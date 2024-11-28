"use client";

import React, { useState, useRef, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Loader2, Clock } from "lucide-react";
import { storage, auth } from "./firebaseConfig";
import { signInAnonymously } from "firebase/auth";
import confetti from "canvas-confetti";

// Importación dinámica de RecordRTC para evitar problemas de SSR
import dynamic from 'next/dynamic';

const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName] = useState<string>("recording");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const recorderRef = useRef<any | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const N8N_WEBHOOK_URL =
    "https://tok-n8n-sol.onrender.com/webhook/dropbox-sirius";

  useEffect(() => {
    setIsClient(true);
    
    // Importar RecordRTC dinámicamente solo en el cliente
    const loadRecordRTC = async () => {
      const RecordRTC = (await import('recordrtc')).default;
      window.RecordRTC = RecordRTC;
    };

    if (typeof window !== 'undefined') {
      loadRecordRTC();
    }

    // Autenticación anónima
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
    if (!isClient) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const RecordRTC = (await import('recordrtc')).default;
      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
        recorderType: RecordRTC.StereoAudioRecorder,
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

  // Si no estamos en el cliente, mostramos un estado de carga o nada
  if (!isClient) {
    return null;
  }

 // Mantén toda la lógica anterior igual, solo actualiza la parte del return

return (
  <div className="w-full">
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="bg-black bg-opacity-40 rounded-lg p-4">
        <ul className="list-disc list-inside text-sm text-gray-200 space-y-2">
          <li>🎙️ Diga el tema de la reunión</li>
          <li>👥 Mencione a los asistentes</li>
          <li>📍 Especifique la ubicación</li>
        </ul>
      </div>

      {/* Botón de grabación */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={`w-16 h-16 flex items-center justify-center text-white rounded-full transition-all transform hover:scale-105 active:scale-95 ${
            isRecording 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-green-500 hover:bg-green-600"
          } shadow-lg`}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <span className="text-sm font-bold">STOP</span>
          ) : (
            <span className="text-sm font-bold">REC</span>
          )}
        </button>

        {isRecording && (
          <div className="flex items-center text-red-400">
            <Clock className="w-4 h-4 mr-1 animate-pulse" />
            <span className="text-sm">Grabando...</span>
          </div>
        )}
      </div>

      {/* Player de audio */}
      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full">
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      )}
    </div>
  </div>
);
};

export default VoiceRecorder;