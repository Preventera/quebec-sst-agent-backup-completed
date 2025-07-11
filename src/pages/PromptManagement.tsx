import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Bot, TrendingUp, RefreshCw, Save, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

const PromptManagement = () => {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState("Hugo");
  const [agentFeedback, setAgentFeedback] = useState<AgentFeedback | null>(null);
  const [agentPrompts, setAgentPrompts] = useState<Record<string, AgentPrompt>>({});
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const currentAgentPrompt = agentPrompts[selectedAgent];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Gestion des Prompts d'Agents
            </h1>
            <p className="text-muted-foreground mt-2">
              Amélioration continue des prompts basée sur les feedbacks utilisateur
            </p>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default PromptManagement;