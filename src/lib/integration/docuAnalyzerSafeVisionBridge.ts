// src/lib/integration/docuAnalyzerSafeVisionBridge.ts
// Service d'intégration entre DocuAnalyzer et SafeVision
// Transforme les documents filtrés en contenu vidéo spécialisé

export interface DocuAnalyzerFilters {
  source: string;
  category: string;
  sector: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  keywords?: string[];
  conformityLevel?: 'high' | 'medium' | 'low';
}

export interface DocumentReference {
  id: string;
  title: string;
  source: string; // CNESST, CSTC, RSST
  url?: string;
  relevantSections: string[];
  legalReferences: string[]; // Articles LMRSST, sections réglementaires
  riskLevel: 'critique' | 'élevé' | 'modéré' | 'faible';
  sector: string;
  lastUpdated: Date;
}

export interface EnrichedScenarioData {
  scenarioId: number;
  scenarioTitle: string;
  specializedPrompts: {
    contextualPrompt: string;
    legalFramework: string;
    sectorialAdaptations: string;
    riskAssessment: string;
    preventionMeasures: string;
  };
  documentReferences: DocumentReference[];
  complianceMetrics: {
    conformityScore: number; // 0-100
    criticalGaps: string[];
    recommendedActions: string[];
  };
  videoParameters: {
    targetAudience: string;
    duration: number; // en secondes
    complexity: 'débutant' | 'intermédiaire' | 'avancé';
    visualElements: string[];
  };
}

export interface FilteredCorpus {
  totalDocuments: number;
  filteredDocuments: DocumentReference[];
  thematicCoverage: {
    theme: string;
    documentCount: number;
    coverage: number; // pourcentage
  }[];
  sectoralRelevance: {
    sector: string;
    relevanceScore: number;
    applicableDocuments: number;
  }[];
  legalCompliance: {
    framework: string; // LMRSST, RSST, etc.
    coverage: number;
    gaps: string[];
  }[];
}

class DocuAnalyzerSafeVisionBridge {
  private readonly BASE_SCENARIOS = {
    52: {
      title: "Capsules vidéo obligations LMRSST",
      basePrompt: "Créer des capsules vidéo éducatives sur les obligations légales en SST selon la LMRSST",
      targetSectors: ["construction", "industrie", "services"]
    },
    116: {
      title: "Formation sécurité construction",  
      basePrompt: "Développer une formation spécialisée en sécurité pour le secteur de la construction",
      targetSectors: ["construction"]
    }
  };

  private readonly SECTORIAL_MAPPINGS = {
    construction: {
      scianCodes: ['23', '231', '232', '236', '237', '238'],
      specificRisks: ['chutes', 'espaces clos', 'équipements lourds', 'matériaux dangereux'],
      regulations: ['CSTC', 'RSST', 'LMRSST']
    },
    industrie: {
      scianCodes: ['31', '32', '33'],
      specificRisks: ['machines industrielles', 'produits chimiques', 'espaces clos'],
      regulations: ['RSST', 'LMRSST', 'TMD']
    },
    services: {
      scianCodes: ['44', '45', '48', '49', '51', '52', '53', '54', '55', '56'],
      specificRisks: ['ergonomie', 'stress au travail', 'sécurité bureaux'],
      regulations: ['LMRSST', 'normes ergonomie']
    }
  };

  /**
   * Point d'entrée principal - enrichit SafeVision avec le corpus DocuAnalyzer
   */
  async enrichSafeVisionWithCorpus(
    filters: DocuAnalyzerFilters,
    scenarioId: number
  ): Promise<EnrichedScenarioData> {
    
    try {
      // 1. Récupérer et filtrer les documents selon les critères
      const filteredCorpus = await this.filterDocumentCorpus(filters);
      
      // 2. Analyser la pertinence sectorielle
      const sectorialAnalysis = await this.analyzeSectorialRelevance(
        filteredCorpus, 
        filters.sector
      );
      
      // 3. Générer les prompts spécialisés
      const specializedPrompts = await this.generateSpecializedPrompts(
        scenarioId,
        filteredCorpus,
        sectorialAnalysis
      );
      
      // 4. Calculer les métriques de conformité
      const complianceMetrics = await this.calculateComplianceMetrics(
        filteredCorpus,
        filters.sector
      );
      
      // 5. Définir les paramètres vidéo optimaux
      const videoParameters = await this.optimizeVideoParameters(
        filteredCorpus,
        filters.sector
      );
      
      return {
        scenarioId,
        scenarioTitle: this.BASE_SCENARIOS[scenarioId]?.title || `Scénario ${scenarioId}`,
        specializedPrompts,
        documentReferences: filteredCorpus.filteredDocuments,
        complianceMetrics,
        videoParameters
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'enrichissement SafeVision:', error);
      throw new Error(`Impossible d'enrichir SafeVision: ${error.message}`);
    }
  }

  /**
   * Filtre les documents selon les critères DocuAnalyzer
   */
  private async filterDocumentCorpus(filters: DocuAnalyzerFilters): Promise<FilteredCorpus> {
    
    // Simulation de l'accès aux 196 documents CNESST crawlés
    // En production, ceci interrogerait votre base Supabase
    const mockDocuments: DocumentReference[] = [
      {
        id: "cnesst-001",
        title: "Guide espaces clos - Construction",
        source: "CNESST",
        url: "https://www.cnesst.gouv.qc.ca/fr/prevention/themes/espaces-clos",
        relevantSections: [
          "Définition des espaces clos",
          "Procédures d'entrée sécurisée", 
          "Équipements de protection"
        ],
        legalReferences: [
          "RSST art. 297-312",
          "LMRSST art. 51",
          "CSTC section VIII"
        ],
        riskLevel: "critique",
        sector: "construction",
        lastUpdated: new Date('2024-08-15')
      },
      {
        id: "cstc-015",
        title: "Sécurité sur chantiers - Espaces confinés",
        source: "CSTC", 
        url: "https://www.csst.qc.ca/prevention/themes/espaces-confines",
        relevantSections: [
          "Évaluation des risques",
          "Formation du personnel",
          "Surveillance continue"
        ],
        legalReferences: [
          "CSTC art. 3.15.1 à 3.15.17",
          "RSST art. 297",
          "LMRSST art. 51"
        ],
        riskLevel: "critique",
        sector: "construction", 
        lastUpdated: new Date('2024-07-22')
      }
    ];

    // Filtrage selon les critères
    const filteredDocs = mockDocuments.filter(doc => {
      let matches = true;
      
      if (filters.source && doc.source !== filters.source) matches = false;
      if (filters.sector && doc.sector !== filters.sector) matches = false;
      if (filters.category && !doc.title.toLowerCase().includes(filters.category.toLowerCase())) matches = false;
      
      return matches;
    });

    // Analyse thématique
    const thematicCoverage = this.calculateThematicCoverage(filteredDocs);
    const sectoralRelevance = this.calculateSectoralRelevance(filteredDocs, filters.sector);
    const legalCompliance = this.calculateLegalCompliance(filteredDocs);

    return {
      totalDocuments: filteredDocs.length,
      filteredDocuments: filteredDocs,
      thematicCoverage,
      sectoralRelevance,
      legalCompliance
    };
  }

  /**
   * Génère des prompts spécialisés pour les agents SafeVision
   */
  private async generateSpecializedPrompts(
    scenarioId: number,
    corpus: FilteredCorpus,
    sectorialAnalysis: any
  ): Promise<EnrichedScenarioData['specializedPrompts']> {
    
    const baseScenario = this.BASE_SCENARIOS[scenarioId];
    const sectorialData = this.SECTORIAL_MAPPINGS[sectorialAnalysis.primarySector];
    
    // Extraction des références légales uniques
    const legalRefs = [...new Set(
      corpus.filteredDocuments.flatMap(doc => doc.legalReferences)
    )].join(', ');
    
    // Construction du contexte sectoriel
    const sectorialContext = sectorialData ? `
      Secteur ciblé: ${sectorialAnalysis.primarySector}
      Codes SCIAN applicables: ${sectorialData.scianCodes.join(', ')}
      Risques spécifiques identifiés: ${sectorialData.specificRisks.join(', ')}
      Cadre réglementaire: ${sectorialData.regulations.join(', ')}
    ` : '';

    return {
      contextualPrompt: `
        ${baseScenario?.basePrompt || 'Créer du contenu vidéo SST spécialisé'}
        
        CONTEXTE DOCUMENTAIRE ENRICHI:
        - ${corpus.totalDocuments} documents analysés du corpus CNESST
        - Sources: ${[...new Set(corpus.filteredDocuments.map(d => d.source))].join(', ')}
        - Dernière mise à jour: ${new Date().toLocaleDateString('fr-CA')}
        
        ${sectorialContext}
        
        INSTRUCTIONS SPÉCIALES:
        - Utiliser uniquement les références documentaires fournies
        - Citer précisément les articles de loi mentionnés: ${legalRefs}
        - Adapter le niveau de détail selon le public cible
        - Inclure des exemples concrets du secteur ${sectorialAnalysis.primarySector}
      `,
      
      legalFramework: `
        CADRE LÉGAL APPLICABLE:
        ${legalRefs}
        
        SOURCES DOCUMENTAIRES VALIDÉES:
        ${corpus.filteredDocuments.map(doc => 
          `- ${doc.title} (${doc.source}) - Niveau de risque: ${doc.riskLevel}`
        ).join('\n')}
        
        EXIGENCES DE CONFORMITÉ:
        ${corpus.legalCompliance.map(comp => 
          `- ${comp.framework}: ${comp.coverage}% de couverture${comp.gaps.length > 0 ? `, Lacunes: ${comp.gaps.join(', ')}` : ''}`
        ).join('\n')}
      `,
      
      sectorialAdaptations: `
        ADAPTATIONS SECTORIELLES REQUISES:
        ${sectorialContext}
        
        PERTINENCE PAR SECTEUR:
        ${corpus.sectoralRelevance.map(sector => 
          `- ${sector.sector}: ${sector.relevanceScore}% (${sector.applicableDocuments} documents)`
        ).join('\n')}
        
        RECOMMANDATIONS D'ADAPTATION:
        - Utiliser la terminologie spécifique au secteur ${sectorialAnalysis.primarySector}
        - Présenter des équipements et situations typiques du secteur
        - Référencer les bonnes pratiques documentées dans le corpus
      `,
      
      riskAssessment: `
        ÉVALUATION DES RISQUES BASÉE SUR LE CORPUS:
        
        RISQUES CRITIQUES IDENTIFIÉS:
        ${corpus.filteredDocuments
          .filter(doc => doc.riskLevel === 'critique')
          .map(doc => `- ${doc.title}: ${doc.relevantSections.join(', ')}`)
          .join('\n')}
          
        DISTRIBUTION DES RISQUES:
        - Critiques: ${corpus.filteredDocuments.filter(d => d.riskLevel === 'critique').length}
        - Élevés: ${corpus.filteredDocuments.filter(d => d.riskLevel === 'élevé').length}
        - Modérés: ${corpus.filteredDocuments.filter(d => d.riskLevel === 'modéré').length}
        - Faibles: ${corpus.filteredDocuments.filter(d => d.riskLevel === 'faible').length}
      `,
      
      preventionMeasures: `
        MESURES DE PRÉVENTION DOCUMENTÉES:
        
        ${corpus.filteredDocuments.map(doc => `
        SOURCE: ${doc.title} (${doc.source})
        SECTIONS PERTINENTES: ${doc.relevantSections.join(' | ')}
        RÉFÉRENCES LÉGALES: ${doc.legalReferences.join(' | ')}
        NIVEAU DE RISQUE: ${doc.riskLevel}
        ---`).join('\n')}
        
        INSTRUCTIONS POUR LA VIDÉO:
        - Présenter les mesures dans l'ordre de priorité (critiques en premier)
        - Illustrer avec des exemples visuels du secteur
        - Faire référence aux documents source pour traçabilité
      `
    };
  }

  /**
   * Calcule les métriques de conformité
   */
  private async calculateComplianceMetrics(
    corpus: FilteredCorpus,
    targetSector: string
  ): Promise<EnrichedScenarioData['complianceMetrics']> {
    
    // Analyse de conformité basée sur les documents filtrés
    const criticalDocs = corpus.filteredDocuments.filter(d => d.riskLevel === 'critique');
    const totalLegalRefs = [...new Set(
      corpus.filteredDocuments.flatMap(doc => doc.legalReferences)
    )];
    
    // Score de conformité basé sur la couverture documentaire
    const conformityScore = Math.min(100, Math.round(
      (corpus.totalDocuments / 50) * 100 // Supposant 50 docs comme référence complète
    ));
    
    const criticalGaps = criticalDocs.length === 0 ? 
      ['Aucun document critique identifié - vérifier la couverture'] :
      criticalDocs.filter(doc => !doc.lastUpdated || 
        (new Date().getTime() - doc.lastUpdated.getTime()) > 365 * 24 * 60 * 60 * 1000
      ).map(doc => `Document obsolète: ${doc.title}`);
    
    const recommendedActions = [
      `Réviser ${criticalDocs.length} documents critiques`,
      `Intégrer ${totalLegalRefs.length} références légales dans la formation`,
      `Adapter le contenu pour ${targetSector}`,
      'Valider la conformité avec un expert SST'
    ];

    return {
      conformityScore,
      criticalGaps,
      recommendedActions
    };
  }

  /**
   * Optimise les paramètres vidéo selon le corpus
   */
  private async optimizeVideoParameters(
    corpus: FilteredCorpus,
    targetSector: string
  ): Promise<EnrichedScenarioData['videoParameters']> {
    
    const complexity = corpus.filteredDocuments.some(d => d.riskLevel === 'critique') ? 
      'avancé' : 
      corpus.filteredDocuments.length > 10 ? 'intermédiaire' : 'débutant';
    
    const duration = Math.min(900, Math.max(180, corpus.totalDocuments * 30)); // 3-15 min
    
    const visualElements = [
      'Schémas techniques des équipements',
      'Démonstrations pratiques',
      `Exemples du secteur ${targetSector}`,
      'Références légales affichées',
      'Quiz interactifs de validation'
    ];

    return {
      targetAudience: `Travailleurs et superviseurs - Secteur ${targetSector}`,
      duration,
      complexity,
      visualElements
    };
  }

  // Méthodes utilitaires
  private calculateThematicCoverage(documents: DocumentReference[]) {
    const themes = ['espaces clos', 'équipements', 'formation', 'réglementation'];
    return themes.map(theme => ({
      theme,
      documentCount: documents.filter(doc => 
        doc.title.toLowerCase().includes(theme.toLowerCase()) ||
        doc.relevantSections.some(section => 
          section.toLowerCase().includes(theme.toLowerCase())
        )
      ).length,
      coverage: Math.round((documents.filter(doc => 
        doc.title.toLowerCase().includes(theme.toLowerCase())
      ).length / documents.length) * 100)
    }));
  }

  private calculateSectoralRelevance(documents: DocumentReference[], targetSector: string) {
    const sectors = ['construction', 'industrie', 'services'];
    return sectors.map(sector => ({
      sector,
      relevanceScore: sector === targetSector ? 100 : Math.round(Math.random() * 50),
      applicableDocuments: documents.filter(doc => doc.sector === sector).length
    }));
  }

  private calculateLegalCompliance(documents: DocumentReference[]) {
    const frameworks = ['LMRSST', 'RSST', 'CSTC'];
    return frameworks.map(framework => ({
      framework,
      coverage: Math.round((documents.filter(doc => 
        doc.legalReferences.some(ref => ref.includes(framework))
      ).length / documents.length) * 100),
      gaps: documents.filter(doc => 
        !doc.legalReferences.some(ref => ref.includes(framework))
      ).length > 0 ? [`Manque références ${framework}`] : []
    }));
  }

  private async analyzeSectorialRelevance(corpus: FilteredCorpus, targetSector: string) {
    return {
      primarySector: targetSector,
      relevanceScore: Math.round((corpus.filteredDocuments.filter(doc => 
        doc.sector === targetSector
      ).length / corpus.totalDocuments) * 100)
    };
  }
}

// Export de l'instance singleton
export const docuAnalyzerSafeVisionBridge = new DocuAnalyzerSafeVisionBridge();