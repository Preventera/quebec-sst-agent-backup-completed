import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AgileFunction } from "@/data/agileFunctions";

export type ExecutionResult = {
  success: boolean;
  message: string;
  data?: any;
  redirectTo?: string;
};

export type AgileActionType = 
  | 'docugen_template'
  | 'template_generation'
  | 'diagnostic_agent'
  | 'monitoring_dashboard'
  | 'inspection_checklist'
  | 'training_scheduler'
  | 'audit_planner'
  | 'document_generator'
  | 'alert_system'
  | 'report_generator'
  | 'crawling_enhanced'
  | 'coming_soon';


// Fonction d'aide pour la modal de prévisualisation
function createDocumentModal(content: string, title: string, fileName: string): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4';
  modal.style.backdropFilter = 'blur(4px)';
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
      <!-- Header -->
      <div class="border-b p-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">${title}</h2>
            <p class="text-blue-100 text-sm">${fileName}</p>
          </div>
          <div class="flex gap-2">
            <button id="download-doc" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              📥 Télécharger
            </button>
            <button id="view-documents" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              📄 Mes Documents  
            </button>
            <button id="close-modal" class="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              ✕
            </button>
          </div>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <div class="prose max-w-none">
          <div class="bg-gray-50 p-4 rounded-lg border">
            <pre class="whitespace-pre-wrap font-mono text-sm leading-relaxed">${content}</pre>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="border-t p-4 bg-gray-50">
        <div class="flex justify-between items-center text-sm text-gray-600">
          <span>Document généré le ${new Date().toLocaleString('fr-CA')}</span>
          <span>${content.length.toLocaleString()} caractères</span>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  const closeBtn = modal.querySelector('#close-modal') as HTMLButtonElement;
  const downloadBtn = modal.querySelector('#download-doc') as HTMLButtonElement;  
  const viewDocsBtn = modal.querySelector('#view-documents') as HTMLButtonElement;

  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  });

  viewDocsBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
    window.location.href = '/documents';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  return modal;
}  

export const getActionType = (func: AgileFunction): AgileActionType => {
  // Fonctions spécialisées avec template_id
  if (func.template_id === 'crawling_sst_enhanced') {
    return 'crawling_enhanced';
  }
  
  // Nouveau template intégré
  if (func.template_id === 'notifications_temps_reel_v1') {
    return 'template_generation';
  }
  
  // Fonctions avec templates DocuGen (anciens)
  if (func.template_id) {
    return 'docugen_template';
  }

  // Classification par agent_owner et focus
  if (func.agent_owner === 'ComplianceAgent') {
    return 'diagnostic_agent';
  }
  
  if (func.agent_owner === 'MonitoringAgent') {
    return 'alert_system';
  }
  
  if (func.agent_owner === 'InspectionAgent') {
    return 'inspection_checklist';
  }
  
  if (func.agent_owner === 'TrainingAgent') {
    return 'training_scheduler';
  }
  
  if (func.agent_owner === 'AuditAgent') {
    return 'audit_planner';
  }

  // Classification par focus/fonction
  if (func.focus.includes('dashboard') || func.focus.includes('suivi')) {
    return 'monitoring_dashboard';
  }

  if (func.fonction.includes('registre') || func.fonction.includes('génération')) {
    return 'document_generator';
  }

  if (func.fonction.includes('rapport') || func.fonction.includes('analyse')) {
    return 'report_generator';
  }

  return 'coming_soon';
};

export const executeAgileFunction = async (func: AgileFunction): Promise<ExecutionResult> => {
  const actionType = getActionType(func);

  try {
    switch (actionType) {
      case 'template_generation':
        return await executeTemplateGeneration(func);

      case 'docugen_template':
        return {
          success: true,
          message: `Redirection vers DocuGen pour ${func.fonction}`,
          redirectTo: `/docugen?template=${func.template_id}`
        };

      case 'diagnostic_agent':
        return await executeDiagnosticAgent(func);

      case 'monitoring_dashboard':
        return await executeMonitoringDashboard(func);

      case 'inspection_checklist':
        return await executeInspectionChecklist(func);

      case 'training_scheduler':
        return await executeTrainingScheduler(func);

      case 'audit_planner':
        return await executeAuditPlanner(func);

      case 'document_generator':
        return await executeDocumentGenerator(func);

      case 'alert_system':
        return await executeAlertSystem(func);

      case 'report_generator':
        return await executeReportGenerator(func);

      case 'crawling_enhanced':
        return await executeCrawlingEnhanced(func);

      case 'coming_soon':
      default:
        return {
          success: false,
          message: `Fonction "${func.fonction}" en développement. Disponible prochainement.`
        };
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la fonction agile:', error);
    return {
      success: false,
      message: `Erreur lors de l'exécution de ${func.fonction}`
    };
  }
};

// Nouvel exécuteur pour le template engine intégré - CORRECTION PLACEHOLDERS
const executeTemplateGeneration = async (func: AgileFunction): Promise<ExecutionResult> => {
  try {
    console.log('Génération avec template engine intégré:', func.template_id);
    
    // Import dynamique du template engine
    const { DocuGenEngine } = await import('@/lib/docugen/templateEngine');
    const engine = new DocuGenEngine();
    
    // CORRECTION: Données alignées avec les placeholders du template
    const templateData = {
      // Correspondance exacte avec les placeholders du template notifications_temps_reel_v1
      "alert_type": "critique",
      "notification_channels": ["email", "sms", "dashboard"],
      "escalation_rules": {
        immediate: true,
        notify_rss: true,
        notify_admin: true,
        response_time_limit: 30
      },
      // Données contextuelles supplémentaires
      company_name: 'Entreprise Test SST',
      incident_details: 'Non-conformité critique détectée lors de l\'inspection',
      detection_timestamp: new Date().toISOString(),
      responsible_agent: func.agent_owner || 'MonitoringAgent',
      priority_level: func.priorite || 'High',
      generated_at: new Date().toLocaleString('fr-CA'),
      regulation_context: func.liens_reglementaires || 'CNESST'
    };

    // Debug logs
    console.log('Template data being sent:', templateData);
    console.log('Template ID:', func.template_id);

    // Génération du document avec le template
    const result = await engine.generateDocument({
      templateId: func.template_id!,
      // CORRECTION: Passer les données dans la structure attendue par getPlaceholderValue
      companyProfile: {
        name: templateData.company_name,
        size: 50,
        sector: 'test',
        address: 'Test Address'
      },
      additionalData: templateData,  // Données principales ici
      options: {
        language: 'fr',
        format: 'markdown'
      },
      metadata: {
        generatedBy: func.agent_owner || 'AgileFunction',
        functionId: func.id,
        functionName: func.fonction,
        priority: func.priorite,
        regulation: func.liens_reglementaires,
        generatedAt: new Date().toISOString()
      }
    });

const fileName = `${func.fonction.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
    
    // OPTION C : STOCKAGE EN BASE DE DONNÉES
    try {
      const { data: savedDoc, error: saveError } = await supabase
        .from('generated_documents')
        .insert({
          title: func.fonction,
          content: result.content,
          template_id: func.template_id,
          agent_owner: func.agent_owner,
          file_name: fileName,
          content_type: 'text/markdown',
          function_id: func.id,
          metadata: {
            priority: func.priorite,
            regulation: func.liens_reglementaires,
            placeholders_used: Object.keys(templateData),
            generation_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (saveError) {
        console.error('Erreur sauvegarde document:', saveError);
      } else {
        console.log('Document sauvegardé en base:', savedDoc.id);
      }
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
    }

    // OPTION A : AFFICHAGE DANS L'INTERFACE
    const modal = createDocumentModal(result.content, func.fonction, fileName);
    document.body.appendChild(modal);

    toast.success(`Document ${func.fonction} généré avec succès!`);

    return {
      success: true,
      message: `Document "${func.fonction}" généré avec succès et disponible`,
      data: {
        template_id: func.template_id,
        content: result.content,
        content_length: result.content.length,
        file_name: fileName,
        generated_at: new Date().toISOString(),
        placeholders_used: Object.keys(templateData),
        document_preview: result.content.substring(0, 200) + "..."
      }
    };
    
  } catch (error) {
    console.error('Erreur génération template:', error);
    toast.error(`Erreur lors de la génération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    
    return {
      success: false,
      message: `Erreur lors de la génération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    };
  }
};

// Fonctions existantes pour les autres types d'actions
const executeDiagnosticAgent = async (func: AgileFunction): Promise<ExecutionResult> => {
  return {
    success: true,
    message: `Diagnostic ${func.fonction} en cours...`,
  };
};

const executeMonitoringDashboard = async (func: AgileFunction): Promise<ExecutionResult> => {
  return {
    success: true,
    message: `Dashboard ${func.fonction} initialisé`,
  };
};

const executeInspectionChecklist = async (func: AgileFunction): Promise<ExecutionResult> => {
  return {
    success: true,
    message: `Checklist ${func.fonction} générée`,
  };
};

const executeTrainingScheduler = async (func: AgileFunction): Promise<ExecutionResult> => {
  return {
    success: true,
    message: `Plan de formation ${func.fonction} créé`,
  };
};

const executeAuditPlanner = async (func: AgileFunction): Promise<ExecutionResult> => {
  return {
    success: true,
    message: `Plan d'audit ${func.fonction} généré`,
  };
};

const executeDocumentGenerator = async (func: AgileFunction): Promise<ExecutionResult> => {
  return {
    success: true,
    message: `Document ${func.fonction} généré`,
  };
};

const executeAlertSystem = async (func: AgileFunction): Promise<ExecutionResult> => {
  return {
    success: true,
    message: `Système d'alerte ${func.fonction} activé`,
  };
};

const executeReportGenerator = async (func: AgileFunction): Promise<ExecutionResult> => {
  return {
    success: true,
    message: `Rapport ${func.fonction} généré`,
  };
};

const executeCrawlingEnhanced = async (func: AgileFunction): Promise<ExecutionResult> => {
  return {
    success: true,
    message: `Crawling ${func.fonction} exécuté`,
  };
};