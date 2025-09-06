import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Settings, Download, Info, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const QuickActions = () => {
  const navigate = useNavigate();

  const handleAction = (index: number) => {
    switch (index) {
      case 0: // Générer rapport
        navigate('/docugen');
        break;
      case 1: // Fonctions Agiles SST
        navigate('/agile-functions');
        break;
      case 2: // Configuration
        toast.info("Page de configuration en cours de développement");
        break;
      case 3: // Export données
        navigate('/conversation-logs');
        break;
      default:
        break;
    }
  };

  const actions = [
    {
      icon: FileText,
      title: "Générer rapport",
      description: "Rapport de conformité PDF",
      action: "Générer"
    },
    {
      icon: Zap,
      title: "Fonctions Agiles SST",
      description: "200+ actions de conformité",
      action: "Explorer"
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
    <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-accent" />
            Actions prioritaires
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Actions recommandées pour maintenir et améliorer votre conformité LMRSST</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex items-center gap-3 justify-between hover:bg-accent/10 hover:border-accent/30 transition-all duration-200 group"
              onClick={() => handleAction(index)}
            >
              <div className="flex items-center gap-3">
                <action.icon className="h-5 w-5 text-primary group-hover:text-accent transition-colors" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;