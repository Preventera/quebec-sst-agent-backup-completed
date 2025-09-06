import { ScianAction } from '@/types/prevention';
import scianActionsData from '@/data/scianActionsData.json';

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

// Base de données enrichie des risques par secteur (basée sur les données CNESST officielles)
const SECTOR_RISKS: Record<string, string[]> = {
  // Secteur de la construction (codes SCIAN 23) - Risques CNESST
  "construction": [
    "Chutes de hauteur (toitures, échafaudages, ouvertures)",
    "Électrocution et contact avec lignes électriques",
    "Écrasement par véhicules et équipement lourd",
    "Exposition à l'amiante (rénovations bâtiments)",
    "Exposition aux poussières de silice cristalline",
    "Troubles musculo-squelettiques (manutention lourde)",
    "Noyade lors de travaux aquatiques",
    "Brûlures chimiques et thermiques",
    "Coupures par outils et matériaux tranchants",
    "Exposition au bruit excessif de la machinerie"
  ],

  // Secteur manufacturier/fabrication (codes SCIAN 31-33) - Risques CNESST
  "manufacturier": [
    "Accidents de machines et équipements industriels",
    "Troubles musculo-squelettiques (mouvements répétitifs)",
    "Exposition aux substances chimiques dangereuses",
    "Exposition au bruit industriel et vibrations",
    "Brûlures par surfaces chaudes ou froides",
    "Troubles respiratoires (vapeurs, poussières industrielles)",
    "Coupures et lacérations par outils",
    "Risques d'explosion et d'incendie",
    "Troubles visuels (soudage, éclairage inadéquat)",
    "Accidents d'espaces confinés"
  ],

  // Secteur du transport et entreposage (codes SCIAN 48-49) - Risques CNESST
  "transport": [
    "Accidents de véhicules routiers et collisions",
    "Troubles musculo-squelettiques (position assise prolongée)",
    "Fatigue et somnolence au volant",
    "Stress de conduite (trafic, délais, pression)",
    "Exposition aux vibrations des véhicules",
    "Accidents lors du chargement/déchargement",
    "Exposition aux gaz d'échappement",
    "Troubles circulatoires (position statique)",
    "Risques météorologiques et conditions routières",
    "Manutention de marchandises lourdes"
  ],

  // Secteur des services professionnels et administratifs - Risques CNESST
  "services": [
    "Troubles musculo-squelettiques (travail de bureau)",
    "Risques psychosociaux et stress organisationnel",
    "Fatigue oculaire et troubles visuels (écrans)",
    "Syndrome du canal carpien",
    "Problèmes de posture (position assise prolongée)",
    "Chutes et glissades sur surfaces de travail",
    "Violence en milieu de travail (agression clients)",
    "Qualité de l'air intérieur déficiente",
    "Épuisement professionnel (burnout)",
    "Troubles du sommeil (stress, surcharge)"
  ],

  // Secteur de la santé et services sociaux (codes SCIAN 62) - Risques CNESST spécialisés
  "santé": [
    "Exposition aux agents biologiques pathogènes",
    "Troubles musculo-squelettiques (transferts patients)",
    "Piqûres d'aiguilles et objets tranchants contaminés",
    "Troubles du sommeil et fatigue (travail de nuit)",
    "Violence et agression de patients agités",
    "Stress post-traumatique et détresse psychologique",
    "Exposition aux médicaments cytotoxiques",
    "Dermatites de contact (désinfectants, latex)",
    "Troubles respiratoires (produits chimiques)",
    "Lombalgies liées aux soins aux patients"
  ],

  // Commerce de détail (codes SCIAN 44-45) - Risques CNESST
  "commerce": [
    "Troubles musculo-squelettiques (manutention, station debout)",
    "Chutes et glissades (sols mouillés, escaliers)",
    "Coupures et écorchures (manipulation objets)",
    "Stress lié à la relation et service clientèle",
    "Troubles du sommeil (horaires atypiques)",
    "Vol, agression et violence au travail",
    "Fatigue des membres inférieurs (station debout prolongée)",
    "Exposition aux produits de nettoyage",
    "Accidents lors de la réception de marchandises",
    "Troubles de concentration (environnement bruyant)"
  ],

  // Agriculture, foresterie, pêche (codes SCIAN 11) - Risques CNESST
  "agriculture": [
    "Accidents de machines et équipements agricoles",
    "Exposition aux pesticides et produits chimiques",
    "Troubles musculo-squelettiques (travail physique intense)",
    "Accidents avec animaux (morsures, coups, écrasement)",
    "Exposition aux conditions climatiques extrêmes",
    "Allergies respiratoires (poussières, pollens)",
    "Coupures par outils et équipements tranchants",
    "Noyade (bassins d'irrigation, cours d'eau)",
    "Troubles auditifs (machinerie agricole bruyante)",
    "Intoxications (manipulation aliments, produits)"
  ],

  // Hébergement et restauration (codes SCIAN 72) - Risques CNESST
  "restauration": [
    "Brûlures (surfaces chaudes, liquides bouillants)",
    "Coupures par couteaux et équipements de cuisine",
    "Chutes et glissades (sols gras, mouillés)",
    "Troubles musculo-squelettiques (port charges, station debout)",
    "Exposition à la chaleur excessive (cuisines)",
    "Stress lié au rythme de travail intensif",
    "Troubles respiratoires (vapeurs de cuisson)",
    "Dermatites (produits de nettoyage, allergènes)",
    "Fatigue (horaires prolongés, irréguliers)",
    "Accidents d'équipements électriques de cuisine"
  ],

  // Finance et assurances (codes SCIAN 52) - Risques CNESST
  "finance": [
    "Troubles musculo-squelettiques (travail intensif bureau)",
    "Stress financier et responsabilité professionnelle",
    "Fatigue oculaire (utilisation écrans prolongée)",
    "Syndrome du canal carpien et tendinites",
    "Troubles posturaux (position assise prolongée)",
    "Épuisement professionnel et anxiété",
    "Troubles du sommeil (stress, pression)",
    "Vol, agression et menaces (institutions financières)"
  ],

  // Secteur par défaut - Risques généraux CNESST
  "default": [
    "Incendies et explosions (tous secteurs)",
    "Intoxications et premiers secours",
    "Évacuation d'urgence et plans d'évacuation",
    "Utilisation équipements de protection individuelle",
    "Formation et sensibilisation sécurité au travail",
    "Inspection régulière des lieux de travail",
    "Prévention des chutes de plain-pied",
    "Ergonomie des postes de travail"
  ]
};

// Base de données spécialisée par code SCIAN précis (données CNESST enrichies)
const SCIAN_SPECIFIC_RISKS: Record<string, string[]> = {
  // === CONSTRUCTION (codes SCIAN 23) === //
  // Construction de bâtiments résidentiels
  "2361": [
    "Chutes de hauteur (toitures résidentielles)",
    "Travail de charpente et structure",
    "Installation de couverture et étanchéité",
    "Montage et démontage d'échafaudages",
    "Manipulation de matériaux lourds (poutres, panneaux)"
  ],
  
  // Construction de bâtiments non résidentiels  
  "2362": [
    "Travaux de plomberie et raccordements",
    "Soudage en espaces confinés",
    "Exposition aux gaz et vapeurs toxiques",
    "Installation d'équipements industriels",
    "Manipulation d'outils pneumatiques"
  ],
  
  // Travaux de génie civil
  "2371": [
    "Excavation et terrassement",
    "Travail près de lignes électriques aériennes",
    "Circulation de véhicules lourds sur chantier",
    "Compactage et nivellement du sol",
    "Exposition aux poussières de silice"
  ],
  
  // Entrepreneurs spécialisés - électricité
  "2383": [
    "Électrocution par haute tension",
    "Brûlures par arc électrique",
    "Travail sous tension électrique",
    "Chutes lors d'installation électrique en hauteur",
    "Exposition aux champs électromagnétiques"
  ],

  // === FABRICATION (codes SCIAN 31-33) === //
  // Transformation d'animaux (abattoirs)
  "3111": [
    "Coupures par machines de boucherie automatisées",
    "Exposition aux températures de réfrigération extrêmes",
    "Manipulation de lames et couteaux très tranchants",
    "Chutes sur sols rendus glissants par graisses",
    "Troubles musculo-squelettiques (mouvements répétitifs de découpe)"
  ],
  
  // Mouture de céréales et graines oléagineuses
  "3112": [
    "Inhalation de poussières de grain (risque d'explosion)",
    "Travail en silos et espaces confinés",
    "Accidents avec machinerie agricole lourde",
    "Ensevelissement dans les grains",
    "Exposition au bruit de la machinerie de mouture"
  ],

  // Sidérurgie
  "3311": [
    "Brûlures par métaux en fusion à très haute température",
    "Exposition aux radiations thermiques intenses",
    "Intoxication au monoxyde de carbone",
    "Projections de métal liquide",
    "Troubles respiratoires (fumées métalliques)"
  ],
  
  // Fabrication de produits métalliques
  "3321": [
    "Coupures par outils de coupe et de formage",
    "Projections de copeaux métalliques dans les yeux",
    "Dermatites par fluides de coupe industriels",
    "Troubles auditifs (machines-outils bruyantes)",
    "Écrasement par presses mécaniques"
  ],

  // === TRANSPORT ET ENTREPOSAGE (codes SCIAN 48-49) === //
  // Transport routier de marchandises
  "4841": [
    "Transport de marchandises dangereuses (matières toxiques)",
    "Troubles musculo-squelettiques par manutention lourde répétée",
    "Fatigue extrême lors de conduite longue distance",
    "Accidents routiers avec véhicules lourds",
    "Exposition aux vapeurs de carburant diesel"
  ],
  
  // Entreposage et stockage
  "4931": [
    "Accidents avec chariots élévateurs et équipement de manutention",
    "Chutes d'objets stockés en hauteur",
    "Travail en entrepôts frigorifiques",
    "Écrasement lors de manipulation de palettes",
    "Troubles respiratoires (poussières d'entreposage)"
  ],

  // === SERVICES DE SANTÉ (codes SCIAN 62) === //
  // Cabinets de médecins
  "6211": [
    "Exposition aux agents pathogènes infectieux",
    "Piqûres par aiguilles potentiellement contaminées",
    "Exposition aux radiations médicales (rayons X)",
    "Stress lié aux urgences médicales",
    "Troubles musculo-squelettiques (examens prolongés)"
  ],
  
  // Cabinets de dentistes
  "6212": [
    "Exposition aux produits pharmaceutiques et anesthésiques",
    "Manipulation d'instruments de précision tranchants",
    "Exposition aux radiations dentaires répétées",
    "Troubles de posture (position de travail contrainte)",
    "Infections par aérosols buccaux"
  ],

  // Hôpitaux généraux et spécialisés
  "6221": [
    "Exposition massive aux agents biologiques",
    "Violence et agression de patients psychiatriques",
    "Manipulation de patients lourds (transferts)",
    "Exposition aux médicaments cytotoxiques de chimiothérapie",
    "Stress post-traumatique (urgences, décès)"
  ],

  // === HÉBERGEMENT ET RESTAURATION (codes SCIAN 72) === //
  // Restaurants avec service complet
  "7221": [
    "Brûlures graves par surfaces chaudes de cuisine",
    "Coupures profondes par couteaux de chef",
    "Chutes sur sols rendus glissants par huiles de friture",
    "Exposition à la chaleur extrême des cuisines",
    "Stress intense lié au service clientèle"
  ],
  
  // Restaurants à service rapide
  "7222": [
    "Brûlures par équipements de cuisson rapide",
    "Stress temporel extrême (cadences de service)",
    "Coupures lors de préparation alimentaire rapide",
    "Électrocution par équipements électriques de cuisine",
    "Troubles musculo-squelettiques (station debout prolongée)"
  ],

  // === COMMERCE DE DÉTAIL (codes SCIAN 44-45) === //
  // Magasins d'alimentation
  "4451": [
    "Coupures par trancheuses et équipements de boucherie",
    "Chutes dans les allées et espaces de stockage",
    "Troubles du dos (réapprovisionnement des tablettes)",
    "Exposition au froid (chambres frigorifiques)",
    "Vol à main armée et agression"
  ],

  // === SERVICES PROFESSIONNELS (codes SCIAN 54) === //
  // Services juridiques
  "5411": [
    "Stress professionnel intense (litiges, échéances)",
    "Syndrome du canal carpien (frappe intensive)",
    "Fatigue oculaire (lecture de documents prolongée)",
    "Épuisement professionnel (charge de travail)",
    "Menaces et intimidation de clients mécontents"
  ],

  // === FINANCE ET ASSURANCES (codes SCIAN 52) === //
  // Banques commerciales
  "5221": [
    "Vol et agression lors d'attaques de banques",
    "Stress financier (responsabilité des transactions)",
    "Troubles ergonomiques (travail informatique intensif)",
    "Anxiété liée à la sécurité des fonds",
    "Épuisement mental (pression de performance)"
  ]
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

// Function to get SCIAN actions for a specific sector and company size
export function getScianActions(sector?: string, companySize?: number): ScianAction[] {
  const actions = scianActionsData as ScianAction[];
  
  return actions.filter(action => {
    // Filter by sector
    if (sector) {
      const sectorMatch = action.scianCategorie.toLowerCase().includes(sector.toLowerCase()) ||
                         sector.toLowerCase().includes(action.scianCategorie.toLowerCase());
      if (!sectorMatch) return false;
    }
    
    // Filter by company size (large companies get more comprehensive actions)
    if (companySize && companySize >= 500) {
      // Large companies get all applicable actions
      return true;
    } else if (companySize && companySize >= 100) {
      // Medium companies get essential actions
      return action.categorieProgramme.includes('Contrôle du risque') ||
             action.categorieProgramme.includes('Identification des risques');
    } else if (companySize && companySize >= 20) {
      // Small companies get basic mandatory actions
      return action.categorieProgramme.includes('Identification des risques');
    }
    
    return true;
  });
}

// Function to prioritize actions based on risk and company profile
export function prioritizeScianActions(actions: ScianAction[], sector: string, companySize: number): ScianAction[] {
  return actions.sort((a, b) => {
    // Priority scoring (higher = more important)
    let scoreA = 0;
    let scoreB = 0;
    
    // Risk severity scoring
    const highRiskTerms = ['écrasement', 'électrocution', 'chute', 'asphyxie'];
    const mediumRiskTerms = ['troubles musculo-squelettiques', 'fatigue', 'bruit'];
    
    if (highRiskTerms.some(term => a.risque.toLowerCase().includes(term))) scoreA += 10;
    if (mediumRiskTerms.some(term => a.risque.toLowerCase().includes(term))) scoreA += 5;
    if (highRiskTerms.some(term => b.risque.toLowerCase().includes(term))) scoreB += 10;
    if (mediumRiskTerms.some(term => b.risque.toLowerCase().includes(term))) scoreB += 5;
    
    // Company size relevance
    if (companySize >= 500) {
      if (a.categorieProgramme.includes('Hygiène du travail')) scoreA += 3;
      if (b.categorieProgramme.includes('Hygiène du travail')) scoreB += 3;
    }
    
    // Sector match bonus
    if (a.scianCategorie.toLowerCase().includes(sector.toLowerCase())) scoreA += 5;
    if (b.scianCategorie.toLowerCase().includes(sector.toLowerCase())) scoreB += 5;
    
    return scoreB - scoreA;
  });
}

// Mesures de prévention enrichies par type de risque (basées sur les recommandations CNESST)
const PREVENTION_MEASURES: Record<string, string[]> = {
  // === RISQUES DE CHUTES ET HAUTEUR === //
  "Chutes de hauteur": [
    "Installation de garde-corps permanents conformes (norme CSA Z259.1)",
    "Utilisation de systèmes d'arrêt de chute (harnais, longe, point d'ancrage)",
    "Formation certifiée sur le travail en hauteur",
    "Inspection quotidienne des équipements de protection",
    "Plans de sauvetage en cas de chute dans le vide",
    "Identification et balisage des ouvertures dangereuses"
  ],
  
  "Chutes et glissades": [
    "Maintien de sols propres et secs en permanence",
    "Installation de revêtements antidérapants",
    "Éclairage adéquat des zones de circulation",
    "Signalisation des zones glissantes temporaires",
    "Chaussures de sécurité antidérapantes obligatoires",
    "Procédures de nettoyage sécuritaires"
  ],

  // === RISQUES ÉLECTRIQUES === //
  "Électrocution": [
    "Procédures de cadenassage-étiquetage (Lock-out/Tag-out)",
    "Vérification systématique de l'absence de tension",
    "Utilisation d'équipements de protection isolants",
    "Formation électrique spécialisée et certification",
    "Inspection annuelle des installations électriques",
    "Maintien des distances de sécurité réglementaires"
  ],

  // === RISQUES MÉCANIQUES === //
  "Machinerie en mouvement": [
    "Installation de protecteurs fixes et mobiles",
    "Dispositifs d'arrêt d'urgence accessibles",
    "Formation spécialisée sur la sécurité des machines",
    "Procédures de cadenassage avant maintenance",
    "Maintenance préventive programmée et documentée",
    "Vérification de l'intégrité des systèmes de sécurité"
  ],

  "Accidents de machines": [
    "Analyse de sécurité avant utilisation de nouveaux équipements",
    "Formation des opérateurs certifiée et mise à jour",
    "Équipements de protection individuelle adaptés",
    "Surveillance et supervision des opérations à risque",
    "Procédures d'urgence en cas d'accident de machine",
    "Registre d'incidents et analyse des causes"
  ],

  // === RISQUES CHIMIQUES ET BIOLOGIQUES === //
  "Substances chimiques": [
    "Inventaire complet et fiches de données de sécurité (FDS)",
    "Évaluation de l'exposition des travailleurs",
    "Équipements de protection respiratoire certifiés",
    "Systèmes de ventilation locale et générale",
    "Formation SIMDUT obligatoire et mise à jour",
    "Procédures d'urgence pour déversements et contamination",
    "Entreposage sécuritaire selon les incompatibilités"
  ],

  "Exposition aux agents biologiques": [
    "Évaluation des risques d'exposition biologiques",
    "Équipements de protection individuelle biocompatibles",
    "Procédures de désinfection et stérilisation",
    "Vaccination préventive si disponible",
    "Formation sur les précautions universelles",
    "Gestion sécuritaire des déchets biomédicaux",
    "Surveillance médicale périodique"
  ],

  // === TROUBLES MUSCULO-SQUELETTIQUES === //
  "Troubles musculo-squelettiques": [
    "Évaluation ergonomique des postes de travail",
    "Formation sur les techniques de manutention sécuritaire",
    "Équipements d'aide à la manutention (sangles, diables, transpalettes)",
    "Rotation des tâches et pauses périodiques",
    "Aménagement ergonomique des postes (hauteur, accessibilité)",
    "Programme d'échauffement et d'étirement",
    "Surveillance médicale préventive"
  ],

  // === RISQUES PSYCHOSOCIAUX === //
  "Stress psychosocial": [
    "Évaluation des facteurs de risques psychosociaux",
    "Programme d'aide aux employés (PAE)",
    "Formation des gestionnaires sur la prévention du stress",
    "Politique de prévention du harcèlement et de la violence",
    "Soutien professionnel et consultation psychologique",
    "Aménagement des charges de travail",
    "Promotion de l'équilibre travail-vie personnelle"
  ],

  "Violence en milieu de travail": [
    "Politique de tolérance zéro envers la violence",
    "Évaluation des risques de violence pour chaque poste",
    "Formation sur la gestion des situations conflictuelles",
    "Systèmes d'alarme et de communication d'urgence",
    "Procédures d'intervention en cas d'agression",
    "Soutien post-incident pour les victimes",
    "Collaboration avec les services de sécurité publique"
  ],

  // === RISQUES ENVIRONNEMENTAUX === //
  "Exposition au bruit": [
    "Mesure des niveaux sonores aux postes de travail",
    "Réduction du bruit à la source (maintenance, isolation)",
    "Équipements de protection auditive adaptés",
    "Audiométrie préventive annuelle",
    "Formation sur la prévention de la surdité professionnelle",
    "Rotation dans les zones très bruyantes"
  ],

  "Exposition aux vibrations": [
    "Évaluation de l'exposition aux vibrations main-bras et corps entier",
    "Maintenance préventive des équipements vibrants",
    "Limitation du temps d'exposition quotidien",
    "Équipements antivibratoires (gants, sièges)",
    "Surveillance médicale spécialisée",
    "Formation sur les risques liés aux vibrations"
  ],

  // === RISQUES THERMIQUES === //
  "Exposition à la chaleur": [
    "Surveillance de la température ambiante et de l'humidité",
    "Mise à disposition d'eau fraîche en permanence",
    "Vêtements de travail adaptés aux conditions thermiques",
    "Pauses fréquentes dans des zones climatisées",
    "Formation sur la prévention des coups de chaleur",
    "Plan d'intervention d'urgence pour stress thermique"
  ],

  "Brûlures": [
    "Identification et signalisation des surfaces chaudes",
    "Équipements de protection thermique (gants, tabliers)",
    "Procédures sécuritaires pour manipulation de liquides chauds",
    "Formation sur les premiers secours en cas de brûlure",
    "Douches et laveurs oculaires d'urgence",
    "Maintenance préventive des équipements thermiques"
  ],

  // === MESURES GÉNÉRALES DE PRÉVENTION === //
  "default": [
    "Évaluation continue et systématique des risques",
    "Formation initiale et continue du personnel",
    "Supervision adéquate et compétente",
    "Équipements de protection individuelle appropriés et entretenus",
    "Procédures d'urgence écrites et pratiquées",
    "Comité de santé et sécurité actif",
    "Inspection régulière des lieux et équipements",
    "Documentation et suivi des incidents"
  ]
};

export class PreventionProgramGenerator {
  
  static generateProgram(params: PreventionProgramParams): PreventionProgram {
    const identifiedRisks = identifyRisksByScian(params.scianCode, params.sector);
    const preventionMeasures = identifiedRisks.flatMap(risk => 
      PREVENTION_MEASURES[risk] || []
    );

    // Get and prioritize SCIAN actions
    const scianActions = getScianActions(params.sector, params.companySize);
    const prioritizedActions = prioritizeScianActions(scianActions, params.sector, params.companySize);

    const sections: PreventionProgramSection[] = [
      {
        title: "1. ENGAGEMENT DE LA DIRECTION",
        content: `La direction de ${params.companyName} s'engage formellement à mettre en place et maintenir un programme de prévention efficace conformément à la LSST.

**Entreprise:** ${params.companyName}
**Secteur d'activité:** ${params.sector}
**Nombre d'employés:** ${params.companySize}
**Code SCIAN:** ${params.scianCode || 'À déterminer'}

**Objectifs prioritaires:**
• Éliminer à la source les dangers identifiés
• Assurer la formation et l'information des travailleurs
• Maintenir un environnement de travail sécuritaire
• Respecter les exigences réglementaires applicables`
      },

      {
        title: "2. POLITIQUE DE SANTÉ ET SÉCURITÉ",
        content: `${params.companyName} reconnaît que la santé et la sécurité constituent une priorité absolue et une responsabilité partagée.

**Nos engagements:**
• Fournir un environnement de travail sécuritaire et sain
• Respecter toutes les lois et règlements applicables
• Impliquer les travailleurs dans l'identification des dangers
• Fournir les ressources nécessaires pour la sécurité
• Améliorer continuellement notre performance SST

**Responsabilités:**
- **Direction:** Leadership, ressources, conformité réglementaire
- **Superviseurs:** Application des règles, formation, surveillance
- **Travailleurs:** Respect des procédures, signalement des dangers`
      },

      {
        title: "3. IDENTIFICATION DES RISQUES",
        content: `Les risques suivants ont été identifiés pour le secteur ${params.sector} selon les données CNESST :

${identifiedRisks.slice(0, 15).map((risk, index) => `${index + 1}. ${risk}`).join('\n')}

**Méthode d'évaluation:** Analyse des postes de travail, consultation des données sectorielles CNESST, retour d'expérience des travailleurs.

**Mise à jour:** Cette identification est révisée annuellement ou suite à tout changement significatif des conditions de travail.`
      },

      {
        title: "4. MESURES DE PRÉVENTION",
        content: `Les mesures de prévention suivantes ont été identifiées selon la hiérarchie des mesures de contrôle (art. 58 LSST) :

${preventionMeasures.slice(0, 20).map((measure, index) => `${index + 1}. ${measure}`).join('\n')}

Ces mesures doivent être appliquées en priorité selon leur niveau dans la hiérarchie des contrôles.`
      },
      
      {
        title: `5. ACTIONS SPÉCIALISÉES SECTEUR ${params.sector.toUpperCase()}`,
        content: `Actions spécifiques identifiées pour le secteur d'activité (${params.companySize} employés) :

${prioritizedActions.slice(0, 8).map((action, index) => 
  `${index + 1}. **${action.actionRapide}**
   - Risque ciblé: ${action.risque}
   - But: ${action.but}
   - Références: ${action.referentiels.join(', ')}
   - Étapes: ${action.sousEtapes.join(' → ')}`
).join('\n\n')}

${params.companySize >= 500 ? 
  `\n**Actions supplémentaires pour grande entreprise (500+ employés):**\n${prioritizedActions.slice(8, 12).map((action, index) => 
    `${index + 9}. ${action.actionRapide} (${action.risque})`
  ).join('\n')}` : ''}`
      },

      {
        title: "6. FORMATION ET INFORMATION",
        content: `Programme de formation obligatoire selon l'article 27 de la LSST :

**Formation générale (tous les employés):**
• Politique et procédures de santé et sécurité
• Droits et obligations des travailleurs
• Identification et signalement des dangers
• Utilisation des équipements de protection individuelle
• Procédures d'urgence et d'évacuation

**Formation spécialisée (selon les postes):**
• Formation spécifique aux risques du secteur ${params.sector}
• Utilisation sécuritaire des équipements et machines
• Manipulation des substances dangereuses (SIMDUT)
• Travail en hauteur, espaces clos (si applicable)

**Responsable de la formation:** À désigner
**Fréquence:** Formation initiale + mise à jour annuelle`
      },

      {
        title: params.companySize >= 20 ? "7. COMITÉ DE SANTÉ ET SÉCURITÉ" : "7. AGENT DE LIAISON SST",
        content: params.companySize >= 20 ? 
          `Composition du comité SST (obligatoire pour ${params.companySize} employés) :

**Représentants de l'employeur:** ${Math.ceil(params.companySize / 100)}
**Représentants des travailleurs:** ${Math.ceil(params.companySize / 100)}

**Mandat du comité:**
• Participer à l'identification et à l'analyse des risques
• Établir et maintenir le programme de prévention
• Participer à l'élaboration des politiques et procédures
• Recevoir et analyser les rapports d'incidents
• Recommander des mesures correctives

**Réunions:** Minimalement 4 fois par année
**Formation:** Formation obligatoire de 6 jours (art. 27 LSST)` :
          `Désignation d'un agent de liaison SST (ALSS) :

**Agent désigné:** [Nom à compléter]
**Responsabilités:**
• Recevoir les suggestions et plaintes relatives à la SST
• Accompagner l'inspecteur lors de ses visites
• Identifier les situations dangereuses
• Transmettre les recommandations à l'employeur

**Formation:** Formation obligatoire selon l'article 27 de la LMRSST`
      },

      {
        title: "8. SURVEILLANCE ET ÉVALUATION",
        content: `Mécanismes de surveillance du programme :

**Inspections régulières:**
• Inspection hebdomadaire des lieux de travail
• Vérification mensuelle des équipements de sécurité
• Audit annuel du programme de prévention

**Indicateurs de performance:**
• Nombre d'accidents et d'incidents
• Taux de fréquence et de gravité
• Pourcentage de conformité aux procédures
• Nombre de situations dangereuses corrigées

**Révision du programme:**
• Révision annuelle obligatoire
• Mise à jour suite à tout changement significatif
• Intégration des leçons apprises des incidents`
      },

      {
        title: "9. PROCÉDURES D'URGENCE",
        content: `Procédures d'urgence établies pour ${params.companyName} :

**Plan d'évacuation:**
• Points de rassemblement identifiés
• Responsables d'évacuation désignés
• Exercices d'évacuation semestriels

**Premiers secours:**
• Secouristes formés disponibles sur chaque quart
• Trousses de premiers secours accessibles
• Numéros d'urgence affichés clairement

**Situations d'urgence spécifiques:**
• Incendie et explosion
• Déversement de substances dangereuses
• Accident grave ou décès
• Conditions météorologiques extrêmes

**Communications d'urgence:**
• 911 (urgences)
• CNESST: 1-844-838-0808
• Info-Santé: 811`
      }
    ];

    const currentDate = new Date().toLocaleDateString('fr-CA');
    
    return {
      title: `Programme de prévention - ${params.companyName}`,
      companyInfo: {
        name: params.companyName,
        sector: params.sector,
        scianCode: params.scianCode,
        size: params.companySize
      },
      sections,
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
    let markdown = `# PROGRAMME DE PRÉVENTION\n\n`;
    
    // En-tête officiel conforme CNESST
    markdown += `**IDENTIFICATION DE L'ÉTABLISSEMENT**\n\n`;
    markdown += `**Nom de l'entreprise :** ${program.companyInfo.name}\n`;
    markdown += `**Secteur d'activité :** ${program.companyInfo.sector}\n`;
    if (program.companyInfo.scianCode) {
      markdown += `**Code SCIAN :** ${program.companyInfo.scianCode}\n`;
    }
    markdown += `**Taille de l'entreprise :** ${program.companyInfo.size} employés\n`;
    markdown += `**Adresse de l'établissement :** _________________________\n`;
    markdown += `**Date d'élaboration :** ${program.generatedDate}\n`;
    markdown += `**Date de dernière mise à jour :** ${program.lastUpdated}\n\n`;
    
    // Conformité légale obligatoire
    markdown += `**RÉFÉRENCE LÉGALE :** Loi sur la santé et la sécurité du travail (LSST) - Articles 51 et 59\n\n`;
    
    // Collaboration obligatoire selon CNESST
    markdown += `**ÉLABORATION EN COLLABORATION AVEC :**\n`;
    markdown += `- Employeur : _________________________\n`;
    markdown += `- Représentant à la prévention : _________________________\n`;
    markdown += `- Comité de santé et sécurité : _________________________\n`;
    markdown += `- Médecin responsable des services de santé : _________________________\n\n`;
    
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
    
    // Sections obligatoires CNESST ajoutées
    markdown += `## ÉCHÉANCIER ET MODALITÉS DE RÉALISATION\n\n`;
    markdown += `*Section obligatoire selon l'article 59 de la LSST*\n\n`;
    markdown += `| Mesure de prévention | Responsable | Échéance | Ressources requises | Indicateurs de suivi | Statut |\n`;
    markdown += `|----------------------|-------------|----------|-------------------|-------------------|--------|\n`;
    markdown += `| À compléter selon l'analyse des risques | | | | | |\n`;
    markdown += `| | | | | | |\n`;
    markdown += `| | | | | | |\n\n`;
    
    markdown += `## MESURES DE SURVEILLANCE, D'ÉVALUATION ET DE SUIVI\n\n`;
    markdown += `*Section obligatoire pour assurer l'efficacité et la durabilité des mesures*\n\n`;
    markdown += `### Surveillance continue\n`;
    markdown += `- Inspections régulières des lieux de travail (fréquence : _______)\n`;
    markdown += `- Vérification de l'application des mesures préventives\n`;
    markdown += `- Suivi des indicateurs de performance en SST\n`;
    markdown += `- Observation des comportements sécuritaires\n\n`;
    
    markdown += `### Évaluation périodique\n`;
    markdown += `- Révision annuelle complète du programme de prévention\n`;
    markdown += `- Analyse des accidents, incidents et presqu'accidents\n`;
    markdown += `- Mise à jour selon l'évolution des activités et des risques\n`;
    markdown += `- Évaluation de l'efficacité des mesures implantées\n\n`;
    
    markdown += `### Modalités de suivi\n`;
    markdown += `- Réunions du comité de santé et sécurité (fréquence : _______)\n`;
    markdown += `- Rapports périodiques à la direction\n`;
    markdown += `- Documentation des corrections et améliorations apportées\n`;
    markdown += `- Communication des résultats aux travailleurs\n\n`;
    
    markdown += `## ÉQUIPEMENTS DE PROTECTION INDIVIDUELLE (EPI)\n\n`;
    markdown += `*Liste des EPI adaptés aux risques identifiés*\n\n`;
    markdown += `| Type d'EPI | Norme/Certification | Poste/Activité | Fréquence de remplacement |\n`;
    markdown += `|------------|---------------------|----------------|---------------------------|\n`;
    markdown += `| À compléter selon l'analyse des risques | | | |\n\n`;
    
    markdown += `## PROGRAMMES DE FORMATION ET D'INFORMATION EN SST\n\n`;
    markdown += `*Programmes obligatoires selon l'article 51 de la LSST*\n\n`;
    markdown += `### Formation d'accueil\n`;
    markdown += `- Sensibilisation aux risques du poste de travail\n`;
    markdown += `- Procédures de sécurité spécifiques\n`;
    markdown += `- Utilisation des EPI\n`;
    markdown += `- Procédures d'urgence\n\n`;
    
    markdown += `### Formation continue\n`;
    markdown += `- Mise à jour des connaissances en SST\n`;
    markdown += `- Formation sur les nouveaux équipements ou procédés\n`;
    markdown += `- Recyclage périodique des compétences\n\n`;
    
    markdown += `### Formation spécialisée\n`;
    markdown += `- Formation des superviseurs et gestionnaires\n`;
    markdown += `- Formation du comité de santé et sécurité\n`;
    markdown += `- Formation du représentant à la prévention\n\n`;
    
    // Signatures officielles obligatoires
    markdown += `## APPROBATION ET TRANSMISSION\n\n`;
    markdown += `**APPROUVÉ PAR :**\n\n`;
    markdown += `**Employeur :** _________________________ **Date :** _________\n`;
    markdown += `**Signature :** _________________________\n\n`;
    
    markdown += `**Représentant à la prévention :** _________________________ **Date :** _________\n`;
    markdown += `**Signature :** _________________________\n\n`;
    
    markdown += `**Médecin responsable :** _________________________ **Date :** _________\n`;
    markdown += `**Signature :** _________________________\n\n`;
    
    markdown += `**TRANSMISSION OBLIGATOIRE À :**\n`;
    markdown += `☐ CNESST (si requis selon la taille et le secteur)\n`;
    markdown += `☐ Association accréditée\n`;
    markdown += `☐ Association sectorielle paritaire\n`;
    markdown += `☐ Comité de santé et sécurité (si constitué)\n`;
    markdown += `☐ Représentant à la prévention\n`;
    markdown += `☐ Médecin responsable des services de santé\n\n`;
    
    markdown += `**Date de transmission :** _________________________\n`;
    markdown += `**Méthode de transmission :** _________________________\n\n`;
    
    markdown += `---\n\n`;
    markdown += `*Document généré conformément aux exigences de la Loi sur la santé et la sécurité du travail (LSST) et aux directives de la CNESST*\n`;

    return markdown;
  }
}