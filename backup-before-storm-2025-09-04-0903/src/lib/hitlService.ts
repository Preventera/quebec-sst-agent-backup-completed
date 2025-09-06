// src/lib/hitlService.ts
// Service HITL pour audit centralisé des validations humaines

interface HITLDecision {
  actionId: string;
  actionType: 'document_generation' | 'workflow_orchestration';
  actionDetails: {
    title: string;
    template?: string;
    company?: string;
    agents?: string;
  };
  decision: 'approved' | 'rejected';
  justification?: string;
  timestamp: string;
}

class HITLAuditService {
  private readonly supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  private readonly supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  async logHITLDecision(decision: HITLDecision): Promise<void> {
    try {
      const auditPayload = {
        request_id: crypto.randomUUID(),
        client_id: 'preventera',
        provider: 'human', // Marquer comme validation humaine
        model: 'hitl-validation',
        agent_name: `HITL-${decision.actionType}`,
        status: decision.decision === 'approved' ? 'success' : 'blocked',
        tokens_used: 0,
        error: decision.decision === 'rejected' 
          ? `HITL Rejected: ${decision.justification || 'No justification provided'}`
          : null,
        security_risk: {
          hitl_decision: decision.decision,
          action_type: decision.actionType,
          action_details: decision.actionDetails,
          validation_timestamp: decision.timestamp,
          justification: decision.justification,
          audit_source: 'hitl-validation-system'
        }
      };

      console.log('🔍 HITL Audit - Envoi vers Supabase:', auditPayload);

      const response = await fetch(`${this.supabaseUrl}/rest/v1/llm_audit_log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(auditPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HITL Audit - Erreur Supabase:', response.status, errorText);
      } else {
        console.log('✅ HITL Audit - Enregistré avec succès');
      }
    } catch (error) {
      console.error('❌ HITL Audit - Erreur réseau:', error);
    }
  }

  async logDocumentGeneration(
    templateName: string, 
    companyName: string, 
    decision: 'approved' | 'rejected',
    justification?: string
  ): Promise<void> {
    await this.logHITLDecision({
      actionId: `doc-${Date.now()}`,
      actionType: 'document_generation',
      actionDetails: {
        title: `Génération ${templateName} pour ${companyName}`,
        template: templateName,
        company: companyName
      },
      decision,
      justification,
      timestamp: new Date().toISOString()
    });
  }

  // FONCTION MANQUANTE AJOUTÉE :
  async logWorkflowOrchestration(
    workflowTitle: string,
    agents: string[],
    priority: string,
    decision: 'approved' | 'rejected',
    justification?: string
  ): Promise<void> {
    await this.logHITLDecision({
      actionId: `workflow-${Date.now()}`,
      actionType: 'workflow_orchestration',
      actionDetails: {
        title: workflowTitle,
        agents: agents.join(', ')
      },
      decision,
      justification,
      timestamp: new Date().toISOString()
    });
  }
}

const hitlService = new HITLAuditService();

// EXPORT MODIFIÉ pour inclure les deux fonctions :
export const useHITLAudit = () => ({
  logDocumentGeneration: hitlService.logDocumentGeneration.bind(hitlService),
  logWorkflowOrchestration: hitlService.logWorkflowOrchestration.bind(hitlService)
});

export default hitlService;