import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { HelpTooltip } from "./LegalTooltip";

const ComplianceStats = () => {
  const stats = [
    {
      title: "Conformité générale",
      value: "78%",
      icon: TrendingUp,
      status: "warning",
      description: "Évaluation globale LMRSST",
      helpText: "Score basé sur l'analyse de vos obligations légales selon les articles 51, 90, 101 de la LMRSST",
      statusIcon: AlertTriangle
    },
    {
      title: "Obligations respectées",
      value: "23/30",
      icon: CheckCircle,
      status: "success",
      description: "Articles conformes",
      helpText: "Nombre d'obligations réglementaires actuellement en conformité avec la LMRSST",
      statusIcon: CheckCircle
    },
    {
      title: "Actions critiques",
      value: "4",
      icon: XCircle,
      status: "destructive",
      description: "Nécessitent action immédiate",
      helpText: "Actions prioritaires pour maintenir la conformité réglementaire et éviter les sanctions",
      statusIcon: XCircle
    },
    {
      title: "Échéances à venir",
      value: "7",
      icon: Clock,
      status: "warning",
      description: "Dans les 30 prochains jours",
      helpText: "Dates limites pour les formations, rapports et mises à jour réglementaires obligatoires",
      statusIcon: AlertTriangle
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <HelpTooltip content={stat.helpText} title={stat.title}>
              <CardTitle className="text-sm font-medium text-foreground">
                {stat.title}
              </CardTitle>
            </HelpTooltip>
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
      ))}
    </div>
  );
};

export default ComplianceStats;