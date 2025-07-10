import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Settings, Download } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      icon: FileText,
      title: "Générer rapport",
      description: "Rapport de conformité PDF",
      action: "Générer"
    },
    {
      icon: MessageSquare,
      title: "Consulter Conversa",
      description: "Assistant IA conversationnel",
      action: "Ouvrir"
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Paramètres entreprise",
      action: "Configurer"
    },
    {
      icon: Download,
      title: "Export données",
      description: "Exporter les données",
      action: "Télécharger"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex items-start gap-3 justify-start"
            >
              <action.icon className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;