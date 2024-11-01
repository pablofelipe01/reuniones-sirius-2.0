"use client";
import VoiceRecorder from "../../components/VoiceRecorder";

export default function Home() {
  return (
    <div 
    
    className="flex items-center justify-center min-h-screen w-full"
    style={{
      backgroundImage: "url('/h6.jpeg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
    >
    
      <div >
        <VoiceRecorder />
      </div>
    </div>
  );
}
