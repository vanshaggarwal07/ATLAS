import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseVoiceToTextOptions {
  onTranscript?: (text: string) => void;
}

// Get supported MIME type for the browser
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/wav',
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log('Using MIME type:', type);
      return type;
    }
  }
  
  console.warn('No preferred MIME type supported, using default');
  return '';
}

export function useVoiceToText(options?: UseVoiceToTextOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('Requesting microphone access...');
      
      // Request high-quality audio specifically for speech
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1, // Mono for speech
        } 
      });
      
      streamRef.current = stream;
      
      // Check audio tracks
      const audioTracks = stream.getAudioTracks();
      console.log('Audio tracks:', audioTracks.length);
      if (audioTracks.length > 0) {
        console.log('Audio track settings:', audioTracks[0].getSettings());
      }
      
      const mimeType = getSupportedMimeType();
      const mediaRecorderOptions: MediaRecorderOptions = {
        audioBitsPerSecond: 128000, // Higher bitrate for better quality
      };
      if (mimeType) {
        mediaRecorderOptions.mimeType = mimeType;
      }
      
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      console.log('MediaRecorder created with mimeType:', mediaRecorder.mimeType);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data chunk received:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, total chunks:', chunksRef.current.length);
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
          console.log('Audio blob size:', audioBlob.size, 'bytes, type:', audioBlob.type);
          
          if (audioBlob.size < 5000) {
            throw new Error('Recording too short. Please speak for at least 2 seconds.');
          }
          
          // Convert to base64 using ArrayBuffer for reliability
          const arrayBuffer = await audioBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Convert to base64 in chunks to avoid stack overflow
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.slice(i, i + chunkSize);
            binary += String.fromCharCode(...chunk);
          }
          const base64Audio = btoa(binary);
          
          console.log('Base64 audio length:', base64Audio.length);
          console.log('Sending to STT API...');
          
          // Send to edge function
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ 
                audio: base64Audio,
                mimeType: mediaRecorder.mimeType || 'audio/webm'
              }),
            }
          );

          const data = await response.json();
          console.log('STT response:', data);
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to transcribe audio');
          }
          
          if (data.text && data.text.trim().length > 0) {
            options?.onTranscript?.(data.text.trim());
            toast.success('Voice transcribed successfully');
          } else if (data.error) {
            throw new Error(data.error);
          } else {
            toast.info('No speech detected. Please speak clearly and try again.');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          const message = error instanceof Error ? error.message : 'Failed to transcribe audio';
          toast.error(message);
        } finally {
          setIsProcessing(false);
          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast.error('Recording failed. Please try again.');
        setIsRecording(false);
        // Stop all tracks on error
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      // Collect data continuously
      mediaRecorder.start(100); // Collect every 100ms
      setIsRecording(true);
      toast.info('🎤 Recording... Speak clearly now');
    } catch (error) {
      console.error('Failed to start recording:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error instanceof Error && error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.');
      } else {
        toast.error('Failed to access microphone. Please check permissions.');
      }
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
