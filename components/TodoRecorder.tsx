"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, Calendar, CheckCircle2, Clock, User } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { tasksStorage, tasksAuth } from "./tasksFirebaseConfig";
import { signInAnonymously } from "firebase/auth";
import confetti from "canvas-confetti";
import dynamic from 'next/dynamic';

const TodoRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName] = useState<string>("todo-recording");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [lastTask, setLastTask] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");

  const recorderRef = useRef<any | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const usuarios = [
    "Martin Herrera",
    "Pablo Acebedo",
    "David Hernández",
    "Joys Fernanda Moreno",
    "Jerson Camilo Loaiza",
    "Luisa Fernanda Ramirez",
    "Santiago Amaya",
    "Alejandro Uricoechea"
  ];

  const N8N_WEBHOOK_URL =
    "https://tok-n8n-sol.onrender.com/webhook/todo-sirius";

  useEffect(() => {
    setIsClient(true);
    
    // Cargar usuario guardado
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    
    const loadRecordRTC = async () => {
      const RecordRTC = (await import('recordrtc')).default;
      window.RecordRTC = RecordRTC;
    };

    if (typeof window !== 'undefined') {
      loadRecordRTC();
    }

    const authenticateAnonymously = async () => {
      try {
        await signInAnonymously(tasksAuth);
        console.log("Signed in anonymously in tasks project");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication error in tasks project:", error);
        alert("Error de autenticación. Por favor, recarga la página.");
      }
    };

    authenticateAnonymously();
  }, []);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUser = e.target.value;
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', newUser);
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

    if (!isClient || !isAuthenticated) {
      alert("Por favor, espera a que la aplicación termine de inicializarse.");
      return;
    }

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
    if (!isAuthenticated) {
      alert("Error de autenticación. Por favor, recarga la página.");
      return;
    }

    if (!currentUser) {
      alert("Por favor, selecciona tu usuario antes de subir el archivo.");
      return;
    }

    setIsLoading(true);

    try {
      const timestamp = Date.now();
      const storageRef = ref(tasksStorage, `audio/${fileName}_${timestamp}.webm`);
      const snapshot = await uploadBytes(storageRef, fileBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("File available at", downloadURL);
      await sendFileUrlToWebhook(downloadURL);
    } catch (error) {
      console.error("File upload error:", error);
      alert("Error al subir el archivo. Por favor, intente de nuevo.");
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
        body: JSON.stringify({ 
          fileUrl,
          timestamp: new Date().toISOString(),
          type: "todo",
          createdBy: currentUser
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.taskText) {
          setLastTask(data.taskText);
        }
        confetti();
        setTimeout(() => {
          setLastTask(null);
        }, 5000);
      } else {
        const errorText = await response.text();
        console.error(
          `Webhook request failed. Status: ${response.status}, Response: ${errorText}`
        );
        alert("Error al procesar la tarea. Por favor, intente de nuevo.");
      }
    } catch (error) {
      console.error("Webhook request error:", error);
      alert("Error al enviar la tarea. Por favor, intente de nuevo.");
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* Selector de Usuario */}
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
            {usuarios.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        {/* Instrucciones */}
        <div className="bg-black bg-opacity-20 rounded-lg p-4">
          <ul className="list-disc list-inside text-sm text-gray-200 space-y-2">
            <li>🎯 Menciona la tarea a realizar</li>
            <li>📅 Indica la fecha límite (opcional)</li>
            <li>⭐ Especifica la prioridad (alta/media/baja)</li>
            <li>👥 Menciona las personas involucradas</li>
          </ul>
        </div>

        {/* Botón de grabación */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || !isAuthenticated || !currentUser}
            className={`w-16 h-16 flex items-center justify-center text-white rounded-full transition-all transform hover:scale-105 active:scale-95 ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-green-500 hover:bg-green-600"
            } shadow-lg ${(!isAuthenticated || isLoading || !currentUser) ? "opacity-50 cursor-not-allowed" : ""}`}
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

        {/* Mensaje de confirmación */}
        {lastTask && (
          <div className="mt-4 p-3 bg-green-500 bg-opacity-20 rounded-lg">
            <p className="text-green-400 text-sm">
              ✓ Tarea registrada: {lastTask}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoRecorder;