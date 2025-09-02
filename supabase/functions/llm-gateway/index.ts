// supabase/functions/llm-gateway/index.ts - VERSION CORRIGÉE QUÉBEC
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

// AJOUT CRITIQUE 1 - Configuration québécoise
const QUEBEC_SST_CONFIG = {
  forbiddenTerms: [
    'coordonnateur SPS',
    'Plan Général de Coordination',
    'PGC',
    'PPSPS',
    'directive européenne',
    'code du travail français',
    'réglementation française'
  ],
  requiredTerms: [
    'CNESST',
    'LMRSST',
    'CSTC',
    'RSST',
    'Québec'
  ],
  constructionKeywords: [
    'construction', 'chantier', 'hauteur', 'échafaudage', 
    'harnais', 'garde-corps', 'excavation'
  ]
}

// AJOUT CRITIQUE 2 - Recherche locale québécoise
async function forceQuebecLocalSearch(supabase: any, query: string, agentName?: string): Promise<any[]> {
  console.log(`🔍 RECHERCHE LOCALE QUÉBEC - Agent: ${agentName || 'Generic'}`)
  console.log(`Query: ${query.substring(0, 100)}...`)
  
  try {
    // Extraire les mots-clés de la requête
    const isConstruction = QUEBEC_SST_CONFIG.constructionKeywords.some(keyword =>
      query.toLowerCase().includes(keyword)
    )
    
    // Construire requête de recherche optimisée
    const searchTerms = []
    if (isConstruction) searchTerms.push('CSTC', 'construction')
    searchTerms.push('LMRSST', 'RSST', 'CNESST', 'québec')
    
    const enhancedQuery = `${query} ${searchTerms.join(' OR ')}`
    
    // Recherche prioritaire selon le contexte
    let results: any[] = []
    
    if (isConstruction) {
      // Priorité CSTC pour construction
      const { data: cstcResults } = await supabase
        .from('sst_crawled_content')
        .select(`
          id, title, content, source_id, metadata, created_at,
          sst_sources!inner(name, url, source_type)
        `)
        .textSearch('content', enhancedQuery)
        .eq('sst_sources.source_type', 'CSTC')
        .order('created_at', { ascending: false })
        .limit(5)
      
      results = cstcResults || []
    }
    
    // Élargir si pas assez de résultats
    if (results.length < 3) {
      const { data: generalResults } = await supabase
        .from('sst_crawled_content')
        .select(`
          id, title, content, source_id, metadata, created_at,
          sst_sources!inner(name, url, source_type)
        `)
        .textSearch('content', enhancedQuery)
        .in('sst_sources.source_type', ['LMRSST', 'RSST', 'CNESST'])
        .order('created_at', { ascending: false })
        .limit(3)
      
      results = [...results, ...(generalResults || [])]
    }
    
    console.log(`✅ RÉSULTATS LOCAUX: ${results.length} documents trouvés`)
    
    if (results.length === 0) {
      console.warn('⚠️ AUCUN DOCUMENT LOCAL - BASE NON PEUPLÉE?')
    }
    
    return results
    
  } catch (error) {
    console.error('❌ ERREUR RECHERCHE LOCALE:', error)
    throw new Error(`Échec accès base québécoise: ${error.message}`)
  }
}

// AJOUT CRITIQUE 3 - Validation réponse québécoise
function validateQuebecResponse(response: string): { isValid: boolean, issues: string[] } {
  const issues: string[] = []
  
  // Vérifier termes interdits
  const forbiddenFound = QUEBEC_SST_CONFIG.forbiddenTerms.filter(term =>
    response.toLowerCase().includes(term.toLowerCase())
  )
  
  if (forbiddenFound.length > 0) {
    issues.push(`Termes européens: ${forbiddenFound.join(', ')}`)
  }
  
  // Vérifier contexte québécois
  const quebecFound = QUEBEC_SST_CONFIG.requiredTerms.filter(term =>
    response.toLowerCase().includes(term.toLowerCase())
  )
  
  if (quebecFound.length === 0) {
    issues.push('Manque contexte québécois (CNESST, LMRSST, etc.)')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

// AJOUT CRITIQUE 4 - Enrichir prompt avec données locales
function enrichPromptWithQuebecData(originalMessages: any[], localData: any[], agentName?: string): any[] {
  if (localData.length === 0) {
    // Pas de données locales - avertir
    const warningMessage = `⚠️ DONNÉES LOCALES QUÉBÉCOISES NON DISPONIBLES

Le système AgenticSST ne peut pas accéder à la base de connaissances locale.
Pour des questions SST québécoises, consultez directement:
- CNESST.gouv.qc.ca
- Publications Québec

NE PAS utiliser de sources européennes (coordonnateur SPS, PGC, PPSPS) qui ne s'appliquent pas au Québec.`
    
    return [{
      role: 'user',
      content: warningMessage
    }]
  }
  
  // Enrichir avec données locales
  const enrichedContent = `SYSTÈME SST QUÉBÉCOIS - BASE DE CONNAISSANCES LOCALE
Agent: ${agentName || 'Generic'}

RÈGLES ABSOLUES:
1. UTILISEZ UNIQUEMENT les sources québécoises locales ci-dessous
2. AUTORITÉ COMPÉTENTE: CNESST Québec
3. JAMAIS de coordonnateur SPS, PGC, PPSPS (n'existent pas au Québec)
4. Citez les articles précis des documents locaux

📚 SOURCES LOCALES QUÉBÉCOISES (${localData.length} documents):
${localData.map((doc, i) => `
${i + 1}. ${doc.title}
   Source: ${doc.sst_sources?.name || 'Source officielle'}
   Type: ${doc.sst_sources?.source_type || 'QUÉBEC'}
   Contenu: ${doc.content.substring(0, 400)}...
`).join('\n')}

QUESTION UTILISATEUR:
${originalMessages[originalMessages.length - 1]?.content || 'Non spécifiée'}

IMPORTANT:
- Répondez en vous basant UNIQUEMENT sur les sources locales ci-dessus
- Mentionnez CNESST comme autorité compétente
- Si données insuffisantes, recommandez CNESST.gouv.qc.ca
- Citez articles précis (ex: "Art. 2.9.1 CSTC" selon documents locaux)`

  return [{
    role: 'user', 
    content: enrichedContent
  }]
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

    // *** MODIFICATION CRITIQUE - RECHERCHE LOCALE QUÉBÉCOISE AVANT LLM ***
    const originalQuery = messages[messages.length - 1]?.content || ''
    let localQuebecData: any[] = []
    let enrichedMessages = messages
    
    try {
      // Rechercher dans la base locale québécoise
      localQuebecData = await forceQuebecLocalSearch(supabase, originalQuery, agent_name)
      
      // Enrichir les messages avec données locales
      enrichedMessages = enrichPromptWithQuebecData(messages, localQuebecData, agent_name)
      
      console.log(`📚 DONNÉES LOCALES: ${localQuebecData.length} docs utilisés pour ${agent_name}`)
      
    } catch (error) {
      console.error('❌ ERREUR RECHERCHE LOCALE:', error)
      
      // Log l'erreur mais continuer avec avertissement
      await logRequest(supabase, {
        client_id: clientId,
        provider,
        model,
        agent_name,
        status: 'local_search_failed',
        tokens_used: 0,
        error: error.message
      })
    }

    // Forward request to appropriate LLM provider avec messages enrichis
    let response: Response
    let tokensUsed = 0
    let llmResponseData: any

    if (provider === 'openai') {
      const openAIResponse = await forwardToOpenAI({
        model,
        messages: enrichedMessages,
        temperature,
        max_tokens
      })
      response = openAIResponse.response
      tokensUsed = openAIResponse.tokens
      llmResponseData = openAIResponse.data
    } else if (provider === 'anthropic') {
      const anthropicResponse = await forwardToAnthropic({
        model,
        messages: enrichedMessages,
        temperature,
        max_tokens
      })
      response = anthropicResponse.response
      tokensUsed = anthropicResponse.tokens
      llmResponseData = anthropicResponse.data
    } else {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    // *** VALIDATION QUÉBÉCOISE CRITIQUE ***
    const responseContent = extractResponseContent(llmResponseData, provider)
    const validation = validateQuebecResponse(responseContent)
    
    if (!validation.isValid) {
      console.error(`🚨 REJET RÉPONSE ${agent_name}:`, validation.issues)
      
      // Forcer réponse d'erreur québécoise
      const errorResponse = {
        error: true,
        message: `🚨 RÉPONSE REJETÉE - RÉFÉRENCES NON-QUÉBÉCOISES

Agent: ${agent_name}
Problèmes: ${validation.issues.join(', ')}

Pour votre question: "${originalQuery.substring(0, 100)}..."

Consultez directement CNESST.gouv.qc.ca
⚠️ Le système a détecté des références européennes incorrectes.`,
        agent: agent_name,
        localDataUsed: localQuebecData.length,
        validationIssues: validation.issues
      }
      
      // Log rejet
      await logRequest(supabase, {
        client_id: clientId,
        provider,
        model,
        agent_name,
        status: 'validation_failed',
        tokens_used: tokensUsed,
        security_risk: injectionRisk,
        validation_issues: validation.issues,
        local_sources_used: localQuebecData.length
      })
      
      return new Response(JSON.stringify(errorResponse), {
        status: 200, // Pas d'erreur technique, mais validation échouée
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // Log successful request avec données québécoises
    await logRequest(supabase, {
      client_id: clientId,
      provider,
      model,
      agent_name,
      status: 'success_quebec_validated',
      tokens_used: tokensUsed,
      security_risk: injectionRisk,
      local_sources_used: localQuebecData.length,
      validation_passed: true
    })

    // Update rate limit counters
    await updateRateLimit(supabase, clientId, tokensUsed)

    console.log(`✅ RÉPONSE VALIDÉE QUÉBÉCOISE - ${agent_name} - ${localQuebecData.length} sources locales`)

    return response

  } catch (error) {
    console.error('LLM Gateway Error:', error)

    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders
    })
  }
})

// FONCTION UTILITAIRE - Extraire contenu réponse
function extractResponseContent(responseData: any, provider: string): string {
  if (provider === 'anthropic') {
    return responseData?.content?.[0]?.text || ''
  } else if (provider === 'openai') {
    return responseData?.choices?.[0]?.message?.content || ''
  }
  return ''
}

// Rate limiting functions (inchangées)
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

// Security functions (inchangées)
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

// Provider forwarding functions (modifiées pour capturer data)
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
    tokens,
    data
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
    tokens,
    data
  }
}

// Audit logging (inchangée)
async function logRequest(supabase: any, logData: any) {
  await supabase
    .from('llm_audit_log')
    .insert({
      ...logData,
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID()
    })
}