import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationLogRequest {
  agent_name: string;
  user_message: string;
  agent_response: string;
  context_data?: Record<string, any>;
  user_id?: string;
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

    const {
      agent_name,
      user_message,
      agent_response,
      context_data,
      user_id
    }: ConversationLogRequest = await req.json();

    console.log('Logging conversation for agent:', agent_name);

    // Validation des données
    if (!agent_name || !user_message || !agent_response) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: agent_name, user_message, agent_response' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Générer un user_id si non fourni
    const finalUserId = user_id || crypto.randomUUID();

    // Insérer le log de conversation
    const { data, error } = await supabaseClient
      .from('conversation_logs')
      .insert({
        user_id: finalUserId,
        agent_name,
        user_message,
        agent_response,
        context_data: context_data || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to log conversation', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Conversation logged successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        conversation_id: data.id,
        message: 'Conversation logged successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in log-conversation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});