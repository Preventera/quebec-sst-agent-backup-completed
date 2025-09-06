// src/lib/hitlAgentsService.ts
// Service HITL spécialisé pour les agents AgenticSST Québec

import { useHITLAudit } from '@/lib/hitlService';

type AgentType = 'Hugo' | 'DiagSST' | 'LexiNorm' | 'Prioris' | 'ALSS' | 'Sentinelle' | 'CoSS' | 'DocuGen';

interface AgentContext {
  agentName: AgentType;
  action: string;
  companyProfile?: {
    name: string;
    size: number;
    sector: string;
    riskLevel?: string;
  };
  scenario?: string;
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
  legalBasis: string[];
  expectedOutputs: string[];
}

interface HITLValidationResult {
  approved: boolean;
  justification?: string;
  timestamp: string;
  userId?: string;
}

// Messages HITL contextuels par agent
const AGENT_HITL_MESSAGES: Record<AgentType, (context: AgentContext) => string> = {
  Hugo: (ctx) => `🎯 VALIDATION HITL - ORCHESTRATEUR HUGO

Action: ${ctx.action}
Scénario: ${ctx.scenario}
Entreprise: ${ctx.companyProfile?.name} (${ctx.companyProfile?.size} employés)
Secteur: ${ctx.companyProfile?.sector}

Agents mobilisés: ${ctx.expectedOutputs.join(' → ')}
Base légale: ${ctx.legalBasis.join(', ')}

⚠️ Hugo va coordonner une orchestration multi-agents selon la LMRSST.
Cette action aura un impact sur la conformité réglementaire de l'entreprise.

Approuvez-vous cette orchestration ?`,

  DiagSST: (ctx) => `🔍 VALIDATION HITL - DIAGNOSTIC CONFORMITÉ

Agent: DiagSST (Diagnostic LMRSST)
Action: ${ctx.action}
Entreprise: ${ctx.companyProfile?.name}
Niveau de risque: ${ctx.companyProfile?.riskLevel || 'Non évalué'}

Articles LMRSST analysés: ${ctx.legalBasis.join(', ')}
Livrables attendus: ${ctx.expectedOutputs.join(', ')}

⚠️ DiagSST va analyser la conformité et identifier les lacunes selon la LMRSST.
Cette évaluation peut révéler des non-conformités critiques.

Approuvez-vous ce diagnostic de conformité ?`,

  LexiNorm: (ctx) => `📚 VALIDATION HITL - RÉFÉRENCES LÉGALES

Agent: LexiNorm (Expert LMRSST/RSST)
Action: ${ctx.action}
Références demandées: ${ctx.legalBasis.join(', ')}

Analyse réglementaire: ${ctx.expectedOutputs.join(', ')}
Niveau de criticité: ${ctx.criticalityLevel.toUpperCase()}

⚠️ LexiNorm va fournir l'interprétation officielle de la réglementation SST.
Ces références auront valeur légale pour les décisions de l'entreprise.

Approuvez-vous cette analyse réglementaire ?`,

  Prioris: (ctx) => `📊 VALIDATION HITL - PRIORISATION ACTIONS

Agent: Prioris (Planification SST)
Action: ${ctx.action}
Contexte: ${ctx.scenario}

Actions à prioriser: ${ctx.expectedOutputs.join(', ')}
Base LMRSST: ${ctx.legalBasis.join(', ')}

⚠️ Prioris va établir un plan d'action hiérarchisé avec échéanciers.
Cette priorisation guidera les investissements SST de l'entreprise.

Approuvez-vous cette planification ?`,

  ALSS: (ctx) => `🎓 VALIDATION HITL - FORMATION LIAISON SST

Agent: ALSS (Apprentissage & Liaison)
Action: ${ctx.action}
Public cible: ${ctx.companyProfile?.size} employés - ${ctx.companyProfile?.sector}

Programme formation: ${ctx.expectedOutputs.join(', ')}
Conformité LMRSST: ${ctx.legalBasis.join(', ')}

⚠️ ALSS va concevoir un programme de formation adapté à la LMRSST.
Cette formation engagera la responsabilité de l'employeur.

Approuvez-vous ce programme de formation ?`,

  Sentinelle: (ctx) => `🛡️ VALIDATION HITL - SURVEILLANCE PROACTIVE

Agent: Sentinelle (Monitoring SST)
Action: ${ctx.action}
Surveillance: ${ctx.scenario}

Indicateurs surveillés: ${ctx.expectedOutputs.join(', ')}
Seuils LMRSST: ${ctx.legalBasis.join(', ')}

⚠️ Sentinelle va activer une surveillance continue avec alertes.
Ce monitoring peut déclencher des actions correctives immédiates.

Approuvez-vous cette surveillance ?`,

  CoSS: (ctx) => `👥 VALIDATION HITL - COMITÉ SST VIRTUEL

Agent: CoSS (Comité de Santé Sécurité)
Action: ${ctx.action}
Consultation: ${ctx.scenario}

Délibération: ${ctx.expectedOutputs.join(', ')}
Articles LMRSST: ${ctx.legalBasis.join(', ')}

⚠️ CoSS va simuler une consultation de comité SST selon l'art. 88-91 LMRSST.
Cette consultation aura valeur de recommandation officielle.

Approuvez-vous cette consultation de comité ?`,

  DocuGen: (ctx) => `📄 VALIDATION HITL - GÉNÉRATION DOCUMENTAIRE

Agent: DocuGen (Documentation SST)
Action: ${ctx.action}
Documents: ${ctx.expectedOutputs.join(', ')}

Base légale: ${ctx.legalBasis.join(', ')}
Entreprise: ${ctx.companyProfile?.name}

⚠️ DocuGen va créer des documents légalement contraignants selon la LMRSST.
Ces documents engageront la responsabilité de l'employeur.

Approuvez-vous cette génération documentaire ?`
};

class HITLAgentsService {
  private readonly auditService = useHITLAudit();

  /**
   * Validation HITL contextuelle pour un agent spécifique
   */
  async validateAgentAction(context: AgentContext): Promise<HITLValidationResult> {
    const message = AGENT_HITL_MESSAGES[context.agentName](context);
    
    const userConfirm = window.confirm(message);
    
    const result: HITLValidationResult = {
      approved: userConfirm,
      justification: userConfirm 
        ? `Agent ${context.agentName} approuvé pour: ${context.action}`
        : `Agent ${context.agentName} rejeté pour: ${context.action}`,
      timestamp: new Date().toISOString(),
      userId: 'current-user' // Remplacer par l'ID utilisateur réel
    };

    // Audit centralisé
    await this.auditService.logWorkflowOrchestration(
      `${context.agentName}: ${context.action}`,
      [context.agentName],
      context.criticalityLevel,
      result.approved ? 'approved' : 'rejected',
      result.justification
    );

    return result;
  }

  /**
   * Validation HITL pour orchestration multi-agents
   */
  async validateOrchestration(
    scenario: string,
    agents: AgentType[],
    companyProfile: any,
    criticalityLevel: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<HITLValidationResult> {
    const message = `🎯 VALIDATION HITL - ORCHESTRATION MULTI-AGENTS

Scénario: ${scenario}
Agents mobilisés: ${agents.join(' → ')}
Entreprise: ${companyProfile?.name} (${companyProfile?.size} employés)
Secteur: ${companyProfile?.sector}
Criticité: ${criticalityLevel.toUpperCase()}

⚠️ Cette orchestration va mobiliser plusieurs agents spécialisés SST.
L'impact sur la conformité LMRSST sera significatif.

Approuvez-vous cette orchestration multi-agents ?`;

    const userConfirm = window.confirm(message);
    
    const result: HITLValidationResult = {
      approved: userConfirm,
      justification: userConfirm 
        ? `Orchestration approuvée: ${agents.join(', ')}`
        : `Orchestration rejetée: ${agents.join(', ')}`,
      timestamp: new Date().toISOString()
    };

    // Audit centralisé pour orchestration
    await this.auditService.logWorkflowOrchestration(
      scenario,
      agents,
      criticalityLevel,
      result.approved ? 'approved' : 'rejected',
      result.justification
    );

    return result;
  }
}

// Hook React pour utilisation dans les composants
export const useHITLAgents = () => {
  const service = new HITLAgentsService();
  
  return {
    validateAgentAction: service.validateAgentAction.bind(service),
    validateOrchestration: service.validateOrchestration.bind(service)
  };
};

export default HITLAgentsService;