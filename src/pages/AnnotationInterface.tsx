import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, MessageSquare, Bot, Calendar, Save, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

interface ConversationLog {
  id: string;
  user_id: string;
  agent_name: string;
  user_message: string;
  agent_response: string;
  context_data: any;
  created_at: string;
}

interface Annotation {
  id: string;
  conversation_log_id: string;
  is_compliant: boolean;
  annotation_notes: string;
  annotated_by: string;
  created_at: string;
}

const AnnotationInterface = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [logs, setLogs] = useState<ConversationLog[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [annotations, setAnnotations] = useState<{ [key: string]: Annotation }>({});
  const [currentAnnotation, setCurrentAnnotation] = useState<{
    is_compliant: boolean | null;
    notes: string;
  }>({ is_compliant: null, notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const logId = searchParams.get('log');

  useEffect(() => {
    fetchData();
  }, [logId]);

  const fetchData = async () => {
    try {
      // Charger les logs
      let logsQuery = supabase
        .from("conversation_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (logId) {
        logsQuery = logsQuery.eq("id", logId);
      }

      const { data: logsData, error: logsError } = await logsQuery;
      if (logsError) throw logsError;

      setLogs(logsData || []);

      // Charger les annotations existantes
      const { data: annotationsData, error: annotationsError } = await supabase
        .from("response_annotations")
        .select("*");

      if (annotationsError) throw annotationsError;

      const annotationsMap = (annotationsData || []).reduce((acc, annotation) => {
        acc[annotation.conversation_log_id] = annotation;
        return acc;
      }, {} as { [key: string]: Annotation });

      setAnnotations(annotationsMap);

      // Charger l'annotation actuelle si elle existe
      if (logsData && logsData.length > 0) {
        const currentLog = logsData[0];
        const existingAnnotation = annotationsMap[currentLog.id];
        if (existingAnnotation) {
          setCurrentAnnotation({
            is_compliant: existingAnnotation.is_compliant,
            notes: existingAnnotation.annotation_notes || ""
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAnnotation = async () => {
    if (!logs[currentLogIndex] || currentAnnotation.is_compliant === null) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une évaluation",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const log = logs[currentLogIndex];
      const existingAnnotation = annotations[log.id];

      const annotationData = {
        conversation_log_id: log.id,
        is_compliant: currentAnnotation.is_compliant,
        annotation_notes: currentAnnotation.notes,
        annotated_by: "current_user", // À remplacer par l'utilisateur actuel
      };

      let result;
      if (existingAnnotation) {
        result = await supabase
          .from("response_annotations")
          .update(annotationData)
          .eq("id", existingAnnotation.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("response_annotations")
          .insert(annotationData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Mettre à jour le state local
      setAnnotations(prev => ({
        ...prev,
        [log.id]: result.data
      }));

      toast({
        title: "Succès",
        description: "Annotation sauvegardée avec succès",
      });

      // Passer au log suivant s'il y en a un
      if (currentLogIndex < logs.length - 1) {
        goToNextLog();
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'annotation",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const goToNextLog = () => {
    if (currentLogIndex < logs.length - 1) {
      const nextIndex = currentLogIndex + 1;
      setCurrentLogIndex(nextIndex);
      loadAnnotationForLog(logs[nextIndex]);
    }
  };

  const goToPrevLog = () => {
    if (currentLogIndex > 0) {
      const prevIndex = currentLogIndex - 1;
      setCurrentLogIndex(prevIndex);
      loadAnnotationForLog(logs[prevIndex]);
    }
  };

  const loadAnnotationForLog = (log: ConversationLog) => {
    const existingAnnotation = annotations[log.id];
    if (existingAnnotation) {
      setCurrentAnnotation({
        is_compliant: existingAnnotation.is_compliant,
        notes: existingAnnotation.annotation_notes || ""
      });
    } else {
      setCurrentAnnotation({ is_compliant: null, notes: "" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune conversation à annoter</p>
              <Link to="/logs">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux logs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentLog = logs[currentLogIndex];
  const hasExistingAnnotation = annotations[currentLog.id];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-primary" />
              Interface d'Annotation
            </h1>
            <p className="text-muted-foreground mt-2">
              Évaluation de la conformité des réponses agents
            </p>
          </div>
          <Link to="/logs">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux logs
            </Button>
          </Link>
        </div>

        {/* Progression */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Conversation {currentLogIndex + 1} sur {logs.length}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPrevLog}
                  disabled={currentLogIndex === 0}
                >
                  Précédent
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextLog}
                  disabled={currentLogIndex === logs.length - 1}
                >
                  Suivant
                </Button>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentLogIndex + 1) / logs.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversation à évaluer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation à évaluer
              </CardTitle>
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <Badge variant="outline">{currentLog.agent_name}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(currentLog.created_at), "dd MMM yyyy, HH:mm", { locale: fr })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Message utilisateur :</p>
                <div className="bg-muted/30 p-4 rounded-lg text-sm">
                  {currentLog.user_message}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Réponse agent :</p>
                <div className="bg-primary/5 p-4 rounded-lg text-sm">
                  {currentLog.agent_response}
                </div>
              </div>
              {currentLog.context_data && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Contexte :</p>
                  <div className="bg-muted/20 p-3 rounded text-xs font-mono">
                    {JSON.stringify(currentLog.context_data, null, 2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel d'annotation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Évaluation de conformité
                {hasExistingAnnotation && (
                  <Badge variant="secondary">Déjà annotée</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-3">La réponse est-elle conforme ?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={currentAnnotation.is_compliant === true ? "default" : "outline"}
                    onClick={() => setCurrentAnnotation(prev => ({ ...prev, is_compliant: true }))}
                    className="h-16 flex flex-col items-center gap-2"
                  >
                    <CheckCircle className="h-6 w-6" />
                    Conforme
                  </Button>
                  <Button
                    variant={currentAnnotation.is_compliant === false ? "destructive" : "outline"}
                    onClick={() => setCurrentAnnotation(prev => ({ ...prev, is_compliant: false }))}
                    className="h-16 flex flex-col items-center gap-2"
                  >
                    <XCircle className="h-6 w-6" />
                    Non conforme
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Notes d'annotation (optionnel)</p>
                <Textarea
                  placeholder="Ajoutez des commentaires sur votre évaluation..."
                  value={currentAnnotation.notes}
                  onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>

              <Button 
                onClick={saveAnnotation} 
                disabled={saving || currentAnnotation.is_compliant === null}
                className="w-full"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {hasExistingAnnotation ? "Mettre à jour" : "Sauvegarder"} l'annotation
              </Button>

              {hasExistingAnnotation && (
                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
                  <p className="font-medium">Annotation existante :</p>
                  <p>Conforme : {hasExistingAnnotation.is_compliant ? "Oui" : "Non"}</p>
                  {hasExistingAnnotation.annotation_notes && (
                    <p>Notes : {hasExistingAnnotation.annotation_notes}</p>
                  )}
                  <p>Par : {hasExistingAnnotation.annotated_by}</p>
                  <p>Le : {format(new Date(hasExistingAnnotation.created_at), "dd MMM yyyy, HH:mm", { locale: fr })}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnnotationInterface;