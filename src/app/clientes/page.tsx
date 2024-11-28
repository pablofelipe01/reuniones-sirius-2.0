"use client";

import NavBar from "../../../components/NavBar";
import VoiceRecorder from "../../../components/VoiceRecorder";
import TodoRecorder from "../../../components/TodoRecorder";
import Image from 'next/image';

export default function ClientesPage() {
  return (
    <div
      className="min-h-screen w-full relative"
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
      <br />
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-7xl mx-auto">
          {/* Columna izquierda para VoiceRecorder */}
          <div className="w-full">
            <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Grabar Reunión
              </h2>
              <VoiceRecorder />
            </div>
          </div>
          <br />
          {/* Columna derecha para TodoRecorder */}
          <div className="w-full">
            <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Grabar Tarea
              </h2>
              <TodoRecorder />
            </div>
          </div>
        </div>

        {/* Leyenda o instrucciones generales */}
        <div className="mt-8 text-center">
          <p className="text-sm text-blue-900">
            <br />
          </p>
        </div>
      </div>
    </div>
  );
}