import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Send, MessageSquare, Play, RotateCcw } from "lucide-react";
import { useConversationLogger } from "@/hooks/useConversationLogger";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  agent_name?: string;
}

const AgentSimulator = () => {
  const { toast } = useToast();
  const { logAgentInteraction } = useConversationLogger();
  
  const [selectedAgent, setSelectedAgent] = useState("Hugo");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const agents = ["Hugo", "DiagSST", "LexiNorm", "Prioris", "Sentinelle", "DocuGen", "CoSS", "ALSS"];

  // Réponses simulées pour démonstration
  const simulatedResponses: Record<string, string[]> = {
    "Hugo": [
      "Je suis Hugo, l'orchestrateur principal. Pour une entreprise de votre taille, je recommande de commencer par un diagnostic avec DiagSST.",
      "Selon vos besoins, je vais vous rediriger vers l'agent approprié. Avez-vous moins de 20 employés ?",
      "Je coordonne tous nos agents spécialisés. Quel est votre secteur d'activité principal ?"
    ],
    "DiagSST": [
      "D'après votre questionnaire, je détecte 3 non-conformités majeures : absence de comité SST, formation manquante, et registre d'accidents incomplet.",
      "Votre programme de prévention nécessite une mise à jour selon l'article 58 de la LMRSST.",
      "Diagnostic terminé : 75% de conformité. Principales améliorations requises dans la formation du personnel."
    ],
    "LexiNorm": [
      "Selon l'article 68 de la LMRSST, les entreprises de 20 employés et plus doivent constituer un comité de santé et de sécurité.",
      "L'article 51 stipule que l'employeur doit prendre les mesures nécessaires pour protéger la santé et assurer la sécurité et l'intégrité physique du travailleur.",
      "Les délais pour la formation SST sont définis à l'article 62 : avant l'affectation au poste de travail."
    ]
  };

  const simulateAgentResponse = (agentName: string, userMessage: string): string => {
    const responses = simulatedResponses[agentName] || [
      `Je suis ${agentName}, votre agent spécialisé AgenticSST. Comment puis-je vous aider avec la conformité LMRSST ?`
    ];
    
    // Sélection intelligente de la réponse basée sur le message
    if (userMessage.toLowerCase().includes("diagnostic")) {
      return responses.find(r => r.includes("diagnostic")) || responses[0];
    }
    if (userMessage.toLowerCase().includes("article") || userMessage.toLowerCase().includes("loi")) {
      return responses.find(r => r.includes("article")) || responses[0];
    }
    if (userMessage.toLowerCase().includes("formation")) {
      return responses.find(r => r.includes("formation")) || responses[0];
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    setIsSimulating(true);
    
    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simuler un délai de traitement
    setTimeout(async () => {
      const agentResponse = simulateAgentResponse(selectedAgent, userInput);
      
      // Ajouter la réponse de l'agent
      const agentMessage: Message = {
        id: crypto.randomUUID(),
        type: "agent",
        content: agentResponse,
        timestamp: new Date(),
        agent_name: selectedAgent
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // Logger la conversation
      try {
        await logAgentInteraction(
          selectedAgent,
          userInput,
          agentResponse,
          {
            simulation: true,
            timestamp: new Date().toISOString()
          }
        );
        
        toast({
          title: "Conversation loggée",
          description: `Interaction avec ${selectedAgent} enregistrée pour analyse`,
        });
      } catch (error) {
        console.error("Erreur lors du logging:", error);
      }
      
      setIsSimulating(false);
    }, 1000 + Math.random() * 2000); // Délai aléatoire de 1-3 secondes
    
    setUserInput("");
  };

  const resetConversation = () => {
    setMessages([]);
    setUserInput("");
  };

  const runQuickDemo = async () => {
    const demoScenarios = [
      { user: "Bonjour, j'aimerais faire un diagnostic de conformité pour mon entreprise", agent: "Hugo" },
      { user: "Nous avons 25 employés dans le secteur manufacturier", agent: "DiagSST" },
      { user: "Quels sont les articles de loi concernant les comités SST ?", agent: "LexiNorm" }
    ];

    setMessages([]);
    
    for (const scenario of demoScenarios) {
      setSelectedAgent(scenario.agent);
      setUserInput(scenario.user);
      
      // Attendre un peu avant d'envoyer
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendMessage();
      
      // Attendre que la réponse soit traitée
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Simulateur d'Agents AgenticSST
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Agent actuel :</span>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={runQuickDemo}>
              <Play className="h-4 w-4 mr-2" />
              Démo rapide
            </Button>
            <Button variant="outline" size="sm" onClick={resetConversation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Zone de conversation */}
          <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-muted/20 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-20">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Commencez une conversation avec un agent AgenticSST</p>
                <p className="text-sm mt-2">Toutes les interactions seront automatiquement loggées pour analyse</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      message.type === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background border"
                    }`}>
                      {message.type === "agent" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4" />
                          <Badge variant="outline" className="text-xs">
                            {message.agent_name}
                          </Badge>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isSimulating && (
                  <div className="flex justify-start">
                    <div className="bg-background border rounded-lg p-3 max-w-[70%]">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4" />
                        <Badge variant="outline" className="text-xs">
                          {selectedAgent}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="animate-pulse bg-muted-foreground rounded-full h-2 w-2"></div>
                        <div className="animate-pulse bg-muted-foreground rounded-full h-2 w-2 delay-75"></div>
                        <div className="animate-pulse bg-muted-foreground rounded-full h-2 w-2 delay-150"></div>
                        <span className="text-xs text-muted-foreground ml-2">Agent en train de répondre...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="flex gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Tapez votre message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={isSimulating}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!userInput.trim() || isSimulating}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setUserInput("Bonjour, j'aimerais faire un diagnostic de conformité")}
              className="text-xs"
            >
              Demander un diagnostic
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setUserInput("Quels sont les articles de loi pour les comités SST ?")}
              className="text-xs"
            >
              Question légale
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setUserInput("Nous avons 25 employés, que devons-nous faire ?")}
              className="text-xs"
            >
              Contexte entreprise
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentSimulator;