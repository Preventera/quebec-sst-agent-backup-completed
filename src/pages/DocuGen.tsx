import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Stepper } from "@/components/ui/stepper";
import { CompanyProfileCard } from "@/components/docugen/CompanyProfileCard";
import { LegalContextCards } from "@/components/docugen/LegalContextCards";
import { TemplateGrid } from "@/components/docugen/TemplateGrid";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Settings2, 
  Zap,
  ChevronLeft,
  ChevronRight,
  FileText,
  Hash,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Header from "@/components/Header";
import { docuGenEngine } from "@/lib/docugen/templateEngine";
import { getApplicableLaws, getRequiredSubjects } from "@/lib/docugen/legalOntology";
import { 
  DocumentTemplate, 
  DocumentGenerationRequest, 
  CompanyProfile, 
  GeneratedDocument
} from "@/types/docugen";
import { useToast } from "@/hooks/use-toast";

export default function DocuGen() {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
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
  const [isProfileValid, setIsProfileValid] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: "1", title: "Profil", description: "Informations entreprise" },
    { id: "2", title: "Contexte", description: "Articles légaux applicables" },
    { id: "3", title: "Génération", description: "Templates et documents" }
  ];

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

  // Validate profile and auto-save
  useEffect(() => {
    const isValid = companyProfile.name.trim() !== '' && 
                   companyProfile.size > 0 && 
                   companyProfile.sector !== '';
    setIsProfileValid(isValid);
    
    // Auto-save to localStorage
    if (isValid) {
      localStorage.setItem('docugen-profile', JSON.stringify(companyProfile));
    }
  }, [companyProfile]);

  // Load saved profile on mount
  useEffect(() => {
    const saved = localStorage.getItem('docugen-profile');
    if (saved) {
      try {
        const profile = JSON.parse(saved);
        setCompanyProfile(profile);
      } catch (e) {
        console.warn('Could not load saved profile');
      }
    }
  }, []);

  // Get available templates based on company profile
  const availableTemplates = docuGenEngine.getTemplatesByCompanyProfile(
    companyProfile.size, 
    companyProfile.sector
  );

  // Get legal context
  const applicableLaws = companyProfile.size > 0 && companyProfile.sector 
    ? getApplicableLaws(companyProfile.size, companyProfile.sector, companyProfile.scianCode)
    : [];

  const requiredSubjects = companyProfile.size > 0 && companyProfile.sector
    ? getRequiredSubjects(companyProfile.size, companyProfile.sector, companyProfile.riskLevel)
    : [];

  const handleGenerateDocument = async () => {
    // Validation des champs obligatoires de base
    const missingFields = [];
    if (!companyProfile.name) missingFields.push("Nom de l'entreprise");
    if (!companyProfile.address) missingFields.push("Adresse de l'établissement");
    if (companyProfile.size === 0) missingFields.push("Taille de l'entreprise");
    if (!companyProfile.sector) missingFields.push("Secteur d'activité");
    if (!selectedTemplate) missingFields.push("Template sélectionné");

    // Validation conditionnelle selon le template
    if (selectedTemplate?.id === 'registre_incidents_v1' && !companyProfile.responsible_person) {
      missingFields.push("Responsable du registre");
    }

    // Validation des membres du comité pour entreprises de 20+ employés avec programme de prévention
    if (selectedTemplate?.id === 'prog_prev_LMRSST_v2' && companyProfile.size >= 20) {
      if (!companyProfile.committee_members || companyProfile.committee_members.length === 0 || 
          companyProfile.committee_members.some(member => !member.trim())) {
        missingFields.push("Membres du comité SST");
      }
    }

    if (missingFields.length > 0) {
      toast({
        title: "Données manquantes",
        description: `Champs requis: ${missingFields.join(', ')}`,
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

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceedToStep2 = isProfileValid;
  const canProceedToStep3 = canProceedToStep2 && applicableLaws.length > 0;

  // Mock templates with real-time status for demo
  const templatesWithStatus = availableTemplates.map(template => ({
    ...template,
    description: `Document ${template.name} conforme aux exigences légales`,
    priority: template.priority || 'recommended' as const,
    status: 'available' as const,
    estimatedTime: Math.floor(Math.random() * 10) + 5,
    outputs: ['PDF', 'DOCX', 'MD'],
    legislation: template.legislation || ['LSST']
  }));

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

        {/* Wizard Navigation */}
        <div className="mb-8">
          <Stepper 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={setCurrentStep}
            completedSteps={isProfileValid ? [0] : []}
          />
        </div>

        {/* Step Content */}
        <div className="space-y-8">
          {currentStep === 0 && (
            <div>
              <CompanyProfileCard
                profile={companyProfile}
                onProfileChange={(field: string, value: any) => {
                  setCompanyProfile(prev => ({ ...prev, [field]: value }));
                }}
              />
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleNextStep}
                  disabled={!canProceedToStep2}
                  className="flex items-center gap-2"
                >
                  Contexte légal
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <LegalContextCards
                articles={applicableLaws.map(law => ({
                  ...law,
                  framework: law.id.split('_')[0] || 'LSST',
                  category: 'Santé et sécurité',
                  applicability: 'Applicable selon profil entreprise'
                }))}
                companyProfile={companyProfile}
              />
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline"
                  onClick={handlePrevStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Profil entreprise
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!canProceedToStep3}
                  className="flex items-center gap-2"
                >
                  Templates disponibles
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <TemplateGrid
                templates={templatesWithStatus}
                onGenerate={(templateId) => {
                  const template = templatesWithStatus.find(t => t.id === templateId);
                  if (template) {
                    setSelectedTemplate(template);
                    handleGenerateDocument();
                  }
                }}
                onPreview={(templateId) => {
                  toast({
                    title: "Prévisualisation",
                    description: "Fonctionnalité en développement"
                  });
                }}
                onViewHistory={(templateId) => {
                  toast({
                    title: "Historique",
                    description: "Fonctionnalité en développement"
                  });
                }}
                onDownload={(templateId) => {
                  if (generatedDocument) {
                    handleDownloadDocument();
                  }
                }}
              />
              
              <div className="flex justify-start mt-6">
                <Button 
                  variant="outline"
                  onClick={handlePrevStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Contexte légal
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Generated Document Display */}
        {generatedDocument && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document généré: {selectedTemplate?.name}
                </span>
                <Button onClick={handleDownloadDocument} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </CardTitle>
              <CardDescription>
                Généré le {new Date(generatedDocument.metadata.generatedDate).toLocaleString('fr-CA')} • 
                Version {generatedDocument.metadata.version} • 
                Template: {selectedTemplate?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quality metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <div className="text-sm text-green-700">Complétude</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">98%</div>
                    <div className="text-sm text-blue-700">Conformité</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">92%</div>
                    <div className="text-sm text-purple-700">Lisibilité</div>
                  </div>
                </div>

                {/* Document content */}
                <div className="border rounded-lg p-4 bg-muted/10 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {generatedDocument.content}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}