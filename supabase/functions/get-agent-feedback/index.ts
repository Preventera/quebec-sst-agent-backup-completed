import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
  agent_name: string;
  limit?: number;
  include_context?: boolean;
}

interface AgentFeedback {
  agent_name: string;
  total_conversations: number;
  total_annotations: number;
  accuracy_percentage: number;
  recent_feedback: {
    conversation_id: string;
    user_message: string;
    agent_response: string;
    is_compliant: boolean;
    annotation_notes?: string;
    context_data?: Record<string, any>;
    created_at: string;
  }[];
  improvement_suggestions: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const agent_name = url.searchParams.get('agent_name');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const include_context = url.searchParams.get('include_context') === 'true';

    if (!agent_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: agent_name' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Getting feedback for agent:', agent_name);

    // Récupérer les métriques de l'agent
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('learning_metrics')
      .select('*')
      .eq('agent_name', agent_name)
      .single();

    if (metricsError && metricsError.code !== 'PGRST116') {
      console.error('Error fetching metrics:', metricsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch agent metrics' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Récupérer les conversations récentes avec annotations
    const { data: recentFeedback, error: feedbackError } = await supabaseClient
      .from('conversation_logs')
      .select(`
        id,
        user_message,
        agent_response,
        context_data,
        created_at,
        response_annotations (
          is_compliant,
          annotation_notes,
          created_at
        )
      `)
      .eq('agent_name', agent_name)
      .not('response_annotations', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recent feedback' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Compter les conversations totales
    const { count: totalConversations } = await supabaseClient
      .from('conversation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('agent_name', agent_name);

    // Formater les données de feedback
    const formattedFeedback = (recentFeedback || []).map(conv => ({
      conversation_id: conv.id,
      user_message: conv.user_message,
      agent_response: conv.agent_response,
      is_compliant: conv.response_annotations?.[0]?.is_compliant || false,
      annotation_notes: conv.response_annotations?.[0]?.annotation_notes,
      context_data: include_context ? conv.context_data : undefined,
      created_at: conv.created_at
    }));

    // Générer des suggestions d'amélioration basées sur les feedbacks
    const nonCompliantFeedback = formattedFeedback.filter(f => !f.is_compliant);
    const improvementSuggestions = generateImprovementSuggestions(
      agent_name,
      nonCompliantFeedback,
      metrics?.accuracy_percentage || 0
    );

    const response: AgentFeedback = {
      agent_name,
      total_conversations: totalConversations || 0,
      total_annotations: metrics?.total_annotations || 0,
      accuracy_percentage: metrics?.accuracy_percentage || 0,
      recent_feedback: formattedFeedback,
      improvement_suggestions: improvementSuggestions
    };

    console.log(`Feedback compiled for ${agent_name}: ${formattedFeedback.length} recent annotations`);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-agent-feedback function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateImprovementSuggestions(
  agentName: string,
  nonCompliantFeedback: any[],
  accuracyPercentage: number
): string[] {
  const suggestions: string[] = [];

  // Suggestions basées sur la précision
  if (accuracyPercentage < 70) {
    suggestions.push("Précision faible: Réviser les règles de base et les critères de conformité LMRSST");
  } else if (accuracyPercentage < 85) {
    suggestions.push("Précision modérée: Affiner les cas d'usage spécifiques et les exceptions");
  }

  // Suggestions spécifiques par agent
  switch (agentName) {
    case "DiagSST":
      if (nonCompliantFeedback.length > 3) {
        suggestions.push("Améliorer l'évaluation des programmes de prévention manquants");
        suggestions.push("Renforcer la détection des non-conformités par secteur d'activité");
      }
      break;
    case "LexiNorm":
      if (nonCompliantFeedback.length > 2) {
        suggestions.push("Mettre à jour la base de connaissances légales LMRSST");
        suggestions.push("Améliorer l'interprétation contextuelle des articles de loi");
      }
      break;
    case "Prioris":
      if (nonCompliantFeedback.length > 2) {
        suggestions.push("Affiner la priorisation des actions correctives");
        suggestions.push("Adapter les recommandations selon la taille de l'entreprise");
      }
      break;
  }

  // Suggestions basées sur les annotations spécifiques
  const commonIssues = nonCompliantFeedback
    .map(f => f.annotation_notes)
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (commonIssues.includes('délai')) {
    suggestions.push("Améliorer la précision des délais légaux mentionnés");
  }
  if (commonIssues.includes('secteur')) {
    suggestions.push("Renforcer l'adaptation sectorielle des recommandations");
  }
  if (commonIssues.includes('article')) {
    suggestions.push("Vérifier l'exactitude des références aux articles LMRSST");
  }

  return suggestions.length > 0 ? suggestions : [
    "Performance satisfaisante: Continuer le monitoring et l'amélioration continue"
  ];
}