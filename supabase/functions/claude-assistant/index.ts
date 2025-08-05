import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for crawled data access
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Fonction pour récupérer le contexte SST crawlé
async function getSSTContext(query: string): Promise<string> {
  try {
    // Recherche dans le contenu crawlé par mots-clés
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    
    if (keywords.length === 0) return '';

    const { data: relevantContent, error } = await supabase
      .from('sst_crawled_content')
      .select(`
        title,
        content,
        article_number,
        section,
        url,
        sst_sources!inner(name, source_type)
      `)
      .or(keywords.map(keyword => `content.ilike.%${keyword}%`).join(','))
      .limit(5);

    if (error || !relevantContent || relevantContent.length === 0) {
      return '';
    }

    // Formater le contexte crawlé
    const contextSections = relevantContent.map(item => {
      const source = `Source: ${item.sst_sources?.name} (${item.sst_sources?.source_type})`;
      const article = item.article_number ? ` - Article ${item.article_number}` : '';
      const section = item.section ? ` - ${item.section}` : '';
      
      return `
[${source}${article}${section}]
${item.title}
${item.content.substring(0, 500)}...
URL: ${item.url}
---`;
    });

    return `
CONTEXTE SST CRAWLÉ RÉCENT:
${contextSections.join('\n')}

Utilisez ces informations récentes et officielles pour enrichir votre réponse.
`;
  } catch (error) {
    console.error('Error fetching SST context:', error);
    return '';
  }
}

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
- Adaptez votre langage au niveau d'expertise de l'utilisateur
- Utilisez prioritairement les informations du CONTEXTE SST CRAWLÉ RÉCENT quand disponible
- Mentionnez la source officielle des informations citées`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, context = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing Claude SST assistant request:', message);

    // Récupérer le contexte SST crawlé
    const sstContext = await getSSTContext(message);
    
    // Construire l'historique de conversation avec contexte enrichi
    const systemPromptWithContext = sstContext 
      ? `${SST_SYSTEM_PROMPT}\n\n${sstContext}`
      : SST_SYSTEM_PROMPT;

    // Formater les messages pour Claude
    const anthropicMessages = context.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
    
    // Ajouter le message actuel
    anthropicMessages.push({
      role: 'user',
      content: message
    });

    // Appel à Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('ANTHROPIC_API_KEY')}`,
        'Content-Type': 'application/json',
        'x-api-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPromptWithContext,
        messages: anthropicMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${errorText}`);
    }

    const result = await response.json();
    const assistantResponse = result.content[0].text;

    console.log('Claude Assistant response generated successfully');

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
    console.error('Claude Assistant error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});