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
  // Appel à l'edge function pour générer la checklist
  const { data, error } = await supabase.functions.invoke('agile-function-executor', {
    body: {
      agileFunction: func,
      actionType: 'inspection_checklist'
    }
  });

  if (error) {
    return {
      success: false,
      message: `Erreur lors de la génération: ${error.message}`
    };
  }

  if (data?.data?.file) {
    // Créer un lien de téléchargement
    const blob = new Blob([data.data.file.content], { type: data.data.file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.data.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    success: true,
    message: data?.message || `Checklist ${func.fonction} générée`,
    data: data?.data
  };
};

const executeTrainingScheduler = async (func: AgileFunction): Promise<ExecutionResult> => {
  const { data, error } = await supabase.functions.invoke('agile-function-executor', {
    body: {
      agileFunction: func,
      actionType: 'training_scheduler'
    }
  });

  if (error) {
    return {
      success: false,
      message: `Erreur: ${error.message}`
    };
  }

  if (data?.data?.file) {
    downloadFile(data.data.file);
  }

  return {
    success: true,
    message: data?.message || `Plan de formation ${func.fonction} créé`,
    data: data?.data
  };
};

const executeAuditPlanner = async (func: AgileFunction): Promise<ExecutionResult> => {
  const { data, error } = await supabase.functions.invoke('agile-function-executor', {
    body: {
      agileFunction: func,
      actionType: 'audit_planner'
    }
  });

  if (error) {
    return {
      success: false,
      message: `Erreur: ${error.message}`
    };
  }

  if (data?.data?.file) {
    downloadFile(data.data.file);
  }

  return {
    success: true,
    message: data?.message || `Plan d'audit ${func.fonction} généré`,
    data: data?.data
  };
};

const executeDocumentGenerator = async (func: AgileFunction): Promise<ExecutionResult> => {
  const { data, error } = await supabase.functions.invoke('agile-function-executor', {
    body: {
      agileFunction: func,
      actionType: 'document_generator'
    }
  });

  if (error) {
    return {
      success: false,
      message: `Erreur lors de la génération: ${error.message}`
    };
  }

  if (data?.data?.file) {
    downloadFile(data.data.file);
  }

  return {
    success: true,
    message: data?.message || `Document ${func.fonction} généré`,
    data: data?.data
  };
};

const executeAlertSystem = async (func: AgileFunction): Promise<ExecutionResult> => {
  const { data, error } = await supabase.functions.invoke('agile-function-executor', {
    body: {
      agileFunction: func,
      actionType: 'alert_system'
    }
  });

  if (error) {
    return {
      success: false,
      message: `Erreur: ${error.message}`
    };
  }

  if (data?.data?.file) {
    downloadFile(data.data.file);
  }

  return {
    success: true,
    message: data?.message || `Système d'alerte ${func.fonction} configuré`,
    data: data?.data
  };
};

const executeReportGenerator = async (func: AgileFunction): Promise<ExecutionResult> => {
  const { data, error } = await supabase.functions.invoke('agile-function-executor', {
    body: {
      agileFunction: func,
      actionType: 'report_generator'
    }
  });

  if (error) {
    return {
      success: false,
      message: `Erreur: ${error.message}`
    };
  }

  if (data?.data?.file) {
    downloadFile(data.data.file);
  }

  return {
    success: true,
    message: data?.message || `Rapport ${func.fonction} généré`,
    data: data?.data
  };
};

// Utilitaire pour télécharger les fichiers
const downloadFile = (file: { name: string; content: string; type: string }) => {
  const blob = new Blob([file.content], { type: file.type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};