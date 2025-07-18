
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import diagnosticPromptsData from "@/data/diagnosticPrompts.json";

interface DiagnosticPrompt {
  id: number;
  category: string;
  sector: string;
  input: string;
  tags: string[];
  expected_response: string;
  source: string;
}

interface DetailedDiagnosticProps {
  selectedSector?: string;
  onBack: () => void;
}

export const DetailedDiagnostic = ({ selectedSector, onBack }: DetailedDiagnosticProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [filteredPrompts, setFilteredPrompts] = useState<DiagnosticPrompt[]>([]);

  useEffect(() => {
    // Filtrer les prompts selon le secteur sélectionné
    const prompts = diagnosticPromptsData as DiagnosticPrompt[];
    const filtered = selectedSector 
      ? prompts.filter(p => p.sector === selectedSector)
      : prompts;
    setFilteredPrompts(filtered);
  }, [selectedSector]);

  const currentPrompt = filteredPrompts[currentStep];
  const progress = ((currentStep + 1) / filteredPrompts.length) * 100;

  const handleResponse = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentPrompt.id]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < filteredPrompts.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isResponseValid = () => {
    if (!currentPrompt) return false;
    
    const response = responses[currentPrompt.id];
    
    // Pour les questions qui demandent du texte libre
    if (currentPrompt.input.toLowerCase().includes("quel") || 
        currentPrompt.input.toLowerCase().includes("combien") ||
        currentPrompt.input.toLowerCase().includes("dans quel")) {
      return typeof response === "string" && response.trim().length > 0;
    }
    
    // Pour les questions oui/non
    if (currentPrompt.input.toLowerCase().includes("disposez-vous") ||
        currentPrompt.input.toLowerCase().includes("tenez-vous") ||
        currentPrompt.input.toLowerCase().includes("avez-vous")) {
      return response === true || response === false;
    }
    
    // Pour les questions de date
    if (currentPrompt.input.toLowerCase().includes("quand") ||
        currentPrompt.input.toLowerCase().includes("date")) {
      return typeof response === "string" && response.length > 0;
    }
    
    // Pour les questions à choix multiples sur les risques
    if (currentPrompt.input.toLowerCase().includes("risques") ||
        currentPrompt.input.toLowerCase().includes("cartographie") ||
        currentPrompt.input.toLowerCase().includes("documentez")) {
      return typeof response === "string" && response.length > 0;
    }
    
    // Validation par défaut
    return response !== undefined && response !== null && response !== "";
  };

  const renderResponseInput = () => {
    if (!currentPrompt) return null;

    // Questions texte libre (nombre d'employés, secteur SCIAN)
    if (currentPrompt.input.toLowerCase().includes("nombre d'employés") ||
        currentPrompt.input.toLowerCase().includes("secteur scian")) {
      return (
        <Input
          value={responses[currentPrompt.id] || ""}
          onChange={(e) => handleResponse(e.target.value)}
          placeholder="Votre réponse..."
          className="w-full"
        />
      );
    }
    
    // Questions oui/non
    if (currentPrompt.input.toLowerCase().includes("disposez-vous") ||
        currentPrompt.input.toLowerCase().includes("tenez-vous") ||
        currentPrompt.input.toLowerCase().includes("avez-vous")) {
      return (
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={responses[currentPrompt.id] === true}
              onCheckedChange={(checked) => handleResponse(checked ? true : undefined)}
            />
            <Label>Oui</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={responses[currentPrompt.id] === false}
              onCheckedChange={(checked) => handleResponse(checked ? false : undefined)}
            />
            <Label>Non</Label>
          </div>
        </div>
      );
    }
    
    // Questions de date
    if (currentPrompt.input.toLowerCase().includes("quand") ||
        currentPrompt.input.toLowerCase().includes("date")) {
      return (
        <Input
          type="date"
          value={responses[currentPrompt.id] || ""}
          onChange={(e) => handleResponse(e.target.value)}
          className="w-full"
        />
      );
    }
    
    // Questions sur les risques avec choix multiples
    if (currentPrompt.input.toLowerCase().includes("risques sst majeurs")) {
      return (
        <Select value={responses[currentPrompt.id] || ""} onValueChange={handleResponse}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez le niveau de risque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="risques_physiques">Risques physiques (chutes, coupures)</SelectItem>
            <SelectItem value="risques_chimiques">Risques chimiques</SelectItem>
            <SelectItem value="risques_ergonomiques">Risques ergonomiques</SelectItem>
            <SelectItem value="risques_psychosociaux">Risques psychosociaux</SelectItem>
            <SelectItem value="risques_biologiques">Risques biologiques</SelectItem>
            <SelectItem value="autres">Autres risques</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    // Questions sur la cartographie des risques et documentation
    if (currentPrompt.input.toLowerCase().includes("cartographie") ||
        currentPrompt.input.toLowerCase().includes("documentez")) {
      return (
        <Select value={responses[currentPrompt.id] || ""} onValueChange={handleResponse}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oui_complet">Oui, entièrement</SelectItem>
            <SelectItem value="oui_partiel">Oui, partiellement</SelectItem>
            <SelectItem value="en_cours">En cours de réalisation</SelectItem>
            <SelectItem value="non">Non</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    // Par défaut, champ texte
    return (
      <Input
        value={responses[currentPrompt.id] || ""}
        onChange={(e) => handleResponse(e.target.value)}
        placeholder="Votre réponse..."
        className="w-full"
      />
    );
  };

  const generateReport = () => {
    // Logique pour générer un rapport basé sur toutes les réponses
    console.log("Réponses collectées:", responses);
    // Ici on pourrait intégrer avec l'API pour générer un rapport personnalisé
  };

  if (filteredPrompts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Aucun prompt trouvé pour le secteur sélectionné.</p>
          <Button onClick={onBack} className="mt-4">
            Retour
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentStep >= filteredPrompts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Diagnostic détaillé terminé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Vous avez répondu à {Object.keys(responses).length} questions sur {filteredPrompts.length}.
          </p>
          <div className="flex gap-2">
            <Button onClick={generateReport}>
              Générer le rapport
            </Button>
            <Button variant="outline" onClick={onBack}>
              Retour au menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {selectedSector || "Tous secteurs"}
          </Badge>
          <Badge variant="secondary">
            {currentStep + 1} / {filteredPrompts.length}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Progression: {Math.round(progress)}%
            </p>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{currentPrompt.category}</CardTitle>
          <div className="flex gap-2">
            {currentPrompt.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label className="text-base font-medium">
            {currentPrompt.input}
          </Label>
          
          {renderResponseInput()}
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            
            <Button 
              onClick={nextStep}
              disabled={!isResponseValid()}
              className="gap-2"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Source: {currentPrompt.source}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
