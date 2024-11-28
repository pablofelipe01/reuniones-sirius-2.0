// pages/page.tsx or src/pages/page.tsx
"use client";

import NavBar from "../../components/NavBar";
import Image from 'next/image';

export default function Home() {
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      
    >
      <Image
        src="/h6.jpeg"
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0"
      />

      <NavBar />

    
    </div>
  );
}
