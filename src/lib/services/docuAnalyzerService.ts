// src/lib/services/docuAnalyzerService.ts

export interface RealDocumentMetadata {
  id: string;
  title: string;
  content?: string;
  url?: string;
  source_id?: number;
  content_type?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  total_documents: number;
  analyzed_documents: number;
  compliance_references: number;
  critical_alerts: number;
  sector_insights: number;
  auto_recommendations: number;
  processing_time: number;
  error_count: number;
}

export class DocuAnalyzerRealDataService {
  private static instance: DocuAnalyzerRealDataService;

  public static getInstance(): DocuAnalyzerRealDataService {
    if (!DocuAnalyzerRealDataService.instance) {
      DocuAnalyzerRealDataService.instance = new DocuAnalyzerRealDataService();
    }
    return DocuAnalyzerRealDataService.instance;
  }

  async getAllDocuments(): Promise<RealDocumentMetadata[]> {
    try {
      console.log('🔍 Récupération documents depuis Supabase...');
      
      const { data: documents, error } = await supabase
        .from('sst_crawled_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      console.log(`📄 ${documents?.length || 0} documents récupérés`);
      return documents || [];
    } catch (error) {
      console.error('Erreur getAllDocuments:', error);
      return [];
    }
  }

  async analyzeCorpus(documents: RealDocumentMetadata[]): Promise<AnalysisResult> {
    const startTime = Date.now();
    console.log(`🔍 Démarrage analyse de ${documents.length} documents réels`);

    try {
      let compliance_references = 0;
      let critical_alerts = 0;
      let sector_insights = 0;
      let auto_recommendations = 0;

      // Analyse réelle des documents Supabase
      for (const doc of documents) {
        const titleLower = doc.title?.toLowerCase() || '';
        const contentLower = doc.content?.toLowerCase() || '';
        
        // Détection références légales
        if (titleLower.includes('lmrsst') || titleLower.includes('cstc') || 
            contentLower.includes('article') || contentLower.includes('norme')) {
          compliance_references++;
        }
        
        // Détection alertes critiques
        if (titleLower.includes('danger') || titleLower.includes('urgence') ||
            titleLower.includes('accident') || contentLower.includes('risque')) {
          critical_alerts++;
        }
        
        // Insights sectoriels
        if (titleLower.includes('construction') || titleLower.includes('mining') ||
            titleLower.includes('foresterie') || titleLower.includes('transport')) {
          sector_insights++;
        }
        
        // Recommandations basées sur le contenu
        if (contentLower.length > 100) {
          auto_recommendations += Math.floor(contentLower.length / 500);
        }
      }

      const processing_time = Date.now() - startTime;

      const result: AnalysisResult = {
        total_documents: documents.length,
        analyzed_documents: documents.length,
        compliance_references,
        critical_alerts,
        sector_insights,
        auto_recommendations,
        processing_time,
        error_count: 0
      };

      console.log('✅ Analyse réelle terminée:', result);
      return result;
    } catch (error) {
      console.error('Erreur analyzeCorpus:', error);
      throw error;
    }
  }
}

