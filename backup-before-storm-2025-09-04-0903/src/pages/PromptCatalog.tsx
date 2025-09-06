import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Play, BookOpen, Zap, Users, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Pagination from "@/components/Pagination";
import orchestrationPrompts from "@/data/orchestrationPrompts.json";

interface OrchestrationPrompt {
  id: number;
  title: string;
  description: string;
  agents: string[];
  article_lmrsst: string;
  category: string;
  priority: string;
  scope: string;
  orchestration_prompt: string;
  expected_deliverables: string[];
}

const PromptCatalog = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Simulation de données si le JSON n'est pas disponible
  const defaultPrompts: OrchestrationPrompt[] = [
    {
      id: 1,
      title: "Comité SST pour entreprises +20 travailleurs",
      description: "Orchestrer DocuGen, Hugo et CoSS pour démontrer la mise en place du comité SST exigé par la LMRSST dans une entreprise de plus de 20 travailleurs.",
      agents: ["DocuGen", "Hugo", "CoSS"],
      article_lmrsst: "Art. 90",
      category: "Comité SST",
      priority: "Élevée",
      scope: "Multi-agents",
      orchestration_prompt: "",
      expected_deliverables: ["Documentation comité SST", "Plan de mise en place", "Validation conformité"]
    },
    {
      id: 2,
      title: "Calendrier prévention article 101",
      description: "Utiliser LexiNorm et Prioris pour générer un calendrier annuel des activités de prévention conforme à l'article 101 LMRSST.",
      agents: ["LexiNorm", "Prioris"],
      article_lmrsst: "Art. 101",
      category: "Programme prévention",
      priority: "Élevée",
      scope: "Multi-agents",
      orchestration_prompt: "",
      expected_deliverables: ["Calendrier annuel", "Activités priorisées", "Référentiel légal"]
    },
    {
      id: 3,
      title: "Programme prévention à jour",
      description: "Orchestrer DocuGen, Hugo et CoSS pour démontrer la mise à jour du programme de prévention.",
      agents: ["DocuGen", "Hugo"],
      article_lmrsst: "Art. 90",
      category: "Programme prévention",
      priority: "Critique",
      scope: "Multi-agents", 
      orchestration_prompt: "",
      expected_deliverables: ["Templates PV", "Système archivage", "Conformité réglementaire"]
    },
    {
      id: 4,
      title: "Validation modalités comité SST",
      description: "Lancer une orchestration pour valider les modalités de fonctionnement du comité SST (art. 90 LMRSST).",
      agents: ["CoSS", "LexiNorm", "DocuGen"],
      article_lmrsst: "Art. 90",
      category: "Comité SST", 
      priority: "Élevée",
      scope: "Multi-agents",
      orchestration_prompt: "",
      expected_deliverables: ["Validation modalités", "Guide fonctionnement", "Conformité réglementaire"]
    }
  ];

  const prompts = orchestrationPrompts?.length > 0 ? orchestrationPrompts : defaultPrompts;

  // Fonctions de filtrage
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || prompt.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPrompts = filteredPrompts.slice(startIndex, startIndex + itemsPerPage);

  // Fonction de lancement de workflow
const handleLaunchWorkflow = (prompt: OrchestrationPrompt) => {
  const hitlMessage = 
    `VALIDATION HITL REQUISE\n\n` +
    `Workflow: ${prompt.title}\n` +
    `Agents: ${prompt.agents.join(" → ")}\n` +
    `Priorité: ${prompt.priority}\n` +
    `Article LMRSST: ${prompt.article_lmrsst}\n` +
    `Catégorie: ${prompt.category}\n\n` +
    `Livrables attendus:\n${prompt.expected_deliverables.map(d => `• ${d}`).join('\n')}\n\n` +
    `Cette orchestration multi-agents va créer des obligations légales selon la LMRSST.\n\n` +
    `Approuvez-vous le lancement de ce workflow ?`;

  const userConfirm = window.confirm(hitlMessage);

  if (!userConfirm) {
    toast({
      title: "Workflow annulé",
      description: `Orchestration "${prompt.title}" rejetée par l'utilisateur`,
      variant: "destructive"
    });
    return;
  }

  toast({
    title: "Validation HITL réussie",
    description: `Orchestration "${prompt.title}" approuvée et démarrée`,
  });
};

  // Fonctions utilitaires pour les badges
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critique':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'élevée':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critique':
        return <AlertCircle className="w-3 h-3 mr-1" />;
      case 'élevée':
        return <Zap className="w-3 h-3 mr-1" />;
      default:
        return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8" role="main">
        {/* En-tête de page */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Catalogue des Orchestrations</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Workflows d'orchestration intelligente LMRSST prêts à l'emploi
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg border p-6 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un workflow..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtres */}
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  <SelectItem value="Comité SST">Comité SST</SelectItem>
                  <SelectItem value="Programme prévention">Programme prévention</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Toutes priorités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes priorités</SelectItem>
                  <SelectItem value="Critique">Critique</SelectItem>
                  <SelectItem value="Élevée">Élevée</SelectItem>
                  <SelectItem value="Moyenne">Moyenne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Compteur de résultats */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{filteredPrompts.length} workflows disponibles</span>
          </div>
        </div>

        {/* Grille des cartes normalisées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {currentPrompts.map((prompt) => (
            <Card key={prompt.id} className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg font-semibold leading-tight flex-1">
                    {prompt.title}
                  </CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium ${getPriorityColor(prompt.priority)}`}
                    >
                      {getPriorityIcon(prompt.priority)}
                      {prompt.priority}
                    </Badge>
                  </div>
                </div>
                
                {/* Badges informatifs */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {prompt.scope}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {prompt.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-blue-700 bg-blue-50 border-blue-200">
                    {prompt.article_lmrsst}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-shrink-0">
                  {prompt.description}
                </p>

                {/* Agents impliqués */}
                <div className="mb-4 flex-shrink-0">
                  <div className="text-xs font-medium text-foreground mb-2 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    Agents impliqués:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {prompt.agents.map((agent, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {agent}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Livrables attendus */}
                <div className="mb-6 flex-1">
                  <div className="text-xs font-medium text-foreground mb-2">
                    Livrables attendus:
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {prompt.expected_deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-1 flex-shrink-0">•</span>
                        <span className="line-clamp-1">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA aligné en bas */}
                <div className="mt-auto pt-4 border-t">
                  <Button 
                    onClick={() => handleLaunchWorkflow(prompt)} 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Lancer le workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
};

export default PromptCatalog;