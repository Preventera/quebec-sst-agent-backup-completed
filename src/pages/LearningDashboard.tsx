import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Bot, CheckCircle, XCircle, Target, Award, Calendar, Users } from "lucide-react";

// ⚡ LAZY LOADING des composants de graphiques
const AccuracyChart = React.lazy(() => import("@/components/charts/AccuracyChart"));
const AnnotationsChart = React.lazy(() => import("@/components/charts/AnnotationsChart"));

interface LearningMetric {
  id: string;
  agent_name: string;
  total_annotations: number;
  compliant_responses: number;
  accuracy_percentage: number;
  last_updated: string;
}

interface AgentStats {
  agent_name: string;
  total_conversations: number;
  total_annotations: number;
  compliant_count: number;
  non_compliant_count: number;
  accuracy: number;
}

const LearningDashboard = () => {
  const [metrics, setMetrics] = useState<LearningMetric[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [showCharts, setShowCharts] = useState(false);

  const agents = ["Hugo", "DiagSST", "LexiNorm", "Prioris", "Sentinelle", "DocuGen", "CoSS", "ALSS"];

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      // Charger les métriques d'apprentissage
      const { data: metricsData, error: metricsError } = await supabase
        .from("learning_metrics")
        .select("*")
        .order("accuracy_percentage", { ascending: false });

      if (metricsError) throw metricsError;
      setMetrics(metricsData || []);

      // Calculer les statistiques détaillées par agent
      const { data: logsData, error: logsError } = await supabase
        .from("conversation_logs")
        .select(`
          agent_name,
          response_annotations (
            is_compliant
          )
        `);

      if (logsError) throw logsError;

      const { data: annotationsData, error: annotationsError } = await supabase
        .from("response_annotations")
        .select(`
          is_compliant,
          conversation_logs (
            agent_name
          )
        `);

      if (annotationsError) throw annotationsError;

      // Calculer les stats par agent
      const statsMap = new Map<string, AgentStats>();
      
      agents.forEach(agent => {
        statsMap.set(agent, {
          agent_name: agent,
          total_conversations: 0,
          total_annotations: 0,
          compliant_count: 0,
          non_compliant_count: 0,
          accuracy: 0
        });
      });

      // Compter les conversations
      (logsData || []).forEach(log => {
        const stats = statsMap.get(log.agent_name);
        if (stats) {
          stats.total_conversations++;
        }
      });

      // Compter les annotations
      (annotationsData || []).forEach(annotation => {
        if (annotation.conversation_logs) {
          const agentName = (annotation.conversation_logs as any).agent_name;
          const stats = statsMap.get(agentName);
          if (stats) {
            stats.total_annotations++;
            if (annotation.is_compliant) {
              stats.compliant_count++;
            } else {
              stats.non_compliant_count++;
            }
            stats.accuracy = stats.total_annotations > 0 
              ? Math.round((stats.compliant_count / stats.total_annotations) * 100)
              : 0;
          }
        }
      });

      setAgentStats(Array.from(statsMap.values()));
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAnnotations = agentStats.reduce((sum, stat) => sum + stat.total_annotations, 0);
  const totalCompliant = agentStats.reduce((sum, stat) => sum + stat.compliant_count, 0);
  const averageAccuracy = agentStats.length > 0 
    ? Math.round(agentStats.reduce((sum, stat) => sum + stat.accuracy, 0) / agentStats.length)
    : 0;

  const chartData = agentStats.map(stat => ({
    agent: stat.agent_name,
    accuracy: stat.accuracy,
    annotations: stat.total_annotations
  }));

  const pieData = agentStats
    .filter(stat => stat.total_annotations > 0)
    .map(stat => ({
      name: stat.agent_name,
      value: stat.total_annotations
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Dashboard d'Apprentissage
            </h1>
            <p className="text-muted-foreground mt-2">
              Suivi des performances et amélioration continue des agents
            </p>
          </div>
        </div>

        {/* Métriques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Annotations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAnnotations}</div>
              <p className="text-xs text-muted-foreground">
                Conversations évaluées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Conformité</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalAnnotations > 0 ? Math.round((totalCompliant / totalAnnotations) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {totalCompliant} sur {totalAnnotations} conformes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Précision Moyenne</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageAccuracy}%</div>
              <p className="text-xs text-muted-foreground">
                Tous agents confondus
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agents Actifs</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agentStats.filter(stat => stat.total_annotations > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Sur {agents.length} agents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ⚡ GRAPHIQUES EN LAZY LOADING */}
        {!showCharts ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Précision par Agent</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[300px] space-y-4">
                <BarChart3 className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  Cliquez pour charger les graphiques interactifs
                </p>
                <Button 
                  onClick={() => setShowCharts(true)}
                  className="w-full max-w-xs"
                >
                  Charger les Graphiques
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des Annotations</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[300px] space-y-4">
                <PieChart className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  Graphiques en camembert interactifs
                </p>
                <Button 
                  onClick={() => setShowCharts(true)}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  Afficher les Données
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Suspense fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Précision par Agent</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Chargement du graphique...</p>
                  </div>
                </CardContent>
              </Card>
            }>
              <AccuracyChart data={chartData} />
            </Suspense>

            <Suspense fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des Annotations</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Chargement du graphique...</p>
                  </div>
                </CardContent>
              </Card>
            }>
              <AnnotationsChart data={pieData} />
            </Suspense>
          </div>
        )}

        {/* Détails par agent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance Détaillée par Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {agentStats
                .sort((a, b) => b.accuracy - a.accuracy)
                .map((stat, index) => (
                <div key={stat.agent_name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="font-medium">{stat.agent_name}</span>
                      </div>
                      <Badge 
                        variant={stat.accuracy >= 80 ? "default" : stat.accuracy >= 60 ? "secondary" : "destructive"}
                      >
                        {stat.accuracy}% précision
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.total_annotations} annotations
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center justify-between bg-muted/30 p-3 rounded">
                      <span>Conversations totales</span>
                      <span className="font-medium">{stat.total_conversations}</span>
                    </div>
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Conformes
                      </span>
                      <span className="font-medium text-green-600">{stat.compliant_count}</span>
                    </div>
                    <div className="flex items-center justify-between bg-red-50 p-3 rounded">
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-600" />
                        Non conformes
                      </span>
                      <span className="font-medium text-red-600">{stat.non_compliant_count}</span>
                    </div>
                  </div>
                  
                  <Progress value={stat.accuracy} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningDashboard;