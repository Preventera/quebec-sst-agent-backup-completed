import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SST_SYSTEM_PROMPT = `Vous êtes un assistant expert en santé et sécurité au travail (SST) au Québec, spécialisé dans la LMRSST (Loi sur les mécanismes de règlement des plaintes en santé et sécurité du travail).

Votre mission:
- Fournir des conseils précis et pratiques en SST
- Expliquer la réglementation québécoise (LMRSST, RSST)
- Aider avec les formations obligatoires et programmes de prévention
- Répondre aux questions sur les accidents de travail
- Guider sur les procédures d'inspection et de conformité

Règles importantes:
- Répondez en français québécois
- Citez les articles de loi pertinents quand possible
- Recommandez toujours de consulter un expert pour les cas complexes
- Soyez concis mais complet dans vos réponses
- Adaptez votre langage au niveau d'expertise de l'utilisateur`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, context = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing SST assistant request:', message);

    // Construire l'historique de conversation
    const messages = [
      { role: 'system', content: SST_SYSTEM_PROMPT },
      ...context.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Appel à OpenAI GPT-4
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    const assistantResponse = result.choices[0].message.content;

    console.log('SST Assistant response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        usage: result.usage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('SST Assistant error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});