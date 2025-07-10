import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

const ComplianceStats = () => {
  const stats = [
    {
      title: "Conformité générale",
      value: "78%",
      icon: CheckCircle,
      status: "warning",
      description: "Évaluation globale LMRSST"
    },
    {
      title: "Obligations respectées",
      value: "23/30",
      icon: CheckCircle,
      status: "success",
      description: "Articles conformes"
    },
    {
      title: "Actions critiques",
      value: "4",
      icon: XCircle,
      status: "destructive",
      description: "Nécessitent action immédiate"
    },
    {
      title: "Échéances à venir",
      value: "7",
      icon: Clock,
      status: "warning",
      description: "Dans les 30 prochains jours"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${getIconColor(stat.status)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <Badge variant={getBadgeVariant(stat.status)} className="text-xs">
                {stat.status === "success" && "Conforme"}
                {stat.status === "warning" && "Attention"}
                {stat.status === "destructive" && "Critique"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ComplianceStats;