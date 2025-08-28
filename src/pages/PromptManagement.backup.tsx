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
  Zap, AlertTriangle, CheckCircle, Clock, User, Edit3, Eye, Plus, X
} from 'lucide-react';
import orchestrationPrompts from '@/data/orchestrationPrompts.json';

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

  const ScenarioDetailDialog = ({ scenario, isEditing = false }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant={isEditing ? "outline" : "default"} 
          size="sm"
          onClick={() => isEditing ? setEditingScenario({...scenario}) : setSelectedScenario(scenario)}
        >
          {isEditing ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {isEditing ? 'Éditer' : 'Détails'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {isEditing ? 'Édition du scénario' : 'Détails du scénario'} - {scenario?.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              {isEditing ? (
                <Input 
                  value={editingScenario?.title || ''}
                  onChange={(e) => setEditingScenario({...editingScenario, title: e.target.value})}
                />
              ) : (
                <p className="text-sm bg-gray-50 p-2 rounded">{scenario?.title}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Secteur SCIAN</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{scenario?.secteur_scian}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            {isEditing ? (
              <Textarea 
                value={editingScenario?.description || ''}
                onChange={(e) => setEditingScenario({...editingScenario, description: e.target.value})}
                rows={3}
              />
            ) : (
              <p className="text-sm bg-gray-50 p-3 rounded">{scenario?.description}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Prompt d'orchestration</label>
            {isEditing ? (
              <Textarea 
                value={editingScenario?.orchestration_prompt || `Orchestrer ${scenario?.agents?.join(' et ')} pour un scénario de ${scenario?.risque_principal} dans le secteur ${scenario?.secteur_scian} selon ${scenario?.legislation_context}.`}
                onChange={(e) => setEditingScenario({...editingScenario, orchestration_prompt: e.target.value})}
                rows={4}
                className="font-mono text-sm"
              />
            ) : (
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm font-mono">
                  {scenario?.orchestration_prompt || `Orchestrer ${scenario?.agents?.join(' et ')} pour un scénario de ${scenario?.risque_principal} dans le secteur ${scenario?.secteur_scian} selon ${scenario?.legislation_context}.`}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Agents impliqués</label>
              <div className="flex gap-1 mt-1">
                {scenario?.agents?.map(agent => (
                  <Badge key={agent} variant="secondary">{agent}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Priorité</label>
              {isEditing ? (
                <Select 
                  value={editingScenario?.priority || scenario?.priority}
                  onValueChange={(value) => setEditingScenario({...editingScenario, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={scenario?.priority === 'critical' ? 'destructive' : 'default'}>
                  {scenario?.priority}
                </Badge>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Législation</label>
              <Badge variant="outline">{scenario?.legislation_context}</Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Livrables attendus</label>
            <div className="bg-green-50 p-3 rounded-md">
              <ul className="text-sm space-y-1">
                {(scenario?.expected_deliverables || [
                  "Rapport d'inspection détaillé",
                  "Plan d'action correctif", 
                  "Formation personnalisée",
                  "Suivi de conformité"
                ]).map((deliverable, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            {isEditing ? (
              <>
                <Button onClick={() => {
                  onEditScenario(scenario, editingScenario);
                  setEditingScenario(null);
                }} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les modifications
                </Button>
                <Button variant="outline" onClick={() => setEditingScenario(null)}>
                  Annuler
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => onSaveScenario(scenario)} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder le scénario
                </Button>
                <Button variant="outline" onClick={() => onAddToDatabase(scenario)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter à la base
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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

              <div className="flex gap-2 pt-2">
                <ScenarioDetailDialog scenario={scenario} />
                <ScenarioDetailDialog scenario={scenario} isEditing={true} />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAddToDatabase(scenario)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
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
          <TabsList className="grid w-full grid-cols-3 mb-6">
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
        </Tabs>
      </div>
    </div>
  );
};

export default PromptManagement;