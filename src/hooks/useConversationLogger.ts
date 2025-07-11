import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConversationData {
  agent_name: string;
  user_message: string;
  agent_response: string;
  context_data?: Record<string, any>;
}

export const useConversationLogger = () => {
  const { toast } = useToast();

  const logConversation = useCallback(async (data: ConversationData) => {
    try {
      // Pour l'instant, utiliser un user_id fictif
      // Dans un vrai système, cela viendrait de l'authentification
      const userId = crypto.randomUUID();

      const { error } = await supabase
        .from("conversation_logs")
        .insert({
          user_id: userId,
          agent_name: data.agent_name,
          user_message: data.user_message,
          agent_response: data.agent_response,
          context_data: data.context_data || {}
        });

      if (error) {
        console.error("Erreur lors du logging:", error);
        toast({
          title: "Erreur de logging",
          description: "Impossible d'enregistrer la conversation",
          variant: "destructive",
        });
        return false;
      }

      console.log("Conversation loggée avec succès:", data.agent_name);
      return true;
    } catch (error) {
      console.error("Erreur critique lors du logging:", error);
      toast({
        title: "Erreur critique",
        description: "Erreur lors de l'enregistrement",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const logAgentInteraction = useCallback(async (
    agentName: string,
    userInput: string,
    agentOutput: string,
    metadata?: Record<string, any>
  ) => {
    return await logConversation({
      agent_name: agentName,
      user_message: userInput,
      agent_response: agentOutput,
      context_data: {
        timestamp: new Date().toISOString(),
        source: "agent_interaction",
        ...metadata
      }
    });
  }, [logConversation]);

  const logDiagnosticSession = useCallback(async (
    responses: Record<string, any>,
    recommendations: string[]
  ) => {
    return await logConversation({
      agent_name: "DiagSST",
      user_message: `Diagnostic entreprise: ${JSON.stringify(responses)}`,
      agent_response: `Recommandations: ${recommendations.join(", ")}`,
      context_data: {
        type: "diagnostic_session",
        responses,
        recommendations,
        timestamp: new Date().toISOString()
      }
    });
  }, [logConversation]);

  const logLegalQuery = useCallback(async (
    query: string,
    articles: string[],
    explanation: string
  ) => {
    return await logConversation({
      agent_name: "LexiNorm",
      user_message: query,
      agent_response: explanation,
      context_data: {
        type: "legal_query",
        articles_referenced: articles,
        timestamp: new Date().toISOString()
      }
    });
  }, [logConversation]);

  return {
    logConversation,
    logAgentInteraction,
    logDiagnosticSession,
    logLegalQuery
  };
};