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
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Settings2, 
  Star,
  Zap,
  Shield,
  BookOpen,
  Users,
  Clock,
  Hash
} from "lucide-react";
import Header from "@/components/Header";
import { docuGenEngine } from "@/lib/docugen/templateEngine";
import { getApplicableLaws, getRequiredSubjects } from "@/lib/docugen/legalOntology";
import { 
  DocumentTemplate, 
  DocumentGenerationRequest, 
  CompanyProfile, 
  GeneratedDocument,
  PipelineExecution 
} from "@/types/docugen";
import { useToast } from "@/hooks/use-toast";

export default function DocuGen() {
  const [searchParams] = useSearchParams();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: '',
    size: 0,
    sector: '',
    scianCode: '',
    address: '',
    riskLevel: 'medium'
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [additionalData, setAdditionalData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Initialize from URL params
  useEffect(() => {
    const nom = searchParams.get('nom');
    const taille = searchParams.get('taille');
    const secteur = searchParams.get('secteur');
    const scianCode = searchParams.get('scianCode');
    const template = searchParams.get('template');

    if (nom || taille || secteur) {
      setCompanyProfile(prev => ({
        ...prev,
        name: nom || prev.name,
        size: taille ? parseInt(taille) : prev.size,
        sector: secteur || prev.sector,
        scianCode: scianCode || prev.scianCode,
      }));
    }

    if (template) {
      const foundTemplate = docuGenEngine.getTemplateById(template);
      if (foundTemplate) {
        setSelectedTemplate(foundTemplate);
      }
    }
  }, [searchParams]);

  // Get available templates based on company profile
  const availableTemplates = docuGenEngine.getTemplatesByCompanyProfile(
    companyProfile.size, 
    companyProfile.sector
  );

  // Get legal context
  const applicableLaws = companyProfile.size > 0 && companyProfile.sector 
    ? getApplicableLaws(companyProfile.size, companyProfile.sector)
    : [];

  const requiredSubjects = companyProfile.size > 0 && companyProfile.sector
    ? getRequiredSubjects(companyProfile.size, companyProfile.sector, companyProfile.riskLevel)
    : [];

  const handleGenerateDocument = async () => {
    if (!selectedTemplate || !companyProfile.name || companyProfile.size === 0) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentStage('Initialisation du pipeline DocuGen 2.0...');

    try {
      const request: DocumentGenerationRequest = {
        templateId: selectedTemplate.id,
        companyProfile,
        additionalData,
        outputFormat: 'markdown',
        options: {
          language: 'fr',
          includeSignatures: true,
          includeTimestamp: true,
          generateTOC: true,
          addLegalHyperlinks: true
        }
      };

      // Simulate pipeline stages for UI feedback
      const stages = [
        { name: 'Collecte et validation des données', progress: 15 },
        { name: 'Sélection du template paramétrique', progress: 30 },
        { name: 'Mapping du contexte légal (ontologie)', progress: 45 },
        { name: 'Génération IA du contenu', progress: 65 },
        { name: 'Contrôle qualité automatisé', progress: 80 },
        { name: 'Compilation et export', progress: 90 },
        { name: 'Traçabilité et signature numérique', progress: 100 }
      ];

      for (const stage of stages) {
        setCurrentStage(stage.name);
        setGenerationProgress(stage.progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const document = await docuGenEngine.generateDocument(request);
      setGeneratedDocument(document);
      
      toast({
        title: "Document généré avec succès",
        description: `${selectedTemplate.name} généré par l'agent ${selectedTemplate.agent}`,
      });

    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentStage('');
    }
  };

  const handleDownloadDocument = () => {
    if (!generatedDocument || !selectedTemplate) return;

    const blob = new Blob([generatedDocument.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.id}-${companyProfile.name.replace(/\s+/g, '-')}_v${generatedDocument.metadata.version}.txt`;
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
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            DocuGen 2.0 - Génération Documentaire SST
          </h1>
          <p className="text-lg text-muted-foreground">
            Pipeline modulaire de génération selon l'ontologie légale québécoise (LMRSST, LSST, CSTC, RBQ)
          </p>
        </div>

        {/* Pipeline Progress */}
        {isGenerating && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 animate-spin" />
                Pipeline de génération en cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={generationProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">{currentStage}</p>
                <div className="text-xs text-muted-foreground">
                  Agent responsable: <strong>{selectedTemplate?.agent}</strong> | 
                  Temps estimé: <strong>{selectedTemplate?.metadata.estimatedGenerationTime}s</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Company Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profil de l'entreprise
              </CardTitle>
              <CardDescription>
                Données pour l'application de l'ontologie légale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'entreprise *</Label>
                <Input
                  id="name"
                  value={companyProfile.name}
                  onChange={(e) => setCompanyProfile(prev => ({...prev, name: e.target.value}))}
                  placeholder="Ex: Entreprise ABC Inc."
                />
              </div>
              
              <div>
                <Label htmlFor="size">Nombre d'employés *</Label>
                <Input
                  id="size"
                  type="number"
                  value={companyProfile.size || ''}
                  onChange={(e) => setCompanyProfile(prev => ({...prev, size: parseInt(e.target.value) || 0}))}
                  placeholder="Ex: 25"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Détermine l'applicabilité: &lt;20 = ALSS, ≥20 = CoSS
                </p>
              </div>
              
              <div>
                <Label htmlFor="sector">Secteur d'activité *</Label>
                <Select 
                  value={companyProfile.sector}
                  onValueChange={(value) => setCompanyProfile(prev => ({...prev, sector: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction (SCIAN 23)</SelectItem>
                    <SelectItem value="manufacturier">Manufacturier (SCIAN 31-33)</SelectItem>
                    <SelectItem value="transport">Transport et entreposage (SCIAN 48-49)</SelectItem>
                    <SelectItem value="santé">Soins de santé (SCIAN 62)</SelectItem>
                    <SelectItem value="services">Services professionnels (SCIAN 54)</SelectItem>
                    <SelectItem value="commerce">Commerce de détail (SCIAN 44-45)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="riskLevel">Niveau de risque</Label>
                <Select 
                  value={companyProfile.riskLevel}
                  onValueChange={(value: any) => setCompanyProfile(prev => ({...prev, riskLevel: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau de risque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Modéré</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="scianCode">Code SCIAN (optionnel)</Label>
                <Input
                  id="scianCode"
                  value={companyProfile.scianCode}
                  onChange={(e) => setCompanyProfile(prev => ({...prev, scianCode: e.target.value}))}
                  placeholder="Ex: 62111 (Médecins)"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Adresse de l'établissement</Label>
                <Textarea
                  id="address"
                  value={companyProfile.address}
                  onChange={(e) => setCompanyProfile(prev => ({...prev, address: e.target.value}))}
                  placeholder="Adresse complète de l'établissement"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Contexte légal applicable
              </CardTitle>
              <CardDescription>
                Articles automatiquement déterminés par l'ontologie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicableLaws.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2">Articles applicables:</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {applicableLaws.map((article) => (
                        <div key={article.id} className="p-2 border rounded-lg text-sm">
                          <div className="font-medium">Art. {article.number} - {article.title}</div>
                          <div className="text-muted-foreground text-xs mt-1">{article.content}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {article.id.split('_')[0]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Renseignez le profil d'entreprise pour voir les articles applicables
                  </p>
                )}

                {requiredSubjects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Sujets SST requis:</h4>
                    <div className="flex flex-wrap gap-1">
                      {requiredSubjects.map((subject) => (
                        <Badge key={subject.id} variant="secondary" className="text-xs">
                          {subject.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Templates paramétriques disponibles
              </CardTitle>
              <CardDescription>
                {companyProfile.size >= 20 
                  ? "Entreprise ≥20 employés - Documents CoSS"
                  : companyProfile.size > 0 
                    ? "Entreprise <20 employés - Documents ALSS" 
                    : "Saisissez la taille pour voir les templates"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableTemplates.map((template) => (
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
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex gap-1">
                        {template.priority === 'mandatory' ? (
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
                      Version {template.version} - Document conforme aux exigences légales
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Agent: {template.agent}
                      </Badge>
                      {template.legislation.map((law) => (
                        <Badge key={law} variant="outline" className="text-xs">
                          {law}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.metadata.estimatedGenerationTime}s
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Formats: {template.metadata.outputFormats.join(', ')}
                    </div>
                  </div>
                ))}
                
                {availableTemplates.length === 0 && companyProfile.size > 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun template disponible pour cette configuration.
                  </p>
                )}
              </div>
              
              {selectedTemplate && (
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={handleGenerateDocument}
                    className="w-full"
                    disabled={!companyProfile.name || companyProfile.size === 0 || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Settings2 className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Générer avec DocuGen 2.0
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Document */}
        {generatedDocument && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document généré
                  </CardTitle>
                  <CardDescription>
                    {selectedTemplate?.name} - {generatedDocument.metadata.title}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadDocument} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Document Metadata */}
              <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">Version</div>
                  <div className="font-medium">{generatedDocument.metadata.version}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Généré par</div>
                  <div className="font-medium">{generatedDocument.metadata.generatedBy}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Statut</div>
                  <Badge variant="secondary">{generatedDocument.metadata.approvalStatus}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Hash de traçabilité</div>
                  <div className="font-mono text-xs flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {generatedDocument.traceability.documentHash.substring(0, 8)}...
                  </div>
                </div>
              </div>

              {/* Quality Results */}
              {generatedDocument.qualityResults && generatedDocument.qualityResults.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Résultats du contrôle qualité:</h4>
                  <div className="space-y-2">
                    {generatedDocument.qualityResults.map((result, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {result.status === 'pass' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : result.status === 'fail' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>{result.checkName}: {result.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Content */}
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">
                  {generatedDocument.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}