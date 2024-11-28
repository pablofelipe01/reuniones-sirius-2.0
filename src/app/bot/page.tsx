"use client";

import NavBar from "../../../components/NavBar";
import { useEffect, useState } from "react";
import Chatbot from "../../../components/Chatbot";
import Image from 'next/image';

export default function BotPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [chatMode, setChatMode] = useState<"single" | "global">("single");

  // Efecto para cargar las reuniones desde Firebase
  useEffect(() => {
    const fetchMeetings = async () => {
      const response = await fetch(
        "https://sirius-reunion-default-rtdb.firebaseio.com/meetings.json"
      );
      const data = await response.json();

      const formattedMeetings = Object.entries(data).map(([id, details]: any) => ({
        id,
        ...details,
      }));

      const sortedMeetings = formattedMeetings.sort((a, b) => 
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      );

      setMeetings(sortedMeetings);
    };

    fetchMeetings();
  }, []);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSelectMeeting = (id: string) => {
    setSelectedMeetingId(id);
    const meeting = meetings.find((m) => m.id === id);
    setSelectedMeeting(meeting || null);
  };

  const truncateSummary = (text: string, lines: number = 3) => {
    if (!text) return "No hay resumen disponible.";
    const words = text.split(" ");
    const truncated = words.slice(0, 50).join(" ");
    return words.length > 50 ? `${truncated}...` : truncated;
  };

  return (
    // El contenedor principal con el fondo
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: "url('/h6.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <NavBar />
<br />
<br />
<br />
      {/* Contenedor del contenido principal */}
      <div className="flex-1 pt-16 px-4 md:px-8 mt-8">
        <div
          className="w-full max-w-4xl mx-auto rounded-lg shadow-lg p-6"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.41)" }}
        >
          <h1 className="text-center text-xl md:text-2xl font-bold text-gray-900 mb-6">
            Chat
          </h1>

          {/* Selector de modo de chat */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-lg border border-gray-300 p-1">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  chatMode === "single" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
                onClick={() => {
                  setChatMode("single");
                  setSelectedMeeting(null);
                  setSelectedMeetingId("");
                }}
              >
                Chat Individual
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  chatMode === "global" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
                onClick={() => setChatMode("global")}
              >
                Búsqueda Global
              </button>
            </div>
          </div>

          {/* Selector de reunión y detalles */}
          {chatMode === "single" && (
            <>
              <div className="mb-6">
                <label htmlFor="meeting-select" className="block text-gray-900 mb-2">
                  Selecciona una reunión:
                </label>
                <select
  id="meeting-select"
  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
  value={selectedMeetingId}
  onChange={(e) => handleSelectMeeting(e.target.value)}
  style={{
    // Aseguramos que las opciones tengan un buen contraste
    colorScheme: 'light'
  }}
>
  <option value="" disabled className="text-gray-600">
    -- Seleccionar reunión --
  </option>
  {meetings.map((meeting) => (
    <option key={meeting.id} value={meeting.id} className="text-gray-800">
      {formatDateTime(meeting.createdTime)} - {meeting.id}
    </option>
  ))}
</select>
              </div>
<br />
              {/* Detalles de la reunión */}
              {selectedMeeting && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                  <h2 className="text-gray-800 font-semibold mb-2">
                    Detalles de la reunión:
                  </h2>
                  <p className="text-sm text-gray-800">
                    <strong>ID:</strong> {selectedMeeting.id}
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>Hora de creación:</strong> {formatDateTime(selectedMeeting.createdTime)}
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>Última modificación:</strong>{" "}
                    {formatDateTime(selectedMeeting.lastModified) || "No modificada"}
                  </p>
                  <p className="text-sm text-gray-800 mt-2">
                    <strong>Resumen:</strong> {truncateSummary(selectedMeeting.informe)}
                  </p>
                </div>
              )}
            </>
          )}
<br />
          {/* Componente de chat */}
          <div className="mt-6">
            {(chatMode === "global" || (chatMode === "single" && selectedMeetingId)) && (
              <Chatbot
                selectedMeetingId={selectedMeetingId}
                mode={chatMode}
              />
            )}
            
            {chatMode === "single" && !selectedMeetingId && (
              <p className="text-center text-gray-100">
                Selecciona una reunión para comenzar el chat
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}