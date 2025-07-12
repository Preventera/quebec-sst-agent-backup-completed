import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mic, MicOff, Volume2, VolumeX, Settings, History, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

const AssistantVocal = () => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Bonjour ! Je suis votre assistant SST vocal. Posez-moi vos questions sur la sécurité au travail.',
      timestamp: new Date()
    }
  ]);
  const [volume, setVolume] = useState(0.8);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartListening = async () => {
    try {
      setIsListening(true);
      toast({
        title: "Écoute en cours...",
        description: "Parlez maintenant, je vous écoute.",
      });
      
      // Simulation - remplacer par vraie capture audio
      setTimeout(() => {
        setIsListening(false);
        setIsProcessing(true);
        handleStopListening();
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

  const handleStopListening = () => {
    setIsProcessing(true);
    
    // Simulation de transcription et traitement
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: "Quelles sont les obligations SST pour une PME de 50 employés ?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsProcessing(false);
      
      // Simulation réponse IA
      setTimeout(() => {
        setIsSpeaking(true);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: "Pour une PME de 50 employés, vous devez : 1) Désigner un responsable SST, 2) Mettre en place un comité de santé-sécurité, 3) Effectuer une évaluation des risques annuelle, 4) Organiser des formations obligatoires pour tous les employés.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Simulation lecture audio
        setTimeout(() => {
          setIsSpeaking(false);
        }, 4000);
      }, 1000);
    }, 2000);
  };

  const handleClearHistory = () => {
    setMessages([messages[0]]); // Garde le message de bienvenue
    toast({
      title: "Historique effacé",
      description: "La conversation a été réinitialisée",
    });
  };

  const getStatusColor = () => {
    if (isListening) return "bg-red-500 animate-pulse";
    if (isProcessing) return "bg-yellow-500 animate-pulse";
    if (isSpeaking) return "bg-blue-500 animate-pulse";
    return "bg-muted";
  };

  const getStatusText = () => {
    if (isListening) return "Écoute en cours...";
    if (isProcessing) return "Traitement...";
    if (isSpeaking) return "Assistant en train de parler...";
    return "Prêt à vous écouter";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                <h1 className="text-2xl font-bold">Assistant Vocal SST</h1>
              </div>
              <Badge variant="secondary">{getStatusText()}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          
          {/* Zone de conversation principale */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardContent className="flex-1 p-0 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <Separator />

              {/* Contrôles vocaux */}
              <div className="p-6">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={isListening ? () => setIsListening(false) : handleStartListening}
                    disabled={isProcessing || isSpeaking}
                    className={`h-16 w-16 rounded-full ${
                      isListening ? 'bg-red-500 hover:bg-red-600' : ''
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {isListening ? "Cliquez pour arrêter l'écoute" : "Cliquez sur le micro pour commencer"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar d'aide */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <History className="h-5 w-5" />
                Suggestions
              </h3>
              
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium mb-2">Questions fréquentes :</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Obligations légales SST</li>
                    <li>• Formation des employés</li>
                    <li>• Évaluation des risques</li>
                    <li>• Équipements de protection</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="text-sm">
                  <p className="font-medium mb-2">Commandes vocales :</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• "Génère un rapport"</li>
                    <li>• "Liste mes obligations"</li>
                    <li>• "Aide-moi avec..."</li>
                    <li>• "Recommandations"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssistantVocal;