// supabase/functions/bright-handler/index.ts
// 🎬 Edge Function AgenticSST avec intégration SafeVision
// Version: 1.0 - Septembre 2025

import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../shared_cors.ts'

// Configuration Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Types pour SafeVision
interface SafeVisionScenario {
  id: number
  title: string
  agents: string[]
  orchestration_prompt: string
  category?: string
  priority?: string
  duration_minutes?: number
  target_audience?: string
}

interface CNESSContext {
  source: string
  content: string
  lastUpdated: string
  url?: string
}

// 🚀 HANDLER PRINCIPAL
export default async function handler(req: Request): Promise<Response> {
  // CORS pour tous les endpoints
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname

    console.log(`📍 Bright Handler - ${req.method} ${path}`)

    // 🎬 ENDPOINT SAFEVISION - Récupération Scénario
    if (path === '/api/v1/scenarios/orchestration' && req.method === 'GET') {
      return await handleSafeVisionScenario(req)
    }

    // 🎯 ENDPOINT SAFEVISION - Génération Script (pour plus tard)
    if (path === '/api/v1/video/generate-script' && req.method === 'POST') {
      return await handleSafeVisionScript(req)
    }

    // 📊 ENDPOINT EXISTANT - LLM Chat (votre système actuel)
    if (path === '/api/llm/chat' && req.method === 'POST') {
      return await handleLLMChat(req)
    }

    // 🔍 ENDPOINT TEST - Health Check
    if (path === '/health' && req.method === 'GET') {
      return new Response(JSON.stringify({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'AgenticSST Bright Handler',
        safevision: 'integrated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 404 pour endpoints non trouvés
    return new Response(`Endpoint not found: ${path}`, { 
      status: 404, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('🚨 Bright Handler Error:', error)
    return new Response(`Server Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
}

// 🎬 SAFEVISION - Récupération Scénario pour génération vidéo
async function handleSafeVisionScenario(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const scenarioId = parseInt(url.searchParams.get('scenarioId') || '52')
    
    console.log(`🎬 SafeVision - Récupération scénario ${scenarioId}`)

    // Authentification
    const authResult = await authenticateUser(req)
    if (!authResult.success) {
      return authResult.response!
    }
    
    const user = authResult.user!
    console.log(`🎬 SafeVision - User authentifié: ${user.id}`)

    // Récupérer données scénario
    const scenarioData = await getSafeVisionScenarioData(scenarioId)
    if (!scenarioData) {
      return new Response(`Scénario ${scenarioId} non trouvé`, { 
        status: 404, 
        headers: corsHeaders 
      })
    }

    // Enrichir avec contexte CNESST
    const cnessContext = await getSafeVisionCNESSContext(scenarioId)

    // Construire réponse SafeVision
    const response = {
      scenarioId,
      title: scenarioData.title,
      agents: scenarioData.agents,
      orchestrationPrompt: scenarioData.orchestration_prompt,
      cnessContext,
      sectorialData: {
        targetSCIAN: ["23", "31-33", "48-49"],
        riskLevel: "medium",
        companySize: "20-199"
      },
      deliverables: [
        "Script formation vidéo personnalisé",
        "Quiz validation connaissances",
        "Certificat conformité LMRSST"
      ],
      metadata: {
        timestamp: new Date().toISOString(),
        source: "AgenticSST Quebec",
        version: "1.0",
        integration: "SafeVision"
      }
    }

    // Log audit SafeVision
    await logSafeVisionCall(user.id, scenarioId, 'orchestration', response)

    console.log(`🎬 SafeVision - Réponse générée pour scénario ${scenarioId}`)

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    })

  } catch (error) {
    console.error('🎬 SafeVision Scenario Error:', error)
    return new Response(`SafeVision Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
}

// 🎯 SAFEVISION - Génération Script (placeholder pour étape 2)
async function handleSafeVisionScript(req: Request): Promise<Response> {
  return new Response(JSON.stringify({
    message: "Endpoint SafeVision Script - En développement (Étape 2)",
    status: "coming_soon"
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  })
}

// 📊 LLM Chat (votre système existant - placeholder)
async function handleLLMChat(req: Request): Promise<Response> {
  return new Response(JSON.stringify({
    message: "Endpoint LLM Chat - À implémenter selon vos besoins existants",
    status: "placeholder"
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  })
}

// 🔐 AUTHENTIFICATION UTILISATEUR
async function authenticateUser(req: Request): Promise<{
  success: boolean
  user?: any
  response?: Response
}> {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return {
        success: false,
        response: new Response('Authorization header required', { 
          status: 401, 
          headers: corsHeaders 
        })
      }
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseClient.auth.getUser(token)

    if (error || !user) {
      console.error('🔐 Auth Error:', error)
      return {
        success: false,
        response: new Response('Unauthorized', { 
          status: 401, 
          headers: corsHeaders 
        })
      }
    }

    return { success: true, user }

  } catch (error) {
    console.error('🔐 Auth Exception:', error)
    return {
      success: false,
      response: new Response('Authentication Error', { 
        status: 500, 
        headers: corsHeaders 
      })
    }
  }
}

// 📋 RÉCUPÉRATION DONNÉES SCÉNARIO
async function getSafeVisionScenarioData(scenarioId: number): Promise<SafeVisionScenario | null> {
  try {
    // Tentative 1: Recherche en base Supabase (si table existe)
    const { data: dbScenario, error: dbError } = await supabaseClient
      .from('orchestration_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single()

    if (dbScenario && !dbError) {
      console.log(`📋 Scénario ${scenarioId} trouvé en base Supabase`)
      return dbScenario
    }

    // Tentative 2: Fallback scénarios hardcodés (votre base de 135 scénarios)
    const hardcodedScenarios: Record<number, SafeVisionScenario> = {
      52: {
        id: 52,
        title: "Capsules vidéo obligations LMRSST",
        agents: ["ALSS", "LexiNorm", "Hugo"],
        orchestration_prompt: "Créer modules formation vidéo obligations LMRSST adaptés par secteur avec focus sécurité construction et manufacturier selon réglementation québécoise",
        category: "Formation",
        priority: "high",
        duration_minutes: 2,
        target_audience: "Ouvriers, superviseurs, responsables SST"
      },
      116: {
        id: 116,
        title: "Comité SST chantier temporaire",
        agents: ["CoSS", "DiagSST", "LexiNorm"],
        orchestration_prompt: "Formation composition et fonctionnement comité SST pour chantiers temporaires selon LMRSST Art.90",
        category: "Conformité",
        priority: "medium",
        duration_minutes: 15,
        target_audience: "Responsables SST, superviseurs"
      }
      // Ajoutez d'autres scénarios selon vos besoins
    }

    const scenario = hardcodedScenarios[scenarioId]
    if (scenario) {
      console.log(`📋 Scénario ${scenarioId} trouvé dans données hardcodées`)
      return scenario
    }

    console.log(`📋 Scénario ${scenarioId} non trouvé`)
    return null

  } catch (error) {
    console.error('📋 Erreur récupération scénario:', error)
    return null
  }
}

// 🏢 ENRICHISSEMENT CONTEXTE CNESST
async function getSafeVisionCNESSContext(scenarioId: number): Promise<CNESSContext[]> {
  try {
    console.log(`🏢 Récupération contexte CNESST pour scénario ${scenarioId}`)

    // Recherche dans vos 196 documents CNESST crawlés
    const { data: cnessData, error } = await supabaseClient
      .from('sst_crawled_content')
      .select('source_name, content, updated_at, source_url')
      .or('content.ilike.%LMRSST%,content.ilike.%formation%,content.ilike.%obligation%,content.ilike.%sécurité%')
      .order('updated_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('🏢 Erreur récupération CNESST:', error)
      return []
    }

    const contextData = cnessData?.map(doc => ({
      source: doc.source_name || 'CNESST',
      content: doc.content?.substring(0, 200) + '...' || 'Contenu non disponible',
      lastUpdated: doc.updated_at || new Date().toISOString(),
      url: doc.source_url || undefined
    })) || []

    console.log(`🏢 Trouvé ${contextData.length} documents CNESST pertinents`)
    return contextData

  } catch (error) {
    console.error('🏢 Erreur contexte CNESST:', error)
    return []
  }
}

// 📊 LOG AUDIT SAFEVISION
async function logSafeVisionCall(
  userId: string, 
  scenarioId: number, 
  action: string, 
  responseData: any
): Promise<void> {
  try {
    await supabaseClient
      .from('llm_audit_log')
      .insert({
        user_id: userId,
        agent_type: 'SafeVision',
        request_data: { 
          scenarioId, 
          action,
          endpoint: 'orchestration' 
        },
        response_data: { 
          scenarioId, 
          title: responseData.title,
          agents: responseData.agents 
        },
        tokens_used: 0, // SafeVision endpoint ne consomme pas de tokens LLM directement
        created_at: new Date().toISOString()
      })

    console.log(`📊 Log audit SafeVision - User: ${userId}, Scenario: ${scenarioId}, Action: ${action}`)
  } catch (error) {
    console.error('📊 Erreur log audit SafeVision:', error)
    // Ne pas faire échouer la requête pour un problème de log
  }
}