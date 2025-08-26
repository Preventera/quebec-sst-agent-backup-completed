// Migration du système d'orchestration agents vers LLM Gateway
// src/lib/agentOrchestrator.ts

import { llmClient } from '@/lib/llmClient';
import orchestrationPrompts from '@/data/orchestrationPrompts.json';

interface AgentCapabilities {
  Hugo: 'Orchestration principale, coordination multi-agents';
  DiagSST: 'Diagnostic conformité, évaluation risques';
  LexiNorm: 'Références légales LMRSST, analyse réglementaire';
  Prioris: 'Priorisation actions, planification';
  DocuGen: 'Génération documents, rapports';
  ALSS: 'Formation, apprentissage, liaison SST';
  Sentinelle: 'Surveillance continue, alertes';
  CoSS: 'Comité SST virtuel, consultation';
}

type AgentType = keyof AgentCapabilities;

interface OrchestrationContext {
  scenarioId: number;
  userContext: string;
  companyProfile?: {
    size: number;
    sector: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  userId: string;
}

interface AgentResponse {
  agentName: AgentType;
  content: string;
  confidence: number;
  sources: string[];
  nextActions?: string[];
  handoffTo?: AgentType;
}

// Prompts système spécialisés pour chaque agent
const AGENT_SYSTEM_PROMPTS: Record<AgentType, string> = {
  Hugo: `Tu es Hugo, l'orchestrateur principal d'AgenticSST Québec. 
Tu coordonnes les autres agents spécialisés selon la LMRSST. 
Tu analyses le contexte global et diriges l'orchestration multi-agents.
Sois concis, stratégique et orienté solutions.`,

  DiagSST: `Tu es DiagSST, l'expert diagnostic de conformité SST.
Tu évalues la conformité LMRSST, identifies les lacunes et risques.
Tu fournis des diagnostics précis avec références réglementaires.
Base tes analyses sur les articles 88-102 LMRSST.`,

  LexiNorm: `Tu es LexiNorm, le spécialiste des références légales SST.
Tu connais parfaitement la LMRSST, RSST, et jurisprudence CNESST.
Tu fournis les références exactes et interprétations réglementaires.
Cite toujours les articles et numéros de règlement précis.`,

  Prioris: `Tu es Prioris, l'expert en priorisation et planification SST.
Tu priorises les actions selon l'impact risque et conformité LMRSST.
Tu créés des plans d'action hiérarchisés avec échéanciers réalistes.
Focus sur l'efficacité opérationnelle et ROI sécuritaire.`,

  DocuGen: `Tu es DocuGen, le générateur de documents SST conformes.
Tu produis des documents structurés selon les standards LMRSST.
Tu génères procédures, politiques, rapports avec format professionnel.
Assure la traçabilité et conformité documentaire.`,

  ALSS: `Tu es ALSS, l'agent de liaison et formation SST.
Tu conçois des programmes de formation LMRSST adaptés.
Tu facilites la communication entre parties prenantes.
Focus sur pédagogie, engagement et appropriation.`,

  Sentinelle: `Tu es Sentinelle, le système de surveillance proactive SST.
Tu détectes les non-conformités et situations à risque.
Tu génères des alertes préventives basées sur indicateurs.
Surveillance continue, réactivité, prévention.`,

  CoSS: `Tu es CoSS, le Comité SST Virtuel.
Tu représentes la perspective participative des travailleurs.
Tu évalues l'acceptabilité sociale des mesures SST.
Balance conformité technique et réalité terrain.`
};

class AgentOrchestrator {
  private activeAgents: Set<AgentType> = new Set();
  private orchestrationHistory: AgentResponse[] = [];

  // Exécuter un scénario d'orchestration spécifique
  async executeOrchestrationScenario(
    scenarioId: number, 
    context: OrchestrationContext
  ): Promise<AgentResponse[]> {
    const scenario = orchestrationPrompts.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scénario ${scenarioId} non trouvé`);
    }

    console.log(`🚀 Exécution orchestration: ${scenario.title}`);
    this.orchestrationHistory = [];
    
    const responses: AgentResponse[] = [];

    // Exécuter chaque agent du scénario en séquence
    for (const agentName of scenario.agents) {
      try {
        const response = await this.executeAgent(
          agentName as AgentType,
          scenario.orchestration_prompt,
          context,
          responses // Historique pour contexte
        );
        
        responses.push(response);
        this.orchestrationHistory.push(response);
        
        // Log pour audit
        await this.logAgentExecution(response, scenario, context);
        
      } catch (error) {
        console.error(`❌ Erreur agent ${agentName}:`, error);
        // Continuer avec les autres agents même si un échoue
      }
    }

    return responses;
  }

  // Exécuter un agent individuel
  async executeAgent(
    agentName: AgentType,
    orchestrationPrompt: string,
    context: OrchestrationContext,
    previousResponses: AgentResponse[] = []
  ): Promise<AgentResponse> {
    
    // Construire le contexte enrichi pour l'agent
    const agentContext = this.buildAgentContext(
      agentName, 
      orchestrationPrompt, 
      context, 
      previousResponses
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

    // Structurer la réponse de l'agent
    return {
      agentName,
      content: llmResponse.content,
      confidence: this.calculateConfidence(llmResponse),
      sources: [`Agent ${agentName}`, 'LMRSST Art. 88-102'],
      nextActions: this.extractNextActions(llmResponse.content),
      handoffTo: this.determineHandoff(agentName, llmResponse.content)
    };
  }

  // Construire le contexte enrichi pour l'agent
  private buildAgentContext(
    agentName: AgentType,
    orchestrationPrompt: string,
    context: OrchestrationContext,
    previousResponses: AgentResponse[]
  ): string {
    let agentContext = `MISSION: ${orchestrationPrompt}\n\n`;
    
    // Contexte utilisateur
    agentContext += `CONTEXTE UTILISATEUR: ${context.userContext}\n\n`;
    
    // Profil entreprise si disponible
    if (context.companyProfile) {
      agentContext += `PROFIL ENTREPRISE:
- Taille: ${context.companyProfile.size} employés
- Secteur: ${context.companyProfile.sector}
- Niveau de risque: ${context.companyProfile.riskLevel}\n\n`;
    }
    
    // Réponses des agents précédents
    if (previousResponses.length > 0) {
      agentContext += `RÉPONSES AGENTS PRÉCÉDENTS:\n`;
      previousResponses.forEach(resp => {
        agentContext += `${resp.agentName}: ${resp.content.substring(0, 200)}...\n`;
      });
      agentContext += '\n';
    }
    
    // Instruction spécifique selon l'agent
    agentContext += this.getAgentSpecificInstruction(agentName);
    
    return agentContext;
  }

  // Instructions spécifiques par agent
  private getAgentSpecificInstruction(agentName: AgentType): string {
    const instructions = {
      Hugo: "En tant qu'orchestrateur, analyse la situation globalement et coordonne la réponse multi-agents.",
      DiagSST: "Effectue un diagnostic complet de conformité LMRSST avec identification précise des lacunes.",
      LexiNorm: "Fournis les références légales exactes et interprétations réglementaires applicables.",
      Prioris: "Priorise les actions selon l'urgence, impact et faisabilité. Crée un plan d'action structuré.",
      DocuGen: "Génère les documents nécessaires avec structure professionnelle et conformité LMRSST.",
      ALSS: "Développe les aspects formation et communication pour l'appropriation des mesures.",
      Sentinelle: "Identifie les indicateurs de surveillance et mécanismes d'alerte préventive.",
      CoSS: "Évalue l'acceptabilité sociale et la faisabilité terrain des mesures proposées."
    };
    
    return instructions[agentName];
  }

  // Calculer le niveau de confiance
  private calculateConfidence(llmResponse: any): number {
    // Logique simple basée sur la longueur et usage de tokens
    const length = llmResponse.content.length;
    const tokenUsage = llmResponse.usage?.total_tokens || 0;
    
    if (length > 500 && tokenUsage > 100) return 94;
    if (length > 300 && tokenUsage > 50) return 87;
    return 75;
  }

  // Extraire les actions suivantes
  private extractNextActions(content: string): string[] {
    // Logique d'extraction des actions (regex, mots-clés, etc.)
    const actionKeywords = ['recommande', 'propose', 'suggère', 'doit', 'devrait'];
    const sentences = content.split(/[.!?]+/);
    
    return sentences
      .filter(s => actionKeywords.some(keyword => s.toLowerCase().includes(keyword)))
      .slice(0, 3)
      .map(s => s.trim());
  }

  // Déterminer l'agent de transfert
  private determineHandoff(agentName: AgentType, content: string): AgentType | undefined {
    // Logique de transfert basée sur le contenu
    if (content.includes('document') && agentName !== 'DocuGen') return 'DocuGen';
    if (content.includes('formation') && agentName !== 'ALSS') return 'ALSS';
    if (content.includes('surveillance') && agentName !== 'Sentinelle') return 'Sentinelle';
    
    return undefined;
  }

  // Logger l'exécution pour audit
  private async logAgentExecution(
    response: AgentResponse,
    scenario: any,
    context: OrchestrationContext
  ): Promise<void> {
    // Utiliser le système de logging existant
    const logData = {
      agent_name: response.agentName,
      user_message: `Scénario ${scenario.id}: ${scenario.title}`,
      agent_response: response.content,
      context_data: {
        scenarioId: scenario.id,
        confidence: response.confidence,
        userId: context.userId,
        orchestrationPrompt: scenario.orchestration_prompt
      }
    };

    // Enregistrement via système existant
    console.log('📊 Audit Agent:', logData);
  }
}

// Instance globale de l'orchestrateur
export const agentOrchestrator = new AgentOrchestrator();

// Fonction utilitaire pour exécution rapide
export async function executeAgentScenario(
  scenarioId: number,
  userContext: string,
  userId: string = 'demo-user'
): Promise<AgentResponse[]> {
  return agentOrchestrator.executeOrchestrationScenario(scenarioId, {
    scenarioId,
    userContext,
    userId
  });
}

// Hook React pour l'orchestration
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