import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseTextToVoiceOptions {
  voiceId?: string;
}

export function useTextToVoice(options?: UseTextToVoiceOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      toast.error('No text to speak');
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsLoading(true);
    
    try {
      // Clean the text - remove markdown, extra whitespace, etc.
      const cleanText = text
        .replace(/#{1,6}\s/g, '') // Remove markdown headers
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
        .trim();
      
      console.log('Requesting TTS for text length:', cleanText.length);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: cleanText.substring(0, 5000), // Limit text length
            voiceId: options?.voiceId 
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate speech');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.audioContent) {
        throw new Error('No audio content received');
      }

      console.log('Audio content received, playing...');

      // Use data URI to play audio
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        audioRef.current = null;
        toast.error('Failed to play audio');
      };

      audio.oncanplaythrough = () => {
        console.log('Audio ready to play');
      };

      setIsSpeaking(true);
      await audio.play();
      toast.success('Playing audio...');
    } catch (error) {
      console.error('TTS error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate speech';
      toast.error(message);
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  }, [options?.voiceId]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsSpeaking(false);
      toast.info('Audio stopped');
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
  };
}
