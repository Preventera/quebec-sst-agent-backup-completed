import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Clock, TrendingUp, TrendingDown, Info } from "lucide-react";
import { HelpTooltip } from "./LegalTooltip";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ComplianceStats = () => {
  const navigate = useNavigate();

  // Séparer la métrique principale des autres
  const mainMetric = {
    title: "Conformité générale",
    value: "78%",
    icon: TrendingUp,
    status: "warning",
    description: "Évaluation globale LMRSST",
    helpText: "Score basé sur l'analyse de vos obligations légales selon les articles 51, 90, 101 de la LMRSST",
    statusIcon: AlertTriangle,
    detailRoute: "general",
    isMain: true
  };

  const secondaryStats = [
    {
      title: "Obligations respectées",
      value: "23/30",
      icon: CheckCircle,
      status: "success",
      description: "Articles conformes",
      helpText: "Nombre d'obligations réglementaires actuellement en conformité avec la LMRSST",
      statusIcon: CheckCircle,
      detailRoute: "obligations"
    },
    {
      title: "Actions critiques",
      value: "4",
      icon: XCircle,
      status: "destructive",
      description: "Nécessitent action immédiate",
      helpText: "Actions prioritaires pour maintenir la conformité réglementaire et éviter les sanctions",
      statusIcon: XCircle,
      detailRoute: "critical"
    },
    {
      title: "Échéances à venir",
      value: "7",
      icon: Clock,
      status: "warning",
      description: "Dans les 30 prochains jours",
      helpText: "Dates limites pour les formations, rapports et mises à jour réglementaires obligatoires",
      statusIcon: AlertTriangle,
      detailRoute: "deadlines"
    }
  ];

  const getIconColor = (status: string) => {
    switch (status) {
      case "success": return "text-success";
      case "warning": return "text-warning";
      case "destructive": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "success": return "default";
      case "warning": return "secondary";
      case "destructive": return "destructive";
      default: return "outline";
    }
  };

  const renderMainMetric = () => (
    <Card 
      className="col-span-full lg:col-span-2 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer"
      onClick={() => navigate(`/compliance-details/${mainMetric.detailRoute}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {mainMetric.title}
                    </CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{mainMetric.helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <mainMetric.icon className={`h-6 w-6 ${getIconColor(mainMetric.status)}`} aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl md:text-5xl font-bold text-foreground">{mainMetric.value}</div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground flex-1">{mainMetric.description}</p>
          <div className="flex items-center gap-2">
            <mainMetric.statusIcon className={`h-4 w-4 ${getIconColor(mainMetric.status)}`} aria-hidden="true" />
            <Badge variant={getBadgeVariant(mainMetric.status)} className="text-sm font-medium px-3 py-1">
              {mainMetric.status === "success" && "✓ Conforme"}
              {mainMetric.status === "warning" && "⚠ Attention"}
              {mainMetric.status === "destructive" && "✗ Critique"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSecondaryStats = () => 
    secondaryStats.map((stat, index) => (
      <Card 
        key={index} 
        className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer border-l-4"
        style={{borderLeftColor: stat.status === "success" ? "hsl(var(--success))" : stat.status === "warning" ? "hsl(var(--warning))" : "hsl(var(--destructive))"}}
        onClick={() => navigate(`/compliance-details/${stat.detailRoute}`)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {stat.title}
                  </CardTitle>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{stat.helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <stat.icon className={`h-5 w-5 ${getIconColor(stat.status)}`} aria-hidden="true" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground flex-1">{stat.description}</p>
            <div className="flex items-center gap-1">
              <stat.statusIcon className={`h-3 w-3 ${getIconColor(stat.status)}`} aria-hidden="true" />
              <Badge variant={getBadgeVariant(stat.status)} className="text-xs font-medium">
                {stat.status === "success" && "Conforme"}
                {stat.status === "warning" && "Attention"}
                {stat.status === "destructive" && "Critique"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
      {renderMainMetric()}
      {renderSecondaryStats()}
    </div>
  );
};

export default ComplianceStats;