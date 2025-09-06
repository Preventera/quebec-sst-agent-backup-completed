// src/lib/safevision/EnhancedSafeVisionOrchestrator.ts
// Orchestrateur SafeVision amélioré avec génération dynamique et intégration DocuAnalyzer

import { llmClient } from '@/lib/llmClient';
import { qualityValidator } from '@/lib/validation/QualityValidationSystem';
import { safetyGraphXAI } from '@/lib/xai/SafetyGraphXAIIntegration';

export interface VideoProvider {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  pricing: 'free' | 'paid' | 'enterprise';
  apiEndpoint?: string;
  maxDuration: string;
  formats: string[];
  features: {
    avatars: boolean;
    voiceCloning: boolean;
    multiLanguage: boolean;
    interactivity: boolean;
    analytics: boolean;
  };
}

export const VIDEO_PROVIDERS: VideoProvider[] = [
{
  id: 'demo-prototype',
  name: 'Mode Démo',
  description: 'Prototype interactif avec storyboard et TTS gratuit',
  capabilities: ['storyboard', 'tts-gratuit', 'preview-html'],
  pricing: 'free',
  apiEndpoint: '',
  maxDuration: '5min',
  formats: ['mp4'],
  features: {
    avatars: false,
    voiceCloning: false,
    multiLanguage: false,
    interactivity: true,
    analytics: false
  }
}, 
  {
    id: 'synthesia',
    name: 'Synthesia',
    description: 'Plateforme leader pour avatars IA et vidéos corporate',
    capabilities: ['avatars-ia', 'voix-humaines', 'multi-langues'],
    pricing: 'paid',
    apiEndpoint: 'https://api.synthesia.io/v2/videos',
    maxDuration: '30min',
    formats: ['mp4', 'webm'],
    features: {
      avatars: true,
      voiceCloning: true,
      multiLanguage: true,
      interactivity: false,
      analytics: true
    }
  },
  {
    id: 'veo3',
    name: 'Google Veo 3',
    description: 'Modèle de génération vidéo IA avancé de Google',
    capabilities: ['generation-video-ia', 'realisme-eleve', 'personnalisation'],
    pricing: 'enterprise',
    apiEndpoint: 'https://aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/publishers/google/models/veo-3',
    maxDuration: '10min',
    formats: ['mp4', 'mov'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: false,
      analytics: false
    }
  },
  {
    id: 'runway',
    name: 'Runway Gen-3',
    description: 'Création vidéo IA créative et flexible',
    capabilities: ['generation-creative', 'effets-visuels', 'montage-ia'],
    pricing: 'paid',
    maxDuration: '5min',
    formats: ['mp4'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: false,
      analytics: false
    }
  },
  {
    id: 'luma',
    name: 'Luma Dream Machine',
    description: 'Génération vidéo IA accessible et rapide',
    capabilities: ['generation-rapide', 'qualite-hd', 'cout-reduit'],
    pricing: 'free',
    maxDuration: '2min',
    formats: ['mp4'],
    features: {
      avatars: false,
      voiceCloning: false,
      multiLanguage: false,
      interactivity: false,
      analytics: false
    }
  }
];

export interface EnhancedVideoSpecs {
  duration: string;
  format: 'micro-learning' | 'formation-complete' | 'alerte' | 'procédural' | 'explicatif' | 'testimonial';
  audience: 'ouvriers' | 'superviseurs' | 'gestionnaires' | 'comite-sst' | 'rh' | 'direction';
  sector: string;
  urgency: 'normal' | 'urgent' | 'critique';
  style: 'professionnel' | 'décontracté' | 'institutionnel' | 'moderne' | 'didactique';
  provider: string;
  language: 'fr-CA' | 'fr-FR' | 'en-CA' | 'en-US';
  accessibility: {
    subtitles: boolean;
    audioDescription: boolean;
    signLanguage: boolean;
  };
}

// Interface pour le contexte enrichi DocuAnalyzer
export interface DocuAnalyzerEnrichedContext {
  scenarioId: number;
  scenarioTitle: string;
  specializedPrompts: {
    contextualPrompt: string;
    legalFramework: string;
    sectorialAdaptations: string;
    riskAssessment: string;
    preventionMeasures: string;
  };
  documentReferences: Array<{
    id: string;
    title: string;
    source: string;
    relevantSections: string[];
    legalReferences: string[];
    riskLevel: 'critique' | 'élevé' | 'modéré' | 'faible';
  }>;
  complianceMetrics: {
    conformityScore: number;
    criticalGaps: string[];
    recommendedActions: string[];
  };
}

export interface ScriptSegment {
  id: string;
  type: 'intro' | 'content' | 'interaction' | 'conclusion' | 'transition';
  timing: {
    start: string;
    duration: string;
  };
  content: {
    narration: string;
    visuals: string[];
    interactions?: {
      type: 'quiz' | 'pause' | 'call-to-action';
      data: any;
    };
  };
  metadata: {
    importance: 'critical' | 'high' | 'medium' | 'low';
    compliance: string[];
    agents: string[];
    docuAnalyzerReferences?: string[];
  };
}

export interface EnhancedScript {
  id: string;
  title: string;
  metadata: {
    scenarioId: number;
    provider: VideoProvider;
    duration: string;
    audience: string;
    compliance: string[];
    agents: string[];
    generatedAt: string;
    version: string;
    docuAnalyzerEnriched: boolean;
    documentSources?: string[];
    qualityMetrics?: {
      confidenceScore: number;
      isValidated: boolean;
      validatedReferences: string[];
      warnings: any[];
      recommendations: string[];
      validatedAt: string;
    };
    xaiSafetyGraph?: {
      explanationId: string;
      globalConfidence: number;
      evidenceLinks: number;
      riskPredictions: number;
      sectorBenchmark: string;
      actionableInsights: number;
    };
  };
  segments: ScriptSegment[];
  production: {
    ready: boolean;
    confidence: number;
    estimatedCost?: number;
    processingTime?: string;
  };
  export: {
    formats: string[];
    apiPayload?: any;
  };
}

export class EnhancedSafeVisionOrchestrator {
  private llmClient: any;
  
  constructor() {
    this.llmClient = llmClient;
  }

  /**
   * Génération de script améliorée avec orchestration dynamique et intégration DocuAnalyzer
   */
  async generateEnhancedScript(
    scenarioId: number,
    videoSpecs: EnhancedVideoSpecs,
    customization?: any
  ): Promise<EnhancedScript> {
    
    console.log(`🎬 Génération script SafeVision avancé - Scénario ${scenarioId}`);
    
    // 1. Sélection du provider et validation
    const provider = VIDEO_PROVIDERS.find(p => p.id === videoSpecs.provider);
    if (!provider) {
      throw new Error(`Provider ${videoSpecs.provider} non supporté`);
    }
    
    // 2. Orchestration multi-agents avec contexte enrichi DocuAnalyzer
    const agentContributions = await this.runEnhancedOrchestration(
      scenarioId,
      videoSpecs,
      provider,
      customization
    );
    
    // 3. Génération de segments structurés
    const segments = await this.generateScriptSegments(
      agentContributions,
      videoSpecs,
      provider
    );
    
    // 4. Optimisation selon le provider
    const optimizedSegments = await this.optimizeForProvider(segments, provider, videoSpecs);
    
    // 5. Validation et scoring
    const productionReadiness = this.assessProductionReadiness(optimizedSegments, provider);
    
    // 6. Génération payload API
    const apiPayload = await this.generateProviderPayload(optimizedSegments, provider, videoSpecs);
    
    // 7. Récupération des métadonnées DocuAnalyzer
    const enrichedContext = this.getDocuAnalyzerContext();

    // 8. NOUVELLE ÉTAPE : Validation qualité anti-hallucinations
    console.log('🔍 Validation qualité du script généré...');

    // Créer un script temporaire pour validation
    const tempScript = {
      segments: optimizedSegments,
      apiPayload,
      productionReadiness,
      enrichedContext
    };

    const validation = await qualityValidator.validateSafeVisionScript(
      tempScript, 
      enrichedContext?.filters
    );

    console.log(`✅ Script validé - Score: ${validation.confidenceScore}% - Fiable: ${validation.isValid}`);

    if (!validation.isValid) {
      console.warn('⚠️ Attention: Script avec score de confiance faible', validation.flaggedContent);
    }

    // 9. NOUVELLE ÉTAPE : Explication XAI + Safety Graph
    console.log('🔗 Génération explication XAI avec données Safety Graph...');

    const entrepriseProfile = {
      secteurSCIAN: enrichedContext?.filters?.sector || '23',
      secteurNom: enrichedContext?.filters?.sectorName || 'Construction', 
      tailleEntreprise: '20-99',
      region: 'Montérégie'
    };

    const xaiSafetyGraphExplanation = await safetyGraphXAI.explainSafeVisionWithSafetyGraph(
      scenarioId,
      entrepriseProfile,
      tempScript
    );

    console.log(`✅ XAI Safety Graph généré - ${xaiSafetyGraphExplanation.evidenceLinks.length} liens preuves, ${xaiSafetyGraphExplanation.actionableInsights.length} actions recommandées`);

    // 10. Création du script final enrichi
    const enhancedScript: EnhancedScript = {
      id: `script_${scenarioId}_${Date.now()}`,
      title: this.generateScriptTitle(scenarioId, videoSpecs, enrichedContext),
      metadata: {
        scenarioId,
        provider,
        duration: videoSpecs.duration,
        audience: videoSpecs.audience,
        compliance: this.extractComplianceReferences(agentContributions, enrichedContext),
        agents: agentContributions.map(c => c.agentName),
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        docuAnalyzerEnriched: !!enrichedContext,
        documentSources: enrichedContext?.documentReferences.map(doc => doc.source) || [],

        // NOUVELLES MÉTADONNÉES DE VALIDATION
        qualityMetrics: {
          confidenceScore: validation.confidenceScore,
          isValidated: validation.isValid,
          validatedReferences: validation.validatedReferences,
          warnings: validation.flaggedContent.filter(f => f.severity === 'high'),
          recommendations: validation.recommendations,
          validatedAt: new Date().toISOString()
        },

        // NOUVELLES MÉTADONNÉES XAI SAFETY GRAPH  
        xaiSafetyGraph: {
          explanationId: xaiSafetyGraphExplanation.id,
          globalConfidence: xaiSafetyGraphExplanation.globalConfidence,
          evidenceLinks: xaiSafetyGraphExplanation.evidenceLinks.length,
          riskPredictions: xaiSafetyGraphExplanation.riskPredictions.length,
          sectorBenchmark: xaiSafetyGraphExplanation.sectorBenchmark.entrepriseActuelle.positionnement,
          actionableInsights: xaiSafetyGraphExplanation.actionableInsights.length
        }
      },
      segments: optimizedSegments,
      production: {
        ready: productionReadiness.ready,
        confidence: productionReadiness.confidence,
        estimatedCost: this.estimateProductionCost(provider, videoSpecs),
        processingTime: this.estimateProcessingTime(provider, optimizedSegments)
      },
      export: {
        formats: provider.formats,
        apiPayload
      }
    };
    
    console.log(`✅ Script SafeVision généré - ${optimizedSegments.length} segments, confiance: ${productionReadiness.confidence}%`);
    if (enrichedContext) {
      console.log(`📚 Enrichi avec ${enrichedContext.documentReferences.length} documents DocuAnalyzer`);
    }
    
    return enhancedScript;
  }

  /**
   * Orchestration multi-agents améliorée avec intégration DocuAnalyzer
   */
  private async runEnhancedOrchestration(
    scenarioId: number,
    videoSpecs: EnhancedVideoSpecs,
    provider: VideoProvider,
    customization?: any
  ) {
    // Récupération du contexte enrichi DocuAnalyzer
    const enrichedContext = this.getDocuAnalyzerContext();
    
    if (enrichedContext) {
      console.log('🔗 Contexte DocuAnalyzer détecté - Enrichissement activé');
      console.log('📋 Documents sources:', enrichedContext.documentReferences?.length || 0);
      console.log('🎯 Score de conformité:', enrichedContext.complianceMetrics?.conformityScore || 0);
    }
    
    // Sélection d'agents selon le provider et les specs
    const selectedAgents = this.selectOptimalAgents(videoSpecs, provider);
    
    const contributions = [];
    
    for (const agentName of selectedAgents) {
      try {
        const prompt = this.buildEnhancedPrompt(
          agentName,
          scenarioId,
          videoSpecs,
          provider,
          contributions,
          enrichedContext
        );
        
        const response = await this.llmClient.generateCompletion({
          systemPrompt: this.getEnhancedAgentPrompt(agentName, provider, enrichedContext),
          userPrompt: prompt,
          maxTokens: 1500,
          temperature: 0.2
        });
        
        contributions.push({
          agentName,
          contribution: response.content,
          confidence: this.calculateConfidence(response),
          provider: provider.id,
          timestamp: new Date().toISOString(),
          docuAnalyzerEnriched: !!enrichedContext
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`❌ Erreur agent ${agentName}:`, error);
      }
    }
    
    return contributions;
  }

  /**
   * Récupération du contexte enrichi DocuAnalyzer depuis sessionStorage
   */
  private getDocuAnalyzerContext(): DocuAnalyzerEnrichedContext | null {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return null;
      }
      
      const enrichedContextStr = sessionStorage.getItem('safevision-enriched-context');
      if (!enrichedContextStr) {
        return null;
      }
      
      return JSON.parse(enrichedContextStr) as DocuAnalyzerEnrichedContext;
    } catch (error) {
      console.warn('⚠️ Erreur lecture contexte DocuAnalyzer:', error);
      return null;
    }
  }

  /**
   * Génération de segments structurés avec intégration DocuAnalyzer
   */
  private async generateScriptSegments(
    contributions: any[],
    videoSpecs: EnhancedVideoSpecs,
    provider: VideoProvider
  ): Promise<ScriptSegment[]> {
    
    const segments: ScriptSegment[] = [];
    const enrichedContext = this.getDocuAnalyzerContext();
    
    // Segment Introduction
    segments.push(await this.createSegment('intro', contributions, videoSpecs, provider, enrichedContext));
    
    // Segments de contenu
    const contentSegments = this.calculateContentSegments(videoSpecs.duration);
    for (let i = 0; i < contentSegments; i++) {
      segments.push(await this.createSegment('content', contributions, videoSpecs, provider, enrichedContext, i));
    }
    
    // Segment interaction (si supporté)
    if (videoSpecs.format !== 'alerte' && this.supportsInteractivity(provider)) {
      segments.push(await this.createSegment('interaction', contributions, videoSpecs, provider, enrichedContext));
    }
    
    // Segment conclusion
    segments.push(await this.createSegment('conclusion', contributions, videoSpecs, provider, enrichedContext));
    
    return segments;
  }

  /**
   * Création de segment enrichi avec données DocuAnalyzer
   */
  private async createSegment(
    type: string, 
    contributions: any[], 
    videoSpecs: any, 
    provider: any, 
    enrichedContext?: DocuAnalyzerEnrichedContext | null,
    index?: number
  ): Promise<ScriptSegment> {
    
    const baseSegment: ScriptSegment = {
      id: `segment_${type}_${index || 0}_${Date.now()}`,
      type: type as any,
      timing: this.calculateSegmentTiming(type, videoSpecs.duration, index),
      content: {
        narration: this.generateNarrationForSegment(type, contributions, enrichedContext),
        visuals: this.generateVisualsForSegment(type, videoSpecs, enrichedContext)
      },
      metadata: {
        importance: this.determineImportance(type, enrichedContext),
        compliance: this.extractSegmentCompliance(contributions, enrichedContext),
        agents: contributions.map(c => c.agentName)
      }
    };

    // Enrichissement avec références DocuAnalyzer
    if (enrichedContext) {
      baseSegment.metadata.docuAnalyzerReferences = enrichedContext.documentReferences
        .filter(doc => doc.riskLevel === 'critique' || doc.riskLevel === 'élevé')
        .map(doc => doc.title);
    }

    return baseSegment;
  }

  /**
   * Construction de prompt enrichi avec données DocuAnalyzer
   */
  private buildEnhancedPrompt(
    agentName: string,
    scenarioId: number,
    videoSpecs: EnhancedVideoSpecs,
    provider: VideoProvider,
    previousContributions: any[],
    enrichedContext?: DocuAnalyzerEnrichedContext | null
  ): string {
    
    let basePrompt = `
MISSION: Génération contenu vidéo SafeVision optimisé pour ${provider.name}

CONTEXTE TECHNIQUE:
- Provider: ${provider.name} (${provider.capabilities.join(', ')})
- Format: ${videoSpecs.format}
- Durée: ${videoSpecs.duration}
- Style: ${videoSpecs.style}
- Audience: ${videoSpecs.audience}

CONTRAINTES PROVIDER:
- Durée max: ${provider.maxDuration}
- Formats: ${provider.formats.join(', ')}
- Avatars: ${provider.features.avatars ? 'Oui' : 'Non'}
- Interactivité: ${provider.features.interactivity ? 'Oui' : 'Non'}`;

    // Enrichissement avec données DocuAnalyzer
    if (enrichedContext) {
      basePrompt += `

🔗 CONTEXTE ENRICHI DOCUANALYZER:
- Documents analysés: ${enrichedContext.documentReferences.length}
- Score conformité: ${enrichedContext.complianceMetrics.conformityScore}%
- Sources: ${[...new Set(enrichedContext.documentReferences.map(d => d.source))].join(', ')}

📋 CADRE LÉGAL SPÉCIALISÉ:
${enrichedContext.specializedPrompts.legalFramework}

🎯 ÉVALUATION DES RISQUES:
${enrichedContext.specializedPrompts.riskAssessment}

⚡ MESURES DE PRÉVENTION DOCUMENTÉES:
${enrichedContext.specializedPrompts.preventionMeasures}

🏭 ADAPTATIONS SECTORIELLES:
${enrichedContext.specializedPrompts.sectorialAdaptations}

INSTRUCTIONS SPÉCIALES:
- Intégrer les références légales précises mentionnées
- Adapter selon les documents critiques identifiés
- Utiliser la terminologie sectorielle documentée
- Respecter le niveau de risque évalué par DocuAnalyzer`;
    }

    basePrompt += `

Génère du contenu optimisé pour ${provider.name} selon ton expertise${enrichedContext ? ' et les données DocuAnalyzer fournies' : ''}.`;

    return basePrompt;
  }

  /**
   * Prompts système enrichis avec contexte DocuAnalyzer
   */
  private getEnhancedAgentPrompt(
    agentName: string, 
    provider: VideoProvider,
    enrichedContext?: DocuAnalyzerEnrichedContext | null
  ): string {
    
    const basePrompts = {
      Hugo: `Tu coordonnes la génération vidéo SafeVision pour ${provider.name}. Optimise selon les capacités: ${provider.capabilities.join(', ')}.`,
      DiagSST: `Tu identifies les éléments de conformité critiques pour vidéo ${provider.name}. Adapte selon les contraintes techniques.`,
      LexiNorm: `Tu assures la précision réglementaire du contenu SafeVision pour ${provider.name}.`,
      ALSS: `Tu optimises l'apprentissage et l'engagement pour vidéo ${provider.name}.`,
      Prioris: `Tu priorises les éléments critiques selon l'urgence pour ${provider.name}.`,
      DocuGen: `Tu structures le contenu documentaire pour vidéo ${provider.name}.`,
      Sentinelle: `Tu surveilles les risques immédiats pour contenu vidéo ${provider.name}.`,
      CoSS: `Tu optimises l'acceptabilité et l'engagement pour ${provider.name}.`
    };

    let systemPrompt = basePrompts[agentName] || `Agent ${agentName} optimisé pour ${provider.name}`;

    // Enrichissement avec contexte DocuAnalyzer
    if (enrichedContext) {
      systemPrompt += `

CONTEXTE SPÉCIALISÉ DISPONIBLE:
- Tu as accès aux données de ${enrichedContext.documentReferences.length} documents analysés par DocuAnalyzer
- Score de conformité actuel: ${enrichedContext.complianceMetrics.conformityScore}%
- Sources documentaires: ${[...new Set(enrichedContext.documentReferences.map(d => d.source))].join(', ')}

Utilise ces données spécialisées pour enrichir ta contribution SafeVision avec des références précises et contextualisées.`;
    }

    return systemPrompt;
  }

  // Optimisation selon le provider vidéo
  private async optimizeForProvider(
    segments: ScriptSegment[],
    provider: VideoProvider,
    videoSpecs: EnhancedVideoSpecs
  ): Promise<ScriptSegment[]> {
    
    return segments.map(segment => {
      if (provider.id === 'synthesia') {
        return this.optimizeForSynthesia(segment, videoSpecs);
      }
      
      if (provider.id === 'veo3') {
        return this.optimizeForVeo3(segment, videoSpecs);
      }
      
      return this.optimizeGeneric(segment, provider);
    });
  }

  private optimizeForSynthesia(segment: ScriptSegment, videoSpecs: EnhancedVideoSpecs): ScriptSegment {
    return {
      ...segment,
      content: {
        ...segment.content,
        narration: this.optimizeNarrationForSynthesia(segment.content.narration),
        visuals: segment.content.visuals.map(visual => 
          this.adaptVisualForSynthesia(visual, videoSpecs)
        )
      }
    };
  }

  private optimizeForVeo3(segment: ScriptSegment, videoSpecs: EnhancedVideoSpecs): ScriptSegment {
    return {
      ...segment,
      content: {
        ...segment.content,
        narration: this.optimizeNarrationForVeo3(segment.content.narration),
        visuals: segment.content.visuals.map(visual => 
          this.adaptVisualForVeo3(visual, videoSpecs)
        )
      }
    };
  }

  /**
   * Génération titre enrichi avec contexte DocuAnalyzer
   */
  private generateScriptTitle(
    scenarioId: number, 
    videoSpecs: any,
    enrichedContext?: DocuAnalyzerEnrichedContext | null
  ): string {
    let title = `Formation SST - Scénario ${scenarioId}`;
    
    if (enrichedContext) {
      const primarySources = [...new Set(enrichedContext.documentReferences.map(d => d.source))];
      title = `${enrichedContext.scenarioTitle} - Sources: ${primarySources.join(', ')}`;
    }
    
    return title;
  }

  /**
   * Extraction références conformité enrichie
   */
  private extractComplianceReferences(
    contributions: any[],
    enrichedContext?: DocuAnalyzerEnrichedContext | null
  ): string[] {
    let references: string[] = [];
    
    // Références de base des contributions agents
    contributions.forEach(contrib => {
      const matches = contrib.contribution.match(/LMRSST|RSST|CSTC|CNESST/g);
      if (matches) references.push(...matches);
    });
    
    // Enrichissement avec références DocuAnalyzer
    if (enrichedContext) {
      enrichedContext.documentReferences.forEach(doc => {
        references.push(...doc.legalReferences);
      });
    }
    
    return [...new Set(references)];
  }

  // Méthodes utilitaires
  private selectOptimalAgents(videoSpecs: EnhancedVideoSpecs, provider: VideoProvider): string[] {
    const baseAgents = ['Hugo', 'DiagSST', 'LexiNorm'];
    
    if (provider.features.avatars) baseAgents.push('ALSS');
    if (videoSpecs.format === 'formation-complete') baseAgents.push('Prioris', 'DocuGen');
    if (videoSpecs.urgency === 'critique') baseAgents.push('Sentinelle');
    if (provider.features.analytics) baseAgents.push('CoSS');
    
    return baseAgents;
  }

  private generateNarrationForSegment(
    type: string, 
    contributions: any[], 
    enrichedContext?: DocuAnalyzerEnrichedContext | null
  ): string {
    let narration = "Contenu généré par les agents SafeVision.";
    
    if (enrichedContext && type === 'intro') {
      narration = `Formation basée sur l'analyse de ${enrichedContext.documentReferences.length} documents officiels. `;
      narration += `Score de conformité actuel: ${enrichedContext.complianceMetrics.conformityScore}%.`;
    }
    
    return narration;
  }

  private generateVisualsForSegment(
    type: string, 
    videoSpecs: any, 
    enrichedContext?: DocuAnalyzerEnrichedContext | null
  ): string[] {
    let visuals = ['Environnement de travail', 'Équipements SST'];
    
    if (enrichedContext) {
      const criticalDocs = enrichedContext.documentReferences.filter(d => d.riskLevel === 'critique');
      visuals = criticalDocs.flatMap(doc => doc.relevantSections);
    }
    
    return visuals;
  }

  private determineImportance(
    type: string, 
    enrichedContext?: DocuAnalyzerEnrichedContext | null
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (enrichedContext && enrichedContext.complianceMetrics.conformityScore < 70) {
      return 'critical';
    }
    return type === 'intro' || type === 'conclusion' ? 'high' : 'medium';
  }

  private extractSegmentCompliance(
    contributions: any[], 
    enrichedContext?: DocuAnalyzerEnrichedContext | null
  ): string[] {
    let compliance: string[] = ['LMRSST'];
    
    if (enrichedContext) {
      compliance = [...new Set(
        enrichedContext.documentReferences.flatMap(doc => doc.legalReferences)
      )];
    }
    
    return compliance;
  }

  private calculateSegmentTiming(type: string, duration: string, index?: number) {
    return {
      start: `${(index || 0) * 30}s`,
      duration: '30s'
    };
  }

  private optimizeNarrationForSynthesia(narration: string): string {
    return narration
      .replace(/\[pause\]/g, '<break time="1s"/>')
      .replace(/\[emphasis\]/g, '<emphasis level="strong">')
      .replace(/\[\/emphasis\]/g, '</emphasis>');
  }

  private optimizeNarrationForVeo3(narration: string): string {
    return narration.replace(/\[.*?\]/g, '').trim();
  }

  private optimizeGeneric(segment: ScriptSegment, provider: VideoProvider): ScriptSegment {
    return segment;
  }

  private adaptVisualForSynthesia(visual: string, videoSpecs: any): string {
    return visual;
  }

  private adaptVisualForVeo3(visual: string, videoSpecs: any): string {
    return visual;
  }

  private calculateContentSegments(duration: string): number {
    const minutes = this.parseDuration(duration) / 60;
    return Math.max(1, Math.floor(minutes / 2));
  }

  private supportsInteractivity(provider: VideoProvider): boolean {
    return provider.features.interactivity;
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) * 60 : 180;
  }

  private estimateProductionCost(provider: VideoProvider, videoSpecs: EnhancedVideoSpecs): number {
    const baseCosts = {
      synthesia: 30,
      veo3: 10,
      runway: 15,
      luma: 0
    };
    
    const minutes = this.parseDuration(videoSpecs.duration) / 60;
    return (baseCosts[provider.id] || 5) * minutes;
  }

  private estimateProcessingTime(provider: VideoProvider, segments: ScriptSegment[]): string {
    const baseTimes = {
      synthesia: 5,
      veo3: 10,
      runway: 8,
      luma: 3
    };
    
    const totalMinutes = (baseTimes[provider.id] || 5) * segments.length;
    return `${totalMinutes}min`;
  }

  private calculateConfidence(response: any): number {
    return 85;
  }

  private assessProductionReadiness(segments: ScriptSegment[], provider: VideoProvider): { ready: boolean, confidence: number } {
    return { ready: true, confidence: 85 };
  }

  // Génération payloads provider
  private async generateProviderPayload(
    segments: ScriptSegment[],
    provider: VideoProvider,
    videoSpecs: EnhancedVideoSpecs
  ): Promise<any> {
    
    switch (provider.id) {
      case 'synthesia':
        return this.generateSynthesiaPayload(segments, videoSpecs);
      
      case 'veo3':
        return this.generateVeo3Payload(segments, videoSpecs);
      
      case 'runway':
        return this.generateRunwayPayload(segments, videoSpecs);
      
      case 'luma':
        return this.generateLumaPayload(segments, videoSpecs);
      
      default:
        return this.generateGenericPayload(segments, videoSpecs);
    }
  }

  private generateSynthesiaPayload(segments: ScriptSegment[], videoSpecs: EnhancedVideoSpecs) {
    const enrichedContext = this.getDocuAnalyzerContext();
    
    return {
      test: false,
      title: `AgenticSST - Formation SST ${videoSpecs.format}${enrichedContext ? ' (Enrichie DocuAnalyzer)' : ''}`,
      description: `Formation générée automatiquement par AgenticSST Québec${enrichedContext ? ` avec ${enrichedContext.documentReferences.length} documents analysés` : ''}`,
      visibility: 'private',
      templateId: 'professional-presenter',
      templateData: {
        avatar: 'professional-woman-1',
        voice: videoSpecs.language === 'fr-CA' ? 'fr-CA-AntoineNeural' : 'en-US-JennyNeural',
        background: 'office-modern',
        script: segments.map(segment => ({
          type: segment.type,
          text: segment.content.narration,
          timing: segment.timing,
          compliance: segment.metadata.compliance
        }))
      },
      settings: {
        quality: 'high',
        format: 'mp4',
        resolution: '1920x1080',
        subtitles: videoSpecs.accessibility.subtitles
      }
    };
  }

  private generateVeo3Payload(segments: ScriptSegment[], videoSpecs: EnhancedVideoSpecs) {
    return {
      prompt: this.buildVeo3Prompt(segments, videoSpecs),
      duration: this.parseDuration(videoSpecs.duration),
      resolution: '1920x1080',
      fps: 30,
      style: videoSpecs.style,
      settings: {
        creativity: 0.3,
        coherence: 0.8,
        quality: 'high'
      }
    };
  }

  private buildVeo3Prompt(segments: ScriptSegment[], videoSpecs: EnhancedVideoSpecs): string {
    const sceneDescriptions = segments.map(segment => 
      `${segment.type}: ${segment.content.visuals.join(', ')}`
    ).join('. ');
    
    return `Professional workplace safety training video. ${sceneDescriptions}. Style: ${videoSpecs.style}. Duration: ${videoSpecs.duration}.`;
  }

  private generateRunwayPayload(segments: ScriptSegment[], videoSpecs: any) {
    return {};
  }

  private generateLumaPayload(segments: ScriptSegment[], videoSpecs: any) {
    return {};
  }

  private generateGenericPayload(segments: ScriptSegment[], videoSpecs: any) {
    return {};
  }
}