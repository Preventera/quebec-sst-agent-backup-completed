// supabase/functions/llm-gateway/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface LLMRequest {
  provider: 'openai' | 'anthropic';
  model: string;
  messages: any[];
  temperature?: number;
  max_tokens?: number;
  org_id?: string;
  user_id?: string;
  agent_name?: string;
}

interface RateLimitEntry {
  requests: number;
  tokens: number;
  window_start: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request
    const body: LLMRequest = await req.json()
    const { provider, model, messages, temperature, max_tokens, org_id, user_id, agent_name } = body

    // Basic validation
    if (!provider || !model || !messages) {
      return new Response('Missing required fields', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Rate limiting check
    const clientId = org_id || user_id || 'anonymous'
    const rateLimit = await checkRateLimit(supabase, clientId)
    
    if (!rateLimit.allowed) {
      // Log rate limit hit
      await logRequest(supabase, {
        client_id: clientId,
        provider,
        model,
        agent_name,
        status: 'rate_limited',
        tokens_used: 0,
        error: 'Rate limit exceeded'
      })

      return new Response('Rate limit exceeded', { 
        status: 429, 
        headers: corsHeaders 
      })
    }

    // Basic prompt injection detection
    const promptText = JSON.stringify(messages)
    const injectionRisk = detectPromptInjection(promptText)
    
    if (injectionRisk.level === 'HIGH') {
      // Log security incident
      await logRequest(supabase, {
        client_id: clientId,
        provider,
        model,
        agent_name,
        status: 'blocked',
        tokens_used: 0,
        error: 'Prompt injection detected',
        security_risk: injectionRisk
      })

      return new Response('Request blocked for security reasons', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    // Forward request to appropriate LLM provider
    let response: Response
    let tokensUsed = 0

    if (provider === 'openai') {
      const openAIResponse = await forwardToOpenAI({
        model,
        messages,
        temperature,
        max_tokens
      })
      response = openAIResponse.response
      tokensUsed = openAIResponse.tokens
    } else if (provider === 'anthropic') {
      const anthropicResponse = await forwardToAnthropic({
        model,
        messages,
        temperature,
        max_tokens
      })
      response = anthropicResponse.response
      tokensUsed = anthropicResponse.tokens
    } else {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    // Log successful request
    await logRequest(supabase, {
      client_id: clientId,
      provider,
      model,
      agent_name,
      status: 'success',
      tokens_used: tokensUsed,
      security_risk: injectionRisk
    })

    // Update rate limit counters
    await updateRateLimit(supabase, clientId, tokensUsed)

    return response

  } catch (error) {
    console.error('LLM Gateway Error:', error)
    
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})

// Rate limiting functions
async function checkRateLimit(supabase: any, clientId: string) {
  const windowSize = 60 * 1000 // 1 minute window
  const maxRequests = 30 // 30 requests per minute
  const maxTokens = 10000 // 10k tokens per minute
  
  const now = Date.now()
  const windowStart = Math.floor(now / windowSize) * windowSize
  
  const { data } = await supabase
    .from('llm_rate_limits')
    .select('*')
    .eq('client_id', clientId)
    .eq('window_start', windowStart)
    .single()
  
  if (!data) {
    return { allowed: true, remaining: maxRequests }
  }
  
  return {
    allowed: data.requests < maxRequests && data.tokens < maxTokens,
    remaining: maxRequests - data.requests
  }
}

async function updateRateLimit(supabase: any, clientId: string, tokens: number) {
  const windowSize = 60 * 1000
  const windowStart = Math.floor(Date.now() / windowSize) * windowSize
  
  await supabase
    .from('llm_rate_limits')
    .upsert({
      client_id: clientId,
      window_start: windowStart,
      requests: 1,
      tokens: tokens
    }, {
      onConflict: 'client_id,window_start',
      ignoreDuplicates: false
    })
}

// Security functions
function detectPromptInjection(promptText: string) {
  const suspiciousPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /forget\s+everything/i,
    /you\s+are\s+now\s+a\s+different/i,
    /system\s*:\s*ignore/i,
    /\[SYSTEM\]/i,
    /override\s+your\s+guidelines/i
  ]
  
  let risk = 'LOW'
  const matches: string[] = []
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(promptText)) {
      matches.push(pattern.source)
      risk = 'HIGH'
    }
  }
  
  return { level: risk, patterns: matches }
}

// Provider forwarding functions
async function forwardToOpenAI(params: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  })
  
  const data = await response.json()
  const tokens = data.usage?.total_tokens || 0
  
  return {
    response: new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }),
    tokens
  }
}

async function forwardToAnthropic(params: any) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      max_tokens: params.max_tokens || 1000,
      temperature: params.temperature || 0.7
    })
  })
  
  const data = await response.json()
  const tokens = data.usage?.input_tokens + data.usage?.output_tokens || 0
  
  return {
    response: new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }),
    tokens
  }
}

// Audit logging
async function logRequest(supabase: any, logData: any) {
  await supabase
    .from('llm_audit_log')
    .insert({
      ...logData,
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID()
    })
}