"use client";

import { useState, useEffect, useRef } from "react";
import type { 
  ChatMessage, 
  ChatbotProps, 
  ApiResponse, 
  WebSearchResult, 
  MeetingReference 
} from '@/types/global';

const Chatbot = ({ selectedMeetingId, mode = "single" }: ChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false); // Nuevo estado
  const [voiceSupported, setVoiceSupported] = useState<boolean>(true);
  const [includeWebSearch, setIncludeWebSearch] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check voice support on component mount
  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: "user", content: message }]);
    setInput("");

    try {
      setIsLoading(true);
      const response = await fetch("/api/send-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: message,
          meetingId: selectedMeetingId,
          mode: mode,
          includeWebSearch: includeWebSearch
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add bot response
      setMessages(prev => [...prev, { 
        type: "bot", 
        content: data.response 
      }]);

      // Add references if available
      if (data.references?.length > 0) {
        setMessages(prev => [...prev, { 
          type: "reference", 
          content: formatReferences(data.references)
        }]);
      }

      // Add web results if available
      if (data.webResults?.length > 0) {
        setMessages(prev => [...prev, { 
          type: "web", 
          content: formatWebResults(data.webResults)
        }]);
      }

    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setMessages(prev => [...prev, { 
        type: "bot", 
        content: "Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatReferences = (references: MeetingReference[]) => {
    return "Referencias encontradas:\n" + references.map((ref, index) => (
      `${index + 1}. Reunión del ${formatDate(ref.createdTime)} ${ref.title ? `- ${ref.title}` : ''} (ID: ${ref.id})`
    )).join("\n");
  };

  const formatWebResults = (results: WebSearchResult[]) => {
    return "Fuentes web consultadas:\n" + results.map((result, index) => (
      `${index + 1}. ${result.title}\n   ${result.url}\n   ${result.description}`
    )).join("\n\n");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "fecha desconocida";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleVoiceInput = () => {
    if (!voiceSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessingVoice(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessingVoice(true); // Mostrar loading
      setTimeout(() => {
        setIsProcessingVoice(false); // Ocultar loading después del procesamiento simulado
      }, 1000);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSendMessage(transcript);
    };

    recognition.onerror = (event: ErrorEvent) => {
      console.error("Error en reconocimiento de voz:", event.error);
      setMessages(prev => [
        ...prev,
        { type: "bot", content: "Hubo un problema con el reconocimiento de voz. Por favor, intenta nuevamente." }
      ]);
      setIsListening(false);
      setIsProcessingVoice(false);
    };

    if (isListening) {
      recognition.abort(); // Detener cualquier instancia activa
      setIsListening(false);
      setIsProcessingVoice(true); // Mostrar loading al detener
      setTimeout(() => {
        setIsProcessingVoice(false);
      }, 1000);
    } else {
      recognition.start();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-100 rounded-lg shadow-md p-6">
      {/* Mode Indicators */}
      <div className="mb-4 flex justify-center space-x-2">
        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
          mode === "global" ? "bg-blue-500 text-white" : "bg-green-500 text-white"
        }`}>
          {mode === "global" ? "Búsqueda Global" : "Chat Específico"}
        </span>
        
        {/* Web Search Toggle */}
        <button
          onClick={() => setIncludeWebSearch(!includeWebSearch)}
          className={`inline-block px-3 py-1 rounded-full text-sm transition-colors ${
            includeWebSearch 
              ? "bg-purple-500 text-white" 
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          title={includeWebSearch ? "Desactivar búsqueda web" : "Activar búsqueda web"}
        >
          {includeWebSearch ? "🌐 Web Activada" : "🌐 Web Desactivada"}
        </button>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="h-96 overflow-y-auto bg-white rounded-lg mb-4 p-4 border border-gray-200 space-y-2"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`text-sm ${
              msg.type === "user" 
                ? "text-blue-700 font-semibold"
                : msg.type === "bot"
                ? "text-green-700 font-semibold"
                : msg.type === "reference"
                ? "text-gray-600 text-xs mt-2 border-t pt-2"
                : "text-purple-600 text-xs mt-2 border-t pt-2"
            }`}
          >
            {msg.type === "user" && "Tú: "}
            {msg.type === "bot" && "Sirius Bot: "}
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 text-sm animate-pulse">
            Sirius Bot está escribiendo...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white placeholder-gray-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={mode === "global" 
              ? "Busca en todas las reuniones..." 
              : "Pregunta sobre esta reunión..."}
            disabled={isLoading}
          />
          {input.length > 0 && !isLoading && (
            <button
              onClick={() => setInput("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Limpiar entrada"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? "Procesando..." : "Enviar"}
          </button>

          {voiceSupported && (
            <button
              className={`p-2 rounded-full transition-all ${
                isListening 
                  ? "bg-red-500 text-white" 
                  : isProcessingVoice 
                  ? "bg-yellow-500 text-white" 
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={handleVoiceInput}
              disabled={isLoading || isListening || isProcessingVoice}
              title={
                isListening
                  ? "Detener grabación"
                  : isProcessingVoice
                  ? "Procesando..."
                  : "Iniciar grabación de voz"
              }
            >
              {isListening ? "🛑" : isProcessingVoice ? "⏳" : "🎤"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
