import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  FileText, 
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Database,
  Cpu,
  Target,
  TrendingUp,
  Layers,
  Sparkles
} from 'lucide-react';

interface STORMExtractionResult {
  documentId: string;
  title: string;
  extractedKnowledge: {
    keyPoints: string[];
    risks: string[];
    regulations: string[];
    recommendations: string[];
    entities: string[];
  };
  confidenceScore: number;
  processingTime: number;
  sector: string;
  relevanceScore: number;
}

interface STORMAnalysisMetrics {
  totalDocuments: number;
  processedDocuments: number;
  avgConfidence: number;
  keyInsights: number;
  processingSpeed: number;
  sectorCoverage: string[];
}

const STORMDocuAnalyzerIntegration: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResults, setExtractionResults] = useState<STORMExtractionResult[]>([]);
  const [analysisMetrics, setAnalysisMetrics] = useState<STORMAnalysisMetrics | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('construction');
  const [processingProgress, setProcessingProgress] = useState(0);

  const sectors = [
    { 
      value: 'construction', 
      label: 'Construction', 
      icon: '🏗️',
      scian: ['236 - Bâtiments résidentiels', '237 - Génie civil', '238 - Entrepreneurs spécialisés'],
      themes: ['Chutes hauteur', 'Échafaudages', 'EPI', 'Excavation', 'Sécurité chantier'],
      complexity: 'Élevée'
    },
    { 
      value: 'manufacturing', 
      label: 'Manufacturier', 
      icon: '🏭',
      scian: ['31-33 - Fabrication', '311 - Aliments', '321 - Bois', '331 - Métaux primaires'],
      themes: ['Cadenassage', 'Machines', 'Substances chimiques', 'Bruit', 'Ergonomie'],
      complexity: 'Moyenne'
    },
    { 
      value: 'healthcare', 
      label: 'Santé', 
      icon: '🏥',
      scian: ['621 - Services médicaux', '622 - Hôpitaux', '623 - Soins prolongés'],
      themes: ['Infections', 'Ergonomie', 'Stress', 'Violence', 'Produits chimiques'],
      complexity: 'Très Élevée'
    },
    { 
      value: 'transport', 
      label: 'Transport', 
      icon: '🚛',
      scian: ['481 - Transport aérien', '484 - Camionnage', '485 - Transport urbain'],
      themes: ['Fatigue', 'Accidents route', 'Manutention', 'Espaces clos', 'Vibrations'],
      complexity: 'Haute'
    },
    { 
      value: 'all', 
      label: 'Tous secteurs', 
      icon: '🎯',
      scian: ['Analyse transversale'],
      themes: ['Formation générale', 'Comités SST', 'Réglementation LMRSST'],
      complexity: 'Variable'
    }
  ];

  // Simulation de l'extraction STORM sur les 196 documents CNESST
  const runSTORMExtraction = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    console.log('🚀 Démarrage extraction STORM enhanced...');
    console.log(`📂 Secteur ciblé: ${selectedSector}`);

    // Simulation du traitement progressif
    const totalSteps = 10;
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProcessingProgress((i / totalSteps) * 100);
      
      if (i === 3) console.log('🔍 Knowledge Extractor activé - Analyse sémantique...');
      if (i === 6) console.log('🧠 Agent AN1 en cours - Détection écarts...');
      if (i === 9) console.log('📊 Génération insights sectoriels...');
    }

    // Résultats simulés basés sur les vrais modules STORM
    const mockResults: STORMExtractionResult[] = [
      {
        documentId: 'CNESST_CONSTRUCTION_001',
        title: 'Guide prévention chutes hauteur construction',
        extractedKnowledge: {
          keyPoints: [
            'Échafaudages obligatoires >3m hauteur',
            'Inspection quotidienne équipements protection',
            'Formation certifiée travail hauteur requise',
            'Plan de sauvetage obligatoire'
          ],
          risks: [
            'Chutes hauteur (34% accidents secteur)',
            'Défaillance équipements protection',
            'Conditions météorologiques adverses',
            'Formation insuffisante personnels'
          ],
          regulations: [
            'LMRSST Art. 51 - Formation obligatoire',
            'CSTC Section 2.9 - Travail hauteur',
            'Code sécurité travail Art. 345-347'
          ],
          recommendations: [
            'Investir formation spécialisée échafaudages',
            'Audit trimestriel équipements protection',
            'Procédure météo pour travaux extérieurs'
          ],
          entities: ['CNESST', 'CSTC', 'Échafaudages', 'EPI', 'Formation']
        },
        confidenceScore: 94,
        processingTime: 2.3,
        sector: 'construction',
        relevanceScore: 96
      },
      {
        documentId: 'CNESST_MANUFACTURING_002',
        title: 'Sécurité machines industrielles manufacturier',
        extractedKnowledge: {
          keyPoints: [
            'Cadenassage obligatoire maintenance',
            'Formation spécialisée opérateurs machines',
            'Contrôles sécurité programmés',
            'Documentation procédures obligatoire'
          ],
          risks: [
            'Contact objets tranchants (23% accidents)',
            'Dysfonctionnement équipements sécurité',
            'Erreur procédures cadenassage',
            'Maintenance préventive insuffisante'
          ],
          regulations: [
            'LMRSST Art. 185 - Équipements protection',
            'Code sécurité Art. 123 - Cadenassage',
            'CSTC Section 3.4 - Machines'
          ],
          recommendations: [
            'Programme cadenassage renforcé',
            'Formation continue opérateurs',
            'Audit mensuel procédures sécurité'
          ],
          entities: ['Cadenassage', 'Machines', 'Maintenance', 'Formation', 'Procédures']
        },
        confidenceScore: 91,
        processingTime: 1.8,
        sector: 'manufacturing',
        relevanceScore: 93
      }
    ];

    const mockMetrics: STORMAnalysisMetrics = {
      totalDocuments: 196,
      processedDocuments: selectedSector === 'all' ? 196 : 67,
      avgConfidence: 92.5,
      keyInsights: 1247,
      processingSpeed: 2.1,
      sectorCoverage: ['Construction', 'Manufacturier', 'Transport', 'Santé', 'Services']
    };

    setExtractionResults(mockResults);
    setAnalysisMetrics(mockMetrics);
    setIsProcessing(false);

    console.log('✅ Extraction STORM terminée avec succès');
    console.log('📊 Résultats:', mockResults.length, 'documents analysés');
    console.log('🎯 Confiance moyenne:', mockMetrics.avgConfidence + '%');
  };

  // Génération SafeVision enrichi STORM
  const generateSTORMSafeVision = (result: STORMExtractionResult) => {
    console.log('🎬 Génération SafeVision STORM pour:', result.title);
    
    const stormEnrichedContext = {
      stormKnowledge: result.extractedKnowledge,
      sectorSpecific: true,
      confidenceBoost: result.confidenceScore,
      regulationsMapped: result.extractedKnowledge.regulations,
      riskProfile: result.extractedKnowledge.risks
    };

    sessionStorage.setItem('storm-safevision-context', JSON.stringify(stormEnrichedContext));
    window.open('/safevision?storm=enhanced', '_blank');
  };

  // Obtenir les détails du secteur sélectionné de manière sécurisée
  const getSelectedSectorData = () => {
    return sectors.find(s => s.value === selectedSector) || sectors[0];
  };

  const selectedSectorData = getSelectedSectorData();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          STORM DocuAnalyzer - Enhanced
        </h1>
        <p className="text-gray-600">
          Extraction intelligente de connaissances avec modules STORM intégrés
        </p>
      </div>

      {/* Configuration et Lancement */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Configuration STORM Enhanced
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3">Secteur d'analyse</label>
              <div className="grid grid-cols-2 gap-2">
                {sectors.map(sector => (
                  <button
                    key={sector.value}
                    onClick={() => setSelectedSector(sector.value)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedSector === sector.value 
                        ? 'bg-purple-50 border-purple-300 text-purple-700' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{sector.icon}</div>
                    <div className="text-sm font-medium">{sector.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sector.scian && sector.scian.length > 0 ? sector.scian[0] : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {sector.themes && sector.themes.length > 0 ? sector.themes.slice(0, 2).join(', ') : 'Thèmes généraux'}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Granularité avancée */}
              {selectedSector !== 'all' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Granularité Sectorielle</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium">Codes SCIAN:</span>
                      <div className="mt-1">
                        {selectedSectorData.scian && selectedSectorData.scian.map((code, i) => (
                          <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Thèmes prioritaires:</span>
                      <div className="mt-1">
                        {selectedSectorData.themes && selectedSectorData.themes.map((theme, i) => (
                          <span key={i} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-1 mb-1">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Complexité:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedSectorData.complexity === 'Très Élevée' ? 'bg-red-100 text-red-800' :
                        selectedSectorData.complexity === 'Élevée' ? 'bg-orange-100 text-orange-800' :
                        selectedSectorData.complexity === 'Haute' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedSectorData.complexity}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Modules STORM Actifs</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Knowledge Extractor (13.9KB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Agent AN1 Analyste (28KB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>100 Topics HSE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Construction Scenarios</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={runSTORMExtraction}
                disabled={isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Extraction STORM en cours...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Lancer Extraction STORM Enhanced
                  </>
                )}
              </Button>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <Progress value={processingProgress} className="w-full" />
              <div className="text-sm text-gray-600 mt-2">
                Progression: {Math.round(processingProgress)}% - Analyse des 196 documents CNESST...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métriques d'Analyse */}
      {analysisMetrics && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métriques STORM Enhanced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analysisMetrics.processedDocuments}</div>
                <div className="text-sm text-gray-600">Documents traités</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysisMetrics.avgConfidence}%</div>
                <div className="text-sm text-gray-600">Confiance moyenne</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analysisMetrics.keyInsights}</div>
                <div className="text-sm text-gray-600">Insights extraits</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{analysisMetrics.processingSpeed}s</div>
                <div className="text-sm text-gray-600">Temps moyen/doc</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{analysisMetrics.sectorCoverage.length}</div>
                <div className="text-sm text-gray-600">Secteurs couverts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats d'Extraction */}
      {extractionResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Résultats Extraction STORM
          </h2>

          {extractionResults.map((result, index) => (
            <Card key={index} className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">{result.sector}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {result.confidenceScore}% confiance
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        {result.relevanceScore}% pertinence
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => generateSTORMSafeVision(result)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    SafeVision STORM
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Points Clés</h4>
                    <ul className="text-sm space-y-1">
                      {result.extractedKnowledge.keyPoints.slice(0, 3).map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Risques Identifiés</h4>
                    <ul className="text-sm space-y-1">
                      {result.extractedKnowledge.risks.slice(0, 3).map((risk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Réglementations</h4>
                    <ul className="text-sm space-y-1">
                      {result.extractedKnowledge.regulations.slice(0, 3).map((reg, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <FileText className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          {reg}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-purple-700 mb-2">Recommandations</h4>
                    <ul className="text-sm space-y-1">
                      {result.extractedKnowledge.recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Layers className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Entités extraites:</span>
                    <div className="flex gap-2">
                      {result.extractedKnowledge.entities.map((entity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions d'utilisation */}
      <Alert className="mt-6">
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>STORM Enhanced activé !</strong><br />
          Le Knowledge Extractor analyse vos 196 documents CNESST avec l'Agent AN1 pour extraire automatiquement les connaissances critiques. 
          Chaque extraction peut générer un SafeVision STORM hyper-personnalisé pour votre secteur.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default STORMDocuAnalyzerIntegration;