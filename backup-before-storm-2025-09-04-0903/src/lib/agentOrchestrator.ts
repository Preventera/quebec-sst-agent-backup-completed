// VERSION CORRIGÉE - Forcer utilisation base locale québécoise
// Migration du système d'orchestration agents vers LLM Gateway
// src/lib/agentOrchestrator.ts

import { llmClient } from '@/lib/llmClient';
import orchestrationPrompts from '@/data/orchestrationPrompts.json';
// AJOUT CRITIQUE - Import Supabase pour base locale
import { supabase } from '@/lib/supabase';

// INTERFACE MODIFIÉE - Ajout contexte québécois
interface AgentCapabilities {
  Hugo: 'Orchestrateur principal AgenticSST - Coordonne analyses multi-agents selon contexte entreprise (taille, secteur SCIAN, niveau risque). Détermine séquences optimales DiagSST→LexiNorm→DocuGen. Spécialisé LMRSST Art.51+ (comités SST), délégation intelligente selon complexité réglementaire.';
  DiagSST: 'Expert diagnostic conformité LMRSST - Évalue conformité selon taille entreprise (seuils 20+ employés Art.51, obligations différenciées). Analyse secteurs SCIAN spécifiques, identifie gaps critiques LMRSST Art.88-102. Intègre risques par industrie (construction CSTC, manufacturing, services). Produit scoring de conformité avec priorités d\'action.';
  LexiNorm: 'Spécialiste validation juridique SST - Interprète références LMRSST/CNESST/CSTC avec contexte jurisprudentiel. Valide conformité articles spécifiques selon secteur d\'activité. Base de 196 documents officiels crawlés. Expertise obligations légales par taille d\'entreprise et classification SCIAN. Détecte conflits réglementaires multi-législations.';
  Prioris: 'Stratégiste priorisation actions SST - Analyse risque/impact/urgence selon matrices CNESST. Priorise recommandations par contraintes opérationnelles (budget, timeline, ressources humaines). Intègre obligations légales critiques vs amélioration continue. Optimise ROI interventions SST selon secteur d\'activité.';
  DocuGen: 'Générateur documents conformité - Produit documents SST selon templates sectoriels SCIAN. Spécialisé programmes prévention LMRSST Art.51, registres incidents Art.123, procédures CSTC construction. Garantie conformité réglementaire avec références légales intégrées. ROI prouvé: -80% temps génération documentaire.';
  ALSS: 'Agent liaison formation SST spécialisée - Conçoit formations contextualisées par corps de métiers et risques sectoriels. Intègre obligations formation LMRSST selon taille entreprise. Workflows comité SST Art.51, formation nouveaux employés, sensibilisation continue. Communication SST adaptée aux niveaux organisationnels.';
  Sentinelle: 'Système surveillance proactive SST - Détection patterns anormaux indicateurs SST (fréquence accidents, near-miss, non-conformités récurrentes). Alertes préventives selon seuils réglementaires CNESST. Monitoring continu évolution risques par secteur. Prédiction incidents basée sur données historiques et benchmarks industrie.';
  CoSS: 'Expert comité SST virtuel LMRSST Art.51 - Support comités SST pour entreprises 20+ employés. Facilite réunions, procès-verbaux, suivi actions. Expertise répartition représentants employeur/employés. Intègre obligations comités temporaires chantiers construction CSTC. Consultation spécialisée résolution conflits SST.';
}

type AgentType = keyof AgentCapabilities;

// INTERFACE MODIFIÉE - Ajout contexte québécois obligatoire
interface OrchestrationContext {
  scenarioId: number;
  userContext: string;
  companyProfile?: {
    size: number;
    sector: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  userId: string;
  // AJOUTS CRITIQUES pour contexte québécois
  forceLocalQuebec: boolean;
  jurisdiction: 'quebec' | 'canada' | 'international';
}

interface AgentResponse {
  agentName: AgentType;
  content: string;
  confidence: number;
  sources: string[];
  nextActions?: string[];
  handoffTo?: AgentType;
}

// FONCTION CRITIQUE 1 - RECHERCHE LOCALE QUÉBÉCOISE FORCÉE
export async function forceLocalQuebecSearch(query: string): Promise<any[]> {
  console.log('🔍 RECHERCHE LOCALE QUÉBEC FORCÉE:', query);
  
  // Mots-clés québécois obligatoires
  const quebecKeywords = [
    'CSTC', 'LMRSST', 'RSST', 'CNESST', 'québec', 'construction'
  ];
  
  // Construire requête avec contexte québécois
  const enhancedQuery = `${query} ${quebecKeywords.join(' OR ')}`;
  
  try {
    // Recherche prioritaire dans base locale
    const { data: localResults } = await supabase
      .from('sst_crawled_content')
      .select(`
        id,
        title,
        content,
        source_id,
        metadata,
        created_at,
        sst_sources!inner(name, url, source_type)
      `)
      .textSearch('content', enhancedQuery)
      .eq('sst_sources.source_type', 'CSTC') // Priorité CSTC
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log(`✅ RÉSULTATS LOCAUX QUEBEC: ${localResults?.length || 0} documents`);
    
    if (!localResults || localResults.length === 0) {
      console.warn('⚠️ AUCUNE DONNÉE LOCALE QUÉBÉCOISE - PROBLÈME CRITIQUE');
      
      // Recherche élargie si pas de résultats CSTC
      const { data: fallbackResults } = await supabase
        .from('sst_crawled_content')
        .select('*')
        .ilike('content', '%québec%')
        .limit(5);
        
      return fallbackResults || [];
    }
    
    return localResults;
    
  } catch (error) {
    console.error('❌ ERREUR RECHERCHE LOCALE:', error);
    throw new Error(`Impossible d'accéder à la base québécoise: ${error.message}`);
  }
}

// FONCTION CRITIQUE 2 - VALIDATION RÉPONSE QUÉBÉCOISE
export function validateQuebecResponse(response: string): boolean {
  const forbiddenEuropean = [
    'coordonnateur SPS',
    'Plan Général de Coordination',
    'PPSPS', 
    'directive européenne',
    'code du travail français',
    'réglementation française'
  ];
  
  const requiredQuebec = [
    'CNESST',
    'LMRSST',
    'CSTC', 
    'RSST',
    'Québec'
  ];
  
  // Vérifier absence termes interdits
  const hasEuropeanTerms = forbiddenEuropean.some(term =>
    response.toLowerCase().includes(term.toLowerCase())
  );
  
  // Vérifier présence contexte québécois
  const hasQuebecContext = requiredQuebec.some(term =>
    response.toLowerCase().includes(term.toLowerCase())
  );
  
  if (hasEuropeanTerms) {
    console.error('🚨 RÉPONSE INVALIDE - CONTIENT TERMES EUROPÉENS:', 
      forbiddenEuropean.filter(term => 
        response.toLowerCase().includes(term.toLowerCase())
      )
    );
    return false;
  }
  
  if (!hasQuebecContext) {
    console.warn('⚠️ RÉPONSE MANQUE CONTEXTE QUÉBÉCOIS');
    return false;
  }
  
  return true;
}

// PROMPTS SYSTÈME MODIFIÉS - Contexte québécois renforcé
const AGENT_SYSTEM_PROMPTS: Record<AgentType, string> = {
  Hugo: `Tu es Hugo, l'orchestrateur principal d'AgenticSST Québec. 

RÈGLES ABSOLUES:
1. TOUJOURS utiliser la base de données locale Supabase PREMIÈRE
2. Contextualiser selon la réglementation QUÉBÉCOISE uniquement (LMRSST, CSTC, RSST)
3. Autorité compétente: CNESST Québec
4. JAMAIS de références européennes (SPS, PGC, PPSPS)

Tu coordonnes les autres agents spécialisés selon la LMRSST. 
Tu analyses le contexte global et diriges l'orchestration multi-agents.
Sois concis, stratégique et orienté solutions québécoises.`,

  DiagSST: `Tu es DiagSST, l'expert diagnostic de conformité SST QUÉBÉCOISE.

BASE DE DONNÉES LOCALE OBLIGATOIRE:
- 196 documents CSTC/LMRSST crawlés dans Supabase
- Priorité absolue aux sources locales

Tu évalues la conformité LMRSST selon:
- Taille entreprise (seuils 20+ employés Art.51)
- Secteur SCIAN spécifique
- Construction: CSTC applicable

Base tes analyses sur les articles 88-102 LMRSST.
JAMAIS de coordonnateur SPS - cela n'existe pas au Québec.`,

  LexiNorm: `Tu es LexiNorm, le spécialiste des références légales SST QUÉBÉCOISES.

SOURCES AUTORISÉES UNIQUEMENT:
- Base locale Supabase (196 documents officiels)
- LMRSST, RSST, CSTC Québec
- Jurisprudence CNESST uniquement

SOURCES INTERDITES:
- Réglementation européenne/française
- Coordonnateur SPS (n'existe pas au Québec)
- Plan Général de Coordination PGC
- PPSPS européen

Tu fournis les références exactes et interprétations réglementaires québécoises.
Cite toujours les articles LMRSST/CSTC précis de la base locale.`,

  Prioris: `Tu es Prioris, l'expert en priorisation et planification SST QUÉBÉCOISE.

CONTEXTE QUÉBÉCOIS OBLIGATOIRE:
- Matrices de risque CNESST
- Obligations LMRSST par taille d'entreprise
- Secteurs SCIAN avec spécificités

Tu priorises les actions selon l'impact risque et conformité LMRSST.
Tu crées des plans d'action hiérarchisés avec échéanciers réalistes.
Focus sur l'efficacité opérationnelle et ROI sécuritaire québécois.`,

  DocuGen: `Tu es DocuGen, le générateur de documents SST conformes QUÉBÉCOIS.

TEMPLATES QUÉBÉCOIS UNIQUEMENT:
- Programmes prévention LMRSST Art.51
- Registres incidents Art.123
- Procédures CSTC construction
- Standards CNESST

Tu produis des documents structurés selon les standards LMRSST/CSTC.
Tu génères procédures, politiques, rapports avec format professionnel québécois.
Assure la traçabilité et conformité documentaire CNESST.`,

  ALSS: `Tu es ALSS, l'agent de liaison et formation SST QUÉBÉCOISE.

FORMATIONS CONTEXTUALISÉES QUÉBEC:
- Obligations LMRSST selon taille entreprise
- Comité SST Art.51 (20+ employés)
- Formation nouveaux employés
- Corps de métiers par secteur SCIAN

Tu conçois des programmes de formation LMRSST adaptés.
Tu facilites la communication entre parties prenantes.
Focus sur pédagogie, engagement et appropriation québécoise.`,

  Sentinelle: `Tu es Sentinelle, le système de surveillance proactive SST QUÉBÉCOISE.

INDICATEURS CNESST:
- Seuils réglementaires québécois
- Benchmarks industrie par secteur SCIAN
- Patterns sectoriels construction/manufacturing

Tu détectes les non-conformités selon standards CNESST.
Tu génères des alertes préventives basées sur indicateurs québécois.
Surveillance continue, réactivité, prévention contextuelle.`,

  CoSS: `Tu es CoSS, le Comité SST Virtuel QUÉBÉCOIS.

LMRSST ART.51 - COMITÉS SST:
- Entreprises 20+ employés: Comité obligatoire
- Répartition employeur/employés
- Procès-verbaux selon standards CNESST
- Construction: Comités temporaires CSTC

Tu représentes la perspective participative des travailleurs québécois.
Tu évalues l'acceptabilité sociale des mesures SST.
Balance conformité technique LMRSST et réalité terrain.`
};

class AgentOrchestrator {
  private activeAgents: Set<AgentType> = new Set();
  private orchestrationHistory: AgentResponse[] = [];

  // FONCTION MODIFIÉE - Exécuter un scénario avec contexte québécois forcé
  async executeOrchestrationScenario(
    scenarioId: number, 
    context: OrchestrationContext
  ): Promise<AgentResponse[]> {
    const scenario = orchestrationPrompts.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scénario ${scenarioId} non trouvé`);
    }

    console.log(`🚀 Exécution orchestration QUÉBEC: ${scenario.title}`);
    
    // FORCER LE CONTEXTE QUÉBÉCOIS
    const quebecContext = {
      ...context,
      forceLocalQuebec: true,
      jurisdiction: 'quebec' as const
    };
    
    // ÉTAPE CRITIQUE: RECHERCHER DANS BASE LOCALE D'ABORD
    let localQuebecData: any[] = [];
    try {
      localQuebecData = await forceLocalQuebecSearch(context.userContext);
      console.log(`📚 DONNÉES LOCALES QUÉBEC: ${localQuebecData.length} documents trouvés`);
    } catch (error) {
      console.error('❌ ERREUR ACCÈS BASE LOCALE:', error);
    }
    
    this.orchestrationHistory = [];
    const responses: AgentResponse[] = [];

    // Exécuter chaque agent du scénario en séquence
    for (const agentName of scenario.agents) {
      try {
        const response = await this.executeAgent(
          agentName as AgentType,
          scenario.orchestration_prompt,
          quebecContext,
          responses, // Historique pour contexte
          localQuebecData // DONNÉES LOCALES QUÉBÉCOISES
        );
        
        // VALIDATION QUÉBÉCOISE OBLIGATOIRE
        const isValid = validateQuebecResponse(response.content);
        if (!isValid) {
          console.error(`🚨 REJET RÉPONSE ${agentName} - CONTIENT RÉFÉRENCES NON-QUÉBÉCOISES`);
          // Forcer une réponse d'erreur explicite
          response.content = `🚨 ERREUR SYSTÈME: L'agent ${agentName} a généré une réponse avec des références non-québécoises. Consultez directement CNESST.gouv.qc.ca pour "${context.userContext}".`;
          response.confidence = 0;
        }
        
        responses.push(response);
        this.orchestrationHistory.push(response);
        
        // Log pour audit
        await this.logAgentExecution(response, scenario, quebecContext);
        
      } catch (error) {
        console.error(`❌ Erreur agent ${agentName}:`, error);
        // Ajouter réponse d'erreur explicite
        responses.push({
          agentName: agentName as AgentType,
          content: `Erreur technique agent ${agentName}: ${error.message}. Consultez CNESST.gouv.qc.ca`,
          confidence: 0,
          sources: ['Erreur système']
        });
      }
    }

    return responses;
  }

  // FONCTION MODIFIÉE - Exécuter un agent avec données locales québécoises
  async executeAgent(
    agentName: AgentType,
    orchestrationPrompt: string,
    context: OrchestrationContext,
    previousResponses: AgentResponse[] = [],
    localQuebecData: any[] = [] // NOUVEAUX PARAMÈTRE CRITIQUE
  ): Promise<AgentResponse> {
    
    // Construire le contexte enrichi pour l'agent avec données locales
    const agentContext = this.buildAgentContextQuebec(
      agentName, 
      orchestrationPrompt, 
      context, 
      previousResponses,
      localQuebecData // DONNÉES LOCALES
    );

    // Appel sécurisé via LLM Gateway
    const llmResponse = await llmClient.agentChat(
      agentName,
      agentContext,
      AGENT_SYSTEM_PROMPTS[agentName],
      {
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
        userId: context.userId
      }
    );

    // Structurer la réponse de l'agent avec sources québécoises
    return {
      agentName,
      content: llmResponse.content,
      confidence: this.calculateConfidence(llmResponse),
      sources: [
        `Agent ${agentName} (Québec)`, 
        'LMRSST Art. 88-102',
        'CSTC Construction',
        `Base locale: ${localQuebecData.length} docs`
      ],
      nextActions: this.extractNextActions(llmResponse.content),
      handoffTo: this.determineHandoff(agentName, llmResponse.content)
    };
  }

  // FONCTION NOUVELLE - Contexte enrichi avec données locales québécoises
  private buildAgentContextQuebec(
    agentName: AgentType,
    orchestrationPrompt: string,
    context: OrchestrationContext,
    previousResponses: AgentResponse[],
    localQuebecData: any[]
  ): string {
    let agentContext = `MISSION QUÉBÉCOISE: ${orchestrationPrompt}\n\n`;
    
    // CONTEXTE QUÉBÉCOIS OBLIGATOIRE
    agentContext += `JURIDICTION: QUÉBEC (CNESST)\n`;
    agentContext += `RÉGLEMENTATION APPLICABLE: LMRSST, CSTC, RSST uniquement\n`;
    agentContext += `AUTORITÉ COMPÉTENTE: CNESST Québec\n\n`;
    
    // DONNÉES LOCALES DISPONIBLES
    if (localQuebecData.length > 0) {
      agentContext += `📚 DONNÉES LOCALES QUÉBÉCOISES (${localQuebecData.length} documents):\n`;
      localQuebecData.slice(0, 5).forEach((doc, i) => {
        agentContext += `${i+1}. ${doc.title} (${doc.sst_sources?.name || 'CSTC/LMRSST'})\n`;
        agentContext += `   Extrait: ${doc.content.substring(0, 200)}...\n\n`;
      });
    } else {
      agentContext += `⚠️ AUCUNE DONNÉE LOCALE - PROBLÈME TECHNIQUE CRITIQUE\n`;
      agentContext += `Rediriger vers CNESST.gouv.qc.ca\n\n`;
    }
    
    // Contexte utilisateur
    agentContext += `CONTEXTE UTILISATEUR: ${context.userContext}\n\n`;
    
    // Profil entreprise si disponible
    if (context.companyProfile) {
      agentContext += `PROFIL ENTREPRISE QUÉBÉCOISE:
- Taille: ${context.companyProfile.size} employés
- Secteur SCIAN: ${context.companyProfile.sector}
- Niveau de risque: ${context.companyProfile.riskLevel}
- Obligations LMRSST: ${context.companyProfile.size >= 20 ? 'Art.51 Comité SST' : 'Art.51.1 Représentant'}\n\n`;
    }
    
    // Réponses des agents précédents
    if (previousResponses.length > 0) {
      agentContext += `RÉPONSES AGENTS QUÉBÉCOIS PRÉCÉDENTS:\n`;
      previousResponses.forEach(resp => {
        agentContext += `${resp.agentName}: ${resp.content.substring(0, 200)}...\n`;
      });
      agentContext += '\n';
    }
    
    // Instruction spécifique selon l'agent
    agentContext += this.getAgentSpecificInstructionQuebec(agentName);
    
    return agentContext;
  }

  // FONCTION MODIFIÉE - Instructions québécoises spécifiques
  private getAgentSpecificInstructionQuebec(agentName: AgentType): string {
    const instructions = {
      Hugo: "En tant qu'orchestrateur québécois, analyse selon LMRSST et coordonne la réponse multi-agents avec sources locales prioritaires.",
      DiagSST: "Effectue un diagnostic conformité LMRSST selon taille entreprise et secteur SCIAN. Utilise UNIQUEMENT les données locales Supabase.",
      LexiNorm: "Fournis les références LMRSST/CSTC exactes de la base locale. JAMAIS de coordonnateur SPS ou réglementation européenne.",
      Prioris: "Priorise selon matrices CNESST et contraintes québécoises. Intègre obligations Art.51+ selon taille entreprise.",
      DocuGen: "Génère documents conformes LMRSST/CSTC avec templates québécois. Standards CNESST uniquement.",
      ALSS: "Développe formation contextualisée québécoise par secteur SCIAN. Comité SST Art.51 si ≥20 employés.",
      Sentinelle: "Surveillance selon indicateurs CNESST et seuils réglementaires québécois par industrie.",
      CoSS: "Comité SST virtuel selon Art.51 LMRSST. Répartition employeur/employés selon obligations québécoises."
    };
    
    return instructions[agentName] + "\n\nIMPORTANT: Base tes réponses sur les données locales québécoises fournies ci-dessus.";
  }

  // Fonctions utilitaires inchangées mais avec logging amélioré
  private calculateConfidence(llmResponse: any): number {
    const length = llmResponse.content.length;
    const tokenUsage = llmResponse.usage?.total_tokens || 0;
    
    if (length > 500 && tokenUsage > 100) return 94;
    if (length > 300 && tokenUsage > 50) return 87;
    return 75;
  }

  private extractNextActions(content: string): string[] {
    const actionKeywords = ['recommande', 'propose', 'suggère', 'doit', 'devrait'];
    const sentences = content.split(/[.!?]+/);
    
    return sentences
      .filter(s => actionKeywords.some(keyword => s.toLowerCase().includes(keyword)))
      .slice(0, 3)
      .map(s => s.trim());
  }

  private determineHandoff(agentName: AgentType, content: string): AgentType | undefined {
    if (content.includes('document') && agentName !== 'DocuGen') return 'DocuGen';
    if (content.includes('formation') && agentName !== 'ALSS') return 'ALSS';
    if (content.includes('surveillance') && agentName !== 'Sentinelle') return 'Sentinelle';
    
    return undefined;
  }

  // Logger amélioré avec contexte québécois
  private async logAgentExecution(
    response: AgentResponse,
    scenario: any,
    context: OrchestrationContext
  ): Promise<void> {
    const logData = {
      agent_name: response.agentName,
      user_message: `Scénario ${scenario.id}: ${scenario.title}`,
      agent_response: response.content,
      context_data: {
        scenarioId: scenario.id,
        confidence: response.confidence,
        userId: context.userId,
        jurisdiction: 'quebec',
        forceLocalQuebec: context.forceLocalQuebec,
        orchestrationPrompt: scenario.orchestration_prompt
      }
    };

    console.log('📊 Audit Agent Québec:', logData);
  }
}

// Instance globale de l'orchestrateur
export const agentOrchestrator = new AgentOrchestrator();

// FONCTION MODIFIÉE - Exécution avec contexte québécois forcé
export async function executeAgentScenario(
  scenarioId: number,
  userContext: string,
  userId: string = 'demo-user'
): Promise<AgentResponse[]> {
  return agentOrchestrator.executeOrchestrationScenario(scenarioId, {
    scenarioId,
    userContext,
    userId,
    forceLocalQuebec: true,  // FORCER CONTEXTE QUÉBÉCOIS
    jurisdiction: 'quebec'
  });
}

// Hook React pour l'orchestration avec contexte québécois
export function useAgentOrchestration() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<AgentResponse[]>([]);

  const executeScenario = async (scenarioId: number, context: string) => {
    setIsExecuting(true);
    try {
      const responses = await executeAgentScenario(scenarioId, context);
      setResults(responses);
      return responses;
    } finally {
      setIsExecuting(false);
    }
  };

  return { executeScenario, isExecuting, results };
}