import type { 
  LegalReference, 
  ComplianceRule, 
  DocumentContext, 
  ComplianceAnalysisResult,
  DocumentMetadata,
  NonConformity,
  Obligation,
  GeneratedScenario,
  ActionPlan
} from '../types/index';
// === INTÉGRATION PIPELINE DATAFORGE DANS AGENTICSST ===
// Ajout progressif sans impact sur le code existant

// === 1. NOUVEAU FICHIER src/lib/dataForgeEngine.ts ===
export class DataForgeEngine {
  private legalRefs: Map<string, LegalReference>;
  private obligationMap: Map<string, Obligation[]>;
  private complianceRules: ComplianceRule[];

  constructor() {
    this.initializeLegalCorpus();
    this.initializeObligationMappings();
    this.initializeComplianceRules();
  }

  // === CORPUS LÉGAL SST QUÉBEC (57 RÈGLEMENTS) ===
  private initializeLegalCorpus() {
    this.legalRefs = new Map([
      ['S-2.1', {
        code: 'S-2.1',
        title: 'Loi sur la santé et la sécurité du travail',
        type: 'Loi',
        source: 'Légis Québec',
        lastUpdate: '2025-04-01',
        url: 'https://www.legisquebec.gouv.qc.ca/fr/ShowDoc/cs/S-2.1'
      }],
      ['A-3.001', {
        code: 'A-3.001',
        title: 'Loi sur les accidents du travail et les maladies professionnelles',
        type: 'Loi',
        source: 'Légis Québec',
        lastUpdate: '2025-04-01',
        url: 'https://www.legisquebec.gouv.qc.ca/fr/showdoc/cs/A-3.001'
      }],
      ['S-2.1,r.13', {
        code: 'S-2.1,r.13',
        title: 'RSST - Règlement sur la santé et sécurité du travail',
        type: 'Règlement',
        source: 'Légis Québec',
        lastUpdate: '2025-04-01',
        url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1%2C%20r.%2013%20/'
      }],
      ['S-2.1,r.4', {
        code: 'S-2.1,r.4',
        title: 'Code de sécurité pour les travaux de construction',
        type: 'Règlement',
        source: 'Légis Québec/ASP',
        lastUpdate: '2025-02-20',
        url: 'https://www.legisquebec.gouv.qc.ca/fr/ShowDoc/cr/S-2.1%2C%20r.%204'
      }],
      ['S-2.1,r.8.1', {
        code: 'S-2.1,r.8.1',
        title: 'Règlement sur l\'information concernant les produits dangereux',
        type: 'Règlement',
        source: 'Légis Québec',
        lastUpdate: '2025-04-01',
        url: 'https://www.legisquebec.gouv.qc.ca/fr/ShowDoc/cr/S-2.1%2C%20r.%208.1'
      }],
      ['S-2.1,r.14', {
        code: 'S-2.1,r.14',
        title: 'Règlement sur la SST dans les mines',
        type: 'Règlement',
        source: 'Légis Québec',
        lastUpdate: '2025-04-01',
        url: 'https://www.legisquebec.gouv.qc.ca/fr/ShowDoc/cr/S-2.1%2C%20r.%2014'
      }]
      // ... les 51 autres règlements à ajouter progressivement
    ]);
  }

  // === MOTEUR DE CONFORMITÉ (RÈGLES SI...ALORS) ===
  private initializeComplianceRules() {
    this.complianceRules = [
      {
        id: 'amiante_detection',
        condition: (context: DocumentContext) => 
          context.keywords.includes('amiante') || 
          context.detectedSubstances.includes('asbestos'),
        obligations: [
          'Évaluation des matériaux (RSST)',
          'Formation/information avant travaux',
          'Méthodes de contrôle poussières',
          'Tenue de registres'
        ],
        legalRefs: ['S-2.1,r.13', 'S-2.1,r.4'],
        severity: 'ÉLEVÉE',
        sector: ['construction', 'industrie']
      },
      {
        id: 'chantier_seuils',
        condition: (context: DocumentContext) => 
          context.sector === 'construction' && 
          (context.employeeCount >= 20 || context.durationMonths >= 3),
        obligations: [
          'Plan de circulation obligatoire',
          'Comité SST chantier (si ≥20 trav.)',
          'Représentant prévention',
          'Mécanismes de prévention'
        ],
        legalRefs: ['S-2.1,r.4', 'S-2.1,r.8.2', 'S-2.1,r.5'],
        severity: 'CRITIQUE',
        sector: ['construction']
      },
      {
        id: 'produits_dangereux',
        condition: (context: DocumentContext) => 
          context.chemicalInventory.length > 0 ||
          context.keywords.some(k => ['SIMDUT', 'FDS', 'étiquetage'].includes(k)),
        obligations: [
          'Étiquetage conforme SIMDUT',
          'FDS à jour et accessibles',
          'Formation SIMDUT obligatoire',
          'Inventaire produits dangereux'
        ],
        legalRefs: ['S-2.1,r.8.1'],
        severity: 'ÉLEVÉE',
        sector: ['tous']
      },
      {
        id: 'secourisme',
        condition: (context: DocumentContext) => 
          context.employeeCount >= 5 || context.riskLevel === 'élevé',
        obligations: [
          'Secouristes formés selon effectif',
          'Trousse premiers secours complète',
          'Affichage numéros urgence',
          'Registre interventions'
        ],
        legalRefs: ['A-3.001,r.10'],
        severity: 'MOYENNE',
        sector: ['tous']
      }
    ];
  }

  // === ANALYSE CONFORMITÉ DOCUMENT ===
  public async analyzeDocumentCompliance(
    content: string,
    metadata: DocumentMetadata
  ): Promise<ComplianceAnalysisResult> {
    
    // 1. Extraction contexte documentaire
    const context = await this.extractDocumentContext(content, metadata);
    
    // 2. Application règles de conformité
    const triggeredRules = this.complianceRules.filter(rule => 
      rule.condition(context)
    );
    
    // 3. Calcul score conformité
    const complianceScore = this.calculateComplianceScore(
      content, 
      triggeredRules, 
      context
    );
    
    // 4. Génération obligations spécifiques
    const obligations = this.generateObligations(triggeredRules, context);
    
    // 5. Recommandations d'actions
    const actionPlan = this.generateActionPlan(obligations, context);

    return {
      document_id: metadata.id,
      conformity_score: complianceScore,
      triggered_rules: triggeredRules.map(r => r.id),
      legal_references: this.extractLegalReferences(triggeredRules),
      non_conformities: this.detectNonConformities(content, obligations),
      obligations: obligations,
      action_plan: actionPlan,
      generated_scenarios: this.generateContextualScenarios(context, obligations),
      validation_timestamp: new Date(),
      dataforge_version: '1.0.0'
    };
  }

  // === GÉNÉRATION SCÉNARIOS CONTEXTUELS ===
  private generateContextualScenarios(
    context: DocumentContext, 
    obligations: Obligation[]
  ): GeneratedScenario[] {
    const scenarios: GeneratedScenario[] = [];
    
    // Scénarios basés sur obligations manquantes
    obligations.forEach(obligation => {
      if (!obligation.isCompliant) {
        scenarios.push({
          id: `dataforge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: `Conformité ${obligation.article} - ${obligation.theme}`,
          description: `Scénario généré pour corriger non-conformité: ${obligation.description}`,
          agents: this.selectAgentsForObligation(obligation),
          priority: this.mapSeverityToPriority(obligation.severity),
          legislation_context: obligation.legalRefs.join(' + '),
          secteur_scian: context.scianCode,
          action_type: obligation.actionType,
          estimated_duration: obligation.estimatedDuration,
          dataforge_generated: true
        });
      }
    });

    return scenarios;
  }

  // === INTÉGRATION AVEC AGENTS EXISTANTS ===
  private selectAgentsForObligation(obligation: Obligation): string[] {
    const agentMap = {
      'formation': ['ALSS', 'CoSS'],
      'documentation': ['DocuGen', 'LexiNorm'],
      'evaluation_risque': ['DiagSST', 'Sentinelle'],
      'conformite_legale': ['LexiNorm', 'Hugo'],
      'comite_sst': ['CoSS', 'Hugo'],
      'surveillance': ['Sentinelle', 'DiagSST'],
      'communication': ['Communication', 'CoSS']
    };
    
    return agentMap[obligation.actionType] || ['Hugo', 'LexiNorm'];
  }
}

// === 2. EXTENSION MODULE DOCUANALYZER EXISTANT ===
// Dans votre PromptManagement.tsx existant, ajoutez ces fonctions :

// Fonction d'analyse avec DataForge
const handleAnalyzeDocumentWithDataForge = async () => {
  setAnalysisLoading(true);
  
  try {
    // Initialiser moteur DataForge
    const dataForgeEngine = new DataForgeEngine();
    
    // Préparer métadonnées
    const metadata = {
      id: `doc_${Date.now()}`,
      type: documentType,
      sector: analysisSector,
      uploadedAt: new Date(),
      source: 'user_upload'
    };
    
    // Analyse avec DataForge
    const dataForgeResult = await dataForgeEngine.analyzeDocumentCompliance(
      documentContent, 
      metadata
    );
    
    // Transformation pour interface existante
    setAnalysisResults({
      conformity_score: dataForgeResult.conformity_score,
      document_type: documentType,
      detected_sector: analysisSector,
      applicable_laws: dataForgeResult.legal_references.map(ref => ref.code),
      criticality: dataForgeResult.conformity_score < 60 ? "HIGH" : 
                  dataForgeResult.conformity_score < 80 ? "MEDIUM" : "LOW",
      non_conformities: dataForgeResult.non_conformities.map(nc => ({
        article: nc.legal_reference,
        severity: nc.severity,
        description: nc.description,
        recommendation: nc.recommended_action
      })),
      recommended_scenarios: dataForgeResult.generated_scenarios.map(scenario => ({
        title: scenario.title,
        description: scenario.description,
        agents: scenario.agents,
        priority: scenario.priority
      })),
      dataforge_analysis: true,
      legal_corpus_version: dataForgeResult.dataforge_version
    });
    
  } catch (error) {
    console.error("Erreur analyse DataForge:", error);
  } finally {
    setAnalysisLoading(false);
  }
};

// === 3. TYPES TYPESCRIPT À AJOUTER ===
interface LegalReference {
  code: string;
  title: string;
  type: 'Loi' | 'Règlement';
  source: string;
  lastUpdate: string;
  url: string;
}

interface ComplianceRule {
  id: string;
  condition: (context: DocumentContext) => boolean;
  obligations: string[];
  legalRefs: string[];
  severity: 'FAIBLE' | 'MOYENNE' | 'ÉLEVÉE' | 'CRITIQUE';
  sector: string[];
}

interface DocumentContext {
  keywords: string[];
  sector: string;
  scianCode: string;
  employeeCount: number;
  durationMonths?: number;
  detectedSubstances: string[];
  chemicalInventory: string[];
  riskLevel: string;
}

interface ComplianceAnalysisResult {
  document_id: string;
  conformity_score: number;
  triggered_rules: string[];
  legal_references: LegalReference[];
  non_conformities: NonConformity[];
  obligations: Obligation[];
  action_plan: ActionPlan;
  generated_scenarios: GeneratedScenario[];
  validation_timestamp: Date;
  dataforge_version: string;
}