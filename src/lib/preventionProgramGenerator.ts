export interface PreventionProgramParams {
  companyName: string;
  sector: string;
  scianCode?: string;
  companySize: number;
  mainActivities: string[];
  identifiedRisks: string[];
  existingMeasures: string[];
  diagnosticResults?: any;
}

export interface PreventionProgramSection {
  title: string;
  content: string;
  subsections?: PreventionProgramSection[];
}

export interface PreventionProgram {
  title: string;
  companyInfo: {
    name: string;
    sector: string;
    scianCode?: string;
    size: number;
  };
  sections: PreventionProgramSection[];
  generatedDate: string;
  lastUpdated: string;
}

// Base de données des risques par secteur SCIAN
const SECTOR_RISKS: Record<string, string[]> = {
  "construction": [
    "Chutes de hauteur",
    "Électrocution",
    "Écrasement par machinerie",
    "Exposition à l'amiante",
    "Bruit excessif",
    "Vibrations",
    "Poussières de silice",
    "Manutention manuelle"
  ],
  "manufacturier": [
    "Machinerie en mouvement",
    "Substances chimiques",
    "Bruit industriel",
    "Ergonomie - mouvements répétitifs",
    "Espaces confinés",
    "Équipements sous pression",
    "Rayonnements",
    "Manutention manuelle"
  ],
  "transport": [
    "Accidents de véhicules",
    "Manutention de marchandises",
    "Fatigue au volant",
    "Conditions météorologiques",
    "Exposition aux carburants",
    "Ergonomie - position assise prolongée",
    "Stress et pression temporelle"
  ],
  "services": [
    "Troubles musculo-squelettiques",
    "Stress psychosocial",
    "Qualité de l'air intérieur",
    "Ergonomie des postes de travail",
    "Violence en milieu de travail",
    "Glissades et chutes de plain-pied"
  ],
  "default": [
    "Incendies et explosions",
    "Premiers secours",
    "Évacuation d'urgence",
    "Équipements de protection individuelle",
    "Formation et sensibilisation",
    "Inspection des lieux de travail"
  ]
};

// Base de données spécialisée par code SCIAN précis
const SCIAN_SPECIFIC_RISKS: Record<string, string[]> = {
  // Construction spécialisée
  "2361": ["Travail en hauteur", "Charpente", "Couverture", "Échafaudages"],
  "2362": ["Plomberie", "Soudage", "Espaces confinés", "Gaz et vapeurs"],
  "2383": ["Électricité haute tension", "Arc électrique", "Travail sous tension"],
  
  // Fabrication alimentaire
  "3111": ["Machines de boucherie", "Températures froides", "Lames et couteaux", "Sols glissants"],
  "3112": ["Poussières de grain", "Espaces confinés", "Machinerie agricole"],
  
  // Fabrication métallique
  "3321": ["Métaux en fusion", "Radiations thermiques", "Monoxyde de carbone"],
  "3322": ["Outils de coupe", "Copeaux métalliques", "Fluides de coupe"],
  
  // Transport
  "4841": ["Marchandises dangereuses", "Manutention lourde", "Conduite longue distance"],
  "4842": ["Entrepôt frigorifique", "Chariots élévateurs", "Stockage en hauteur"],
  
  // Services de santé
  "6211": ["Agents pathogènes", "Aiguilles souillées", "Radiations médicales"],
  "6212": ["Produits pharmaceutiques", "Chimiothérapie", "Manipulation précise"],
  
  // Restauration
  "7221": ["Surfaces chaudes", "Huiles de friture", "Sols glissants", "Coupures"],
  "7222": ["Service rapide", "Stress temporel", "Brûlures", "Équipement électrique"]
};

// Fonction pour identifier les risques selon le code SCIAN
export function identifyRisksByScian(scianCode?: string, sector?: string): string[] {
  const risks: string[] = [];
  
  // 1. Risques spécifiques au code SCIAN exact
  if (scianCode && SCIAN_SPECIFIC_RISKS[scianCode]) {
    risks.push(...SCIAN_SPECIFIC_RISKS[scianCode]);
  }
  
  // 2. Risques sectoriels généraux
  const sectorKey = sector?.toLowerCase() || 'default';
  if (SECTOR_RISKS[sectorKey]) {
    risks.push(...SECTOR_RISKS[sectorKey]);
  } else {
    risks.push(...SECTOR_RISKS.default);
  }
  
  // 3. Retourner les risques uniques
  return [...new Set(risks)];
}

// Mesures de prévention par type de risque
const PREVENTION_MEASURES: Record<string, string[]> = {
  "Chutes de hauteur": [
    "Installation de garde-corps conformes",
    "Utilisation de harnais de sécurité",
    "Formation sur le travail en hauteur",
    "Inspection quotidienne des équipements",
    "Procédures de travail sécuritaires"
  ],
  "Électrocution": [
    "Cadenassage des sources d'énergie",
    "Vérification de l'absence de tension",
    "Utilisation d'équipements isolés",
    "Formation électrique spécialisée",
    "Inspection des installations électriques"
  ],
  "Machinerie en mouvement": [
    "Installation de protecteurs fixes",
    "Dispositifs d'arrêt d'urgence",
    "Formation sur la sécurité machine",
    "Procédures de cadenassage",
    "Maintenance préventive régulière"
  ],
  "Substances chimiques": [
    "Fiches de données de sécurité (FDS)",
    "Équipements de protection respiratoire",
    "Ventilation adéquate",
    "Formation SIMDUT",
    "Procédures de déversement"
  ],
  "default": [
    "Évaluation régulière des risques",
    "Formation du personnel",
    "Supervision adéquate",
    "Équipements de protection appropriés",
    "Procédures d'urgence"
  ]
};

export class PreventionProgramGenerator {
  
  static generateProgram(params: PreventionProgramParams): PreventionProgram {
    const currentDate = new Date().toLocaleDateString('fr-CA');
    
    return {
      title: `Programme de prévention - ${params.companyName}`,
      companyInfo: {
        name: params.companyName,
        sector: params.sector,
        scianCode: params.scianCode,
        size: params.companySize
      },
      sections: [
        this.generateIntroductionSection(params),
        this.generatePolicySection(params),
        this.generateRiskAnalysisSection(params),
        this.generatePreventionMeasuresSection(params),
        this.generateTrainingSection(params),
        this.generateEmergencySection(params),
        this.generateMonitoringSection(params),
        this.generateDocumentationSection(params)
      ],
      generatedDate: currentDate,
      lastUpdated: currentDate
    };
  }

  private static generateIntroductionSection(params: PreventionProgramParams): PreventionProgramSection {
    return {
      title: "1. Introduction et engagement de la direction",
      content: `
**Engagement de la direction**

La direction de ${params.companyName} s'engage formellement à mettre en place et maintenir un programme de prévention efficace conformément à la Loi sur la santé et la sécurité du travail (LSST) du Québec.

**Objectifs du programme de prévention :**
- Éliminer à la source les dangers pour la santé, la sécurité et l'intégrité physique des travailleurs
- Assurer la formation et l'information nécessaires aux travailleurs
- Maintenir un milieu de travail sécuritaire et sain
- Respecter les exigences réglementaires en matière de SST

**Portée du programme :**
Ce programme s'applique à tous les travailleurs de ${params.companyName}, incluant les employés permanents, temporaires, contractuels et stagiaires, dans le secteur d'activité ${params.sector}.
      `,
      subsections: []
    };
  }

  private static generatePolicySection(params: PreventionProgramParams): PreventionProgramSection {
    return {
      title: "2. Politique de santé et sécurité au travail",
      content: `
**Politique SST de ${params.companyName}**

${params.companyName} reconnaît que la santé et la sécurité de ses employés constituent une priorité absolue et une responsabilité partagée.

**Nos engagements :**
- Fournir un environnement de travail sécuritaire et sain
- Respecter toutes les lois et règlements applicables
- Impliquer les travailleurs dans l'identification et la résolution des problèmes de SST
- Fournir les ressources nécessaires pour maintenir des conditions de travail sécuritaires
- Améliorer continuellement notre performance en SST

**Responsabilités :**
- Direction : Leadership, ressources, conformité
- Superviseurs : Application, formation, surveillance
- Travailleurs : Respect des règles, signalement des dangers, participation active

Cette politique est signée par la direction et communiquée à tous les employés.
      `,
      subsections: []
    };
  }

  private static generateRiskAnalysisSection(params: PreventionProgramParams): PreventionProgramSection {
    // Utiliser la nouvelle fonction d'identification des risques
    const scianRisks = identifyRisksByScian(params.scianCode, params.sector);
    const identifiedRisks = [...new Set([...params.identifiedRisks, ...scianRisks])];

    return {
      title: "3. Identification et analyse des risques",
      content: `
**Méthodologie d'identification des risques :**
- Inspection des lieux de travail
- Analyse des tâches et postes de travail
- Consultation des travailleurs et du comité SST
- Analyse des accidents et incidents
- Évaluation des agents de risque (chimiques, physiques, biologiques, ergonomiques)

**Secteur d'activité :** ${params.sector}${params.scianCode ? ` (Code SCIAN: ${params.scianCode})` : ''}

**Risques identifiés :**
      `,
      subsections: identifiedRisks.map(risk => ({
        title: `• ${risk}`,
        content: `Évaluation du niveau de risque et mesures de contrôle requises pour ${risk.toLowerCase()}.`,
        subsections: []
      }))
    };
  }

  private static generatePreventionMeasuresSection(params: PreventionProgramParams): PreventionProgramSection {
    const sectorRisks = SECTOR_RISKS[params.sector.toLowerCase()] || SECTOR_RISKS.default;
    
    return {
      title: "4. Mesures de prévention et de protection",
      content: `
**Hiérarchie des mesures de contrôle :**
1. Élimination du danger à la source
2. Substitution par un procédé moins dangereux
3. Contrôles techniques (isolation, ventilation)
4. Contrôles administratifs (procédures, formation)
5. Équipements de protection individuelle (EPI)

**Mesures spécifiques par risque identifié :**
      `,
      subsections: sectorRisks.map(risk => {
        const measures = PREVENTION_MEASURES[risk] || PREVENTION_MEASURES.default;
        return {
          title: `${risk}`,
          content: measures.map(measure => `• ${measure}`).join('\n'),
          subsections: []
        };
      })
    };
  }

  private static generateTrainingSection(params: PreventionProgramParams): PreventionProgramSection {
    return {
      title: "5. Formation et information",
      content: `
**Programme de formation SST :**

**Formation d'accueil (nouveaux employés) :**
- Politique et procédures SST de l'entreprise
- Risques spécifiques au poste de travail
- Utilisation des équipements de protection
- Procédures d'urgence
- Droits et responsabilités en SST

**Formation continue :**
- Mise à jour des connaissances SST
- Formation sur les nouveaux équipements/procédés
- Sensibilisation aux nouveaux risques
- Formation du comité SST

**Formation spécialisée selon les besoins :**
- SIMDUT (système d'information sur les matières dangereuses)
- Travail en espaces confinés
- Conduite préventive
- Premiers secours
- Utilisation d'équipements spécialisés

**Registre de formation :**
Toutes les formations sont documentées et archivées selon les exigences réglementaires.
      `,
      subsections: []
    };
  }

  private static generateEmergencySection(params: PreventionProgramParams): PreventionProgramSection {
    return {
      title: "6. Mesures d'urgence",
      content: `
**Plan d'urgence de ${params.companyName} :**

**Procédures d'évacuation :**
- Plans d'évacuation affichés à tous les étages
- Points de rassemblement identifiés
- Responsables d'évacuation désignés
- Exercices d'évacuation réguliers

**Intervention d'urgence :**
- Équipe d'intervention formée
- Équipements d'urgence disponibles et vérifiés
- Procédures de communication avec les services d'urgence
- Plans spécifiques selon les types d'urgence

**Premiers secours :**
- Secouristes certifiés disponibles
- Trousses de premiers secours complètes et accessibles
- Procédures de transport vers centres médicaux
- Formation périodique en réanimation cardiorespiratoire (RCR)

**Communication d'urgence :**
- Numéros d'urgence affichés
- Système d'alarme fonctionnel
- Procédures de notification des autorités
      `,
      subsections: []
    };
  }

  private static generateMonitoringSection(params: PreventionProgramParams): PreventionProgramSection {
    return {
      title: "7. Surveillance et amélioration continue",
      content: `
**Mécanismes de surveillance :**

**Inspections régulières :**
- Inspections quotidiennes par les superviseurs
- Inspections hebdomadaires des équipements critiques
- Inspections mensuelles des lieux de travail
- Inspections annuelles par des experts externes

**Indicateurs de performance SST :**
- Taux de fréquence des accidents
- Taux de gravité des lésions
- Nombre de presqu'accidents signalés
- Pourcentage de participation aux formations
- Conformité aux inspections

**Comité de santé et sécurité :**
- Réunions mensuelles du comité SST
- Participation paritaire employeur-travailleurs
- Suivi des recommandations
- Communication des résultats

**Amélioration continue :**
- Révision annuelle du programme de prévention
- Mise à jour selon l'évolution réglementaire
- Intégration des leçons apprises
- Consultation continue des travailleurs
      `,
      subsections: []
    };
  }

  private static generateDocumentationSection(params: PreventionProgramParams): PreventionProgramSection {
    return {
      title: "8. Documentation et registres",
      content: `
**Documents requis et archives :**

**Registres obligatoires :**
- Registre des accidents du travail
- Registre des premiers secours
- Registre des formations SST
- Registre des inspections
- Registre du comité SST

**Documentation technique :**
- Fiches de données de sécurité (FDS)
- Rapports d'évaluation des risques
- Certificats de conformité des équipements
- Plans d'urgence et d'évacuation
- Procédures de travail sécuritaires

**Conservation des documents :**
- Durée de conservation selon les exigences légales
- Système de classement et d'archivage
- Accès contrôlé à la documentation
- Sauvegarde et protection des données

**Révision et mise à jour :**
Ce programme de prévention sera révisé annuellement ou lors de changements significatifs dans l'entreprise, les activités ou la réglementation.

**Approbation :**
Ce programme est approuvé par la direction de ${params.companyName} et entre en vigueur le ${new Date().toLocaleDateString('fr-CA')}.

Signature de la direction : _______________________
Date : ${new Date().toLocaleDateString('fr-CA')}
      `,
      subsections: []
    };
  }

  static exportToMarkdown(program: PreventionProgram): string {
    let markdown = `# ${program.title}\n\n`;
    markdown += `**Entreprise :** ${program.companyInfo.name}\n`;
    markdown += `**Secteur d'activité :** ${program.companyInfo.sector}\n`;
    if (program.companyInfo.scianCode) {
      markdown += `**Code SCIAN :** ${program.companyInfo.scianCode}\n`;
    }
    markdown += `**Taille de l'entreprise :** ${program.companyInfo.size} employés\n`;
    markdown += `**Date de génération :** ${program.generatedDate}\n`;
    markdown += `**Dernière mise à jour :** ${program.lastUpdated}\n\n`;
    markdown += `---\n\n`;

    program.sections.forEach(section => {
      markdown += `## ${section.title}\n\n`;
      markdown += `${section.content}\n\n`;
      
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach(subsection => {
          markdown += `### ${subsection.title}\n\n`;
          markdown += `${subsection.content}\n\n`;
        });
      }
    });

    return markdown;
  }
}