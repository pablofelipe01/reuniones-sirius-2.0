// pages/page.tsx or src/pages/page.tsx
"use client";

import NavBar from "../../components/NavBar";
import Image from 'next/image';

export default function Home() {
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: "url('/h6.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <NavBar />

    
    </div>
  );
}
