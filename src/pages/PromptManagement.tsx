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
import { FileText, Bot, TrendingUp, RefreshCw, Save, AlertTriangle, CheckCircle, Search, Settings, Users, Zap, MoreVertical, Edit, Copy, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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

const PromptManagement = () => {
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

  return (
    <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              Gestion des Prompts d'Orchestration
            </h1>
            <p className="text-muted-foreground mt-2">
              Prompts d'agents individuels et orchestration intelligente LMRSST
            </p>
          </div>
        </div>

        {/* Navigation par onglets */}
        <Tabs defaultValue="orchestration" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="orchestration" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Orchestration LMRSST
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Prompts Agents
            </TabsTrigger>
          </TabsList>

          {/* Onglet Orchestration LMRSST */}
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

            {/* Grille des prompts d'orchestration */}
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
                        {/* Menu contextuel au survol */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings className="h-4 w-4" />
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
                    
                    <div className="bg-muted/30 p-3 rounded text-xs font-mono">
                      {prompt.orchestration_prompt}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        <Zap className="h-4 w-4 mr-2" />
                        Exécuter
                      </Button>
                      {randomStatus !== 'production' && (
                        <Button variant="outline" size="sm">
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
            {filteredOrchestrationPrompts.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                  className="justify-center"
                />
              </div>
            )}
          </TabsContent>

          {/* Onglet Prompts Agents */}
          <TabsContent value="agents" className="space-y-6">

            {/* Sélection d'agent */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <span className="font-medium">Agent sélectionné :</span>
                  </div>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchAgentFeedback(selectedAgent)}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance actuelle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Actuelle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agentFeedback ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Précision</span>
                          <span className="font-medium">{agentFeedback.accuracy_percentage}%</span>
                        </div>
                        <Progress value={agentFeedback.accuracy_percentage} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-muted/30 p-3 rounded">
                          <div className="font-medium text-lg">{agentFeedback.total_conversations}</div>
                          <div className="text-muted-foreground">Conversations</div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded">
                          <div className="font-medium text-lg">{agentFeedback.total_annotations}</div>
                          <div className="text-muted-foreground">Annotations</div>
                        </div>
                      </div>

                      {agentFeedback.improvement_suggestions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Suggestions d'amélioration :</h4>
                          {agentFeedback.improvement_suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs">
                              <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Chargement des métriques...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feedback récent */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Feedback Récent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {agentFeedback?.recent_feedback.map((feedback, index) => (
                      <div key={index} className="border rounded p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={feedback.is_compliant ? "default" : "destructive"}>
                            {feedback.is_compliant ? "Conforme" : "Non conforme"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <strong>Question :</strong> {feedback.user_message.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Réponse :</strong> {feedback.agent_response.substring(0, 100)}...
                        </p>
                        {feedback.annotation_notes && (
                          <p className="text-xs bg-muted/30 p-2 rounded">
                            <strong>Notes :</strong> {feedback.annotation_notes}
                          </p>
                        )}
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun feedback récent disponible
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Édition du prompt */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Prompt Actuel
                    {currentAgentPrompt && (
                      <Badge variant="outline" className="ml-auto">
                        v{currentAgentPrompt.version}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    placeholder="Entrez le prompt de l'agent..."
                    rows={12}
                    className="resize-none font-mono text-sm"
                  />
                  
                  <div className="flex gap-2">
                    <Button onClick={savePrompt} disabled={saving} className="flex-1">
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Sauvegarder
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={generateImprovedPrompt}
                      disabled={!agentFeedback || agentFeedback.improvement_suggestions.length === 0}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Améliorer
                    </Button>
                  </div>
                  
                  {currentAgentPrompt && (
                    <p className="text-xs text-muted-foreground">
                      Dernière mise à jour : {format(new Date(currentAgentPrompt.last_updated), "dd MMM yyyy, HH:mm", { locale: fr })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PromptManagement;