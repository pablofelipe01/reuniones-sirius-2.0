"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import Confetti from 'react-confetti';
import { Loader2 } from "lucide-react";

const VoiceTest: React.FC = () => {
  const [estaGrabando, setEstaGrabando] = useState<boolean>(false);
  const [urlAudio, setUrlAudio] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string>("Operador: ");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
      if (urlAudio) {
        URL.revokeObjectURL(urlAudio);
      }
    };
  }, [urlAudio]);

  const cleanup = () => {
    if (recorderRef.current) {
      try {
        recorderRef.current.destroy();
      } catch (e) {
        console.error('Error destroying recorder:', e);
      }
      recorderRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.error('Error stopping tracks:', e);
      }
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.error('Error closing audio context:', e);
      }
      audioContextRef.current = null;
    }

    if (requestAnimationFrameRef.current) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
      requestAnimationFrameRef.current = null;
    }

    setEstaGrabando(false);
    setIsLoading(false);
  };

  const iniciarGrabacion = async () => {
    try {
      cleanup();

      if (urlAudio) {
        URL.revokeObjectURL(urlAudio);
        setUrlAudio(null);
      }

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
        mimeType: 'audio/webm;codecs=opus',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        timeSlice: 1000,
        ondataavailable: (blob: Blob) => {
          console.log('Data available:', blob.size);
        },
      });

      recorder.startRecording();
      recorderRef.current = recorder;

      setEstaGrabando(true);
      setShowConfetti(false);
      dibujarFormaDeOnda();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('No se pudo iniciar la grabación. Por favor, verifica los permisos del micrófono.');
      cleanup();
    }
  };

  const enviarAlWebhook = async (audioBlob: Blob): Promise<boolean> => {
    const formData = new FormData();
    formData.append('file', audioBlob, `${nombreArchivo}.webm`);

    try {
      const response = await fetch('https://tok-n8n-sol.onrender.com/webhook/41537048-7a36-4da6-a476-77754e4c07e2', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Error al enviar el archivo al webhook.');
        return false;
      }
      console.log('Archivo enviado exitosamente al webhook.');
      return true;
    } catch (error) {
      console.error('Error al enviar archivo al webhook:', error);
      return false;
    }
  };

  const detenerGrabacion = async () => {
    if (recorderRef.current) {
      try {
        setIsLoading(true);
        
        recorderRef.current.stopRecording(() => {
          try {
            const blob = recorderRef.current.getBlob();
            
            console.log('Blob created:', {
              size: blob.size,
              type: blob.type,
              isBlob: blob instanceof Blob
            });
            
            if (blob instanceof Blob && blob.size > 0) {
              const url = window.URL.createObjectURL(blob);
              setUrlAudio(url);

              enviarAlWebhook(blob).then((success) => {
                if (success) {
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 5000);
                } else {
                  alert('Error al enviar el archivo. Por favor, intente nuevamente.');
                }
              });
            } else {
              throw new Error('Invalid recording blob');
            }
          } catch (blobError) {
            console.error('Error processing blob:', blobError);
            alert('Error al procesar la grabación. Por favor, intente nuevamente.');
          } finally {
            cleanup();
          }
        });
      } catch (error) {
        console.error('Error stopping recording:', error);
        alert('Error al detener la grabación. Por favor, intente nuevamente.');
        cleanup();
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

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
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

  const recargarPagina = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full relative">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className="p-4 max-w-md w-full bg-white bg-opacity-80 rounded-lg shadow-lg">
        <canvas ref={canvasRef} width={300} height={80} className="w-full mb-4" />
        <div className="mb-6 flex flex-col space-y-4 items-center">
          

          <i className="fas fa-microphone-alt text-6xl mb-2" style={{ color: "darkblue" }}></i>
          <h2 className="text-3xl mb-2" style={{ color: "darkblue" }}>Instrucciones</h2>

          <ul className="text-xl mt-4 text-darkblue" style={{ color: "darkblue" }}>
            <li className="flex items-start"><span className="w-6 flex-shrink-0"> 👤</span><span><strong>Cliente: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">🌡️</span><span><strong>Componentes polares: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">🌞</span><span><strong>Temperatura: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">♻️</span><span><strong>Refill: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">🛢️</span><span><strong>Filtrado de aceite: 🔊 Si o No</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">🍟</span><span><strong>Cantidad de freídos: 🔊 ________</strong></span></li>
            <li className="flex items-start"><span className="w-6 flex-shrink-0">🗣️</span><span><strong>Observaciones: 🔊 ________</strong></span></li>
          </ul>

          <button
            onClick={iniciarGrabacion}
            disabled={estaGrabando || isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-full shadow-lg disabled:bg-gray-400 w-full sm:w-auto transform transition-transform duration-200 active:scale-95"
          >
            Iniciar
          </button>
          
          <button
            onClick={detenerGrabacion}
            disabled={!estaGrabando || isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-full shadow-lg disabled:bg-gray-400 w-full sm:w-auto transform transition-transform duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Stop'
            )}
          </button>

          {urlAudio && !isLoading && (
            <button
              onClick={recargarPagina}
              className="px-4 py-2 bg-yellow-500 text-white rounded-full shadow-lg w-full sm:w-auto mt-4 transform transition-transform duration-200 active:scale-95"
            >
              Nuevo Registro
            </button>
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