"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "./firebaseConfig";
import { signInAnonymously } from "firebase/auth";
import confetti from "canvas-confetti";

const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName] = useState<string>("recording");
  const [isLoading, setIsLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const N8N_WEBHOOK_URL = "https://tok-n8n-sol.onrender.com/webhook/dropbox-sirius";

  useEffect(() => {
    signInAnonymously(auth).catch((error) => {
      console.error("Authentication error:", error);
    });

    return () => cleanup();
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setMediaRecorder(null);
    setAudioChunks([]);
    setIsRecording(false);
    setIsLoading(false);
  };

  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(chunks => [...chunks, event.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { 
          type: recorder.mimeType 
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        await uploadFile(audioBlob);
      };

      setMediaRecorder(recorder);
      recorder.start(100);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Please grant microphone permission to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      cleanup();
    }
  };

  const uploadFile = async (fileBlob: Blob) => {
    setIsLoading(true);
    try {
      const storageRef = ref(storage, `audio/${fileName}_${Date.now()}.${fileBlob.type.split('/')[1]}`);
      const snapshot = await uploadBytes(storageRef, fileBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await sendFileUrlToWebhook(downloadURL);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendFileUrlToWebhook = async (fileUrl: string) => {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl })
      });

      if (response.ok) {
        confetti();
        alert("Recording uploaded successfully!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Webhook error:", error);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md" style={{ backgroundColor: "rgba(0, 0, 0, 0.41)" }}>
        <h1 className="text-2xl font-bold text-center mb-4 text-white-800">Voice Recorder</h1>
        <ul className="list-disc font-bold list-inside mb-4 text-left text-sm text-gray-200">
          <li>🎙️ Diga el tema de la reunión.</li>
          <li>👥 Mencione a los asistentes.</li>
          <li>📍 Especifique la ubicación de la reunión.</li>
        </ul>
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
        {audioUrl && (
          <audio controls src={audioUrl} className="mt-4 w-full">
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;