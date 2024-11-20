"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "./firebaseConfig";
import { signInAnonymously } from "firebase/auth";
import confetti from "canvas-confetti";

const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName] = useState<string>("recording");
  const [isLoading, setIsLoading] = useState(false);

  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const N8N_WEBHOOK_URL =
    "https://tok-n8n-sol.onrender.com/webhook/dropbox-sirius";

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
    if (recorderRef.current) {
      recorderRef.current.destroy();
      recorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setIsLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
        recorderType: StereoAudioRecorder,
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not start recording. Please ensure microphone access is allowed.");
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;

    try {
      recorderRef.current.stopRecording(async () => {
        const blob = recorderRef.current?.getBlob();
        if (blob) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

          // Upload the file to Firebase Storage
          await uploadFile(blob);
        }
        cleanup();
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const uploadFile = async (fileBlob: Blob) => {
    setIsLoading(true);

    try {
      const storageRef = ref(storage, `audio/${fileName}_${Date.now()}.webm`);
      const snapshot = await uploadBytes(storageRef, fileBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("File available at", downloadURL);
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
