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

      // Sort meetings by creation date (most recent first)
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
    const truncated = words.slice(0, 50).join(" "); // Adjust for about 3 lines
    return words.length > 50 ? `${truncated}...` : truncated;
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: "url('/h6.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <NavBar />
      <br />
      <br />
      <br />

      <div className="pt-16 flex flex-col items-center justify-center px-4 md:px-8">
        <div
          className="w-full max-w-4xl bg-white bg-opacity-90 rounded-lg shadow-lg p-6"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.41" }}
        >
          <h1 className="text-center text-xl md:text-2xl font-bold text-gray-400 mb-6">
            Chat sobre reuniones
          </h1>
            <br />
          {/* Chat Mode Toggle */}
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

          {/* Show meeting selector only in single chat mode */}
          {chatMode === "single" && (
            <>
              <div className="mb-6">
                <label htmlFor="meeting-select" className="block text-gray-400 mb-2">
                  Selecciona una reunión:
                </label>
                <select
                  id="meeting-select"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMeetingId}
                  onChange={(e) => handleSelectMeeting(e.target.value)}
                >
                  <option value="" disabled>
                    -- Seleccionar reunión --
                  </option>
                  {meetings.map((meeting) => (
                    <option key={meeting.id} value={meeting.id}>
                      {formatDateTime(meeting.createdTime)} - {meeting.id}
                    </option>
                  ))}
                </select>
              </div>
              <br />

              {/* Meeting Details */}
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
          {/* Enhanced Chatbot Component */}
          <div className="mt-6">
            {(chatMode === "global" || (chatMode === "single" && selectedMeetingId)) && (
              <Chatbot
                selectedMeetingId={selectedMeetingId}
                mode={chatMode}
              />
            )}
            
            {chatMode === "single" && !selectedMeetingId && (
              <p className="text-center text-gray-400">
                Selecciona una reunión para comenzar el chat
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}