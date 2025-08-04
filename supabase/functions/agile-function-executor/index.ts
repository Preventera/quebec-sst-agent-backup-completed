import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgileFunction {
  id: number;
  fonction: string;
  categorie: string;
  focus: string;
  liens_reglementaires: string;
  priorite: string;
  kpi?: string;
  agent_owner?: string;
  template_id?: string;
  estimated_time?: string;
}

interface ExecutionRequest {
  agileFunction: AgileFunction;
  actionType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agileFunction, actionType }: ExecutionRequest = await req.json();
    
    console.log(`Executing agile function: ${agileFunction.fonction} (Type: ${actionType})`);

    let result;
    
    switch (actionType) {
      case 'inspection_checklist':
        result = await generateInspectionChecklist(agileFunction);
        break;
        
      case 'document_generator':
        result = await generateDocument(agileFunction);
        break;
        
      case 'report_generator':
        result = await generateReport(agileFunction);
        break;
        
      case 'training_scheduler':
        result = await generateTrainingPlan(agileFunction);
        break;
        
      case 'audit_planner':
        result = await generateAuditPlan(agileFunction);
        break;
        
      case 'alert_system':
        result = await configureAlertSystem(agileFunction);
        break;
        
      default:
        result = {
          success: false,
          message: `Type d'action ${actionType} non supporté`,
          data: null
        };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in agile-function-executor:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Erreur lors de l'exécution: ${error.message}`,
      data: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateInspectionChecklist(func: AgileFunction) {
  const checklist = {
    title: func.fonction,
    description: func.focus,
    regulation: func.liens_reglementaires,
    priority: func.priorite,
    estimated_time: func.estimated_time || "10 min",
    kpi: func.kpi || "% éléments conformes",
    created_at: new Date().toISOString(),
    items: generateChecklistItems(func),
    metadata: {
      agent_owner: func.agent_owner,
      category: func.categorie,
      id: func.id
    }
  };

  // Générer le fichier de checklist
  const fileContent = generateChecklistFile(checklist);

  return {
    success: true,
    message: `Checklist ${func.fonction} générée avec succès`,
    data: {
      checklist,
      file: {
        name: `checklist_${func.id}_${Date.now()}.json`,
        content: fileContent,
        type: 'application/json'
      },
      downloadable: true
    }
  };
}

async function generateDocument(func: AgileFunction) {
  const document = {
    title: func.fonction,
    type: "Document SST",
    regulation: func.liens_reglementaires,
    content: generateDocumentContent(func),
    created_at: new Date().toISOString(),
    metadata: {
      priority: func.priorite,
      agent_owner: func.agent_owner,
      category: func.categorie,
      estimated_time: func.estimated_time
    }
  };

  return {
    success: true,
    message: `Document ${func.fonction} généré`,
    data: {
      document,
      file: {
        name: `document_${func.id}_${Date.now()}.md`,
        content: generateMarkdownDocument(document),
        type: 'text/markdown'
      },
      downloadable: true
    }
  };
}

async function generateReport(func: AgileFunction) {
  const report = {
    title: `Rapport - ${func.fonction}`,
    type: "Rapport d'analyse SST",
    regulation: func.liens_reglementaires,
    kpi: func.kpi,
    analysis: generateAnalysisContent(func),
    recommendations: generateRecommendations(func),
    created_at: new Date().toISOString(),
    metadata: {
      priority: func.priorite,
      category: func.categorie,
      focus: func.focus
    }
  };

  return {
    success: true,
    message: `Rapport ${func.fonction} généré`,
    data: {
      report,
      file: {
        name: `rapport_${func.id}_${Date.now()}.md`,
        content: generateReportMarkdown(report),
        type: 'text/markdown'
      },
      downloadable: true
    }
  };
}

async function generateTrainingPlan(func: AgileFunction) {
  const trainingPlan = {
    title: `Plan de formation - ${func.fonction}`,
    regulation: func.liens_reglementaires,
    modules: generateTrainingModules(func),
    schedule: generateTrainingSchedule(func),
    resources: generateTrainingResources(func),
    created_at: new Date().toISOString()
  };

  return {
    success: true,
    message: `Plan de formation ${func.fonction} créé`,
    data: {
      trainingPlan,
      file: {
        name: `formation_${func.id}_${Date.now()}.json`,
        content: JSON.stringify(trainingPlan, null, 2),
        type: 'application/json'
      },
      downloadable: true
    }
  };
}

async function generateAuditPlan(func: AgileFunction) {
  const auditPlan = {
    title: `Plan d'audit - ${func.fonction}`,
    regulation: func.liens_reglementaires,
    scope: func.focus,
    priority: func.priorite,
    checklist: generateAuditChecklist(func),
    timeline: generateAuditTimeline(func),
    resources_needed: generateAuditResources(func),
    created_at: new Date().toISOString()
  };

  return {
    success: true,
    message: `Plan d'audit ${func.fonction} généré`,
    data: {
      auditPlan,
      file: {
        name: `audit_${func.id}_${Date.now()}.json`,
        content: JSON.stringify(auditPlan, null, 2),
        type: 'application/json'
      },
      downloadable: true
    }
  };
}

async function configureAlertSystem(func: AgileFunction) {
  const alertConfig = {
    name: func.fonction,
    description: func.focus,
    regulation: func.liens_reglementaires,
    priority: func.priorite,
    triggers: generateAlertTriggers(func),
    notifications: generateNotificationRules(func),
    escalation: generateEscalationRules(func),
    created_at: new Date().toISOString()
  };

  return {
    success: true,
    message: `Système d'alerte ${func.fonction} configuré`,
    data: {
      alertConfig,
      file: {
        name: `alerte_${func.id}_${Date.now()}.json`,
        content: JSON.stringify(alertConfig, null, 2),
        type: 'application/json'
      },
      downloadable: true
    }
  };
}

// Utilitaires de génération de contenu
function generateChecklistItems(func: AgileFunction): string[] {
  const baseItems = [
    `Vérifier la conformité selon ${func.liens_reglementaires}`,
    `Contrôler les éléments liés à: ${func.focus}`,
    `Documenter les non-conformités identifiées`,
    `Mesurer le KPI: ${func.kpi || 'À définir'}`,
    `Prendre les actions correctives nécessaires`
  ];

  // Ajout d'éléments spécifiques selon la catégorie
  if (func.categorie.includes('CSTC') || func.categorie.includes('RBQ')) {
    baseItems.push(
      'Vérifier la signalisation chantier',
      'Contrôler les équipements de protection collective',
      'Vérifier les harnais et systèmes antichute'
    );
  }

  if (func.categorie.includes('LMRSST')) {
    baseItems.push(
      'Vérifier les registres obligatoires',
      'Contrôler la formation des employés',
      'Vérifier les procédures d\'urgence'
    );
  }

  if (func.categorie.includes('Ergonomie')) {
    baseItems.push(
      'Évaluer les postures de travail',
      'Mesurer les charges manipulées',
      'Vérifier l\'aménagement des postes'
    );
  }

  return baseItems;
}

function generateChecklistFile(checklist: any): string {
  return JSON.stringify(checklist, null, 2);
}

function generateDocumentContent(func: AgileFunction): string {
  return `
# ${func.fonction}

## Description
${func.focus}

## Réglementation applicable
${func.liens_reglementaires}

## Priorité
${func.priorite}

## KPI à surveiller
${func.kpi || 'À définir'}

## Agent responsable
${func.agent_owner || 'À assigner'}

## Temps estimé
${func.estimated_time || 'À déterminer'}

## Actions recommandées
- Mise en conformité selon la réglementation
- Suivi régulier des indicateurs
- Formation du personnel concerné
- Documentation des procédures
`;
}

function generateMarkdownDocument(document: any): string {
  return `# ${document.title}

**Type:** ${document.type}
**Date de création:** ${new Date(document.created_at).toLocaleDateString('fr-FR')}
**Réglementation:** ${document.regulation}

## Contenu

${document.content}

## Métadonnées
- **Priorité:** ${document.metadata.priority}
- **Agent responsable:** ${document.metadata.agent_owner}
- **Catégorie:** ${document.metadata.category}
- **Temps estimé:** ${document.metadata.estimated_time}
`;
}

function generateAnalysisContent(func: AgileFunction): string {
  return `Analyse des risques et conformité pour ${func.fonction}. 
Focus sur ${func.focus} selon ${func.liens_reglementaires}.
Priorité: ${func.priorite}`;
}

function generateRecommendations(func: AgileFunction): string[] {
  return [
    `Mise en œuvre immédiate des exigences ${func.liens_reglementaires}`,
    `Surveillance continue du KPI: ${func.kpi}`,
    `Formation ciblée sur ${func.focus}`,
    `Révision périodique des procédures`
  ];
}

function generateReportMarkdown(report: any): string {
  return `# ${report.title}

**Type:** ${report.type}
**Date:** ${new Date(report.created_at).toLocaleDateString('fr-FR')}
**Réglementation:** ${report.regulation}

## Analyse
${report.analysis}

## KPI
${report.kpi}

## Recommandations
${report.recommendations.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n')}

## Métadonnées
- **Priorité:** ${report.metadata.priority}
- **Catégorie:** ${report.metadata.category}
- **Focus:** ${report.metadata.focus}
`;
}

function generateTrainingModules(func: AgileFunction): any[] {
  return [
    {
      name: `Formation ${func.focus}`,
      duration: func.estimated_time || "2h",
      regulation: func.liens_reglementaires,
      objectives: [`Maîtriser ${func.focus}`, `Respecter ${func.liens_reglementaires}`]
    }
  ];
}

function generateTrainingSchedule(func: AgileFunction): any {
  return {
    frequency: func.priorite === 'Critique' ? 'Trimestrielle' : 'Annuelle',
    duration: func.estimated_time || "2h",
    participants: "Personnel concerné"
  };
}

function generateTrainingResources(func: AgileFunction): string[] {
  return [
    `Guide ${func.liens_reglementaires}`,
    `Procédures ${func.focus}`,
    'Support de formation',
    'Quiz d\'évaluation'
  ];
}

function generateAuditChecklist(func: AgileFunction): string[] {
  return [
    `Conformité ${func.liens_reglementaires}`,
    `Application des procédures ${func.focus}`,
    `Mesure du KPI: ${func.kpi}`,
    'Documentation à jour',
    'Formation du personnel'
  ];
}

function generateAuditTimeline(func: AgileFunction): any {
  return {
    preparation: "1 semaine",
    execution: func.estimated_time || "1 jour",
    reporting: "3 jours",
    frequency: func.priorite === 'Critique' ? 'Trimestrielle' : 'Semestrielle'
  };
}

function generateAuditResources(func: AgileFunction): string[] {
  return [
    'Auditeur certifié',
    `Documentation ${func.liens_reglementaires}`,
    'Checklist d\'audit',
    'Outils de mesure'
  ];
}

function generateAlertTriggers(func: AgileFunction): any[] {
  return [
    {
      name: `Non-conformité ${func.focus}`,
      condition: `KPI ${func.kpi} hors seuil`,
      severity: func.priorite
    }
  ];
}

function generateNotificationRules(func: AgileFunction): any {
  return {
    immediate: func.priorite === 'Critique',
    email: true,
    sms: func.priorite === 'Critique',
    dashboard: true
  };
}

function generateEscalationRules(func: AgileFunction): any {
  return {
    level1: "Superviseur immédiat",
    level2: "Responsable SST",
    level3: func.priorite === 'Critique' ? "Direction" : null,
    timeframe: func.priorite === 'Critique' ? "30 min" : "2h"
  };
}