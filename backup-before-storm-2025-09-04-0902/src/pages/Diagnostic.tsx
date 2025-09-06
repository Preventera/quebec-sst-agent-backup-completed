import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, AlertTriangle, FileText, Download, Zap, Brain, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { diagnosticLMRSST, DiagnosticParams, DiagnosticResult } from "@/lib/diagnosticLMRSST";
import { DetailedDiagnostic } from "@/components/DetailedDiagnostic";

const Diagnostic = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'menu' | 'form' | 'detailed' | 'results'>('menu');
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>("");
  
  const [formData, setFormData] = useState<DiagnosticParams>({
    taille: 0,
    registreIncidents: false,
    formationDate: "",
    programmePrevention: false,
    secteur: ""
  });

  const secteurs = [
    "Construction",
    "Manufacture",
    "Services",
    "Transport",
    "Agriculture",
    "Santé",
    "Éducation",
    "Commerce",
    "Autre"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const diagnosticResults = await diagnosticLMRSST(formData);
      setResults(diagnosticResults);
      setCurrentStep('results');
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
      // Fallback vers diagnostic de base en cas d'erreur
      const diagnosticResults = {
        secteur: formData.secteur,
        taille: formData.taille,
        conformitéGlobale: true,
        nonConformités: [],
        recommandations: []
      };
      setResults(diagnosticResults);
      setCurrentStep('results');
    }
  };

  const resetDiagnostic = () => {
    setCurrentStep('menu');
    setResults(null);
    setSelectedSector("");
    setFormData({
      taille: 0,
      registreIncidents: false,
      formationDate: "",
      programmePrevention: false,
      secteur: ""
    });
  };

  const handleGenerateDocument = () => {
    // Naviguer vers la page de génération avec les paramètres pré-remplis
    const params = new URLSearchParams({
      nom: `Entreprise ${results?.secteur}`,
      taille: results?.taille.toString() || '',
      secteur: results?.secteur.toLowerCase() || '',
      template: 'programme-prevention'
    });
    navigate(`/documents?${params.toString()}`);
  };

  const startQuickDiagnostic = () => {
    setCurrentStep('form');
  };

  const startDetailedDiagnostic = (sector?: string) => {
    setSelectedSector(sector === "tous" ? "" : sector || "");
    setCurrentStep('detailed');
  };

  if (currentStep === 'detailed') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <DetailedDiagnostic 
              selectedSector={selectedSector}
              onBack={() => setCurrentStep('menu')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results' && results) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Button>
              <Button 
                variant="secondary" 
                onClick={resetDiagnostic}
              >
                Nouveau diagnostic
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Résultats du diagnostic LMRSST
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">Secteur: {results.secteur}</Badge>
                  <Badge variant="outline">{results.taille} employés</Badge>
                  <Badge variant={results.conformitéGlobale ? "default" : "destructive"}>
                    {results.conformitéGlobale ? "Conforme" : "Non conforme"}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {results.nonConformités.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Non-conformités identifiées ({results.nonConformités.length})
                  </CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                   {results.nonConformités.map((item, index) => (
                     <div key={index} className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                       <p className="font-medium text-destructive">{item.message}</p>
                       <p className="text-sm text-muted-foreground mt-1">Référence: {item.article}</p>
                       {item.message.includes("programme de prévention") && (
                         <Button 
                           size="sm" 
                           className="mt-2"
                           onClick={handleGenerateDocument}
                         >
                           <Download className="h-4 w-4 mr-2" />
                           Générer le programme de prévention
                         </Button>
                       )}
                     </div>
                   ))}
                 </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Recommandations ({results.recommandations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.recommandations.map((item, index) => (
                  <div key={index} className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                    <p className="font-medium">{item.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">Référence: {item.article}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Ce diagnostic est basé sur les principales exigences de la LMRSST. 
                  Pour une évaluation complète, consultez un expert en santé et sécurité au travail.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'menu') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Choisissez votre type de diagnostic</CardTitle>
                <p className="text-muted-foreground">
                  Sélectionnez le niveau de détail souhaité pour votre évaluation LMRSST
                </p>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    Diagnostic Rapide
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Évaluation express en 5 questions essentielles
                  </p>
                  <div className="text-sm text-primary font-medium">
                    Idéal pour un bilan express
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Badge variant="secondary">5 minutes</Badge>
                    <Badge variant="outline">Questions essentielles</Badge>
                  </div>
                  <div className="relative">
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Secteur d'activité</li>
                      <li>• Nombre d'employés</li>
                      <li>• Formation SST</li>
                      <li>• Registre incidents</li>
                      <li>• Programme prévention</li>
                    </ul>
                    <div className="absolute inset-0 bg-popover/95 border rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                      <div className="text-xs font-medium mb-2">Aperçu des questions clefs :</div>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>1. Dans quel secteur votre entreprise opère-t-elle ?</li>
                        <li>2. Combien d'employés travaillent dans votre organisation ?</li>
                        <li>3. Quand a eu lieu votre dernière formation SST ?</li>
                        <li>4. Tenez-vous un registre des incidents à jour ?</li>
                        <li>5. Avez-vous un programme de prévention en place ?</li>
                      </ul>
                    </div>
                  </div>
                  <Button onClick={startQuickDiagnostic} className="w-full">
                    Commencer le diagnostic rapide
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    Diagnostic Détaillé
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Évaluation complète par secteur avec 72 questions spécialisées
                  </p>
                  <div className="text-sm text-primary font-medium">
                    Idéal pour un audit complet
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Badge variant="secondary">15-30 minutes</Badge>
                    <Badge variant="outline">Questions sectorielles</Badge>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Profil organisationnel</li>
                    <li>• Risques professionnels</li>
                    <li>• Documentation SST</li>
                    <li>• Formations</li>
                  </ul>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Secteur (optionnel)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Le secteur permet de personnaliser les questions selon votre domaine d'activité.
                              Par exemple, le secteur "Construction" inclura des questions sur les équipements de protection individuelle,
                              tandis que "Services" se concentrera sur les risques ergonomiques.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select value={selectedSector} onValueChange={setSelectedSector}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous secteurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tous">Tous secteurs</SelectItem>
                        <SelectItem value="Manufacturier">Manufacturier</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Services professionnels">Services professionnels</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Soins de santé">Soins de santé</SelectItem>
                        <SelectItem value="Commerce de détail">Commerce de détail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => startDetailedDiagnostic(selectedSector)} className="w-full">
                    Commencer le diagnostic détaillé
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('menu')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au menu
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Diagnostic SST Intelligent</CardTitle>
              <p className="text-muted-foreground">
                Évaluez votre conformité LMRSST en quelques questions
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="secteur">Secteur d'activité</Label>
                  <Select value={formData.secteur} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, secteur: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {secteurs.map((secteur) => (
                        <SelectItem key={secteur} value={secteur}>
                          {secteur}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taille">Nombre d'employés</Label>
                  <Input
                    id="taille"
                    type="number"
                    min="1"
                    value={formData.taille || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      taille: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="Ex: 25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formationDate">Date de la dernière formation SST</Label>
                  <Input
                    id="formationDate"
                    type="date"
                    value={formData.formationDate}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      formationDate: e.target.value 
                    }))}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="registreIncidents"
                      checked={formData.registreIncidents}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        registreIncidents: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="registreIncidents">
                      Registre des incidents et accidents tenu à jour
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="programmePrevention"
                      checked={formData.programmePrevention}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        programmePrevention: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="programmePrevention">
                      Programme de prévention ou plan d'action en place
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!formData.secteur || !formData.taille || !formData.formationDate}
                >
                  Analyser ma conformité
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;