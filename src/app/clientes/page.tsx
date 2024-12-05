"use client";

import NavBar from "../../../components/NavBar";
import VoiceRecorder from "../../../components/VoiceRecorder";
import TodoRecorder from "../../../components/TodoRecorder";
import Image from 'next/image';

export default function ClientesPage() {
  return (
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
      <br />
      {/* Main content container with proper spacing */}
      <div className="flex-1 pt-16 px-4 md:px-8 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Voice Recorder Section */}
            <div 
              className="w-full rounded-lg shadow-lg p-6"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.41)" }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Grabar Reunión
              </h2>
              <VoiceRecorder />
            </div>

            {/* Space for additional content if needed */}
            <div className="w-full">
              {/* You can add additional content here */}
            </div>
          </div>

          {/* Footer space if needed */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white">
              <br />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}