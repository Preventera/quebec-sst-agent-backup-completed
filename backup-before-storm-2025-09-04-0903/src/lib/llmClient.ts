// Client LLM Gateway pour AgenticSST Québec
// src/lib/llmClient.ts - VERSION CORRIGÉE POUR ANTHROPIC

interface LLMMessage {
  role: 'user' | 'assistant';  // Retiré 'system' pour Anthropic
  content: string;
}

interface LLMRequest {
  provider: 'openai' | 'anthropic';
  model: string;
  messages: LLMMessage[];
  system?: string;  // AJOUTÉ : système séparé pour Anthropic
  temperature?: number;
  max_tokens?: number;
  org_id?: string;
  user_id?: string;
  agent_name?: string;
}

interface LLMResponse {
  id: string;
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

class LLMGatewayClient {
  private gatewayUrl: string;
  private orgId: string;
  private supabaseKey: string;

  constructor(orgId: string = 'preventera') {
    this.gatewayUrl = import.meta.env.VITE_LLM_GATEWAY_URL || 'https://lljuzduaryqbzrenkfoo.supabase.co/functions/v1/bright-handler';
    this.orgId = import.meta.env.VITE_DEFAULT_ORG_ID || orgId;
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!this.supabaseKey) {
      console.warn('VITE_SUPABASE_ANON_KEY manquant dans .env.local');
    }
  }

  async chat(
    messages: LLMMessage[],
    options: {
      provider?: 'openai' | 'anthropic';
      model?: string;
      system?: string;  // AJOUTÉ
      temperature?: number;
      max_tokens?: number;
      agent_name?: string;
      user_id?: string;
    } = {}
  ): Promise<LLMResponse> {
    const request: LLMRequest = {
      provider: options.provider || import.meta.env.VITE_DEFAULT_PROVIDER || 'anthropic',
      model: options.model || import.meta.env.VITE_DEFAULT_MODEL || 'claude-3-haiku-20240307',
      messages,
      system: options.system,  // AJOUTÉ : prompt système séparé
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      org_id: this.orgId,
      user_id: options.user_id,
      agent_name: options.agent_name
    };

    try {
      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Check VITE_SUPABASE_ANON_KEY in .env.local');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 403) {
          throw new Error('Request blocked for security reasons.');
        }
        if (response.status === 400) {
          console.error('Bad Request details:', errorText);
          throw new Error(`Invalid request format: ${errorText}`);
        }
        
        console.error('Gateway error details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        throw new Error(`Gateway error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`LLM Provider error: ${data.error}`);
      }

      // Normaliser la réponse selon le provider
      if (request.provider === 'anthropic') {
        return {
          id: data.id || 'unknown',
          content: data.content?.[0]?.text || data.content || '',
          usage: {
            input_tokens: data.usage?.input_tokens || 0,
            output_tokens: data.usage?.output_tokens || 0,
            total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
          }
        };
      } else {
        // OpenAI format
        return {
          id: data.id || 'unknown',
          content: data.choices?.[0]?.message?.content || '',
          usage: {
            input_tokens: data.usage?.prompt_tokens || 0,
            output_tokens: data.usage?.completion_tokens || 0,
            total_tokens: data.usage?.total_tokens || 0
          }
        };
      }
    } catch (error) {
      console.error('LLM Gateway error:', error);
      throw error;
    }
  }

  // CORRIGÉ : agentChat pour format Anthropic
  async agentChat(
    agentName: string,
    userMessage: string,
    systemPrompt?: string,
    options: {
      provider?: 'openai' | 'anthropic';
      model?: string;
      userId?: string;
    } = {}
  ): Promise<LLMResponse> {
    const messages: LLMMessage[] = [];
    
    // Pour Anthropic : PAS de message system, seulement user/assistant
    messages.push({ role: 'user', content: userMessage });

    return this.chat(messages, {
      ...options,
      system: systemPrompt,  // Système passé comme paramètre séparé
      agent_name: agentName,
      user_id: options.userId
    });
  }

  // CORRIGÉ : Conversations multi-tours
  async continueConversation(
    agentName: string,
    conversationHistory: { role: 'user' | 'assistant' | 'system'; content: string }[],
    newMessage: string,
    options: {
      provider?: 'openai' | 'anthropic';
      model?: string;
      userId?: string;
    } = {}
  ): Promise<LLMResponse> {
    
    // Extraire le système s'il existe dans l'historique
    let systemPrompt: string | undefined;
    const messages: LLMMessage[] = [];
    
    for (const msg of conversationHistory) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
      }
    }
    
    messages.push({ role: 'user', content: newMessage });

    return this.chat(messages, {
      ...options,
      system: systemPrompt,
      agent_name: agentName,
      user_id: options.userId
    });
  }

  // Test de connexion simplifié
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.agentChat(
        'test',
        'Hello test'
        // Pas de système pour le test
      );
      return response.content.length > 0;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Instance par défaut
export const llmClient = new LLMGatewayClient();

// Fonction helper pour créer des clients par organisation
export function createLLMClient(orgId: string) {
  return new LLMGatewayClient(orgId);
}

// Hooks React pour faciliter l'usage
export function useLLMClient(orgId?: string) {
  return orgId ? createLLMClient(orgId) : llmClient;
}

// Utilitaire pour migration progressive
export async function migrateLLMCall(
  legacyCall: () => Promise<string>,
  agentName: string,
  userMessage: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const response = await llmClient.agentChat(agentName, userMessage, systemPrompt);
    return response.content;
  } catch (error) {
    console.warn('Gateway failed, falling back to legacy call:', error);
    return await legacyCall();
  }
}

// Fonction utilitaire de diagnostic
export async function diagnoseGateway(): Promise<{
  configured: boolean;
  connected: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  
  const configured = !!(import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_LLM_GATEWAY_URL);
  if (!configured) {
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) errors.push('VITE_SUPABASE_ANON_KEY manquant');
    if (!import.meta.env.VITE_LLM_GATEWAY_URL) errors.push('VITE_LLM_GATEWAY_URL manquant');
  }
  
  let connected = false;
  if (configured) {
    try {
      connected = await llmClient.testConnection();
    } catch (error) {
      errors.push(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return { configured, connected, errors };
}

// NOUVEAU : Utilitaire pour tester avec debug
export async function testGatewayWithDebug(): Promise<void> {
  console.log('🔍 Testing Gateway Configuration...');
  
  console.log('Environment variables:');
  console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('- VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  console.log('- VITE_LLM_GATEWAY_URL:', import.meta.env.VITE_LLM_GATEWAY_URL);
  
  try {
    const response = await llmClient.agentChat(
      'AssistantSST',
      'Test de connexion',
      'Tu es un assistant SST. Réponds simplement "Connexion réussie" en français.'
    );
    
    console.log('✅ Gateway test successful!');
    console.log('Response:', response.content);
    console.log('Usage:', response.usage);
  } catch (error) {
    console.error('❌ Gateway test failed:', error);
  }
}