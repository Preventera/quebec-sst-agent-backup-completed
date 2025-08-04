import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice = 'Aria' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Processing ElevenLabs text-to-speech request for text:', text.substring(0, 100) + '...');

    // Generate speech from text using ElevenLabs
    const voiceId = getVoiceId(voice);
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log('ElevenLabs text-to-speech conversion successful');

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('ElevenLabs text-to-voice error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

// Map des voix avec leurs IDs ElevenLabs
function getVoiceId(voiceName: string): string {
  const voiceMap: { [key: string]: string } = {
    'Aria': '9BWtsMINqrJLrRacOk9x',
    'Roger': 'CwhRBWXzGAHq8TQ4Fs17',
    'Sarah': 'EXAVITQu4vr4xnSDxMaL',
    'Laura': 'FGY2WhTYpPnrIDTdsKH5',
    'Charlie': 'IKne3meq5aSn9XLyUdCD',
    'George': 'JBFqnCBsd6RMkjVDRZzb',
    'Callum': 'N2lVS1w4EtoT3dr4eOWO',
    'River': 'SAz9YHcvj6GT2YYXdXww',
    'Liam': 'TX3LPaxmHKxFdv7VOQHJ',
    'Charlotte': 'XB0fDUnXU5powFXDhCwa',
    'Alice': 'Xb7hH8MSUJpSbSDYk0k2',
    'Matilda': 'XrExE9yKIg1WjnnlVkGX',
    'Will': 'bIHbv24MWmeRgasZH58o',
    'Jessica': 'cgSgspJ2msm6clMCkdW9',
    'Eric': 'cjVigY5qzO86Huf0OWal',
    'Chris': 'iP95p4xoKVk53GoZ742B',
    'Brian': 'nPczCjzI2devNBz1zQrb',
    'Daniel': 'onwK4e9ZLuTAKqWW03F9',
    'Lily': 'pFZP5JQG7iQjIQuC4Bku',
    'Bill': 'pqHfZKP75CvOlQylNhV4'
  };
  
  return voiceMap[voiceName] || voiceMap['Aria']; // Default to Aria
}