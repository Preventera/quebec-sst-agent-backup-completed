import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActionLogger } from "@/hooks/useActionLogger";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useToast } from "@/hooks/use-toast";

const DiagnosticButton = () => {
  const navigate = useNavigate();
  const { logComplianceAction } = useActionLogger();
  const { announce } = useAccessibility();
  const { toast } = useToast();

  const handleStartDiagnostic = async () => {
    try {
      // Log compliance action for audit trail
      await logComplianceAction(
        'start_diagnostic',
        'DiagnosticButton',
        'Art. 101 LMRSST',
        { 
          feature: 'LMRSST Compliance Diagnostic',
          user_intent: 'evaluate_compliance'
        }
      );

      // Accessibility announcement
      announce('Navigation vers le diagnostic de conformité LMRSST', 'assertive');
      
      // Success feedback
      toast({
        title: "Diagnostic démarré",
        description: "Redirection vers l'évaluation de conformité LMRSST",
        duration: 3000,
      });

      navigate('/diagnostic');
    } catch (error) {
      console.error('Error starting diagnostic:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le diagnostic. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Diagnostic SST Intelligent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-primary-foreground/90">
          Évaluez automatiquement votre conformité LMRSST avec notre agent DiagSST. 
          Analyse personnalisée selon votre secteur et taille d'entreprise.
        </p>
        
        <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
          <Zap className="h-4 w-4" />
          <span>Powered by AgenticSST™ Multi-Agents</span>
        </div>
        
        <Button 
          size="lg" 
          className="w-full bg-white text-primary hover:bg-white/90 font-semibold"
          onClick={handleStartDiagnostic}
          aria-describedby="diagnostic-description"
          aria-label="Commencer le diagnostic de conformité LMRSST - Évaluation automatique selon l'article 101"
        >
          Commencer le diagnostic
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
        
        <div id="diagnostic-description" className="sr-only">
          Démarrer une évaluation automatisée de votre conformité à la Loi modernisant le régime de santé et sécurité du travail. 
          Analyse personnalisée selon votre secteur d'activité et la taille de votre entreprise, conforme à l'article 101 LMRSST.
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticButton;