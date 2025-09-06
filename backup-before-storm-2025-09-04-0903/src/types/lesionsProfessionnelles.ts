export interface LesionProfessionnelle {
  id: string;
  annee: number;
  secteurActivite: string;
  scianCode: string;
  typeLesion: string;
  partieLesee: string;
  natureLesion: string;
  genreBlessure: string;
  agentCausal: string;
  evenementAccident: string;
  nbCas: number;
  nbJoursPerdus: number;
  coutTotal: number;
  gravite: 'Légère' | 'Modérée' | 'Grave' | 'Très grave';
  province: string;
  source: string;
}

export interface StatistiquesLesions {
  secteur: string;
  scianCode?: string;
  annee: number;
  totalCas: number;
  totalJoursPerdus: number;
  coutMoyen: number;
  frequenceAccidents: number;
  graviteMoyenne: number;
  tendance: 'Hausse' | 'Stable' | 'Baisse';
  principalesLesions: {
    type: string;
    pourcentage: number;
    nbCas: number;
  }[];
  principalescauses: {
    cause: string;
    pourcentage: number;
    nbCas: number;
  }[];
  partiesLesees: {
    partie: string;
    pourcentage: number;
    nbCas: number;
  }[];
}

export interface AnalyseComparative {
  secteurEntreprise: string;
  scianEntreprise?: string;
  performanceVsSecteur: {
    tauxAccidents: 'Meilleur' | 'Similaire' | 'Moins bon';
    graviteMoyenne: 'Meilleur' | 'Similaire' | 'Moins bon';
    couts: 'Meilleur' | 'Similaire' | 'Moins bon';
  };
  risquesPrioritaires: {
    risque: string;
    probabiliteStatistique: number;
    impactPotentiel: number;
    scoreRisque: number;
    recommandation: string;
  }[];
  benchmarkingSectoriel: {
    percentileSecteur: number;
    positionRelative: string;
    ameliorationsPossibles: string[];
  };
}

export interface InsightPredictif {
  secteur: string;
  scianCode?: string;
  risquesEmergents: {
    risque: string;
    tendance: string;
    probabiliteAugmentation: number;
    facteurs: string[];
  }[];
  preventionOptimale: {
    mesure: string;
    efficaciteStatistique: number;
    reductionRisqueEstimee: number;
    coutBenefice: string;
  }[];
  alertesStatistiques: {
    type: string;
    message: string;
    urgence: 'Faible' | 'Modérée' | 'Élevée' | 'Critique';
  }[];
}

export interface RecommandationEnrichie {
  mesure: string;
  article: string;
  preuveStatistique: {
    efficaciteProuvee: number;
    reductionCasObservee: number;
    sourceDonnees: string;
    niveauConfiance: number;
  };
  contexteSectoriel: {
    frequenceApplicationSecteur: number;
    resultatsMoyensSecteur: string;
    exemplesCasSucces: string[];
  };
  impactEstime: {
    reductionRisqueEstimee: number;
    economiesPotentielles: number;
    retourInvestissement: string;
  };
}