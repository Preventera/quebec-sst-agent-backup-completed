import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, ChevronRight } from "lucide-react";

const AlertPanel = () => {
  const alerts = [
    {
      id: 1,
      title: "Formation SST obligatoire",
      description: "Formation des représentants SST - Art. 90 LMRSST",
      priority: "critical",
      dueDate: "2024-01-15",
      category: "Formation"
    },
    {
      id: 2,
      title: "Mise à jour du programme de prévention",
      description: "Révision annuelle requise - Art. 58 LMRSST",
      priority: "medium",
      dueDate: "2024-02-01",
      category: "Documentation"
    },
    {
      id: 3,
      title: "Inspection des équipements",
      description: "Vérification des dispositifs de protection",
      priority: "medium",
      dueDate: "2024-01-30",
      category: "Inspection"
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critique</Badge>;
      case "medium":
        return <Badge variant="secondary">Moyen</Badge>;
      default:
        return <Badge variant="outline">Faible</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertes et échéances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getPriorityBadge(alert.priority)}
                <Badge variant="outline" className="text-xs">
                  {alert.category}
                </Badge>
              </div>
              <h4 className="font-medium mb-1">{alert.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Échéance: {formatDate(alert.dueDate)}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full">
            Voir toutes les alertes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertPanel;