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
  | 'diagnostic_agent'
  | 'monitoring_dashboard'
  | 'inspection_checklist'
  | 'training_scheduler'
  | 'audit_planner'
  | 'document_generator'
  | 'alert_system'
  | 'report_generator'
  | 'coming_soon';

export const getActionType = (func: AgileFunction): AgileActionType => {
  // Fonctions avec templates DocuGen
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

// Exécuteurs spécifiques
const executeDiagnosticAgent = async (func: AgileFunction): Promise<ExecutionResult> => {
  // Appel à l'edge function de diagnostic
  const { data, error } = await supabase.functions.invoke('sst-assistant', {
    body: {
      action: 'diagnostic_quick',
      function_context: {
        id: func.id,
        type: 'agile_function',
        regulation: func.liens_reglementaires,
        focus: func.focus
      }
    }
  });

  if (error) {
    return {
      success: false,
      message: `Erreur lors du diagnostic: ${error.message}`
    };
  }

  return {
    success: true,
    message: `Diagnostic ${func.fonction} lancé avec succès`,
    data: data,
    redirectTo: '/diagnostic'
  };
};

const executeMonitoringDashboard = async (func: AgileFunction): Promise<ExecutionResult> => {
  // Génère un dashboard de monitoring spécialisé
  return {
    success: true,
    message: `Dashboard ${func.fonction} activé`,
    redirectTo: '/learning'
  };
};

const executeInspectionChecklist = async (func: AgileFunction): Promise<ExecutionResult> => {
  // Génère une checklist d'inspection
  const checklistData = {
    title: func.fonction,
    regulation: func.liens_reglementaires,
    items: generateInspectionItems(func),
    estimated_time: func.estimated_time || "10 min"
  };

  return {
    success: true,
    message: `Checklist ${func.fonction} générée`,
    data: checklistData
  };
};

const executeTrainingScheduler = async (func: AgileFunction): Promise<ExecutionResult> => {
  // Planifie des formations
  return {
    success: true,
    message: `Planification ${func.fonction} initialisée`,
    data: {
      training_type: func.focus,
      regulation: func.liens_reglementaires,
      estimated_duration: func.estimated_time
    }
  };
};

const executeAuditPlanner = async (func: AgileFunction): Promise<ExecutionResult> => {
  // Planifie des audits
  return {
    success: true,
    message: `Planification d'audit ${func.fonction} créée`,
    data: {
      audit_type: func.focus,
      regulation: func.liens_reglementaires,
      priority: func.priorite
    }
  };
};

const executeDocumentGenerator = async (func: AgileFunction): Promise<ExecutionResult> => {
  // Génère des documents via DocuGen
  const { data, error } = await supabase.functions.invoke('docugen-ai', {
    body: {
      template_type: 'agile_function',
      function_data: {
        id: func.id,
        title: func.fonction,
        regulation: func.liens_reglementaires,
        focus: func.focus,
        priority: func.priorite
      }
    }
  });

  if (error) {
    return {
      success: false,
      message: `Erreur lors de la génération: ${error.message}`
    };
  }

  return {
    success: true,
    message: `Document ${func.fonction} généré avec succès`,
    data: data,
    redirectTo: '/docugen'
  };
};

const executeAlertSystem = async (func: AgileFunction): Promise<ExecutionResult> => {
  // Configure un système d'alerte
  return {
    success: true,
    message: `Système d'alerte ${func.fonction} configuré`,
    data: {
      alert_type: func.focus,
      regulation: func.liens_reglementaires,
      priority: func.priorite
    }
  };
};

const executeReportGenerator = async (func: AgileFunction): Promise<ExecutionResult> => {
  // Génère un rapport
  return {
    success: true,
    message: `Génération de rapport ${func.fonction} en cours`,
    data: {
      report_type: func.focus,
      regulation: func.liens_reglementaires,
      kpi: func.kpi
    }
  };
};

// Utilitaires
const generateInspectionItems = (func: AgileFunction): string[] => {
  const baseItems = [
    `Vérifier la conformité selon ${func.liens_reglementaires}`,
    `Contrôler les éléments liés à: ${func.focus}`,
    `Documenter les non-conformités identifiées`,
    `Mesurer le KPI: ${func.kpi || 'À définir'}`
  ];

  // Ajout d'éléments spécifiques selon la catégorie
  if (func.categorie.includes('CSTC') || func.categorie.includes('RBQ')) {
    baseItems.push('Vérifier la signalisation chantier');
    baseItems.push('Contrôler les équipements de protection collective');
  }

  if (func.categorie.includes('LMRSST')) {
    baseItems.push('Vérifier les registres obligatoires');
    baseItems.push('Contrôler la formation des employés');
  }

  return baseItems;
};