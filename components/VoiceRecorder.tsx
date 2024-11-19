"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "./firebaseConfig"; // Adjust the path as needed
import { signInAnonymously } from "firebase/auth";
import confetti from "canvas-confetti";

const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName] = useState<string>("recording");
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const N8N_WEBHOOK_URL =
    "https://tok-n8n-sol.onrender.com/webhook/dropbox-sirius";

  // Initialize Firebase Auth
  useEffect(() => {
    signInAnonymously(auth)
      .then(() => {
        console.log("Signed in anonymously");
      })
      .catch((error) => {
        console.error("Authentication error:", error);
      });
  }, []);

  const cleanup = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    chunksRef.current = [];
    setIsRecording(false);
    setIsLoading(false);
  };

  const drawWaveform = () => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.beginPath();
      ctx?.moveTo(0, canvas.height / 2);

      for (let i = 0; i < bufferLength; i++) {
        const x = (i / bufferLength) * canvas.width;
        const y = (dataArray[i] / 128.0) * (canvas.height / 2);
        ctx?.lineTo(x, y);
      }

      ctx?.lineTo(canvas.width, canvas.height / 2);

      if (ctx) {
        ctx.strokeStyle = "#007bff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    draw();
  };

  const startRecording = async () => {
    cleanup();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext =
        new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = []; // Clear previous chunks

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Upload the file to Firebase Storage
        await uploadFile(blob);
      };

      mediaRecorder.start(); // Start recording
      mediaRecorderRef.current = mediaRecorder;

      drawWaveform();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not start recording. Please ensure microphone access is allowed.");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadFile = async (fileBlob: Blob) => {
    setIsLoading(true);

    try {
      // Create a storage reference
      const storageRef = ref(storage, `audio/${fileName}_${Date.now()}.webm`);

      // Upload the file
      const snapshot = await uploadBytes(storageRef, fileBlob);

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("File available at", downloadURL);

      // Send the file URL to the n8n webhook
      await sendFileUrlToWebhook(downloadURL);
    } catch (error) {
      console.error("File upload error:", error);
      alert("File upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendFileUrlToWebhook = async (fileUrl: string) => {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl }),
      });

      if (response.ok) {
        confetti();
        alert("File URL sent successfully!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorText = await response.text();
        console.error(
          `Webhook request failed. Status: ${response.status}, Response: ${errorText}`
        );
        alert("Webhook request failed. Please try again.");
      }
    } catch (error) {
      console.error("Webhook request error:", error);
      alert("Webhook request failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md" style={{ backgroundColor: "rgba(0, 0, 0, 0.41" }}>
        <h1 className="text-2xl font-bold text-center mb-4 text-white-800">Voice Recorder</h1>
        <ul className="list-disc font-bold list-inside mb-4 text-left text-sm text-gray-200">
          <li>🎙️ Diga el tema de la reunión.</li>
          <li>👥 Mencione a los asistentes.</li>
          <li>📍 Especifique la ubicación de la reunión.</li>
        </ul>
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          className="w-full mb-4"
        ></canvas>
        <div className="space-y-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`w-20 h-20 text-white rounded-full transition-transform transform active:scale-90 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              isRecording ? "bg-red-500" : "bg-green-500"
            } shadow-lg`}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isRecording ? (
              "STOP"
            ) : (
              "REC"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
