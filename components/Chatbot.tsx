"use client";

import { useState } from "react";

const Chatbot = ({ selectedMeetingId }: { selectedMeetingId: string }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(true);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, `Tú: ${message}`]);
    setInput("");

    try {
      setIsLoading(true);
      const response = await fetch("/api/send-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: message,
          meetingId: selectedMeetingId,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, `Sirius Bot: ${data.response}`]);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setMessages((prev) => [
        ...prev,
        "Sirius Bot: Lo siento, no pude procesar tu mensaje.",
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Error en reconocimiento de voz:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 rounded-lg shadow-md p-6">
      {/* Mensajes del chat */}
      <div className="h-64 overflow-y-auto bg-white rounded-lg mb-4 p-4 border border-gray-200 text-gray-800">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`text-sm mb-2 ${
              msg.startsWith("Tú:")
                ? "text-blue-700 font-semibold"
                : msg.startsWith("Sirius Bot:")
                ? "text-green-700 font-semibold"
                : "text-gray-800"
            }`}
          >
            {msg}
          </div>
        ))}
      </div>

      {/* Área de entrada */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
      </div>

      <br />

      {/* Contenedor de Botones con Espaciado */}
      <div className="flex items-center space-x-2 mt-2">
        {/* Botón de Enviar */}
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={() => handleSendMessage(input)}
          disabled={isLoading}
        >
          {isLoading ? "..." : "Enviar"}
        </button>

        {/* Botón de Voz */}
        {voiceSupported ? (
          <button
            className={`p-2 rounded-full ${
              isListening ? "bg-red-500 text-white" : "bg-gray-300 text-black"
            } transition-transform transform hover:scale-110 focus:outline-none`}
            onClick={handleVoiceInput}
            disabled={isListening}
            title="Hablar"
          >
            {isListening ? "🛑" : "🎤"}
          </button>
        ) : (
          <p className="text-sm text-red-500 mt-4">
            Reconocimiento de voz no soportado en este navegador.
          </p>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
