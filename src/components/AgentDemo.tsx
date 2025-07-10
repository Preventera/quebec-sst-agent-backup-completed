import { useState } from "react";
import { MessageSquare, Send, Bot, User, Brain, Search, FileText, AlertTriangle, FileCheck, Users, Cog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    description: "Je génère vos plans d'action personnalisés",
    icon: FileText,
    color: "warning",
    capabilities: ["Priorisation intelligente", "Plans sectoriels", "Suivi d'avancement"],
    responses: [
      "Basé sur votre diagnostic, je vais créer un plan d'action structuré par priorité.",
      "Action critique #1: Créer le programme de prévention (échéance: 30 jours)",
      "J'ai généré un plan adapté à votre secteur avec 12 actions réparties sur 6 mois.",
      "Plan mis à jour ! 3 actions complétées, 5 en cours, échéance respectée à 85%."
    ]
  },
  {
    name: "Sentinelle",
    role: "Alertes réglementaires",
    description: "Je surveille vos échéances et obligations",
    icon: AlertTriangle,
    color: "destructive",
    capabilities: ["Surveillance continue", "Alertes multi-canaux", "Escalade intelligente"],
    responses: [
      "🚨 ALERTE: Formation du comité SST expire dans 15 jours !",
      "Rappel: Inspection annuelle programmée le 15 mars - Checklist envoyée.",
      "Notification envoyée sur Teams et par email. Voulez-vous programmer un rappel ?",
      "Détection d'un incident non déclaré. Procédure d'urgence activée."
    ]
  },
  {
    name: "DocuGen",
    role: "Générateur de rapports",
    description: "Je compile vos rapports de conformité",
    icon: FileCheck,
    color: "success",
    capabilities: ["Rapports PDF", "Export CNESST", "Documentation légale"],
    responses: [
      "Je génère votre rapport de conformité complet avec signature numérique.",
      "Rapport PDF créé: 23 pages incluant diagnostic, plan d'action et références légales.",
      "Export JSON formaté pour soumission CNESST - Validation réussie ✓",
      "Rapport bilingue généré avec annexes techniques et justifications légales."
    ]
  },
  {
    name: "CoSS",
    role: "Comité SST virtuel",
    description: "Je simule les décisions de votre comité SST",
    icon: Users,
    color: "primary",
    capabilities: ["Vote collectif", "Réunions virtuelles", "Décisions consensuelles"],
    responses: [
      "Convocation du comité SST virtuel. 5 membres connectés pour validation.",
      "Vote sur le programme de prévention: 4 pour, 1 abstention. ✅ Approuvé !",
      "Le comité recommande l'ajout d'un RSS spécialisé en ergonomie.",
      "Réunion mensuelle programmée. Ordre du jour: suivi des 3 incidents récents."
    ]
  },
  {
    name: "ALSS",
    role: "Agent de liaison SST",
    description: "Je représente les travailleurs dans les PME",
    icon: User,
    color: "secondary",
    capabilities: ["Médiation conflits", "Représentation employés", "Escalade CNESST"],
    responses: [
      "Un employé m'a contacté concernant un risque. Je traite sa demande confidentiellement.",
      "Recommandation transmise à l'employeur: améliorer l'éclairage au poste de soudure.",
      "Médiation en cours pour résoudre le différend sur les EPI obligatoires.",
      "Escalade vers CNESST initiée. Dossier préparé avec preuves et témoignages."
    ]
  }
];

const AgentDemo = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(demoAgents[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulation de réponse d'agent
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
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  const startDemo = (demoType: string) => {
    const demoMessages: Record<string, Message[]> = {
      diagnostic: [
        {
          id: '1',
          content: "Je voudrais faire un diagnostic de conformité pour mon entreprise",
          sender: 'user',
          timestamp: new Date()
        },
        {
          id: '2',
          content: "Parfait ! DiagSST va s'occuper de votre évaluation. Je vais analyser votre conformité LMRSST. Combien d'employés compte votre entreprise ?",
          sender: 'agent',
          agentName: 'Hugo',
          timestamp: new Date()
        }
      ],
      legal: [
        {
          id: '1',
          content: "Quelles sont les obligations pour former un comité SST ?",
          sender: 'user',
          timestamp: new Date()
        },
        {
          id: '2',
          content: "LexiNorm peut vous aider ! L'article 78 de la LMRSST exige la formation du comité SST dans les 60 jours suivant sa constitution. Voici les détails...",
          sender: 'agent',
          agentName: 'Hugo',
          timestamp: new Date()
        }
      ],
      alert: [
        {
          id: '1',
          content: "J'ai reçu une alerte sur mon tableau de bord",
          sender: 'user',
          timestamp: new Date()
        },
        {
          id: '2',
          content: "🚨 Sentinelle a détecté: Formation du comité SST expire dans 15 jours ! Voulez-vous que je programme les actions correctives ?",
          sender: 'agent',
          agentName: 'Hugo',
          timestamp: new Date()
        }
      ]
    };

    setMessages(demoMessages[demoType] || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mode Démo - Agents AgenticSST</h2>
          <p className="text-muted-foreground">
            Testez les interactions avec nos agents intelligents sans backend
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Simulation Interactive
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sélection d'agent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agents Disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoAgents.map((agent) => {
              const IconComponent = agent.icon;
              const isSelected = selectedAgent.name === agent.name;
              
              return (
                <Button
                  key={agent.name}
                  variant={isSelected ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.role}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Interface de chat */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  <selectedAgent.icon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{selectedAgent.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Boutons de démo rapide */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => startDemo('diagnostic')}
              >
                Démo Diagnostic
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startDemo('legal')}
              >
                Démo Légal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startDemo('alert')}
              >
                Démo Alerte
              </Button>
            </div>

            {/* Zone de chat */}
            <Card className="bg-muted/10">
              <ScrollArea className="h-80 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Commencez une conversation ou utilisez une démo</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'agent' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border'
                        }`}
                      >
                        {message.sender === 'agent' && message.agentName && (
                          <div className="text-xs text-muted-foreground mb-1">
                            {message.agentName}
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {message.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-background border px-3 py-2 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>

            {/* Zone de saisie */}
            <div className="flex gap-2">
              <Input
                placeholder="Tapez votre message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Capacités de l'agent */}
            <div>
              <h4 className="font-medium mb-2">Capacités de {selectedAgent.name}</h4>
              <div className="flex flex-wrap gap-1">
                {selectedAgent.capabilities.map((capability, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentDemo;