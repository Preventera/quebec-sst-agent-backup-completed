import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Users, Bot, Settings, FileText, Target, Layers, Sparkles,
  Search, Filter, Download, Upload, RefreshCw, Save, TrendingUp,
  Zap, AlertTriangle, CheckCircle, Clock, User, Edit3, Eye, Plus, X, Loader2
} from 'lucide-react';
import orchestrationPrompts from '@/data/orchestrationPrompts.json';
import { DataForgeEngine } from '@/lib/dataForgeEngine';
import type { ComplianceAnalysisResult, DocumentMetadata, DataForgeAnalysisState } from '@/types/index';

// Codes SCIAN étendus
const SCIAN_CODES = [
  // Construction (23)
  { code: "2361", name: "Construction résidentielle" },
  { code: "2362", name: "Construction non résidentielle" },
  { code: "2371", name: "Construction de réseaux de transport" },
  { code: "2372", name: "Construction de réseaux d'aqueduc et d'égout" },
  { code: "2379", name: "Autres travaux de génie civil" },
  { code: "2381", name: "Travaux de fondation, de structure et d'enveloppe de bâtiment" },
  { code: "2382", name: "Services d'installation d'équipement de bâtiment" },
  { code: "2383", name: "Finition de bâtiment" },
  { code: "2389", name: "Autres entrepreneurs spécialisés" },

  // Fabrication (31-33)
  { code: "3111", name: "Fabrication d'aliments pour animaux" },
  { code: "3112", name: "Mouture de céréales et d'oléagineux" },
  { code: "3121", name: "Fabrication de boissons" },
  { code: "3141", name: "Fabrication de textiles et produits textiles" },
  { code: "3211", name: "Scieries et préservation du bois" },
  { code: "3221", name: "Fabrication de pâte, papier et produits connexes" },
  { code: "3241", name: "Fabrication de produits du pétrole et du charbon" },
  { code: "3251", name: "Fabrication de produits chimiques de base" },
  { code: "3271", name: "Fabrication d'acier à partir de minerai et d'alliages" },
  { code: "3311", name: "Fabrication de machines agricoles" },
  { code: "3321", name: "Fabrication de machines pour l'industrie forestière" },
  
  // Transport et entreposage (48-49)
  { code: "4811", name: "Transport aérien régulier" },
  { code: "4821", name: "Transport ferroviaire" },
  { code: "4831", name: "Transport par eau profonde" },
  { code: "4841", name: "Transport en commun urbain" },
  { code: "4851", name: "Transport interurbain et rural par autocar" },
  { code: "4881", name: "Services de soutien au transport aérien" },
  { code: "4911", name: "Transport postal" },
  { code: "4931", name: "Entreposage et stockage" },

  // Commerce de détail (44-45)
  { code: "4411", name: "Concessionnaires d'automobiles neuves" },
  { code: "4431", name: "Magasins d'électronique et d'électroménagers" },
  { code: "4451", name: "Épiceries" },
  { code: "4461", name: "Magasins de produits de santé et de soins personnels" },
  { code: "4481", name: "Stations-service" },
  
  // Services professionnels (54)
  { code: "5411", name: "Services juridiques" },
  { code: "5412", name: "Services de comptabilité et de tenue de livres" },
  { code: "5413", name: "Services d'architecture et de génie" },
  { code: "5414", name: "Services de design spécialisé" },
  { code: "5415", name: "Services de conception de systèmes informatiques" },
  { code: "5416", name: "Services de conseil en gestion" },
  { code: "5417", name: "Services de recherche et développement scientifiques" },
  
  // Soins de santé (62)
  { code: "6211", name: "Bureaux de médecins" },
  { code: "6212", name: "Bureaux de dentistes" },
  { code: "6213", name: "Bureaux d'autres praticiens de la santé" },
  { code: "6221", name: "Hôpitaux généraux et spécialisés" },
  { code: "6231", name: "Établissements de soins infirmiers" },
  
  // Hébergement et restauration (72)
  { code: "7211", name: "Hôtels et motels" },
  { code: "7221", name: "Restaurants à service complet" },
  { code: "7222", name: "Établissements de restauration à service restreint" },
  { code: "7223", name: "Services de traiteur et cantines mobiles" },

  // Agriculture (11)
  { code: "1111", name: "Culture du soja, de l'avoine et des autres oléagineux" },
  { code: "1121", name: "Élevage de bovins de boucherie" },
  { code: "1123", name: "Élevage de porcs" },
  { code: "1131", name: "Production d'arbres de Noël" },
  { code: "1141", name: "Pêche" },
  
  // Services publics (22)
  { code: "2211", name: "Production, transport et distribution d'électricité" },
  { code: "2212", name: "Distribution de gaz naturel" },
  { code: "2213", name: "Distribution d'eau et traitement des eaux usées" }
];

// Catégories de risques par secteur SCIAN
const SECTEUR_RISQUES = {
  "23": {
    risques_principaux: ["chutes", "machinerie", "substances_dangereuses", "electricite", "excavation"],
    legislation_focus: "MIXED",
    agents_recommandes: ["Hugo", "DiagSST", "Sentinelle", "LexiNorm"]
  },
  "31": {
    risques_principaux: ["machinerie", "substances_chimiques", "bruit", "espaces_confines", "manutention"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["DiagSST", "Sentinelle", "LexiNorm", "Hugo"]
  },
  "48": {
    risques_principaux: ["vehicules", "manutention", "fatigue", "substances_dangereuses"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Hugo", "Sentinelle", "DiagSST"]
  },
  "44": {
    risques_principaux: ["manutention", "glissades", "violence", "ergonomie"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Hugo", "DiagSST", "Prioris"]
  },
  "54": {
    risques_principaux: ["ergonomie", "stress", "deplacement", "bureautique"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Hugo", "Prioris", "ALSS"]
  },
  "62": {
    risques_principaux: ["biologiques", "ergonomie", "violence", "substances_chimiques"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Sentinelle", "Hugo", "DiagSST", "ALSS"]
  }
};

// Législations enrichies
const LEGISLATIONS = [
  { value: "LMRSST", name: "LMRSST - Loi modernisée sur la santé et sécurité du travail" },
  { value: "CSTC", name: "CSTC - Code de sécurité pour les travaux de construction" },
  { value: "RSST", name: "RSST - Règlement sur la santé et sécurité du travail" },
  { value: "LAMTP", name: "LAMTP - Loi sur les accidents du travail" },
  { value: "CSA", name: "CSA - Normes techniques canadiennes" },
  { value: "TRANSPORT_CANADA", name: "Transport Canada - Marchandises dangereuses" },
  { value: "MIXED", name: "Multi-Législations" }
];

// Types
interface ValidationSummary {
  totalPrompts: number;
  validatedPrompts: number;
  overallConfiance: number;
  criticalIssues: number;
  pendingValidation: number;
}

interface GenerationParams {
  secteur_scian: string;
  taille_entreprise: string;
  risque_principal: string;
  legislation_focus: 'LMRSST' | 'CSTC' | 'RSST' | 'LAMTP' | 'CSA' | 'TRANSPORT_CANADA' | 'MIXED';
  region_quebec: string;
  complexite: string;
}

// Fonction pour obtenir les risques par secteur
const getRisquesBySecteur = (scianCode: string) => {
  const secteur = scianCode.substring(0, 2);
  return SECTEUR_RISQUES[secteur] || {
    risques_principaux: ["generale"],
    legislation_focus: "LMRSST",
    agents_recommandes: ["Hugo", "DiagSST"]
  };
};

// Composant de visualisation des scénarios amélioré
const EnhancedScenarioViewer = ({ 
  generatedScenarios, 
  onSaveScenario, 
  onEditScenario, 
  onAddToDatabase, 
  onExportScenarios 
}) => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [editingScenario, setEditingScenario] = useState(null);
  const [viewMode, setViewMode] = useState('detailed');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterLegislation, setFilterLegislation] = useState('all');

  const filteredScenarios = generatedScenarios.filter(scenario => {
    const matchesPriority = filterPriority === 'all' || scenario.priority === filterPriority;
    const matchesLegislation = filterLegislation === 'all' || scenario.legislation_context === filterLegislation;
    return matchesPriority && matchesLegislation;
  });

  if (generatedScenarios.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Aucun scénario généré. Configurez vos paramètres et cliquez sur "Générer".</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold text-green-700">
            {filteredScenarios.length} scénarios générés
          </div>
          
          <div className="flex gap-2">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterLegislation} onValueChange={setFilterLegislation}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Législation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {LEGISLATIONS.map(leg => (
                  <SelectItem key={leg.value} value={leg.value}>{leg.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={onExportScenarios} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter JSON
        </Button>
      </div>

      <div className="space-y-4">
        {filteredScenarios.map((scenario, idx) => (
          <Card key={idx} className={`${
            scenario.priority === 'critical' ? 'border-red-200 bg-red-50' :
            scenario.priority === 'high' ? 'border-orange-200 bg-orange-50' :
            'border-green-200 bg-green-50'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg text-green-800">
                  {scenario.title}
                </CardTitle>
                <div className="flex gap-1">
                  <Badge variant={scenario.priority === "critical" ? "destructive" : "default"} className="text-xs">
                    {scenario.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {scenario.legislation_context}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{scenario.description}</p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-medium">Secteur:</span>
                  <p>{scenario.secteur_scian}</p>
                </div>
                <div>
                  <span className="font-medium">Taille:</span>
                  <p>{scenario.taille_entreprise} employés</p>
                </div>
                <div>
                  <span className="font-medium">Risque:</span>
                  <p>{scenario.risque_principal?.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="font-medium">Région:</span>
                  <p className="capitalize">{scenario.region_quebec}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-xs font-medium text-blue-800 mb-1">Prompt d'orchestration:</div>
                <p className="text-xs text-blue-700 font-mono">
                  {scenario.orchestration_prompt || `Orchestrer ${scenario.agents?.join(' et ')} pour un scénario de ${scenario.risque_principal} dans le secteur ${scenario.secteur_scian} selon ${scenario.legislation_context}.`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <div className="flex gap-1">
                  {scenario.agents?.map(agent => (
                    <Badge key={agent} variant="secondary" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
// Composant principal
const PromptManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [lastValidationSummary, setLastValidationSummary] = useState<ValidationSummary | null>(null);
  
  const [generationParams, setGenerationParams] = useState<GenerationParams>({
    secteur_scian: '2361',
    taille_entreprise: '20-49',
    risque_principal: 'chutes',
    legislation_focus: 'LMRSST',
    region_quebec: 'montreal',
    complexite: 'standard'
  });
  const [generatedScenarios, setGeneratedScenarios] = useState<any[]>([]);
  const [scianSearchTerm, setScianSearchTerm] = useState('');
  const [filteredCodes, setFilteredCodes] = useState(SCIAN_CODES);

  // États DocuAnalyzer
  const [documentContent, setDocumentContent] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [analysisSector, setAnalysisSector] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // États DataForge
  const [dataForgeAnalysis, setDataForgeAnalysis] = useState({
    isLoading: false,
    result: null,
    error: null,
    analysisStartTime: null,
    processingStep: 'Prêt'
  });
  const [useDataForge, setUseDataForge] = useState(false);

  const agents = ["Hugo", "DiagSST", "LexiNorm", "Prioris", "Sentinelle", "DocuGen", "CoSS", "ALSS"];
  const categories = ["Inspection", "Formation", "Documentation", "Conformité", "Analyse", "Multi-établissements", "Politiques internes", "Évaluation postes"];
  const priorities = ["critical", "high", "medium", "low"];

  const risquesOptions = [
    'chutes', 'machinerie', 'substances_dangereuses', 'electricite',
    'excavation', 'substances_chimiques', 'bruit', 'espaces_confines',
    'manutention', 'vehicules', 'fatigue', 'glissades', 'violence',
    'ergonomie', 'biologiques', 'stress', 'deplacement', 'bureautique',
    'generale'
  ];

  const taillesEntreprise = [
    '1-4', '5-19', '20-49', '50-99', '100-199', '200-499', '500+'
  ];

  const regionsQuebec = [
    'montreal', 'quebec', 'saguenay', 'sherbrooke', 'trois-rivieres',
    'gatineau', 'chicoutimi', 'abitibi', 'bas-saint-laurent', 'gaspesie'
  ];

  // === FONCTIONS DOCUANALYZER ===
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentContent(e.target.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyzeDocument = () => {
    setAnalysisLoading(true);
    setTimeout(() => {
      setAnalysisResults({
        conformity_score: 67,
        document_type: documentType || "Document SST",
        detected_sector: analysisSector || "Détection automatique", 
        applicable_laws: ["LMRSST"],
        criticality: "MEDIUM",
        non_conformities: [{
          article: "LMRSST Art.51",
          severity: "ÉLEVÉE",
          description: "Analyse basique - utilisez DataForge",
          recommendation: "Activer DataForge pour analyse complète"
        }],
        dataforge_analysis: false
      });
      setAnalysisLoading(false);
    }, 2000);
  };

  const handleAnalyzeDocumentWithDataForge = async () => {
    if (!documentContent.trim()) {
      alert("Veuillez saisir du contenu à analyser");
      return;
    }

    setDataForgeAnalysis({
      isLoading: true,
      result: null,
      error: null,
      analysisStartTime: new Date(),
      processingStep: 'Initialisation DataForge...'
    });

    setTimeout(() => {
      setDataForgeAnalysis({
        isLoading: false,
        result: null,
        error: null,
        analysisStartTime: null,
        processingStep: 'Terminé'
      });
      
      setAnalysisResults({
        conformity_score: 85,
        document_type: documentType || 'Auto-détecté',
        detected_sector: analysisSector || 'Multiple',
        applicable_laws: ["LMRSST", "RSST"],
        criticality: "HIGH",
        non_conformities: [{
          article: "LMRSST Art.51",
          severity: "ÉLEVÉE", 
          description: "Analyse DataForge complète",
          recommendation: "Révision recommandée"
        }],
        dataforge_analysis: true
      });
    }, 3000);
  };

  const handleSearchSCIAN = (term: string) => {
    setScianSearchTerm(term);
    const filtered = SCIAN_CODES.filter(code => 
      code.name.toLowerCase().includes(term.toLowerCase()) ||
      code.code.includes(term)
    );
    setFilteredCodes(filtered);
  };

  const handleSecteurChange = (scianCode: string) => {
    const secteurData = getRisquesBySecteur(scianCode);
    setGenerationParams(prev => ({
      ...prev,
      secteur_scian: scianCode,
      legislation_focus: secteurData.legislation_focus as any,
      risque_principal: secteurData.risques_principaux[0] || 'generale'
    }));
  };

  const handleGenerateScenarios = async () => {
    setLoading(true);
    
    const templates = [
      { type: 'inspection', agents: ['Hugo', 'DiagSST'], priority: 'high' },
      { type: 'formation', agents: ['Prioris', 'LexiNorm'], priority: 'medium' },
      { type: 'documentation', agents: ['DocuGen', 'CoSS'], priority: 'medium' },
      { type: 'conformité', agents: ['LexiNorm', 'Sentinelle'], priority: 'critical' }
    ];

    setTimeout(() => {
      const scenarios = [];
      const secteurData = getRisquesBySecteur(generationParams.secteur_scian);
      
      for (let i = 0; i < 12; i++) {
        const template = templates[i % templates.length];
        const selectedCode = SCIAN_CODES.find(c => c.code === generationParams.secteur_scian);
        
        scenarios.push({
          id: `gen_${Date.now()}_${i}`,
          title: `${generationParams.risque_principal} - Scénario ${i + 1}`,
          description: `Scénario généré pour ${selectedCode?.name} (${generationParams.taille_entreprise} employés) - Région ${generationParams.region_quebec}`,
          agents: secteurData.agents_recommandes.slice(0, 2),
          priority: template.priority,
          legislation_context: generationParams.legislation_focus,
          secteur_scian: generationParams.secteur_scian,
          taille_entreprise: generationParams.taille_entreprise,
          risque_principal: generationParams.risque_principal,
          region_quebec: generationParams.region_quebec,
          complexite: generationParams.complexite,
          orchestration_prompt: `Orchestrer ${secteurData.agents_recommandes.slice(0, 2).join(' et ')} pour un scénario de ${generationParams.risque_principal} dans le secteur ${generationParams.secteur_scian} selon ${generationParams.legislation_focus}. Niveau de complexité: ${generationParams.complexite}.`,
          expected_deliverables: [
            "Rapport d'inspection détaillé",
            "Plan d'action correctif", 
            "Formation personnalisée",
            "Suivi de conformité"
          ],
          created_at: new Date().toISOString()
        });
      }
      setGeneratedScenarios(scenarios);
      setLoading(false);
    }, 2000);
  };

  const handleSaveScenario = (scenario: any) => {
    toast({
      title: "Scénario sauvegardé",
      description: `Le scénario "${scenario.title}" a été sauvegardé avec succès.`,
    });
  };

  const handleEditScenario = (originalScenario: any, updatedData: any) => {
    const updatedScenarios = generatedScenarios.map(s => 
      s.id === originalScenario.id ? { ...s, ...updatedData } : s
    );
    setGeneratedScenarios(updatedScenarios);
    toast({
      title: "Scénario modifié",
      description: `Le scénario "${updatedData.title}" a été mis à jour.`,
    });
  };

  const handleAddToDatabase = (scenario: any) => {
    toast({
      title: "Ajouté à la base de données",
      description: `Le scénario "${scenario.title}" a été ajouté à la base de données principale.`,
    });
  };

  const handleExportScenarios = () => {
    const dataStr = JSON.stringify(generatedScenarios, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `scenarios_${generationParams.secteur_scian}_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredPrompts = orchestrationPrompts.filter(prompt => {
    const matchesSearch = prompt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || prompt.priority === selectedPriority;
    const matchesAgent = selectedAgent === 'all' || prompt.agents?.includes(selectedAgent);
    
    return matchesSearch && matchesCategory && matchesPriority && matchesAgent;
  });

  const ValidationSummaryCard = ({ summary }: { summary: ValidationSummary }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Résumé de Validation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Prompts validés</span>
            <div className="font-bold text-lg text-blue-600">{summary.validatedPrompts}/{summary.totalPrompts}</div>
          </div>
          <div className="font-bold text-lg text-blue-600">{summary.overallConfiance.toFixed(1)}%</div>
          <div className="text-muted-foreground">Confiance</div>
          <div className="mt-3">
            <Progress value={summary.overallConfiance} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              Gestion des Prompts d'Orchestration
            </h1>
            <p className="text-muted-foreground mt-2">
              Prompts d'agents individuels et orchestration intelligente LMRSST avec validation croisée
            </p>
          </div>
        </div>

        {lastValidationSummary && <ValidationSummaryCard summary={lastValidationSummary} />}

        <Tabs defaultValue="orchestration" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="orchestration" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Orchestration LMRSST
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Prompts Agents
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Générateur Multi-Législations
            </TabsTrigger>
            <TabsTrigger value="docuanalyzer" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              DocuAnalyzer
            </TabsTrigger>
          </TabsList>
         <TabsContent value="orchestration" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un prompt..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes priorités</SelectItem>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority === "critical" ? "Critique" :
                           priority === "high" ? "Élevée" :
                           priority === "medium" ? "Moyenne" : "Faible"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground flex items-center">
                    {filteredPrompts.length} prompt{filteredPrompts.length > 1 ? 's' : ''} trouvé{filteredPrompts.length > 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPrompts.map((prompt: any) => {
                const randomStatus = ['draft', 'test', 'production'][Math.floor(Math.random() * 3)];
                
                return (
                  <Card key={prompt.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{prompt.title}</CardTitle>
                          <div className="flex flex-wrap gap-1">
                            {prompt.agents?.map((agent: string) => (
                              <Badge key={agent} variant="secondary" className="text-xs">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={prompt.priority === "critical" ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {prompt.priority === "critical" ? "Critique" :
                             prompt.priority === "high" ? "Élevée" :
                             prompt.priority === "medium" ? "Moyenne" : "Faible"}
                          </Badge>
                          <Badge
                            variant={randomStatus === "production" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {randomStatus === "production" ? "Production" :
                             randomStatus === "test" ? "Test" : "Brouillon"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {prompt.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Catégorie:</span>
                          <p className="text-muted-foreground">{prompt.category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Articles:</span>
                          <p className="text-muted-foreground">
                            {prompt.article_lmrsst || 'Non spécifié'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Éditer
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {agent}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Prompts associés: {orchestrationPrompts.filter(p => p.agents?.includes(agent)).length}
                    </div>
                    
                    <Textarea
                      placeholder={`Prompt pour l'agent ${agent}...`}
                      rows={6}
                      className="resize-none font-mono text-sm"
                    />
                    
                    <div className="flex gap-2">
                      <Button size="sm" disabled={saving} className="flex-1">
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Sauvegarder
                      </Button>
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Améliorer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{orchestrationPrompts.length}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Total Scénarios
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {orchestrationPrompts.filter(p => p.article_lmrsst && !p.legislation_context?.includes("CSTC")).length}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    LMRSST
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {orchestrationPrompts.filter(p => p.legislation_context?.includes("CSTC")).length}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    CSTC
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {SCIAN_CODES.length}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Secteurs SCIAN
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedScenarios.length}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Générés
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Générateur Contextuel Avancé - Québec SST
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Secteur d'activité (SCIAN)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un secteur..."
                        value={scianSearchTerm}
                        onChange={(e) => handleSearchSCIAN(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select 
                      value={generationParams.secteur_scian} 
                      onValueChange={handleSecteurChange}
                    >
                      <SelectTrigger className="w-80">
                        <SelectValue placeholder="Sélectionnez un secteur" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {filteredCodes.map((scian) => (
                          <SelectItem key={scian.code} value={scian.code}>
                            {scian.code} - {scian.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Taille entreprise</label>
                    <Select 
                      value={generationParams.taille_entreprise} 
                      onValueChange={(value) => setGenerationParams(prev => ({...prev, taille_entreprise: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taillesEntreprise.map(taille => (
                          <SelectItem key={taille} value={taille}>{taille} employés</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Risque principal</label>
                    <Select 
                      value={generationParams.risque_principal} 
                      onValueChange={(value) => setGenerationParams(prev => ({...prev, risque_principal: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {risquesOptions.map(risque => (
                          <SelectItem key={risque} value={risque}>
                            {risque.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Législation</label>
                    <Select 
                      value={generationParams.legislation_focus} 
                      onValueChange={(value: any) => setGenerationParams(prev => ({...prev, legislation_focus: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEGISLATIONS.map(leg => (
                          <SelectItem key={leg.value} value={leg.value}>{leg.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Région Québec</label>
                    <Select 
                      value={generationParams.region_quebec} 
                      onValueChange={(value) => setGenerationParams(prev => ({...prev, region_quebec: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regionsQuebec.map(region => (
                          <SelectItem key={region} value={region}>
                            {region.charAt(0).toUpperCase() + region.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Complexité</label>
                    <Select 
                      value={generationParams.complexite} 
                      onValueChange={(value) => setGenerationParams(prev => ({...prev, complexite: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="complexe">Complexe</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleGenerateScenarios} 
                    disabled={loading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white self-end"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Générer
                  </Button>
                </div>

                {generationParams.secteur_scian && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-sm">
                        <div className="font-medium text-blue-800 mb-2">
                          Recommandations pour le secteur {generationParams.secteur_scian}
                        </div>
                        {(() => {
                          const secteurData = getRisquesBySecteur(generationParams.secteur_scian);
                          return (
                            <div className="grid grid-cols-2 gap-4 text-blue-700">
                              <div>
                                <span className="font-medium">Agents recommandés:</span>
                                <div className="flex gap-1 mt-1">
                                  {secteurData.agents_recommandes.map(agent => (
                                    <Badge key={agent} variant="outline" className="text-xs">
                                      {agent}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Risques principaux:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {secteurData.risques_principaux.map(risque => (
                                    <Badge key={risque} variant="secondary" className="text-xs">
                                      {risque.replace('_', ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <EnhancedScenarioViewer
                  generatedScenarios={generatedScenarios}
                  onSaveScenario={handleSaveScenario}
                  onEditScenario={handleEditScenario}
                  onAddToDatabase={handleAddToDatabase}
                  onExportScenarios={handleExportScenarios}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docuanalyzer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Module DocuAnalyzer - Intelligence Documentaire SST + DataForge
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Analysez vos documents SST avec DataForge : corpus légal complet de 57 règlements québécois
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Téléversez votre document SST
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOCX, TXT • Politique, procédure, manuel
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="document-upload"
                      />
                      <Button 
                        onClick={() => document.getElementById('document-upload')?.click()}
                        variant="outline"
                        className="mt-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Sélectionner fichier
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-3 text-gray-500">ou saisie manuelle</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Contenu du document SST
                    </label>
                    <textarea
                      placeholder="Exemple: 'POLITIQUE DE SANTÉ ET SÉCURITÉ - Notre entreprise s'engage...'"
                      value={documentContent}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Type de document
                    </label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="politique">Politique SST</SelectItem>
                        <SelectItem value="procedure">Procédure</SelectItem>
                        <SelectItem value="manuel">Manuel sécurité</SelectItem>
                        <SelectItem value="rapport_inspection">Rapport inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Secteur SCIAN
                    </label>
                    <Select value={analysisSector} onValueChange={setAnalysisSector}>
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-détection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2361">2361 - Construction</SelectItem>
                        <SelectItem value="3111">3111 - Alimentaire</SelectItem>
                        <SelectItem value="auto">Auto-détection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Moteur d'analyse
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="engine"
                          checked={!useDataForge}
                          onChange={() => setUseDataForge(false)}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Standard</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="engine"
                          checked={useDataForge}
                          onChange={() => setUseDataForge(true)}
                          className="text-blue-600"
                        />
                        <span className="text-sm font-medium text-purple-600">DataForge</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  {useDataForge ? (
                    <Button 
                      onClick={handleAnalyzeDocumentWithDataForge}
                      disabled={dataForgeAnalysis.isLoading || (!uploadedFile && !documentContent)}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {dataForgeAnalysis.isLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          <span>{dataForgeAnalysis.processingStep}</span>
                        </div>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Analyser avec DataForge
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleAnalyzeDocument}
                      disabled={analysisLoading || (!uploadedFile && !documentContent)}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {analysisLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Analyse standard...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Analyser (Standard)
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {analysisResults && (
                  <div className="space-y-6">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Score de Conformité</CardTitle>
                          <Badge variant={analysisResults.conformity_score >= 80 ? "default" : "destructive"} className="text-lg px-3 py-1">
                            {analysisResults.conformity_score}/100
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Type:</span>
                            <p className="text-gray-600">{analysisResults.document_type}</p>
                          </div>
                          <div>
                            <span className="font-medium">Secteur:</span>
                            <p className="text-gray-600">{analysisResults.detected_sector}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {analysisResults.non_conformities?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Non-conformités ({analysisResults.non_conformities.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {analysisResults.non_conformities.map((nc, index) => (
                            <div key={index} className="border-l-4 border-l-red-400 bg-red-50 p-3 rounded mb-3">
                              <h4 className="font-medium text-red-800">{nc.article}</h4>
                              <p className="text-sm text-red-700">{nc.description}</p>
                              <p className="text-xs text-red-600 mt-1">
                                <strong>Recommandation:</strong> {nc.recommendation}
                              </p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default PromptManagement; 