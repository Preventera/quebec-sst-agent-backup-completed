// Ontologie légale SST Québec - Base de connaissances structurée

import { LegalFramework, LegalArticle, SSTSubject, SectorDefinition, OntologyRelationship, ApplicabilityCondition } from '@/types/docugen';

// === FRAMEWORKS LÉGAUX === //

export const LEGAL_FRAMEWORKS: LegalFramework[] = [
  {
    id: 'LMRSST',
    name: 'Loi modernisant le régime de santé et de sécurité du travail',
    description: 'Loi de modernisation 2021 étendant les mécanismes de prévention à tous les secteurs',
    version: '2021',
    lastUpdated: '2021-10-27',
    articles: [
      {
        id: 'LMRSST_90',
        number: '90',
        title: 'Programme de prévention obligatoire',
        content: 'L\'employeur doit élaborer et maintenir un programme de prévention adapté aux activités de son établissement.',
        applicabilityConditions: [
          {
            type: 'company_size',
            operator: '>=',
            value: 20,
            description: 'Entreprises de 20 employés et plus'
          }
        ],
        relatedSubjects: ['programme-prevention'],
        officialUrl: 'https://legisquebec.gouv.qc.ca/fr/document/lc/2021c27'
      },
      {
        id: 'LMRSST_101',
        number: '101',
        title: 'Comité de santé et sécurité du travail',
        content: 'L\'employeur doit former un comité de santé et sécurité paritaire.',
        applicabilityConditions: [
          {
            type: 'company_size',
            operator: '>=',
            value: 20,
            description: 'Entreprises de 20 employés et plus'
          }
        ],
        relatedSubjects: ['comite-sst'],
        officialUrl: 'https://legisquebec.gouv.qc.ca/fr/document/lc/2021c27'
      },
      {
        id: 'LMRSST_64',
        number: '64',
        title: 'Plan d\'action SST simplifié',
        content: 'L\'employeur peut établir un plan d\'action en lieu et place du programme de prévention.',
        applicabilityConditions: [
          {
            type: 'company_size',
            operator: '<',
            value: 20,
            description: 'Entreprises de moins de 20 employés'
          },
          {
            type: 'date',
            operator: '>=',
            value: '2025-10-06',
            description: 'Applicable dès octobre 2025'
          }
        ],
        relatedSubjects: ['plan-action'],
        officialUrl: 'https://legisquebec.gouv.qc.ca/fr/document/lc/2021c27'
      },
      {
        id: 'LMRSST_123',
        number: '123',
        title: 'Registre des incidents et accidents',
        content: 'L\'employeur doit tenir un registre des incidents et accidents de travail.',
        applicabilityConditions: [
          {
            type: 'company_size',
            operator: '>=',
            value: 1,
            description: 'Toutes les entreprises'
          }
        ],
        relatedSubjects: ['registre-incidents'],
        officialUrl: 'https://legisquebec.gouv.qc.ca/fr/document/lc/2021c27'
      },
      {
        id: 'LMRSST_27',
        number: '27',
        title: 'Formation en santé et sécurité',
        content: 'Formation obligatoire des membres du comité SST et des représentants.',
        applicabilityConditions: [
          {
            type: 'company_size',
            operator: '>=',
            value: 1,
            description: 'Toutes les entreprises avec mécanismes de prévention'
          }
        ],
        relatedSubjects: ['formation-sst'],
        officialUrl: 'https://legisquebec.gouv.qc.ca/fr/document/lc/2021c27'
      }
    ]
  },
  {
    id: 'LSST',
    name: 'Loi sur la santé et la sécurité du travail',
    description: 'Loi-cadre de prévention des lésions professionnelles au Québec',
    version: 'S-2.1',
    lastUpdated: '2023-12-01',
    articles: [
      {
        id: 'LSST_51',
        number: '51',
        title: 'Obligations générales de l\'employeur',
        content: 'L\'employeur doit prendre les mesures nécessaires pour protéger la santé et assurer la sécurité et l\'intégrité physique du travailleur.',
        applicabilityConditions: [
          {
            type: 'company_size',
            operator: '>=',
            value: 1,
            description: 'Tous les employeurs'
          }
        ],
        relatedSubjects: ['obligations-employeur'],
        officialUrl: 'https://legisquebec.gouv.qc.ca/fr/document/lc/S-2.1'
      }
    ]
  },
  {
    id: 'CSTC',
    name: 'Code de sécurité pour les travaux de construction',
    description: 'Règlement spécifique aux chantiers de construction',
    version: 'S-2.1, r.4',
    lastUpdated: '2024-01-15',
    articles: [
      {
        id: 'CSTC_2.4.1',
        number: '2.4.1',
        title: 'Représentant en santé-sécurité sur chantier',
        content: 'Un représentant en santé-sécurité doit être désigné sur tout chantier de 10 travailleurs et plus.',
        applicabilityConditions: [
          {
            type: 'sector',
            operator: '==',
            value: 'construction',
            description: 'Secteur de la construction uniquement'
          },
          {
            type: 'company_size',
            operator: '>=',
            value: 10,
            description: 'Chantiers de 10 travailleurs et plus'
          }
        ],
        relatedSubjects: ['representant-sst-chantier'],
        officialUrl: 'https://legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.4'
      }
    ]
  },
  {
    id: 'RBQ',
    name: 'Régie du bâtiment du Québec - Codes',
    description: 'Codes de construction et de sécurité des bâtiments',
    version: 'B-1.1',
    lastUpdated: '2024-03-01',
    articles: [
      {
        id: 'RBQ_CODE_SECURITE',
        number: 'Chap. Bâtiment',
        title: 'Code de sécurité - Exploitation des bâtiments',
        content: 'Exigences d\'entretien et d\'exploitation des dispositifs de sécurité des bâtiments.',
        applicabilityConditions: [
          {
            type: 'activity',
            operator: 'includes',
            value: 'exploitation-batiment',
            description: 'Propriétaires et exploitants de bâtiments'
          }
        ],
        relatedSubjects: ['securite-batiment'],
        officialUrl: 'https://legisquebec.gouv.qc.ca/fr/document/rc/B-1.1,%20r.3'
      }
    ]
  }
];

// === SUJETS SST === //

export const SST_SUBJECTS: SSTSubject[] = [
  {
    id: 'programme-prevention',
    name: 'Programme de prévention',
    category: 'prevention',
    description: 'Document de planification intégrée de la prévention en entreprise',
    applicableLaws: ['LMRSST', 'LSST'],
    sectors: ['tous'],
    riskLevels: ['medium', 'high', 'critical']
  },
  {
    id: 'plan-action',
    name: 'Plan d\'action SST',
    category: 'prevention',
    description: 'Document simplifié de planification pour petites entreprises',
    applicableLaws: ['LMRSST'],
    sectors: ['tous'],
    riskLevels: ['low', 'medium']
  },
  {
    id: 'comite-sst',
    name: 'Comité de santé et sécurité du travail',
    category: 'prevention',
    description: 'Mécanisme paritaire de participation des travailleurs',
    applicableLaws: ['LMRSST', 'LSST'],
    sectors: ['tous'],
    riskLevels: ['medium', 'high', 'critical']
  },
  {
    id: 'representant-sst',
    name: 'Représentant en santé-sécurité',
    category: 'prevention',
    description: 'Personne désignée pour représenter les travailleurs en SST',
    applicableLaws: ['LMRSST'],
    sectors: ['tous'],
    riskLevels: ['medium', 'high', 'critical']
  },
  {
    id: 'representant-sst-chantier',
    name: 'Représentant SST sur chantier',
    category: 'prevention',
    description: 'Représentant spécialisé pour les chantiers de construction',
    applicableLaws: ['CSTC'],
    sectors: ['construction'],
    riskLevels: ['high', 'critical']
  },
  {
    id: 'agent-liaison',
    name: 'Agent de liaison en santé-sécurité (ALSS)',
    category: 'prevention',
    description: 'Personne désignée dans les petites entreprises pour faire le lien en SST',
    applicableLaws: ['LMRSST'],
    sectors: ['tous'],
    riskLevels: ['low', 'medium']
  },
  {
    id: 'registre-incidents',
    name: 'Registre des incidents et accidents',
    category: 'surveillance',
    description: 'Tenue obligatoire des événements SST',
    applicableLaws: ['LMRSST'],
    sectors: ['tous'],
    riskLevels: ['low', 'medium', 'high', 'critical']
  },
  {
    id: 'formation-sst',
    name: 'Formation en santé et sécurité',
    category: 'formation',
    description: 'Formation obligatoire des acteurs SST',
    applicableLaws: ['LMRSST', 'LSST'],
    sectors: ['tous'],
    riskLevels: ['low', 'medium', 'high', 'critical']
  },
  {
    id: 'epi',
    name: 'Équipements de protection individuelle',
    category: 'protection',
    description: 'Fourniture et utilisation d\'EPI appropriés',
    applicableLaws: ['LSST', 'CSTC'],
    sectors: ['tous'],
    riskLevels: ['medium', 'high', 'critical']
  },
  {
    id: 'simdut',
    name: 'SIMDUT 2015 - Système d\'information sur les matières dangereuses',
    category: 'formation',
    description: 'Étiquetage, fiches de sécurité et formation sur les produits dangereux',
    applicableLaws: ['LSST'],
    sectors: ['manufacturier', 'construction', 'santé', 'agriculture'],
    riskLevels: ['medium', 'high', 'critical']
  },
  {
    id: 'espaces-confines',
    name: 'Travail en espaces confinés',
    category: 'protection',
    description: 'Procédures sécuritaires pour les espaces à risque d\'asphyxie',
    applicableLaws: ['LSST', 'CSTC'],
    sectors: ['manufacturier', 'construction', 'transport'],
    riskLevels: ['critical']
  },
  {
    id: 'travail-hauteur',
    name: 'Travail en hauteur',
    category: 'protection',
    description: 'Protection contre les chutes de hauteur',
    applicableLaws: ['LSST', 'CSTC'],
    sectors: ['construction', 'manufacturier'],
    riskLevels: ['high', 'critical']
  },
  {
    id: 'securite-batiment',
    name: 'Sécurité des bâtiments',
    category: 'protection',
    description: 'Entretien des systèmes de sécurité incendie et mécaniques',
    applicableLaws: ['RBQ'],
    sectors: ['tous'],
    riskLevels: ['medium', 'high']
  }
];

// === DÉFINITIONS SECTORIELLES === //

export const SECTOR_DEFINITIONS: SectorDefinition[] = [
  {
    id: 'construction',
    name: 'Construction',
    scianCodes: ['23'],
    riskProfile: 'critical',
    specificRequirements: [
      'Représentant SST dès 10 travailleurs',
      'Comité de chantier selon taille',
      'Coordonnateur SST sur grands chantiers'
    ]
  },
  {
    id: 'manufacturier',
    name: 'Fabrication manufacturière',
    scianCodes: ['31', '32', '33'],
    riskProfile: 'high',
    specificRequirements: [
      'SIMDUT pour produits chimiques',
      'Cadenassage des machines',
      'Protection auditive'
    ]
  },
  {
    id: 'transport',
    name: 'Transport et entreposage',
    scianCodes: ['48', '49'],
    riskProfile: 'medium',
    specificRequirements: [
      'Formation conduite sécuritaire',
      'Procédures de chargement',
      'Gestion de la fatigue'
    ]
  },
  {
    id: 'santé',
    name: 'Soins de santé et assistance sociale',
    scianCodes: ['62'],
    riskProfile: 'high',
    specificRequirements: [
      'Protection contre agents biologiques',
      'Manutention sécuritaire des patients',
      'Gestion du stress'
    ]
  },
  {
    id: 'services',
    name: 'Services professionnels et administratifs',
    scianCodes: ['54', '55', '56'],
    riskProfile: 'low',
    specificRequirements: [
      'Ergonomie des postes de travail',
      'Prévention des RPS',
      'Qualité de l\'air'
    ]
  },
  {
    id: 'commerce',
    name: 'Commerce de détail',
    scianCodes: ['44', '45'],
    riskProfile: 'medium',
    specificRequirements: [
      'Prévention des chutes',
      'Sécurité lors des vols',
      'Manutention sécuritaire'
    ]
  }
];

// === RELATIONS ONTOLOGIQUES === //

export const ONTOLOGY_RELATIONSHIPS: OntologyRelationship[] = [
  {
    id: 'LMRSST_90_requires_committee',
    type: 'requires',
    source: 'LMRSST_90',
    target: 'LMRSST_101',
    conditions: [
      {
        type: 'company_size',
        operator: '>=',
        value: 20,
        description: 'Programme de prévention nécessite comité SST'
      }
    ],
    strength: 1.0
  },
  {
    id: 'small_company_plan_vs_program',
    type: 'supersedes',
    source: 'LMRSST_64',
    target: 'LMRSST_90',
    conditions: [
      {
        type: 'company_size',
        operator: '<',
        value: 20,
        description: 'Plan d\'action remplace programme pour <20 employés'
      }
    ],
    strength: 1.0
  },
  {
    id: 'construction_special_representative',
    type: 'applies_to',
    source: 'CSTC_2.4.1',
    target: 'representant-sst-chantier',
    conditions: [
      {
        type: 'sector',
        operator: '==',
        value: 'construction',
        description: 'Représentant spécialisé pour la construction'
      }
    ],
    strength: 1.0
  },
  {
    id: 'training_applies_all_mechanisms',
    type: 'applies_to',
    source: 'LMRSST_27',
    target: 'formation-sst',
    conditions: [],
    strength: 1.0
  }
];

// === FONCTIONS UTILITAIRES === //

export function getApplicableLaws(
  companySize: number, 
  sector: string, 
  scianCode?: string,
  date: Date = new Date()
): LegalArticle[] {
  const applicable: LegalArticle[] = [];
  
  for (const framework of LEGAL_FRAMEWORKS) {
    for (const article of framework.articles) {
      if (isArticleApplicable(article, companySize, sector, scianCode, date)) {
        applicable.push(article);
      }
    }
  }
  
  return applicable;
}

export function isArticleApplicable(
  article: LegalArticle,
  companySize: number,
  sector: string,
  scianCode?: string,
  date: Date = new Date()
): boolean {
  for (const condition of article.applicabilityConditions) {
    if (!evaluateCondition(condition, companySize, sector, scianCode, date)) {
      return false;
    }
  }
  return true;
}

function evaluateCondition(
  condition: ApplicabilityCondition,
  companySize: number,
  sector: string,
  scianCode?: string,
  date: Date = new Date()
): boolean {
  switch (condition.type) {
    case 'company_size':
      const size = condition.value as number;
      switch (condition.operator) {
        case '>=': return companySize >= size;
        case '<=': return companySize <= size;
        case '<': return companySize < size;
        case '>': return companySize > size;
        case '==': return companySize === size;
        case '!=': return companySize !== size;
        default: return false;
      }
    
    case 'sector':
      const targetSector = condition.value as string;
      switch (condition.operator) {
        case '==': return sector === targetSector;
        case '!=': return sector !== targetSector;
        case 'includes': return sector.includes(targetSector);
        case 'excludes': return !sector.includes(targetSector);
        default: return false;
      }
    
    case 'date':
      const targetDate = new Date(condition.value as string);
      switch (condition.operator) {
        case '>=': return date >= targetDate;
        case '<=': return date <= targetDate;
        case '==': return date.toDateString() === targetDate.toDateString();
        default: return false;
      }
    
    default:
      return true;
  }
}

export function getRequiredSubjects(
  companySize: number,
  sector: string,
  riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): SSTSubject[] {
  return SST_SUBJECTS.filter(subject => {
    // Vérifier si le secteur est applicable
    if (!subject.sectors.includes('tous') && !subject.sectors.includes(sector)) {
      return false;
    }
    
    // Vérifier si le niveau de risque est applicable
    if (!subject.riskLevels.includes(riskLevel)) {
      return false;
    }
    
    // Vérifier les lois applicables
    const applicableLaws = getApplicableLaws(companySize, sector);
    const hasApplicableLaw = subject.applicableLaws.some(law =>
      applicableLaws.some(article => article.id.startsWith(law))
    );
    
    return hasApplicableLaw;
  });
}

export function getSectorDefinition(sector: string): SectorDefinition | undefined {
  return SECTOR_DEFINITIONS.find(def => def.id === sector);
}

export function findRelatedArticles(subjectId: string): LegalArticle[] {
  const related: LegalArticle[] = [];
  
  for (const framework of LEGAL_FRAMEWORKS) {
    for (const article of framework.articles) {
      if (article.relatedSubjects.includes(subjectId)) {
        related.push(article);
      }
    }
  }
  
  return related;
}

// Classe de gestion de l'ontologie légale
export class LegalOntologyManager {
  getFrameworks(): LegalFramework[] {
    return LEGAL_FRAMEWORKS;
  }
  
  getSubjects(): SSTSubject[] {
    return SST_SUBJECTS;
  }
  
  getSectors(): SectorDefinition[] {
    return SECTOR_DEFINITIONS;
  }
  
  getApplicableLaws(companySize: number, sector: string, scianCode?: string, date?: Date): LegalArticle[] {
    return getApplicableLaws(companySize, sector, scianCode, date);
  }
  
  getRequiredSubjects(
    companySize: number, 
    sector: string, 
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): SSTSubject[] {
    return getRequiredSubjects(companySize, sector, riskLevel);
  }
}

// Export de la classe pour les tests
export { LegalOntologyManager as LegalOntology };

// Instance singleton pour utilisation globale
export const legalOntology = new LegalOntologyManager();