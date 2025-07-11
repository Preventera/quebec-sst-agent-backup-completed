import { useState } from "react";
import { Play, CheckCircle, XCircle, Clock, Brain, Search, FileText, AlertTriangle, FileCheck, Users, User, Cog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface TestScenario {
  id: number;
  title: string;
  description: string;
  expectedResult: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

interface Agent {
  name: string;
  role: string;
  description: string;
  icon: any;
  color: string;
  scenarios: TestScenario[];
}

const testAgents: Agent[] = [
  {
    name: "Hugo",
    role: "Orchestrateur principal",
    description: "Coordonne tous les agents selon la taille et le secteur de l'entreprise",
    icon: Cog,
    color: "primary",
    scenarios: [
      { id: 1, title: "Routage vers CoSS pour entreprise de 25 employés", description: "Tester le routage automatique vers l'agent CoSS", expectedResult: "Redirection vers CoSS avec paramètres entreprise", status: 'pending' },
      { id: 2, title: "Routage vers ALSS pour entreprise de 12 employés", description: "Tester le routage automatique vers l'agent ALSS", expectedResult: "Redirection vers ALSS avec paramètres PME", status: 'pending' },
      { id: 3, title: "Redirection vers LexiNorm après demande légale", description: "Tester la redirection contextuelle vers LexiNorm", expectedResult: "Consultation LexiNorm avec contexte préservé", status: 'pending' },
      { id: 4, title: "Redémarrage intelligent après session incomplète", description: "Reprendre une session interrompue", expectedResult: "Reprise au point d'arrêt avec données sauvegardées", status: 'pending' },
      { id: 5, title: "Interruption contrôlée d'un processus par l'utilisateur", description: "Gérer l'interruption manuelle d'un processus", expectedResult: "Sauvegarde état et confirmation utilisateur", status: 'pending' }
    ]
  },
  {
    name: "DiagSST",
    role: "Diagnostic conformité",
    description: "Évalue la conformité réglementaire selon les réponses utilisateur",
    icon: Brain,
    color: "secondary",
    scenarios: [
      { id: 11, title: "Diagnostic complet PME manufacturière 30 employés", description: "Évaluation complète secteur manufacturier", expectedResult: "Rapport détaillé avec obligations spécifiques", status: 'pending' },
      { id: 12, title: "Diagnostic pour entreprise sans programme de prévention", description: "Identifier l'absence de programme", expectedResult: "Alerte critique + plan d'action prioritaire", status: 'pending' },
      { id: 13, title: "Diagnostic après réponse incomplète", description: "Gérer les données manquantes", expectedResult: "Demande clarifications + diagnostic partiel", status: 'pending' },
      { id: 14, title: "Évaluation multi-établissement avec regroupement", description: "Diagnostic pour plusieurs sites", expectedResult: "Rapport consolidé par établissement", status: 'pending' },
      { id: 15, title: "Détection absence de registre des incidents", description: "Identifier registres manquants", expectedResult: "Non-conformité critique détectée", status: 'pending' }
    ]
  },
  {
    name: "LexiNorm",
    role: "Référentiel légal",
    description: "Fournit les interprétations des articles de la LMRSST",
    icon: Search,
    color: "accent",
    scenarios: [
      { id: 21, title: "Recherche article sur formation du comité SST", description: "Consultation article formation comité", expectedResult: "Article LMRSST avec interprétation claire", status: 'pending' },
      { id: 22, title: "Obligation de présence d'un RSS", description: "Clarifier l'obligation RSS", expectedResult: "Conditions et exemptions RSS expliquées", status: 'pending' },
      { id: 23, title: "Obligation de documenter les analyses de risques", description: "Exigences documentation analyses", expectedResult: "Procédure et modèles fournis", status: 'pending' },
      { id: 24, title: "Conditions de mise en place d'un ALSS", description: "Critères nomination ALSS", expectedResult: "Conditions légales et processus", status: 'pending' },
      { id: 25, title: "Délai légal pour former les membres du comité", description: "Échéances formation obligatoire", expectedResult: "Délais précis et sanctions potentielles", status: 'pending' }
    ]
  },
  {
    name: "Prioris",
    role: "Plan d'action",
    description: "Génère les actions à prioriser selon les écarts détectés",
    icon: FileText,
    color: "warning",
    scenarios: [
      { id: 31, title: "Plan d'action pour 3 non-conformités critiques", description: "Priorisation actions critiques", expectedResult: "Plan structuré par priorité et échéance", status: 'pending' },
      { id: 32, title: "Plan pour absence de comité + registre obsolète", description: "Actions multiples coordonnées", expectedResult: "Plan intégré avec dépendances", status: 'pending' },
      { id: 33, title: "Génération plan sectoriel (mines, chantiers)", description: "Plan adapté au secteur d'activité", expectedResult: "Actions spécialisées par secteur", status: 'pending' },
      { id: 34, title: "Plan simplifié pour entreprise de 7 employés", description: "Plan adapté aux microentreprises", expectedResult: "Actions essentielles simplifiées", status: 'pending' },
      { id: 35, title: "Ajout d'étapes personnalisées manuellement", description: "Personnalisation du plan", expectedResult: "Intégration étapes custom", status: 'pending' }
    ]
  },
  {
    name: "Sentinelle",
    role: "Alertes réglementaires",
    description: "Détecte et alerte sur les échéances et risques de non-conformité",
    icon: AlertTriangle,
    color: "destructive",
    scenarios: [
      { id: 41, title: "Rappel renouvellement formation comité SST", description: "Alerte échéance formation", expectedResult: "Notification 30 jours avant échéance", status: 'pending' },
      { id: 42, title: "Notification échéance inspection annuelle", description: "Rappel inspection obligatoire", expectedResult: "Alerte avec checklist inspection", status: 'pending' },
      { id: 43, title: "Alerte absence programme de prévention", description: "Détection manquement critique", expectedResult: "Alerte urgente + actions immédiates", status: 'pending' },
      { id: 44, title: "Notification suite à déclaration d'incident", description: "Suivi post-incident", expectedResult: "Plan de suivi et échéances", status: 'pending' },
      { id: 45, title: "Push vers Teams et Email simultané", description: "Multi-canal notification", expectedResult: "Envoi coordonné sur tous canaux", status: 'pending' }
    ]
  },
  {
    name: "DocuGen",
    role: "Générateur de rapports",
    description: "Compile les rapports de conformité et les exports CNESST",
    icon: FileCheck,
    color: "success",
    scenarios: [
      { id: 51, title: "Rapport PDF de conformité complète", description: "Génération rapport final", expectedResult: "PDF structuré avec signature", status: 'pending' },
      { id: 52, title: "Export JSON pour API CNESST", description: "Format export officiel", expectedResult: "JSON validé format CNESST", status: 'pending' },
      { id: 53, title: "Rapport sectoriel : entreprise agricole", description: "Spécialisation par secteur", expectedResult: "Rapport adapté secteur agricole", status: 'pending' },
      { id: 54, title: "Rapport multilingue : français / anglais", description: "Support bilinguisme", expectedResult: "Génération dans les deux langues", status: 'pending' },
      { id: 55, title: "Ajout justification légale par obligation", description: "Références légales détaillées", expectedResult: "Chaque point lié à son article", status: 'pending' }
    ]
  },
  {
    name: "CoSS",
    role: "Comité SST virtuel",
    description: "Prend les décisions pour les entreprises de 20+ employés",
    icon: Users,
    color: "primary",
    scenarios: [
      { id: 61, title: "Validation collective programme de prévention", description: "Vote comité sur programme", expectedResult: "Processus de vote et validation", status: 'pending' },
      { id: 62, title: "Simulation réunion avec décision majoritaire", description: "Processus décisionnel collectif", expectedResult: "Compte-rendu avec votes", status: 'pending' },
      { id: 63, title: "Vérification compétences des membres", description: "Audit compétences comité", expectedResult: "Évaluation et recommandations", status: 'pending' },
      { id: 64, title: "Approbation plan proposé par Prioris", description: "Validation plan d'action", expectedResult: "Décision motivée du comité", status: 'pending' },
      { id: 65, title: "Proposition d'ajout d'un RSS", description: "Recommandation ressource", expectedResult: "Justification et profil RSS", status: 'pending' }
    ]
  },
  {
    name: "ALSS",
    role: "Agent de liaison SST",
    description: "Gère la SST dans les entreprises de moins de 20 employés",
    icon: User,
    color: "secondary",
    scenarios: [
      { id: 71, title: "Demande d'assistance d'un employé", description: "Requête employé individuelle", expectedResult: "Traitement confidentiel et suivi", status: 'pending' },
      { id: 72, title: "Transmission recommandation écrite à l'employeur", description: "Communication formelle", expectedResult: "Recommandation documentée", status: 'pending' },
      { id: 73, title: "Simulation d'un conflit SST", description: "Médiation conflit employeur/employé", expectedResult: "Processus de résolution", status: 'pending' },
      { id: 74, title: "Escalade simulée vers la CNESST", description: "Procédure escalation", expectedResult: "Dossier préparé pour CNESST", status: 'pending' },
      { id: 75, title: "Vérification plan d'action simplifié", description: "Validation plan PME", expectedResult: "Plan adapté aux ressources limitées", status: 'pending' }
    ]
  }
];

const TestSuite = () => {
  const [selectedAgent, setSelectedAgent] = useState<string>("Hugo");
  const [runningTests, setRunningTests] = useState<Set<number>>(new Set());
  const [testResults, setTestResults] = useState<Map<number, 'passed' | 'failed'>>(new Map());
  const { toast } = useToast();

  const selectedAgentData = testAgents.find(agent => agent.name === selectedAgent);

  const runTest = async (testId: number, testTitle: string) => {
    setRunningTests(prev => new Set([...prev, testId]));
    
    // Simulation d'un test
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const passed = Math.random() > 0.3; // 70% de chance de réussite
    setTestResults(prev => new Map([...prev, [testId, passed ? 'passed' : 'failed']]));
    setRunningTests(prev => {
      const newSet = new Set(prev);
      newSet.delete(testId);
      return newSet;
    });

    toast({
      title: passed ? "Test réussi" : "Test échoué",
      description: `${testTitle} - ${passed ? 'Résultat conforme' : 'Problème détecté'}`,
      variant: passed ? "default" : "destructive"
    });
  };

  const runAllTests = async () => {
    if (!selectedAgentData) return;
    
    for (const scenario of selectedAgentData.scenarios) {
      await runTest(scenario.id, scenario.title);
      await new Promise(resolve => setTimeout(resolve, 500)); // Délai entre tests
    }
  };

  const getTestStatus = (testId: number) => {
    if (runningTests.has(testId)) return 'running';
    const result = testResults.get(testId);
    if (result) return result;
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 animate-spin text-warning" />;
      case 'passed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Play className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatsForAgent = (agent: Agent) => {
    const total = agent.scenarios.length;
    const passed = agent.scenarios.filter(s => testResults.get(s.id) === 'passed').length;
    const failed = agent.scenarios.filter(s => testResults.get(s.id) === 'failed').length;
    const running = agent.scenarios.filter(s => runningTests.has(s.id)).length;
    
    return { total, passed, failed, running, pending: total - passed - failed - running };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Suite de Tests AgenticSST</h2>
          <p className="text-muted-foreground">
            Interface de test interactive pour valider les 100 scénarios
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {testAgents.reduce((acc, agent) => acc + agent.scenarios.length, 0)} scénarios de test
        </Badge>
      </div>

      <Tabs value={selectedAgent} onValueChange={setSelectedAgent} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-1">
          {testAgents.map((agent) => {
            const IconComponent = agent.icon;
            const stats = getStatsForAgent(agent);
            
            return (
              <TabsTrigger
                key={agent.name}
                value={agent.name}
                className="flex flex-col p-3 h-auto"
              >
                <IconComponent className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{agent.name}</span>
                <div className="flex gap-1 mt-1">
                  {stats.passed > 0 && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                  {stats.failed > 0 && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                  {stats.running > 0 && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {testAgents.map((agent) => (
          <TabsContent key={agent.name} value={agent.name} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-${agent.color}/10`}>
                      <agent.icon className={`h-6 w-6 text-${agent.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{agent.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  <Button onClick={runAllTests} variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Lancer tous les tests
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {Object.entries(getStatsForAgent(agent)).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-xs text-muted-foreground capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                <Accordion type="single" collapsible className="space-y-2">
                  {agent.scenarios.map((scenario) => {
                    const status = getTestStatus(scenario.id);
                    
                    return (
                      <AccordionItem key={scenario.id} value={scenario.id.toString()}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            {getStatusIcon(status)}
                            <div>
                              <div className="font-medium">{scenario.title}</div>
                              <div className="text-sm text-muted-foreground">
                                Scénario #{scenario.id}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">{scenario.description}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Résultat attendu</h4>
                              <p className="text-sm text-muted-foreground">{scenario.expectedResult}</p>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                onClick={() => runTest(scenario.id, scenario.title)}
                                disabled={status === 'running'}
                                size="sm"
                                variant={status === 'passed' ? 'success' : status === 'failed' ? 'destructive' : 'default'}
                              >
                                {status === 'running' ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    En cours...
                                  </>
                                ) : status === 'passed' ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Réussi
                                  </>
                                ) : status === 'failed' ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Relancer
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Lancer le test
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TestSuite;