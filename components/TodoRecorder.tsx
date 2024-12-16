"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, Clock, User } from "lucide-react";
import confetti from "canvas-confetti";

const TodoRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [lastTask, setLastTask] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");

  const recorderRef = useRef<any | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const usuarios = [
    "Martin Herrera",
    "Pablo Acebedo",
    "David Hernández",
    "Joys Moreno",
    "Jerson Camilo Loaiza",
    "Luisa Fernanda Ramirez",
    "Santiago Amaya",
    "Alejandro Uricoechea",
    "Lina Loaiza"
  ];

  const N8N_WEBHOOK_URL = "https://tok-n8n-sol.onrender.com/webhook/todo-sirius";

  useEffect(() => {
    setIsClient(true);

    // Load saved user
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(savedUser);
    }

    const loadRecordRTC = async () => {
      const RecordRTC = (await import("recordrtc")).default;
      window.RecordRTC = RecordRTC;
    };

    if (typeof window !== "undefined") {
      loadRecordRTC();
    }
  }, []);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUser = e.target.value;
    setCurrentUser(newUser);
    localStorage.setItem("currentUser", newUser);
  };

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
    if (!currentUser) {
      alert("Por favor, selecciona tu usuario antes de grabar.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const RecordRTC = (await import("recordrtc")).default;
      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
        recorderType: RecordRTC.StereoAudioRecorder,
        audioBitsPerSecond: 64000, // Reduced bitrate to 64 kbps
        desiredSampRate: 16000,    // Reduced sample rate to 16 kHz
        numberOfAudioChannels: 1, // Mono audio
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("No se pudo iniciar la grabación. Por favor, asegúrese de permitir el acceso al micrófono.");
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
          await uploadFile(blob);
        }
        cleanup();
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const uploadFile = async (fileBlob: Blob) => {
    if (!currentUser) {
      alert("Por favor, selecciona tu usuario antes de subir el archivo.");
      return;
    }

    setIsLoading(true);

    try {
      const timestamp = Date.now();
      const formData = new FormData();
      formData.append("file", fileBlob, `todo-recording_${timestamp}.webm`);
      formData.append("createdBy", currentUser);
      formData.append("timestamp", new Date().toISOString());
      formData.append("type", "todo");

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.taskText) {
          setLastTask(responseData.taskText);
        }
        confetti();
        setTimeout(() => {
          setLastTask(null);
        }, 5000);
      } else {
        const errorText = await response.text();
        console.error("Webhook request failed:", errorText);
        alert("Error al procesar la tarea. Por favor, intente de nuevo.");
      }
    } catch (error) {
      console.error("Error al enviar la tarea:", error);
      alert("Error al enviar la tarea. Por favor, intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* User Selector */}
        <div className="bg-black bg-opacity-20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-5 h-5 text-white" />
            <label className="text-white">Usuario:</label>
          </div>
          <select
            value={currentUser}
            onChange={handleUserChange}
            className="w-full p-2 rounded-lg bg-white bg-opacity-90 text-gray-800"
            required
          >
            <option value="">Selecciona tu usuario</option>
            {usuarios.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>

        {/* Instructions */}
        <div className="bg-black bg-opacity-20 rounded-lg p-4">
          <ul className="list-disc list-inside text-sm text-gray-200 space-y-2">
            <li>🎯 Menciona la tarea a realizar</li>
            <li>📅 Indica la fecha límite (opcional)</li>
            <li>⭐ Especifica la prioridad (alta/media/baja)</li>
            <li>👥 Menciona las personas involucradas</li>
          </ul>
        </div>

        {/* Recording Button */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || !currentUser}
            className={`w-16 h-16 flex items-center justify-center text-white rounded-full transition-all transform hover:scale-105 active:scale-95 ${
              isRecording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            } shadow-lg ${isLoading || !currentUser ? "opacity-50 cursor-not-allowed" : ""}`}
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

        {/* Audio Player */}
        {audioUrl && (
          <div className="mt-4">
            <audio controls src={audioUrl} className="w-full">
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        )}

        {/* Confirmation Message */}
        {lastTask && (
          <div className="mt-4 p-3 bg-green-500 bg-opacity-20 rounded-lg">
            <p className="text-green-400 text-sm">✓ Tarea registrada: {lastTask}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoRecorder;
