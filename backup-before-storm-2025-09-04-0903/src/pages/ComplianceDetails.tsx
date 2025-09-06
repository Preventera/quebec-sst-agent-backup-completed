import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Info, TrendingUp, CheckCircle, AlertTriangle, XCircle, Clock, Calculator, Database, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpTooltip } from "@/components/LegalTooltip";

const ComplianceDetails = () => {
  const { metricType } = useParams();
  const navigate = useNavigate();

  const getMetricData = () => {
    switch (metricType) {
      case "general":
        return {
          title: "Conformité générale",
          value: "78%",
          icon: TrendingUp,
          status: "warning",
          description: "Évaluation globale LMRSST",
          color: "text-warning"
        };
      case "obligations":
        return {
          title: "Obligations respectées",
          value: "23/30",
          icon: CheckCircle,
          status: "success",
          description: "Articles conformes",
          color: "text-success"
        };
      case "critical":
        return {
          title: "Actions critiques",
          value: "4",
          icon: XCircle,
          status: "destructive",
          description: "Nécessitent action immédiate",
          color: "text-destructive"
        };
      case "deadlines":
        return {
          title: "Échéances à venir",
          value: "7",
          icon: Clock,
          status: "warning",
          description: "Dans les 30 prochains jours",
          color: "text-warning"
        };
      default:
        return {
          title: "Métrique inconnue",
          value: "N/A",
          icon: Info,
          status: "default",
          description: "Données non disponibles",
          color: "text-muted-foreground"
        };
    }
  };

  const metric = getMetricData();

  const xaiExplanation = {
    general: {
      calculation: "Score basé sur la moyenne pondérée de 30 obligations LMRSST analysées par l'IA",
      factors: [
        { name: "Respect des délais", weight: 30, score: 85, impact: "Positive" },
        { name: "Complétude des documents", weight: 25, score: 75, impact: "Positive" },
        { name: "Mise à jour des procédures", weight: 20, score: 60, impact: "Négative" },
        { name: "Formation du personnel", weight: 15, score: 90, impact: "Positive" },
        { name: "Suivi des incidents", weight: 10, score: 70, impact: "Neutre" }
      ],
      recommendations: [
        "Priorité : Mettre à jour les procédures de sécurité (impact de +12% sur le score)",
        "Planifier les formations manquantes avant les échéances",
        "Réviser les documents obsolètes identifiés par l'IA"
      ]
    },
    obligations: {
      calculation: "Analyse automatisée de 30 articles LMRSST avec validation par agents IA spécialisés",
      factors: [
        { name: "Art. 51-90 (Programme)", weight: 40, score: 85, impact: "Positive" },
        { name: "Art. 91-100 (Formation)", weight: 30, score: 70, impact: "Neutre" },
        { name: "Art. 101-110 (Suivi)", weight: 30, score: 90, impact: "Positive" }
      ],
      recommendations: [
        "7 obligations nécessitent une mise à jour documentaire",
        "Compléter les formations manquantes pour 3 employés",
        "Réviser les procédures d'urgence (dernière mise à jour : 2023)"
      ]
    },
    critical: {
      calculation: "Détection basée sur l'urgence légale et le niveau de risque évalué par l'IA",
      factors: [
        { name: "Risque légal", weight: 50, score: 20, impact: "Critique" },
        { name: "Impact opérationnel", weight: 30, score: 40, impact: "Élevé" },
        { name: "Délai de résolution", weight: 20, score: 10, impact: "Critique" }
      ],
      recommendations: [
        "URGENT : Mettre à jour le registre des accidents (Art. 280 LMRSST)",
        "Compléter l'évaluation des risques chimiques avant le 15/08",
        "Former 2 superviseurs aux premiers secours",
        "Réviser le plan d'évacuation suite aux modifications du bâtiment"
      ]
    },
    deadlines: {
      calculation: "Suivi automatique des échéances légales avec alertes prédictives",
      factors: [
        { name: "Formations obligatoires", weight: 40, score: 60, impact: "Attention" },
        { name: "Rapports annuels", weight: 35, score: 80, impact: "Bonne" },
        { name: "Inspections périodiques", weight: 25, score: 45, impact: "Attention" }
      ],
      recommendations: [
        "Planifier 3 formations avant le 25/08 (délai légal)",
        "Programmer l'inspection des équipements de protection",
        "Préparer le rapport annuel CNESST (échéance : 30/09)",
        "Renouveler les certifications expirantes"
      ]
    }
  };

  const currentExplanation = xaiExplanation[metricType as keyof typeof xaiExplanation] || xaiExplanation.general;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Button>
          <div className="flex items-center gap-3">
            <metric.icon className={`h-6 w-6 ${metric.color}`} />
            <div>
              <h1 className="text-2xl font-bold">{metric.title}</h1>
              <p className="text-muted-foreground">{metric.description}</p>
            </div>
          </div>
        </div>

        {/* Current Metric Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Valeur actuelle</span>
              <Badge variant={metric.status === "success" ? "default" : metric.status === "warning" ? "secondary" : "destructive"}>
                {metric.status === "success" && "Conforme"}
                {metric.status === "warning" && "Attention"}
                {metric.status === "destructive" && "Critique"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{metric.value}</div>
            <p className="text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>

        {/* XAI Explanation */}
        <Tabs defaultValue="calculation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculation">
              <Calculator className="h-4 w-4 mr-2" />
              Calcul
            </TabsTrigger>
            <TabsTrigger value="factors">
              <Database className="h-4 w-4 mr-2" />
              Facteurs
            </TabsTrigger>
            <TabsTrigger value="ai-insights">
              <Brain className="h-4 w-4 mr-2" />
              IA Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Méthode de calcul
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {currentExplanation.calculation}
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <HelpTooltip 
                    content="Cette métrique est calculée en temps réel par notre système d'IA multi-agents qui analyse continuellement vos données de conformité"
                    title="Calcul en temps réel"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      Mise à jour automatique toutes les heures
                    </div>
                  </HelpTooltip>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="factors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Facteurs d'influence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentExplanation.factors.map((factor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            factor.impact === "Positive" ? "default" :
                            factor.impact === "Critique" ? "destructive" :
                            factor.impact === "Élevé" ? "destructive" :
                            factor.impact === "Attention" ? "secondary" :
                            "outline"
                          }>
                            {factor.impact}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Poids: {factor.weight}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={factor.score} className="flex-1" />
                        <span className="text-sm font-medium w-12">{factor.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Recommandations IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentExplanation.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{recommendation}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">Analyse prédictive</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Basé sur l'analyse de vos données historiques, notre IA prédit une amélioration de 
                    <span className="font-semibold text-primary"> +15% </span>
                    si vous implémentez les recommandations prioritaires dans les 30 prochains jours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComplianceDetails;