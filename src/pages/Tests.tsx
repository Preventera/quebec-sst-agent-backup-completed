import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube, Bot, FileText } from "lucide-react";
import TestSuite from "@/components/TestSuite";
import AgentDemo from "@/components/AgentDemo";
import AgentSimulator from "@/components/AgentSimulator";
import Header from "@/components/Header";

const Tests = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Centre de Tests et Démo AgenticSST
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Interface complète pour tester, valider et démontrer les capacités 
            de notre système multi-agents de conformité LMRSST
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scénarios</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-muted-foreground">
                Scénarios de test complets
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agents Testables</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Agents spécialisés disponibles
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Couverture Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">
                Fonctionnalités couvertes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interface principale à onglets */}
        <div className="space-y-6">
          <Tabs defaultValue="suite" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="suite">
                <TestTube className="h-4 w-4 mr-2" />
                Suite de Tests
              </TabsTrigger>
              <TabsTrigger value="demo">
                <Bot className="h-4 w-4 mr-2" />
                Mode Démo
              </TabsTrigger>
              <TabsTrigger value="simulator">
                <Bot className="h-4 w-4 mr-2" />
                Simulateur
              </TabsTrigger>
              <TabsTrigger value="docs">
                <FileText className="h-4 w-4 mr-2" />
                Documentation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suite" className="space-y-6 mt-6">
              <TestSuite />
            </TabsContent>

            <TabsContent value="demo" className="space-y-6 mt-6">
              <AgentDemo />
            </TabsContent>

            <TabsContent value="simulator" className="space-y-6 mt-6">
              <AgentSimulator />
            </TabsContent>

            <TabsContent value="docs" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentation QA - Guide de Test AgenticSST
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Guide de test par agent */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Guide de Test par Agent</h3>
                      
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Hugo - 10 scénarios</Badge>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Routage vers CoSS (25+ employés)</li>
                            <li>• Routage vers ALSS (&lt;20 employés)</li>
                            <li>• Redirection vers LexiNorm</li>
                            <li>• Gestion des sessions interrompues</li>
                            <li>• Adaptation contextuelle dynamique</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">DiagSST - 10 scénarios</Badge>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Diagnostic PME manufacturière</li>
                            <li>• Détection programme manquant</li>
                            <li>• Évaluation multi-établissement</li>
                            <li>• Gestion réponses incomplètes</li>
                            <li>• Interaction avec autres agents</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Procédures de test */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Procédures de Test</h3>
                      
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">1. Test Unitaire par Agent</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Sélectionner l'agent dans l'interface</li>
                            <li>• Lancer chaque scénario individuellement</li>
                            <li>• Vérifier le résultat attendu</li>
                            <li>• Documenter les écarts</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">2. Test d'Intégration</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Tester les flux multi-agents</li>
                            <li>• Valider les transferts de données</li>
                            <li>• Vérifier la cohérence globale</li>
                            <li>• Tester les cas d'erreur</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 mt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Centre de Tests AgenticSST Québec™ - Validation complète de l'architecture multi-agents
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tests;