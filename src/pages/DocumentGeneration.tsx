import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, AlertCircle, CheckCircle, Settings2, Star } from "lucide-react";
import Header from "@/components/Header";
import { DOCUMENT_TEMPLATES, filtrerTemplatesParTaille, genererDocument, type DocumentTemplate, type DocumentData } from "@/lib/documentGenerator";
import { getScianActions, prioritizeScianActions } from "@/lib/preventionProgramGenerator";
import { useToast } from "@/hooks/use-toast";

export default function DocumentGeneration() {
  const [searchParams] = useSearchParams();
  const [entrepriseData, setEntrepriseData] = useState({
    nom: '',
    taille: 0,
    secteur: '',
    scianCode: '',
    adresse: ''
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');
  const [selectedScianActions, setSelectedScianActions] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialiser les données depuis les paramètres URL
  useEffect(() => {
    const nom = searchParams.get('nom');
    const taille = searchParams.get('taille');
    const secteur = searchParams.get('secteur');
    const scianCode = searchParams.get('scianCode');
    const template = searchParams.get('template');

    if (nom || taille || secteur) {
      setEntrepriseData({
        nom: nom || '',
        taille: taille ? parseInt(taille) : 0,
        secteur: secteur || '',
        scianCode: scianCode || '',
        adresse: ''
      });
    }

    // Auto-sélectionner le template si spécifié
    if (template) {
      const foundTemplate = DOCUMENT_TEMPLATES.find(t => t.id === template);
      if (foundTemplate) {
        setSelectedTemplate(foundTemplate);
      }
    }
  }, [searchParams]);

  const templatesDisponibles = filtrerTemplatesParTaille(entrepriseData.taille);
  
  // Get SCIAN actions for the current company profile
  const availableScianActions = entrepriseData.secteur && entrepriseData.taille > 0 
    ? prioritizeScianActions(
        getScianActions(entrepriseData.secteur, entrepriseData.taille),
        entrepriseData.secteur,
        entrepriseData.taille
      )
    : [];

  const handleGenererDocument = () => {
    if (!selectedTemplate || !entrepriseData.nom || !entrepriseData.taille) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const documentData: DocumentData = {
      entreprise: {
        ...entrepriseData,
        selectedScianActions: selectedScianActions
      },
      dateGeneration: new Date().toLocaleDateString('fr-CA')
    };

    const document = genererDocument(selectedTemplate, documentData);
    setGeneratedDocument(document);
    
    const actionCount = selectedScianActions.length;
    toast({
      title: "Document généré",
      description: `${selectedTemplate.nom} généré avec succès${actionCount > 0 ? ` avec ${actionCount} actions SCIAN spécialisées` : ''}`,
    });
  };

  const handleTelechargerDocument = () => {
    if (!generatedDocument || !selectedTemplate) return;

    const blob = new Blob([generatedDocument], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.id}-${entrepriseData.nom.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Génération de Documents SST
          </h1>
          <p className="text-lg text-muted-foreground">
            Agent <strong>DocuGen</strong> - Production de documents réglementaires selon les exigences LMRSST
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulaire entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations de l'entreprise
              </CardTitle>
              <CardDescription>
                Renseignez les données de votre entreprise pour générer les documents appropriés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom de l'entreprise *</Label>
                <Input
                  id="nom"
                  value={entrepriseData.nom}
                  onChange={(e) => setEntrepriseData({...entrepriseData, nom: e.target.value})}
                  placeholder="Ex: Entreprise ABC Inc."
                />
              </div>
              
              <div>
                <Label htmlFor="taille">Nombre d'employés *</Label>
                <Input
                  id="taille"
                  type="number"
                  value={entrepriseData.taille || ''}
                  onChange={(e) => setEntrepriseData({...entrepriseData, taille: parseInt(e.target.value) || 0})}
                  placeholder="Ex: 25"
                />
              </div>
              
              <div>
                <Label htmlFor="secteur">Secteur d'activité</Label>
                <Select 
                  value={entrepriseData.secteur}
                  onValueChange={(value) => setEntrepriseData({...entrepriseData, secteur: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="manufacturier">Manufacturier</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="transport">Transport et entreposage</SelectItem>
                    <SelectItem value="santé">Santé et services sociaux</SelectItem>
                    <SelectItem value="commerce">Commerce de détail</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="scianCode">Code SCIAN (optionnel)</Label>
                <Input
                  id="scianCode"
                  value={entrepriseData.scianCode}
                  onChange={(e) => setEntrepriseData({...entrepriseData, scianCode: e.target.value})}
                  placeholder="Ex: 62111 (Médecins)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Le code SCIAN permet d'identifier des risques spécialisés selon votre activité précise
                </p>
              </div>
              
              <div>
                <Label htmlFor="adresse">Adresse (optionnel)</Label>
                <Textarea
                  id="adresse"
                  value={entrepriseData.adresse}
                  onChange={(e) => setEntrepriseData({...entrepriseData, adresse: e.target.value})}
                  placeholder="Adresse complète de l'entreprise"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions SCIAN spécialisées */}
          {availableScianActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Actions SCIAN - {entrepriseData.secteur}
                </CardTitle>
                <CardDescription>
                  Actions spécialisées pour entreprise de {entrepriseData.taille} employés
                  {entrepriseData.taille >= 500 && (
                    <Badge variant="secondary" className="ml-2">
                      <Star className="h-3 w-3 mr-1" />
                      Grande entreprise
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableScianActions.slice(0, 12).map((action) => (
                    <div
                      key={action.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedScianActions.includes(action.id)
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedScianActions(prev => 
                          prev.includes(action.id)
                            ? prev.filter(id => id !== action.id)
                            : [...prev, action.id]
                        );
                      }}
                    >
                      <h4 className="font-medium text-sm mb-1">{action.actionRapide}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Risque:</strong> {action.risque} | <strong>But:</strong> {action.but}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {action.scenarioPhase}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {action.etapeWorkflow}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedScianActions.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      {selectedScianActions.length} action(s) sélectionnée(s) pour intégration
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sélection de document */}
          <Card>
            <CardHeader>
              <CardTitle>Documents disponibles</CardTitle>
              <CardDescription>
                {entrepriseData.taille >= 20 
                  ? "Entreprise de 20 employés et plus - Documents CoSS requis"
                  : entrepriseData.taille > 0 
                    ? "Entreprise de moins de 20 employés - Documents ALSS requis" 
                    : "Saisissez le nombre d'employés pour voir les documents applicables"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templatesDisponibles.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{template.nom}</h3>
                      <div className="flex gap-1">
                        {template.obligatoire ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Obligatoire
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Recommandé
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        Agent: {template.agent}
                      </Badge>
                      {template.exigencesLegales.map((exigence) => (
                        <Badge key={exigence} variant="outline" className="text-xs">
                          {exigence}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                
                {templatesDisponibles.length === 0 && entrepriseData.taille > 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun document disponible pour cette configuration d'entreprise.
                  </p>
                )}
              </div>
              
              {selectedTemplate && (
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={handleGenererDocument}
                    className="w-full"
                    disabled={!entrepriseData.nom || !entrepriseData.taille}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Générer le document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Document généré */}
        {generatedDocument && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document généré</CardTitle>
                  <CardDescription>
                    {selectedTemplate?.nom} - Prêt à télécharger
                  </CardDescription>
                </div>
                <Button onClick={handleTelechargerDocument}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedDocument}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}