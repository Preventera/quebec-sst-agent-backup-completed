import { useState } from "react";
import { MessageSquare, Send, Bot, User, Brain, Search, FileText, AlertTriangle, FileCheck, Users, Cog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useHITLAgents } from '@/lib/hitlAgentsService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agentName?: string;
  timestamp: Date;
}

interface Agent {
  name: string;
  role: string;
  description: string;
  icon: any;
  color: string;
  responses: string[];
  capabilities: string[];
}

const demoAgents: Agent[] = [
  {
    name: "Hugo",
    role: "Orchestrateur principal",
    description: "Je coordonne tous les agents selon votre entreprise",
    icon: Cog,
    color: "primary",
    capabilities: ["Routage intelligent", "Coordination multi-agents", "Gestion de session"],
    responses: [
      "Bonjour ! Je vais analyser votre entreprise et diriger votre demande vers le bon agent spécialisé.",
      "Avec 25 employés, je vous dirige vers notre agent CoSS pour la gestion de votre comité SST.",
      "Pour une entreprise de votre taille, l'agent ALSS sera plus adapté à vos besoins.",
      "Je détecte une question légale. Je transfère votre demande à LexiNorm, notre expert réglementaire."
    ]
  },
  {
    name: "DiagSST",
    role: "Diagnostic conformité",
    description: "J'évalue votre conformité LMRSST",
    icon: Brain,
    color: "secondary",
    capabilities: ["Diagnostic automatisé", "Analyse de conformité", "Détection des écarts"],
    responses: [
      "Je vais analyser votre conformité LMRSST. Combien d'employés compte votre entreprise ?",
      "Parfait ! Pour une PME manufacturière, je dois vérifier 23 obligations principales.",
      "Je détecte l'absence d'un programme de prévention. C'est une non-conformité critique !",
      "Votre diagnostic révèle 78% de conformité avec 4 actions critiques à prioriser."
    ]
  },
  {
    name: "LexiNorm",
    role: "Référentiel légal",
    description: "Je fournis les interprétations légales LMRSST",
    icon: Search,
    color: "accent",
    capabilities: ["Recherche légale", "Interprétation articles", "Veille réglementaire"],
    responses: [
      "Quelle disposition de la LMRSST souhaitez-vous que je clarifie ?",
      "L'article 78 exige la formation du comité SST dans les 60 jours suivant sa constitution.",
      "Un RSS est obligatoire pour les entreprises de 20 employés et plus selon l'article 88.",
      "Voici l'interprétation officielle avec jurisprudence et exemples pratiques."
    ]
  },
  {
    name: "Prioris",
    role: "Plan d'action",
    description: "Je génère les plans d'action prioritaires",
    icon: FileText,
    color: "warning",
    capabilities: ["Priorisation intelligente", "Plans d'action", "Échéanciers"],
    responses: [
      "Basé sur votre diagnostic, voici les 5 actions prioritaires à mettre en place.",
      "L'action la plus critique est la mise en place du comité SST (échéance: 30 jours).",
      "Je recommande de commencer par la formation RSS avant le programme de prévention.",
      "Voici votre plan d'action personnalisé avec budget estimé et ressources nécessaires."
    ]
  },
  {
    name: "Sentinelle",
    role: "Alertes réglementaires",
    description: "Je surveille et alerte sur les échéances",
    icon: AlertTriangle,
    color: "destructive",
    capabilities: ["Surveillance continue", "Alertes préventives", "Monitoring conformité"],
    responses: [
      "ALERTE: Votre formation RSS expire dans 15 jours !",
      "Je détecte une non-conformité émergente dans votre secteur d'activité.",
      "Rappel: Réunion comité SST obligatoire avant le 30 du mois.",
      "Nouvelle réglementation CNESST en vigueur - analyse d'impact en cours."
    ]
  },
  {
    name: "DocuGen",
    role: "Générateur de rapports",
    description: "Je compile les rapports de conformité",
    icon: FileCheck,
    color: "success",
    capabilities: ["Génération automatique", "Rapports CNESST", "Documentation"],
    responses: [
      "Je prépare votre rapport de conformité pour inspection CNESST.",
      "Document généré: Programme de prévention adapté à votre secteur.",
      "Votre registre d'accidents est maintenant prêt pour audit.",
      "Export terminé: 23 documents de conformité générés avec références légales."
    ]
  },
  {
    name: "CoSS",
    role: "Comité SST virtuel",
    description: "Je simule les décisions du comité SST",
    icon: Users,
    color: "primary",
    capabilities: ["Consultation paritaire", "Prise de décision", "Recommandations"],
    responses: [
      "En tant que comité SST, nous recommandons l'achat d'EPI supplémentaires.",
      "Le comité approuve à l'unanimité le nouveau programme de formation.",
      "Décision: Investigation requise sur l'accident du 15 mars selon l'art. 62.",
      "Le comité demande une inspection supplémentaire du département production."
    ]
  },
  {
    name: "ALSS",
    role: "Agent de liaison SST",
    description: "Je gère la SST dans les petites entreprises",
    icon: User,
    color: "secondary",
    capabilities: ["Liaison externe", "Formation adaptée", "Support PME"],
    responses: [
      "Comme ALSS, je vous accompagne dans votre démarche de conformité LMRSST.",
      "Je planifie vos formations SST avec l'ASP de votre secteur.",
      "Votre programme de prévention PME est maintenant conforme et opérationnel.",
      "Je coordonne avec la CNESST pour votre première inspection d'établissement."
    ]
  }
];

const AgentDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(demoAgents[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { validateAgentAction } = useHITLAgents();

  // Fonction d'exécution avec HITL intégré
  const executeAgentWithHITL = async (agent: Agent) => {
    const context = {
      agentName: agent.name as any,
      action: `Exécution ${agent.role}`,
      companyProfile: {
        name: "Entreprise Demo",
        size: 25,
        sector: "Démonstration"
      },
      scenario: `Démonstration agent ${agent.name}`,
      criticalityLevel: agent.name === 'Sentinelle' ? 'critical' as const :
                       agent.name === 'DiagSST' ? 'high' as const :
                       agent.name === 'Hugo' ? 'high' as const : 'medium' as const,
      legalBasis: agent.name === 'LexiNorm' ? ['LMRSST Art. 88-91', 'RSST'] :
                  agent.name === 'DiagSST' ? ['LMRSST Art. 88-102'] :
                  agent.name === 'CoSS' ? ['LMRSST Art. 78', 'Art. 90'] :
                  ['LMRSST générale'],
      expectedOutputs: agent.capabilities
    };

    // Validation HITL AVANT exécution
    const validation = await validateAgentAction(context);
    
    if (!validation.approved) {
      toast({
        title: `${agent.name} - Exécution annulée`,
        description: "Validation HITL rejetée par l'utilisateur",
        variant: "destructive"
      });
      return;
    }

    // Agent approuvé - exécuter
    toast({
      title: `${agent.name} - Validation HITL approuvée`,
      description: "Agent autorisé avec audit centralisé",
    });

    setIsProcessing(true);
    
    // Simulation d'exécution agent (remplacer par votre logique)
    setTimeout(() => {
      const randomResponse = agent.responses[Math.floor(Math.random() * agent.responses.length)];
      
      const newMessage: Message = {
        id: Date.now().toString(),
        content: randomResponse,
        sender: 'agent',
        agentName: agent.name,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsProcessing(false);
      
      toast({
        title: `${agent.name} exécuté avec succès`,
        description: "Réponse générée avec traçabilité HITL",
      });
    }, 2000);
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");

    // Simulation de réponse agent
    setTimeout(() => {
      const randomResponse = selectedAgent.responses[Math.floor(Math.random() * selectedAgent.responses.length)];
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: 'agent',
        agentName: selectedAgent.name,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Sélection d'agent */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {demoAgents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <Card 
              key={agent.name} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAgent.name === agent.name ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedAgent(agent)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <IconComponent className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {agent.role}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600 mb-3">{agent.description}</p>
                
                {/* BOUTON EXÉCUTER AVEC HITL */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    executeAgentWithHITL(agent);
                  }}
                  disabled={isProcessing}
                  className="w-full text-xs"
                  variant={agent.name === selectedAgent.name ? "default" : "outline"}
                >
                  {isProcessing && selectedAgent.name === agent.name 
                    ? "Exécution..." 
                    : "Exécuter (HITL)"
                  }
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Zone de chat */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation avec {selectedAgent.name}
                <Badge variant="secondary">{selectedAgent.role}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 mb-4 p-4 border rounded-lg">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune conversation en cours</p>
                    <p className="text-sm">Envoyez un message ou exécutez un agent pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-2 max-w-[80%] ${
                          message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`rounded-lg p-3 ${
                            message.sender === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {message.agentName && (
                              <div className="text-xs font-semibold mb-1 opacity-75">
                                {message.agentName}
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <div className="text-xs opacity-75 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder={`Posez votre question à ${selectedAgent.name}...`}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={!currentMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations agent */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedAgent.icon className="h-5 w-5" />
                {selectedAgent.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Rôle</h4>
                <p className="text-sm text-gray-600">{selectedAgent.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Capacités</h4>
                <div className="space-y-1">
                  {selectedAgent.capabilities.map((capability, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-blue-800">Validation HITL</h4>
                <p className="text-xs text-blue-700">
                  Chaque exécution nécessite une validation humaine avec audit centralisé 
                  selon votre architecture Zero-Trust.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDemo;