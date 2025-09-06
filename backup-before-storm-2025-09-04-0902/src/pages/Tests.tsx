import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube, Bot, FileText } from "lucide-react";
import TestSuite from "@/components/TestSuite";
import AgentDemo from "@/components/AgentDemo";
import AgentSimulator from "@/components/AgentSimulator";

const Tests = () => {
  return (
    <div className="min-h-screen bg-background">
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

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">LexiNorm - 10 scénarios</Badge>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Recherche articles formation comité</li>
                            <li>• Obligations RSS par taille</li>
                            <li>• Documentation analyses risques</li>
                            <li>• Conditions mise en place ALSS</li>
                            <li>• Délais légaux et sanctions</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Prioris - 10 scénarios</Badge>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Plans pour non-conformités critiques</li>
                            <li>• Actions coordonnées multiples</li>
                            <li>• Adaptation sectorielle</li>
                            <li>• Plans simplifiés PME</li>
                            <li>• Personnalisation manuelle</li>
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

                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">3. Test de Performance</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Mesurer temps de réponse</li>
                            <li>• Tester montée en charge</li>
                            <li>• Valider la robustesse</li>
                            <li>• Optimiser les goulots</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">4. Test Utilisateur</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Utiliser le mode démo</li>
                            <li>• Tester scénarios réels</li>
                            <li>• Valider l'expérience UX</li>
                            <li>• Recueillir feedback</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Matrice de couverture */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Matrice de Couverture des Tests</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-muted">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="border border-muted p-2 text-left">Agent</th>
                            <th className="border border-muted p-2 text-center">Scénarios</th>
                            <th className="border border-muted p-2 text-center">Unitaires</th>
                            <th className="border border-muted p-2 text-center">Intégration</th>
                            <th className="border border-muted p-2 text-center">Performance</th>
                            <th className="border border-muted p-2 text-center">Utilisateur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: "Hugo", scenarios: 10 },
                            { name: "DiagSST", scenarios: 10 },
                            { name: "LexiNorm", scenarios: 10 },
                            { name: "Prioris", scenarios: 10 },
                            { name: "Sentinelle", scenarios: 10 },
                            { name: "DocuGen", scenarios: 10 },
                            { name: "CoSS", scenarios: 10 },
                            { name: "ALSS", scenarios: 10 },
                            { name: "Scénarios croisés", scenarios: 20 }
                          ].map((agent, index) => (
                            <tr key={index}>
                              <td className="border border-muted p-2 font-medium">{agent.name}</td>
                              <td className="border border-muted p-2 text-center">{agent.scenarios}</td>
                              <td className="border border-muted p-2 text-center">✅</td>
                              <td className="border border-muted p-2 text-center">✅</td>
                              <td className="border border-muted p-2 text-center">⏳</td>
                              <td className="border border-muted p-2 text-center">✅</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Légende */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span>✅</span>
                      <span>Implémenté</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏳</span>
                      <span>En cours</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>❌</span>
                      <span>Non implémenté</span>
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