import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowRight, Zap } from "lucide-react";

const DiagnosticButton = () => {
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
        >
          Commencer le diagnostic
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default DiagnosticButton;