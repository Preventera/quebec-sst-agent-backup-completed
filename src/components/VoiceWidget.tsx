import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, X, Maximize2, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface VoiceWidgetProps {
  className?: string;
}

const VoiceWidget = ({ className }: VoiceWidgetProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>("");

  const handleQuickVoice = async () => {
    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    try {
      setIsListening(true);
      toast({
        title: "Écoute rapide...",
        description: "Posez votre question rapidement",
      });

      // Simulation capture audio
      setTimeout(() => {
        setIsListening(false);
        setIsProcessing(true);
        
        // Simulation traitement
        setTimeout(() => {
          setIsProcessing(false);
          setLastResponse("Selon la LMRSST, vous devez effectuer une formation annuelle obligatoire pour tous vos employés.");
          
          toast({
            title: "Réponse prête",
            description: "Cliquez pour écouter la réponse complète",
          });
        }, 2000);
      }, 3000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  const handleOpenFullAssistant = () => {
    setIsOpen(false);
    navigate('/assistant-vocal');
  };

  const getStatusColor = () => {
    if (isListening) return "bg-red-500 animate-pulse";
    if (isProcessing) return "bg-yellow-500 animate-pulse";
    return "bg-primary";
  };

  return (
    <>
      {/* Bouton flottant */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={handleQuickVoice}
          size="lg"
          className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${getStatusColor()}`}
          disabled={isProcessing}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
        
        {/* Indicateur d'état */}
        {(isListening || isProcessing) && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="secondary" className="text-xs animate-bounce">
              {isListening ? "Écoute" : "Traitement"}
            </Badge>
          </div>
        )}
      </div>

      {/* Dialog modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Assistant Vocal Rapide</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenFullAssistant}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Mode complet
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* État actuel */}
            <div className="text-center p-6">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${getStatusColor()}`}>
                {isListening ? (
                  <MicOff className="h-10 w-10 text-white" />
                ) : (
                  <Mic className="h-10 w-10 text-white" />
                )}
              </div>
              
              <p className="text-lg font-medium">
                {isListening && "Je vous écoute..."}
                {isProcessing && "Analyse en cours..."}
                {!isListening && !isProcessing && "Prêt à vous aider"}
              </p>
              
              <p className="text-sm text-muted-foreground mt-2">
                {isListening && "Parlez maintenant"}
                {isProcessing && "Traitement de votre demande"}
                {!isListening && !isProcessing && "Cliquez sur le micro pour commencer"}
              </p>
            </div>

            {/* Dernière réponse */}
            {lastResponse && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Dernière réponse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{lastResponse}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => toast({ title: "Lecture audio", description: "Fonctionnalité en cours d'implémentation" })}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Écouter
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleQuickVoice}
                disabled={isProcessing}
                className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Arrêter
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Nouvelle question
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceWidget;