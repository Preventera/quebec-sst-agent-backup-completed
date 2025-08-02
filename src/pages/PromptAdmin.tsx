import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Bot, TrendingUp, RefreshCw, Save, AlertTriangle, CheckCircle, Search, Settings, Users, Zap, MoreVertical, Edit, Copy, Play, Upload, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import orchestrationPrompts from "@/data/orchestrationPrompts.json";

interface AgentFeedback {
  agent_name: string;
  total_conversations: number;
  total_annotations: number;
  accuracy_percentage: number;
  recent_feedback: Array<{
    conversation_id: string;
    user_message: string;
    agent_response: string;
    is_compliant: boolean;
    annotation_notes?: string;
  }>;
  improvement_suggestions: string[];
}

interface AgentPrompt {
  agent_name: string;
  current_prompt: string;
  version: number;
  last_updated: string;
  performance_score: number;
}

interface OrchestrationPrompt {
  id: number;
  title: string;
  description: string;
  agents: string[];
  article_lmrsst: string;
  category: string;
  priority: string;
  scope: string;
  orchestration_prompt: string;
  expected_deliverables: string[];
}

const PromptAdmin = () => {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState("Hugo");
  const [agentFeedback, setAgentFeedback] = useState<AgentFeedback | null>(null);
  const [agentPrompts, setAgentPrompts] = useState<Record<string, AgentPrompt>>({});
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const agents = ["Hugo", "DiagSST", "LexiNorm", "Prioris", "Sentinelle", "DocuGen", "CoSS", "ALSS"];

  // Prompts par défaut pour chaque agent
  const defaultPrompts: Record<string, string> = {
    "Hugo": `Tu es Hugo, l'orchestrateur principal d'AgenticSST Québec. Ton rôle est de coordonner tous les agents selon la taille et le secteur de l'entreprise.

MISSION:
- Analyser le contexte de l'entreprise (taille, secteur, besoins)
- Rediriger vers l'agent approprié
- Maintenir la cohérence du parcours utilisateur

RÈGLES:
- Entreprises <20 employés → ALSS
- Entreprises 20+ employés → CoSS
- Questions légales → LexiNorm
- Diagnostic conformité → DiagSST
- Plans d'action → Prioris

Réponds de manière concise et professionnelle en français.`,

    "DiagSST": `Tu es DiagSST, l'agent de diagnostic de conformité LMRSST. Tu évalues la conformité réglementaire selon les réponses utilisateur.

MISSION:
- Analyser les réponses du questionnaire de conformité
- Identifier les écarts à la LMRSST
- Générer un rapport de conformité détaillé
- Recommander les actions prioritaires

EXPERTISE:
- Programmes de prévention
- Comités de santé-sécurité
- Formation obligatoire
- Registres d'accidents

Sois précis et factuel dans tes évaluations.`,

    "LexiNorm": `Tu es LexiNorm, l'agent référentiel légal de la LMRSST. Tu fournis les interprétations des articles de loi.

MISSION:
- Interpréter les articles de la LMRSST
- Fournir des références légales précises
- Expliquer les obligations selon le contexte
- Clarifier les exigences réglementaires

EXPERTISE:
- Articles LMRSST complets
- Jurisprudence CNESST
- Obligations sectorielles
- Délais légaux

Cite toujours les articles exacts et reste factuel.`
  };

  useEffect(() => {
    // Initialiser les prompts par défaut
    const initialPrompts: Record<string, AgentPrompt> = {};
    agents.forEach(agent => {
      initialPrompts[agent] = {
        agent_name: agent,
        current_prompt: defaultPrompts[agent] || `Tu es ${agent}, agent spécialisé d'AgenticSST Québec.`,
        version: 1,
        last_updated: new Date().toISOString(),
        performance_score: 75
      };
    });
    setAgentPrompts(initialPrompts);
    setCurrentPrompt(initialPrompts[selectedAgent]?.current_prompt || "");
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentFeedback(selectedAgent);
      setCurrentPrompt(agentPrompts[selectedAgent]?.current_prompt || "");
    }
  }, [selectedAgent, agentPrompts]);

  const fetchAgentFeedback = async (agentName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-agent-feedback', {
        body: { agent_name: agentName, limit: 5, include_context: true }
      });

      if (error) throw error;
      setAgentFeedback(data);
    } catch (error) {
      console.error('Erreur lors du chargement du feedback:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le feedback de l'agent",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async () => {
    setSaving(true);
    try {
      // Simuler la sauvegarde (dans un vrai système, cela irait en base)
      const updatedPrompts = {
        ...agentPrompts,
        [selectedAgent]: {
          ...agentPrompts[selectedAgent],
          current_prompt: currentPrompt,
          version: agentPrompts[selectedAgent].version + 1,
          last_updated: new Date().toISOString()
        }
      };
      
      setAgentPrompts(updatedPrompts);
      
      toast({
        title: "Succès",
        description: `Prompt mis à jour pour ${selectedAgent}`,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le prompt",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateImprovedPrompt = async () => {
    if (!agentFeedback || agentFeedback.improvement_suggestions.length === 0) {
      toast({
        title: "Info",
        description: "Aucune suggestion d'amélioration disponible",
      });
      return;
    }

    const suggestions = agentFeedback.improvement_suggestions;
    const currentPromptText = agentPrompts[selectedAgent]?.current_prompt || "";
    
    // Amélioration basique basée sur les suggestions
    let improvedPrompt = currentPromptText;
    
    if (suggestions.some(s => s.includes('précision'))) {
      improvedPrompt += "\n\nAMÉLIORATE SPÉCIFIQUE:\n- Sois plus précis dans tes références légales\n- Vérifie l'exactitude de chaque information";
    }
    
    if (suggestions.some(s => s.includes('secteur'))) {
      improvedPrompt += "\n- Adapte tes réponses selon le secteur d'activité spécifique";
    }
    
    if (suggestions.some(s => s.includes('délai'))) {
      improvedPrompt += "\n- Mentionne les délais légaux exacts avec les références d'articles";
    }

    setCurrentPrompt(improvedPrompt);
    
    toast({
      title: "Prompt amélioré",
      description: "Le prompt a été enrichi avec les suggestions d'amélioration",
    });
  };

  // Filtrage des prompts d'orchestration
  const filteredOrchestrationPrompts = orchestrationPrompts.filter((prompt: OrchestrationPrompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.agents.some(agent => agent.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || prompt.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Pagination pour les prompts d'orchestration
  const totalItems = filteredOrchestrationPrompts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrompts = filteredOrchestrationPrompts.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPriority]);

  const categories = [...new Set(orchestrationPrompts.map((p: OrchestrationPrompt) => p.category))];
  const priorities = [...new Set(orchestrationPrompts.map((p: OrchestrationPrompt) => p.priority))];

  const currentAgentPrompt = agentPrompts[selectedAgent];

  const publishPrompt = (promptId: number) => {
    toast({
      title: "Prompt publié",
      description: "Le prompt a été publié en production avec succès.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* En-tête avec indication d'accès admin */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Lock className="h-8 w-8 text-primary" />
              Administration des Prompts
            </h1>
            <p className="text-muted-foreground mt-2">
              Création, édition et gestion des prompts d'agents et d'orchestration - Accès administrateur
            </p>
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Lock className="h-3 w-3 mr-1" />
            Zone Administrateur
          </Badge>
        </div>

        {/* Navigation par onglets */}
        <Tabs defaultValue="orchestration" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="orchestration" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestion Orchestration
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Édition Agents
            </TabsTrigger>
          </TabsList>

          {/* Onglet Orchestration LMRSST - Mode Administration */}
          <TabsContent value="orchestration" className="space-y-6">
            {/* Filtres de recherche */}
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
                    {filteredOrchestrationPrompts.length} prompt{filteredOrchestrationPrompts.length > 1 ? 's' : ''} trouvé{filteredOrchestrationPrompts.length > 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions administrateur */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button variant="default">
                    <FileText className="h-4 w-4 mr-2" />
                    Nouveau Prompt
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer Prompts
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuration Globale
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grille des prompts d'orchestration avec contrôles admin */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedPrompts.map((prompt: OrchestrationPrompt) => {
                const isOrchestrator = prompt.agents.length > 1;
                const randomStatus = ['draft', 'test', 'production'][Math.floor(Math.random() * 3)];
                
                return (
                <Card key={prompt.id} className="group hover:shadow-lg transition-all duration-200 relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{prompt.title}</CardTitle>
                          {isOrchestrator && (
                            <Badge variant="default" className="bg-primary/10 text-primary">
                              Orchestrateur
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            prompt.priority === "critical" ? "destructive" :
                            prompt.priority === "high" ? "default" :
                            prompt.priority === "medium" ? "secondary" : "outline"
                          }>
                            {prompt.priority === "critical" ? "Critique" : 
                             prompt.priority === "high" ? "Élevée" : 
                             prompt.priority === "medium" ? "Moyenne" : "Faible"}
                          </Badge>
                          <Badge variant="outline">{prompt.category}</Badge>
                          <Badge variant={
                            randomStatus === 'production' ? 'default' :
                            randomStatus === 'test' ? 'secondary' : 'outline'
                          } className={
                            randomStatus === 'production' ? 'bg-green-500/10 text-green-700 border-green-200' :
                            randomStatus === 'test' ? 'bg-orange-500/10 text-orange-700 border-orange-200' :
                            'bg-gray-500/10 text-gray-700 border-gray-200'
                          }>
                            {randomStatus === 'production' ? 'Production' :
                             randomStatus === 'test' ? 'Test' : 'Brouillon'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                        {/* Menu contextuel administration */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{prompt.description}</p>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Agents impliqués:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prompt.agents.map((agent, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Article LMRSST:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">{prompt.article_lmrsst}</code>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Livrables attendus:</strong>
                        <ul className="list-disc list-inside mt-1 text-xs text-muted-foreground">
                          {prompt.expected_deliverables.map((deliverable, index) => (
                            <li key={index}>{deliverable}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                      {prompt.orchestration_prompt}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Éditer
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Tester
                      </Button>
                      {randomStatus !== 'production' && (
                        <Button 
                          size="sm"
                          onClick={() => publishPrompt(prompt.id)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Publier
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={totalItems}
            />
          </TabsContent>

          {/* Onglet Prompts Agents - Mode Édition */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sélection d'agent et feedback */}
              <div className="space-y-6">
                {/* Sélecteur d'agent */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Sélection Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent} value={agent}>
                            {agent}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Informations agent actuel */}
                {currentAgentPrompt && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedAgent}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Version</span>
                          <span className="font-mono">v{currentAgentPrompt.version}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Performance</span>
                          <span className="font-semibold">{currentAgentPrompt.performance_score}%</span>
                        </div>
                        <Progress value={currentAgentPrompt.performance_score} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          Mis à jour: {format(new Date(currentAgentPrompt.last_updated), 'PPp', { locale: fr })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Feedback et suggestions */}
                {agentFeedback && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Feedback Performance
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchAgentFeedback(selectedAgent)}
                          disabled={loading}
                        >
                          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{agentFeedback.total_conversations}</div>
                          <div className="text-xs text-muted-foreground">Conversations</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{agentFeedback.total_annotations}</div>
                          <div className="text-xs text-muted-foreground">Annotations</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{agentFeedback.accuracy_percentage}%</div>
                          <div className="text-xs text-muted-foreground">Précision</div>
                        </div>
                      </div>

                      {agentFeedback.improvement_suggestions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Suggestions d'amélioration
                          </h4>
                          <ul className="space-y-1">
                            {agentFeedback.improvement_suggestions.slice(0, 3).map((suggestion, index) => (
                              <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="text-orange-500 mt-0.5">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={generateImprovedPrompt}
                            className="w-full mt-3"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Appliquer suggestions
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Éditeur de prompt */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Éditeur de Prompt - {selectedAgent}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPrompt(agentPrompts[selectedAgent]?.current_prompt || "")}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Réinitialiser
                        </Button>
                        <Button
                          size="sm"
                          onClick={savePrompt}
                          disabled={saving}
                        >
                          {saving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Sauvegarder
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    <Textarea
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      placeholder="Entrez le prompt pour cet agent..."
                      className="min-h-[500px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PromptAdmin;