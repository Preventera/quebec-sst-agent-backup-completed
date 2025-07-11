export interface DocumentTemplate {
  id: string;
  nom: string;
  agent: string;
  description: string;
  exigencesLegales: string[];
  obligatoire: boolean;
  tailleEntreprise: 'toutes' | 'petite' | 'grande';
}

export interface DocumentData {
  entreprise: {
    nom: string;
    taille: number;
    secteur: string;
    adresse?: string;
  };
  diagnostic?: any;
  dateGeneration: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'registre-incidents',
    nom: 'Registre des incidents et accidents',
    agent: 'DocuGen',
    description: 'Registre obligatoire pour consigner tous les incidents et accidents de travail',
    exigencesLegales: ['LMRSST 123'],
    obligatoire: true,
    tailleEntreprise: 'toutes'
  },
  {
    id: 'programme-prevention',
    nom: 'Programme de prévention',
    agent: 'CoSS',
    description: 'Programme de prévention obligatoire pour les entreprises de 20 employés et plus',
    exigencesLegales: ['LMRSST 90'],
    obligatoire: true,
    tailleEntreprise: 'grande'
  },
  {
    id: 'plan-action',
    nom: 'Plan d\'action SST',
    agent: 'Prioris',
    description: 'Plan d\'action recommandé pour les entreprises de moins de 20 employés',
    exigencesLegales: ['LMRSST 64'],
    obligatoire: false,
    tailleEntreprise: 'petite'
  },
  {
    id: 'rapport-coss',
    nom: 'Rapport du Comité SST',
    agent: 'CoSS',
    description: 'Rapport périodique du comité de santé et sécurité',
    exigencesLegales: ['LMRSST 101'],
    obligatoire: true,
    tailleEntreprise: 'grande'
  },
  {
    id: 'designation-alss',
    nom: 'Désignation ALSS',
    agent: 'ALSS',
    description: 'Document de désignation de l\'agent de liaison en santé et sécurité',
    exigencesLegales: ['LMRSST 101'],
    obligatoire: true,
    tailleEntreprise: 'petite'
  },
  {
    id: 'certificat-formation',
    nom: 'Certificat de formation SST',
    agent: 'Sentinelle',
    description: 'Certificat attestant de la formation en santé et sécurité',
    exigencesLegales: ['LMRSST 27'],
    obligatoire: true,
    tailleEntreprise: 'toutes'
  }
];

export function genererDocument(template: DocumentTemplate, data: DocumentData): string {
  const { entreprise, diagnostic, dateGeneration } = data;
  
  switch (template.id) {
    case 'registre-incidents':
      return genererRegistreIncidents(entreprise, dateGeneration);
    
    case 'programme-prevention':
      return genererProgrammePrevention(entreprise, diagnostic, dateGeneration);
    
    case 'plan-action':
      return genererPlanAction(entreprise, diagnostic, dateGeneration);
    
    case 'rapport-coss':
      return genererRapportCoSS(entreprise, dateGeneration);
    
    case 'designation-alss':
      return genererDesignationALSS(entreprise, dateGeneration);
    
    case 'certificat-formation':
      return genererCertificatFormation(entreprise, dateGeneration);
    
    default:
      return genererDocumentGenerique(template, entreprise, dateGeneration);
  }
}

function genererRegistreIncidents(entreprise: any, date: string): string {
  return `# REGISTRE DES INCIDENTS ET ACCIDENTS DE TRAVAIL

**Entreprise:** ${entreprise.nom}
**Date de création:** ${date}
**Référence légale:** LMRSST Article 123

## INSTRUCTIONS D'UTILISATION

Ce registre doit être tenu à jour et consigner tous les incidents et accidents de travail survenus dans l'entreprise.

## MODÈLE D'ENREGISTREMENT

| Date | Heure | Lieu | Description | Personne impliquée | Témoin(s) | Mesures prises |
|------|-------|------|-------------|-------------------|-----------|----------------|
|      |       |      |             |                   |           |                |

## OBLIGATIONS LÉGALES

Selon l'article 123 de la LMRSST, l'employeur doit tenir un registre des incidents et accidents de travail.

**Signature du responsable SST:** _________________________
**Date:** ${date}`;
}

function genererProgrammePrevention(entreprise: any, diagnostic: any, date: string): string {
  return `# PROGRAMME DE PRÉVENTION

**Entreprise:** ${entreprise.nom} (${entreprise.taille} employés)
**Secteur:** ${entreprise.secteur}
**Date d'élaboration:** ${date}
**Référence légale:** LMRSST Article 90

## 1. IDENTIFICATION DES RISQUES

${diagnostic?.nonConformités?.length > 0 ? 
  diagnostic.nonConformités.map((nc: any) => `- ${nc.message} (${nc.article})`).join('\n') :
  '- Analyse des risques à compléter'
}

## 2. MESURES DE PRÉVENTION

${diagnostic?.recommandations?.length > 0 ?
  diagnostic.recommandations.map((rec: any) => `- ${rec.message} (${rec.article})`).join('\n') :
  '- Mesures de prévention à définir'
}

## 3. FORMATION ET INFORMATION

- Formation obligatoire des membres du Comité SST (LMRSST Article 27)
- Sensibilisation de tous les employés aux risques identifiés

## 4. SUIVI ET ÉVALUATION

- Révision annuelle du programme
- Mise à jour suite aux modifications de l'organisation du travail

**Validé par le Comité SST le:** _________________________
**Signature du président du comité:** _________________________`;
}

function genererPlanAction(entreprise: any, diagnostic: any, date: string): string {
  return `# PLAN D'ACTION EN SANTÉ ET SÉCURITÉ

**Entreprise:** ${entreprise.nom} (${entreprise.taille} employés)
**Date d'élaboration:** ${date}
**Référence légale:** LMRSST Article 64

## ACTIONS PRIORITAIRES

${diagnostic?.recommandations?.length > 0 ?
  diagnostic.recommandations.map((rec: any, index: number) => 
    `${index + 1}. ${rec.message} (${rec.article})`
  ).join('\n') :
  '1. Évaluation des risques présents au poste de travail\n2. Mise en place de mesures préventives\n3. Formation et information des employés'
}

## ÉCHÉANCIER

| Action | Responsable | Échéance | Statut |
|--------|-------------|----------|--------|
|        |             |          |        |

**Signature de l'employeur:** _________________________
**Signature de l'ALSS:** _________________________`;
}

function genererRapportCoSS(entreprise: any, date: string): string {
  return `# RAPPORT DU COMITÉ DE SANTÉ ET SÉCURITÉ

**Entreprise:** ${entreprise.nom}
**Période:** ${date}
**Référence légale:** LMRSST Article 101

## COMPOSITION DU COMITÉ

- Représentant(s) de l'employeur: _________________________
- Représentant(s) des travailleurs: _________________________

## ACTIVITÉS RÉALISÉES

1. Participation à l'identification et à l'analyse des risques
2. Validation du programme de prévention
3. Suivi de la mise en œuvre des mesures de prévention

## RECOMMANDATIONS

- À compléter lors des réunions du comité

**Prochaine réunion:** _________________________
**Signature du président:** _________________________`;
}

function genererDesignationALSS(entreprise: any, date: string): string {
  return `# DÉSIGNATION D'UN AGENT DE LIAISON EN SANTÉ ET SÉCURITÉ

**Entreprise:** ${entreprise.nom}
**Date de désignation:** ${date}
**Référence légale:** LMRSST Article 101

## AGENT DÉSIGNÉ

**Nom:** _________________________
**Poste:** _________________________
**Formation SST reçue:** _________________________

## RESPONSABILITÉS

L'agent de liaison a pour responsabilités:
- Recevoir les suggestions et plaintes relatives à la santé et sécurité
- Accompagner l'inspecteur lors de ses visites
- Identifier les situations pouvant être source de danger
- Transmettre les recommandations à l'employeur

## FORMATION

Formation obligatoire selon l'article 27 de la LMRSST.

**Signature de l'employeur:** _________________________
**Signature de l'ALSS:** _________________________`;
}

function genererCertificatFormation(entreprise: any, date: string): string {
  return `# CERTIFICAT DE FORMATION EN SANTÉ ET SÉCURITÉ

**Entreprise:** ${entreprise.nom}
**Date:** ${date}
**Référence légale:** LMRSST Article 27

## PARTICIPANT

**Nom:** _________________________
**Poste:** _________________________
**Fonction SST:** _________________________

## FORMATION REÇUE

- Obligations légales en santé et sécurité
- Identification des risques
- Mesures de prévention
- Rôle et responsabilités

**Durée de la formation:** _________ heures
**Formateur:** _________________________
**Validité:** 3 ans (renouvellement requis)

**Signature du formateur:** _________________________
**Signature du participant:** _________________________`;
}

function genererDocumentGenerique(template: DocumentTemplate, entreprise: any, date: string): string {
  return `# ${template.nom.toUpperCase()}

**Entreprise:** ${entreprise.nom}
**Date:** ${date}
**Agent responsable:** ${template.agent}
**Références légales:** ${template.exigencesLegales.join(', ')}

## Description

${template.description}

## Contenu à compléter

Ce document doit être complété selon les exigences spécifiques de votre entreprise.

**Signature du responsable:** _________________________`;
}

export function filtrerTemplatesParTaille(taille: number): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(template => {
    if (template.tailleEntreprise === 'toutes') return true;
    if (template.tailleEntreprise === 'petite') return taille < 20;
    if (template.tailleEntreprise === 'grande') return taille >= 20;
    return false;
  });
}