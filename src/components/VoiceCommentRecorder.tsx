'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the component's props with TypeScript for better type safety
interface VoiceCommentRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => Promise<void>;
  isSubmitting: boolean;
  maxRecordingTime?: number; // Optional prop to limit recording duration (in seconds)
}

export function VoiceCommentRecorder({ 
  onRecordingComplete, 
  isSubmitting, 
  maxRecordingTime = 300 // Default maximum recording time of 5 minutes
}: VoiceCommentRecorderProps) {
  // Use refs for values that shouldn't trigger re-renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  // State management for UI and recording status
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSafari, setIsSafari] = useState(false);
  
  // Access toast notification system
  const { toast } = useToast();

  // Detect Safari browser on component mount
  useEffect(() => {
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  // Get appropriate audio constraints based on browser
  const getAudioConstraints = () => ({
    audio: {
      channelCount: 1,           // Mono audio for voice
      sampleRate: 44100,         // CD-quality audio
      echoCancellation: true,    // Reduce echo
      noiseSuppression: true,    // Reduce background noise
      autoGainControl: true,     // Automatically adjust volume
      ...(isSafari ? {
        sampleSize: 16,          // Safari-specific setting for better compatibility
      } : {
        latency: 0,              // Low latency for non-Safari browsers
      })
    }
  });

  // Determine the best audio format for the current browser
  const getBestAudioFormat = (): string => {
    if (isSafari) {
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        return 'audio/mp4';
      }
      if (MediaRecorder.isTypeSupported('audio/aac')) {
        return 'audio/aac';
      }
      return ''; // Let Safari use its default format
    }

    // Format preferences for other browsers
    const formats = [
      'audio/webm;codecs=opus',  // Best quality for modern browsers
      'audio/webm',              // Fallback webm
      'audio/ogg;codecs=opus',   // Alternative high-quality format
      'audio/mp4',               // Universal fallback
    ];
    
    const supportedFormat = formats.find(format => 
      MediaRecorder.isTypeSupported(format)
    );
    
    console.log(`Using audio format: ${supportedFormat || 'browser default'}`);
    return supportedFormat || '';
  };

  // Clean up media resources when needed
  const cleanupMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current?.state !== 'inactive') {
      try {
        mediaRecorderRef.current?.stop();
      } catch (error) {
        console.warn('Error stopping media recorder:', error);
      }
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  // Handle recording duration tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxRecordingTime) {
            stopRecording();
            toast({
              title: "Límite de grabación alcanzado",
              description: "Se ha alcanzado el tiempo máximo de grabación",
              variant: "warning",
            });
            return prev;
          }
          return newDuration;
        });
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, maxRecordingTime]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      cleanupMediaStream();
    };
  }, [cleanupMediaStream]);

  // Start the recording process
  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
      console.log('Microphone access granted');
      
      streamRef.current = stream;
      
      const mimeType = getBestAudioFormat();
      console.log('Selected MIME type:', mimeType);
      
      // Configure MediaRecorder with browser-specific settings
      const recorderOptions: MediaRecorderOptions = {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: isSafari ? undefined : 128000 // Remove bitrate constraint for Safari
      };

      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      // Handle incoming audio data
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
        }
      };

      // Handle recording completion
      recorder.onstop = async () => {
        try {
          if (chunksRef.current.length === 0) {
            throw new Error('No se detectó audio en la grabación');
          }

          const audioBlob = new Blob(chunksRef.current, { 
            type: mimeType || 'audio/mp4' // Default to MP4 for Safari
          });
          
          if (audioBlob.size < 1000) {
            throw new Error('La grabación es demasiado corta');
          }

          console.log('Recording completed:', {
            format: audioBlob.type,
            size: audioBlob.size,
            duration: recordingDuration,
            chunks: chunksRef.current.length
          });

          await onRecordingComplete(audioBlob);
          
          toast({
            title: "Grabación completada",
            description: `Duración: ${recordingDuration} segundos`,
          });
          
        } catch (error) {
          console.error('Recording processing error:', error);
          toast({
            title: "Error en la grabación",
            description: error.message || "Hubo un problema con la grabación",
            variant: "destructive",
          });
        }
      };

      // Start recording with browser-specific timing
      recorder.start(isSafari ? 1000 : 100); // Larger chunks for Safari
      setIsRecording(true);
      
      toast({
        title: "Grabación iniciada",
        description: "Hable claramente hacia el micrófono",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      
      // Provide browser-specific error messages
      const errorMessage = isSafari 
        ? "En Safari, asegúrese de permitir el acceso al micrófono en Preferencias del Sistema > Seguridad y Privacidad"
        : "No se pudo acceder al micrófono. Verifique los permisos.";
      
      toast({
        title: "Error al iniciar la grabación",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Stop the recording process
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        // Ensure minimum recording duration
        if (recordingDuration < 1) {
          toast({
            title: "Grabación muy corta",
            description: "Por favor, grabe por al menos un segundo",
            variant: "warning",
          });
          return;
        }

        mediaRecorderRef.current.stop();
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast({
          title: "Error al detener la grabación",
          description: "Hubo un problema al finalizar la grabación",
          variant: "destructive",
        });
      }
    }
  }, [isRecording, recordingDuration]);

  // Format the duration display (MM:SS)
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render the recording interface
  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "secondary"}
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isSubmitting}
      className="flex items-center gap-2"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Procesando...</span>
        </>
      ) : isRecording ? (
        <>
          <Square className="h-4 w-4" />
          <span>Detener ({formatDuration(recordingDuration)})</span>
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          <span>Grabar comentario</span>
        </>
      )}
    </Button>
  );
}