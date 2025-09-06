export interface AgileFunction {
  id: number;
  fonction: string;
  categorie: string;
  focus: string;
  liens_reglementaires: string;
  priorite: 'High' | 'Medium' | 'Low' | 'Critique';
  kpi?: string;
  exemple_usage?: string;
  agent_owner?: string;
  template_id?: string;
  estimated_time?: string;
  status?: 'available' | 'generating' | 'completed' | 'error';
  description?: string;
  criticite?: number;
}

export const agileFunctions: AgileFunction[] = [
  {
    id: 1,
    fonction: "Diagnostic conformité LMRSST",
    categorie: "Conformité LMRSST",
    focus: "Contrôle respect articles LMRSST",
    liens_reglementaires: "Art. 27, 90, 123 LMRSST",
    priorite: "High",
    kpi: "% conformité articles vérifiés",
    exemple_usage: "Audit complet des obligations LMRSST",
    agent_owner: "ComplianceAgent",
    template_id: "diagnostic_lmrsst_v1",
    estimated_time: "15 min"
  },
  {
    id: 2,
    fonction: "Génération automatique registre des incidents",
    categorie: "Conformité LMRSST / Gestion doc",
    focus: "Document légal obligatoire",
    liens_reglementaires: "Art. 123 LMRSST",
    priorite: "High",
    kpi: "Nb incidents documentés",
    exemple_usage: "Registre automatisé des incidents workplace",
    agent_owner: "DocuGenAgent",
    template_id: "registre_incidents_v1",
    estimated_time: "5 min"
  },
  {
    id: 3,
    fonction: "Suivi des échéances formations SST",
    categorie: "Gestion documentaire / SGSST",
    focus: "Gestion des formations obligatoires",
    liens_reglementaires: "CNESST programmes",
    priorite: "Medium",
    kpi: "% formations à jour",
    exemple_usage: "Dashboard échéances formations par employé",
    agent_owner: "TrainingAgent",
    estimated_time: "10 min"
  },
  {
    id: 4,
    fonction: "Planification agile des audits internes SST",
    categorie: "SGSST / Meilleures pratiques",
    focus: "Organisation audits + suivi",
    liens_reglementaires: "ISO 45001, CNESST guides",
    priorite: "Medium",
    kpi: "Nb audits planifiés/réalisés",
    exemple_usage: "Calendrier automatisé des audits internes",
    agent_owner: "AuditAgent",
    estimated_time: "20 min"
  },
  {
    id: 5,
    fonction: "Outil de gestion des inspections terrain",
    categorie: "Gestion opérationnelle",
    focus: "Remontée terrain & contrôle",
    liens_reglementaires: "CNESST procédures",
    priorite: "High",
    kpi: "% inspections complétées",
    exemple_usage: "App mobile pour inspections quotidiennes",
    agent_owner: "InspectionAgent",
    estimated_time: "8 min"
  },
  {
    id: 6,
    fonction: "Notifications temps réel non‑conformités",
    categorie: "Technologies & intégrations",
    focus: "Alertes proactives",
    liens_reglementaires: "Normes CNESST",
    priorite: "High",
    kpi: "Temps de réaction < 30 min",
    exemple_usage: "Alertes push pour non-conformités critiques",
    agent_owner: "MonitoringAgent",
    estimated_time: "Temps réel",
    template_id: "notifications_temps_reel_v1"
  },
  {
    id: 7,
    fonction: "Module analyse ergonomique postes",
    categorie: "Sujets SST – Ergonomie",
    focus: "Prévention des TMS",
    liens_reglementaires: "Guides CNESST ergonomie",
    priorite: "Medium",
    kpi: "Score ergonomique > 80%",
    exemple_usage: "Évaluation ergonomique automatisée",
    agent_owner: "ErgonomicsAgent",
    estimated_time: "25 min"
  },
  {
    id: 8,
    fonction: "Gestion plans de prévention sectoriels",
    categorie: "Prévention",
    focus: "Élaboration / gestion plans prévention",
    liens_reglementaires: "Art. 90 LMRSST",
    priorite: "High",
    kpi: "Plans à jour par secteur",
    exemple_usage: "Plans personnalisés par secteur d'activité",
    agent_owner: "PreventionAgent",
    template_id: "prog_prev_LMRSST_v2",
    estimated_time: "30 min"
  },
  {
    id: 9,
    fonction: "Contrôle conformité affichage chantier",
    categorie: "Normes CSTC/RBQ",
    focus: "Respect affichages légaux chantier",
    liens_reglementaires: "Code CSTC art. 2.6",
    priorite: "High",
    kpi: "% chantiers conformes",
    exemple_usage: "Vérification automatisée affichages obligatoires",
    agent_owner: "ConstructionAgent",
    estimated_time: "12 min"
  },
  {
    id: 10,
    fonction: "Module de gestion des accidents",
    categorie: "Gestion des risques",
    focus: "Analyse & suivi des incidents",
    liens_reglementaires: "LMRSST, CNESST",
    priorite: "Critique",
    kpi: "Délai déclaration < 24h",
    exemple_usage: "Workflow complet gestion accidents",
    agent_owner: "IncidentAgent",
    estimated_time: "15 min"
  },
  {
    id: 201,
    priorite: "High",
    categorie: "Intelligence / Veille",
    fonction: "Crawling intelligent SST avec traitement sémantique",
    focus: "Surveillance automatisée des sources SST avec analyse sémantique et notifications intelligentes",
    liens_reglementaires: "LMRSST art. 2.1, RSST mise à jour continue",
    kpi: "Sources crawlées/jour, alertes critiques détectées",
    description: "Système de crawling avancé qui surveille 18+ sources SST québécoises avec traitement sémantique, extraction PDF, et notifications automatiques pour les changements réglementaires critiques",
    criticite: 4,
    estimated_time: "2 min",
    agent_owner: "AgentCrawlerSST",
    template_id: "crawling_sst_enhanced"
  }
];

export const getAgileCategories = (): string[] => {
  return Array.from(new Set(agileFunctions.map(func => func.categorie)));
};

export const getAgilePriorities = (): string[] => {
  return Array.from(new Set(agileFunctions.map(func => func.priorite)));
};

export const filterAgileFunctions = (
  searchTerm: string = '',
  category: string = '',
  priority: string = ''
): AgileFunction[] => {
  return agileFunctions.filter(func => {
    const matchesSearch = func.fonction.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         func.focus.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === '' || func.categorie === category;
    const matchesPriority = priority === '' || func.priorite === priority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });
};