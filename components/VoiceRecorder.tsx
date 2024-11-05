"use client";

import React, { useState, useRef } from "react";
import Image from 'next/image';


const VoiceRecorder: React.FC = () => {
  const [estaGrabando, setEstaGrabando] = useState<boolean>(false);
  const [urlAudio, setUrlAudio] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string>("Operador: ");
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);

  const iniciarGrabacion = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // @ts-ignore
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    source.connect(analyser);

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlob);
      setUrlAudio(url);
      audioChunksRef.current = [];
    };

    mediaRecorder.start();
    setEstaGrabando(true);

    dibujarFormaDeOnda();
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setEstaGrabando(false);
    cancelAnimationFrame(requestAnimationFrameRef.current!);
  };

  const dibujarFormaDeOnda = () => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvas.getContext("2d");

    const draw = () => {
      requestAnimationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx!.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas

      ctx!.lineWidth = 2;
      ctx!.strokeStyle = "rgb(255, 0, 0)"; // Línea roja

      ctx!.beginPath();
      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx!.moveTo(x, y);
        } else {
          ctx!.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx!.lineTo(canvas.width, canvas.height / 2);
      ctx!.stroke();
    };

    draw();
  };

  const enviarAlWebhook = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, `${nombreArchivo}.wav`);

    try {
      const response = await fetch('https://tok-n8n-sol.onrender.com/webhook/10cad20c-8354-481d-913b-11ed72a9a1c9', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Error al enviar el archivo al webhook.');
      }
    } catch (error) {
      console.error('Error al enviar archivo al webhook:', error);
    }
  };

  const manejarDescarga = async () => {
    if (urlAudio) {
      const response = await fetch(urlAudio);
      const audioBlob = await response.blob();
      await enviarAlWebhook(audioBlob);

      // Iniciar descarga del archivo
      const link = document.createElement('a');
      link.href = urlAudio;
      link.download = `${encodeURIComponent(nombreArchivo || "grabacion")}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const recargarPagina = () => {
    window.location.reload();
  };

  return (
    <div
    className="flex items-center justify-center min-h-screen w-full"
    
  >
    <div className="p-4 max-w-md w-full bg-white bg-opacity-80 rounded-lg shadow-lg">
      <h1 style={{ fontSize: "2rem", marginBottom: "20px", textAlign: "center", color: "darkblue", fontWeight: "bold" }}>
        🎤 Data Lab IA
      </h1>
      <canvas ref={canvasRef} width={300} height={80} className="w-full mb-4" />
      <div className="mb-6 flex flex-col space-y-4 items-center">
      <Image
  src="/logo.png" // Asegúrate de que esté en la carpeta `public`
  alt="Logo"
  width={96} // Ajusta el tamaño según lo necesites
  height={96}
  className="mb-4 object-contain rounded-lg" // Usa `rounded-full` para un círculo
/>


        <i className="fas fa-microphone-alt text-6xl mb-2" style={{ color: "darkblue" }}></i>
        <h2 className="text-3xl mb-2" style={{ color: "darkblue" }}>Instrucciones</h2>

        <ul class="text-xl mt-4 text-darkblue" style={{ color: "darkblue" }}>
        <h2 class="text-3xl mb-2 text-darkblue">PRIMARIOS</h2>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">🛑</span>
    <span><strong>Esterilización:</strong> número de bolsas</span>
  </li>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">🦠</span>
    <span><strong>Inoculación:</strong> número de bolsas</span>
  </li>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">🦠</span>
    <span><strong>Tipo de Inoculación:</strong> Duplicación / Producción</span>
  </li>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">🏠</span>
    <span><strong>Cuarto:</strong> cuarto al que irán las bolsas</span>
  </li>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">🌡️</span>
    <span><strong>Temperatura:</strong> temperatura del cuarto</span>
  </li>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">💧</span>
    <span><strong>Humedad:</strong> % de Humedad</span>
  </li>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">📦 </span>
    <span><strong>Estibas:</strong> de qué estibas a qué estibas se guardaron las bolsas</span>
  </li>

</ul>

<ul class="text-xl mt-4 text-darkblue" style={{ color: "darkblue" }}>

  <h2 class="text-3xl mb-2 text-darkblue">CEPAS</h2>

  
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">🧬</span>
    <span class="ml-2"><strong>Tipo de Cepa:</strong> Madre / Cepita</span>
  </li>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">🧬</span>
    <span class="ml-2"><strong>Primera cepa utilizada:</strong> EJ: 231024TR</span>
  </li>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">🧬</span>
    <span class="ml-2"><strong>Cantidad:</strong> EJ: 5 bolsas</span>
  </li>
  <li class="flex items-start">
    <span class="w-6 flex-shrink-0">🧬</span>
    <span class="ml-2"><strong>Repetir Proceso:</strong> Máximo 4</span>
  </li>
 
</ul>


  {/* <ul className="text-xl list-disc list-inside mt-4" style={{ color: 'darkblue' }}>
    <li>🛑 <strong>Esterilización:</strong> número de bolsas</li>
    <li>🦠 <strong>Inoculación:</strong> número de bolsas</li>
    <li>🦠 <strong>Tipo de Inoculación:</strong> Duplicación / Producción</li>
    <li>🏠 <strong>Cuarto:</strong> cuarto al que irán las bolsas</li>
    <li>🌡️ <strong>Temperatura:</strong> número de temperatura</li>
    <li>💧 <strong>Humedad:</strong> porcentaje de humedad en el cuarto</li>
    <li>📦 <strong>Estibas:</strong> de qué estibas a qué estibas se guardaron las bolsas</li>
    <br />
    <h2 className="text-3xl mb-2" style={{ color: "darkblue" }}> CEPAS </h2>
    <li>🧬 <strong>Tipo de Cepa</strong> Madre / Cepita</li>
    <li>🧬 <strong>Primera cepa utilizada: </strong> EJ: 231024TR </li>
    <li>🧬 <strong>Cantidad:</strong> EJ: 5 bolsas</li>
      <br />
    <li>🧬 <strong>Repetir Proceso: </strong>Maximo 4</li>
  
  </ul> */}
        
        <button
          onClick={iniciarGrabacion}
          disabled={estaGrabando}
          className="px-4 py-2 bg-green-500 text-white rounded-full shadow-lg disabled:bg-gray-400 w-full sm:w-auto transform transition-transform duration-200 active:scale-95"
        >
          Iniciar
        </button>
        <button
          onClick={detenerGrabacion}
          disabled={!estaGrabando}
          className="px-4 py-2 bg-red-500 text-white rounded-full shadow-lg disabled:bg-gray-400 w-full sm:w-auto transform transition-transform duration-200 active:scale-95"
        >
          Stop
        </button>
        {urlAudio && (
          <>
            <select
              id="nombreArchivo"
              value={nombreArchivo}
              onChange={(e) => setNombreArchivo(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-black mt-2"
            >
              <option value="Operador: Yesenia">Yesenia</option>
              <option value="Operador: Angi">Angi</option>
              <option value="Operador: Luisa">Luisa</option>
              <option value="Operador: Alexandra">Alexandra</option>
            </select>
            <button
              onClick={manejarDescarga}
              className="mt-4 inline-block px-4 py-2 bg-indigo-500 text-white rounded-full shadow-lg w-full text-center sm:w-auto transform transition-transform duration-200 active:scale-95"
            >
              Enviar Registro
            </button>
            <button
              onClick={recargarPagina}
              className="px-4 py-2 bg-yellow-500 text-white rounded-full shadow-lg w-full sm:w-auto mt-4 transform transition-transform duration-200 active:scale-95"
            >
              Nuevo Registro
            </button>
          </>
        )}
      </div>
      {urlAudio && (
        <div className="mt-6">
          <audio src={urlAudio} controls className="w-full" />
        </div>
      )}
    </div>
  </div>
  );
};

export default VoiceRecorder;
