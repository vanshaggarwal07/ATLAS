import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, mimeType } = await req.json();
    
    console.log('=== ElevenLabs STT Request ===');
    console.log('MIME type from client:', mimeType);
    console.log('Base64 audio length:', audio?.length);
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY not found in environment');
      throw new Error('ElevenLabs API key not configured');
    }
    
    console.log('API Key present: Yes (length:', ELEVENLABS_API_KEY.length, ')');

    // Use Deno's standard base64 decode - prevents corruption
    const decodedAudio = base64Decode(audio);
    // Convert to regular Uint8Array to fix type compatibility
    const binaryAudio = new Uint8Array(decodedAudio.buffer, decodedAudio.byteOffset, decodedAudio.byteLength);
    console.log('Decoded audio size:', binaryAudio.length, 'bytes');
    if (binaryAudio.length < 1000) {
      throw new Error('Audio recording too short - please speak for at least 2 seconds');
    }
    
    // Determine file extension based on MIME type
    let fileExtension = 'webm';
    let contentType = 'audio/webm';
    
    if (mimeType) {
      const lower = mimeType.toLowerCase();
      if (lower.includes('mp4') || lower.includes('m4a')) {
        fileExtension = 'mp4';
        contentType = 'audio/mp4';
      } else if (lower.includes('ogg')) {
        fileExtension = 'ogg';
        contentType = 'audio/ogg';
      } else if (lower.includes('wav')) {
        fileExtension = 'wav';
        contentType = 'audio/wav';
      } else if (lower.includes('mp3') || lower.includes('mpeg')) {
        fileExtension = 'mp3';
        contentType = 'audio/mpeg';
      } else if (lower.includes('webm')) {
        fileExtension = 'webm';
        contentType = 'audio/webm';
      }
    }
    
    console.log('File extension:', fileExtension, 'Content type:', contentType);
    
    // Create form data for ElevenLabs API
    const formData = new FormData();
    
    // Create blob with proper content type - copy to new ArrayBuffer to fix type issue
    const audioBuffer = new ArrayBuffer(binaryAudio.length);
    new Uint8Array(audioBuffer).set(binaryAudio);
    const audioBlob = new Blob([audioBuffer], { type: contentType });
    formData.append('file', audioBlob, `recording.${fileExtension}`);
    formData.append('model_id', 'scribe_v1');
    // Enable audio event tagging to distinguish speech from background noise
    formData.append('tag_audio_events', 'true');

    console.log('Sending to ElevenLabs API...');
    console.log('Blob size:', audioBlob.size);

    // Call ElevenLabs Speech-to-Text API
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Full response body:', responseText);

    if (!response.ok) {
      console.error('ElevenLabs API error:', response.status, responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.detail?.message) {
          throw new Error(errorData.detail.message);
        }
      } catch (e) {
        // Ignore parse error
      }
      
      throw new Error(`Transcription failed (${response.status})`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid response from transcription service');
    }
    
    console.log('Parsed result:', JSON.stringify(result, null, 2));
    
    // Filter out audio events (like background noise, music, etc.)
    // Only return actual speech text
    let speechText = result.text || '';
    const words = result.words || [];
    
    // Check if all words are audio events (not speech)
    const hasActualSpeech = words.some((word: any) => word.type !== 'audio_event');
    
    // If only audio events detected (no speech), return empty
    if (!hasActualSpeech && words.length > 0) {
      console.log('Only audio events detected, no speech found');
      speechText = '';
    }
    
    // Filter the text to remove audio event markers like (laughter), (music), etc.
    speechText = speechText.replace(/\([^)]*\)/g, '').trim();
    
    console.log('Final speech text:', speechText);
    console.log('=== STT Request Complete ===');

    return new Response(
      JSON.stringify({ 
        text: speechText,
        language: result.language_code || 'auto',
        words: words.filter((w: any) => w.type !== 'audio_event')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('STT Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
