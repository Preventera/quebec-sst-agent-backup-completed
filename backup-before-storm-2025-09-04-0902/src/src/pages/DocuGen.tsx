import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useHITLAudit } from '@/lib/hitlService';

const DocuGen = () => {
  const { toast } = useToast();
  const { logDocumentGeneration } = useHITLAudit();

  // États simplifiés
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companySize, setCompanySize] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Templates simplifiés
  const templates = [
    {
      id: 'prog_prev_LMRSST_v2',
      name: 'Programme de prévention (LMRSST)',
      description: 'Document Programme de prévention conforme aux exigences LMRSST'
    },
    {
      id: 'registre_incidents_v1',
      name: 'Registre des incidents et accidents',
      description: 'Document Registre des incidents conforme aux exigences légales'
    }
  ];

  // Fonction principale avec HITL
  const handleGenerateDocument = async (template: any) => {
    // Validation basique
    if (!companyName || !companyAddress || companySize === 0) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // POPUP HITL
    const userConfirm = window.confirm(
      `🔒 VALIDATION HITL REQUISE\n\n` +
      `Agent: DocuGen 2.0\n` +
      `Action: Génération ${template.name}\n` +
      `Entreprise: ${companyName} (${companySize} employés)\n\n` +
      `⚠️ Cette action va créer un document légalement contraignant selon la LMRSST.\n\n` +
      `Approuvez-vous cette génération ?`
    );

    if (!userConfirm) {
      // Enregistrer le REJET dans l'audit
      await logDocumentGeneration(
        template.name,
        companyName,
        'rejected',
        'Utilisateur a annulé via popup HITL'
      );
      
      toast({
        title: "Génération annulée - Audit enregistré",
        description: "Décision rejetée et tracée dans l'audit centralisé",
        variant: "destructive"
      });
      return;
    }

    // Enregistrer l'APPROBATION dans l'audit
    await logDocumentGeneration(
      template.name,
      companyName,
      'approved',
      'Utilisateur a approuvé via popup HITL'
    );

    toast({
      title: "✅ Validation HITL approuvée",
      description: "Génération approuvée et enregistrée dans l'audit centralisé",
    });

    // Simulation de génération
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Document généré avec succès",
        description: `${template.name} créé avec audit trail complet`,
      });
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          DocuGen 2.0 - Test HITL
        </h1>
        <p className="text-gray-600">
          Version simplifiée pour tester l'audit centralisé HITL
        </p>
      </div>

      {/* Formulaire entreprise */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profil Entreprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Acme Corp"
            />
          </div>
          <div>
            <Label htmlFor="companyAddress">Adresse</Label>
            <Input
              id="companyAddress"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Ex: 123 rue Principal, Montréal"
            />
          </div>
          <div>
            <Label htmlFor="companySize">Nombre d'employés</Label>
            <Input
              id="companySize"
              type="number"
              value={companySize}
              onChange={(e) => setCompanySize(parseInt(e.target.value) || 0)}
              placeholder="Ex: 25"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateDocument(template)}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Génération en cours..." : "Lancer la génération"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {isGenerating && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Pipeline de génération en cours...</p>
              <p className="text-xs text-gray-500 mt-2">Validation HITL: Approuvée avec audit centralisé</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocuGen;