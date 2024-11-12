// components/VoiceTest.tsx
"use client";

import React, { useState, useRef } from "react";
import Image from 'next/image';

const VoiceTest: React.FC = () => {
  const [estaGrabando, setEstaGrabando] = useState<boolean>(false);
  const [urlAudio, setUrlAudio] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string>("Operador: ");
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const RecordRTC = (await import('recordrtc')).default;
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      source.connect(analyser);

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
      });
      recorder.startRecording();
      recorderRef.current = recorder;

      setEstaGrabando(true);

      dibujarFormaDeOnda();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  const detenerGrabacion = async () => {
    if (recorderRef.current) {
      await recorderRef.current.stopRecording();
      const blob = await recorderRef.current.getBlob();
      const url = URL.createObjectURL(blob);
      setUrlAudio(url);

      recorderRef.current = null;
      setEstaGrabando(false);
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const dibujarFormaDeOnda = () => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      requestAnimationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(255, 0, 0)";

      ctx.beginPath();
      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const enviarAlWebhook = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, `${nombreArchivo}.wav`);

    try {
      const response = await fetch('https://tok-n8n-sol.onrender.com/webhook-test/41537048-7a36-4da6-a476-77754e4c07e2', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Error al enviar el archivo al webhook.');
      } else {
        console.log('Archivo enviado exitosamente al webhook.');
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
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="p-4 max-w-md w-full bg-white bg-opacity-80 rounded-lg shadow-lg">
        <canvas ref={canvasRef} width={300} height={80} className="w-full mb-4" />
        <div className="mb-6 flex flex-col space-y-4 items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={96}
            height={96}
            className="mb-4 object-contain rounded-lg"
          />

          <i className="fas fa-microphone-alt text-6xl mb-2" style={{ color: "darkblue" }}></i>
          <h2 className="text-3xl mb-2" style={{ color: "darkblue" }}>Instrucciones</h2>

          <ul className="text-xl mt-4 text-darkblue" style={{ color: "darkblue" }}>
            <li className="flex items-start"><span className="w-6 flex-shrink-0"> 👤</span><span><strong>Cliente: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">🌡️</span><span><strong>Componentes polares: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">🌞</span><span><strong>Temperatura: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">♻️</span><span><strong>Refill: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">🛢️</span><span><strong>Filtrado de aceite: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">🍟</span><span><strong>Cantidad de freídos: 🔊 ________</strong></span></li>
          </ul>

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

export default VoiceTest;
