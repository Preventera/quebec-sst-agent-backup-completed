import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Play, BookOpen, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
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
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filtrage des prompts d'orchestration
  const filteredOrchestrationPrompts = orchestrationPrompts.filter((prompt: OrchestrationPrompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.agents.some(agent => agent.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || prompt.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Pagination pour les prompts d'orchestration
  const totalItems = filteredOrchestrationPrompts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrompts = filteredOrchestrationPrompts.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPriority]);

  const categories = [...new Set(orchestrationPrompts.map((p: OrchestrationPrompt) => p.category))];
  const priorities = [...new Set(orchestrationPrompts.map((p: OrchestrationPrompt) => p.priority))];

  const executeWorkflow = (prompt: OrchestrationPrompt) => {
    toast({
      title: "Workflow lancé",
      description: `Le workflow "${prompt.title}" a été démarré avec succès.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Catalogue des Orchestrations
            </h1>
            <p className="text-muted-foreground mt-2">
              Workflows d'orchestration intelligente LMRSST prêts à l'emploi
            </p>
          </div>
        </div>

        {/* Filtres de recherche */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un workflow..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes priorités</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority === "critical" ? "Critique" : 
                       priority === "high" ? "Élevée" : 
                       priority === "medium" ? "Moyenne" : "Faible"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground flex items-center">
                {filteredOrchestrationPrompts.length} workflow{filteredOrchestrationPrompts.length > 1 ? 's' : ''} disponible{filteredOrchestrationPrompts.length > 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grille des workflows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {paginatedPrompts.map((prompt: OrchestrationPrompt) => {
            const isOrchestrator = prompt.agents.length > 1;
            const randomStatus = ['production', 'test'][Math.floor(Math.random() * 2)]; // Seuls les prompts validés sont dans le catalogue
            
            return (
            <Card key={prompt.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{prompt.title}</CardTitle>
                      {isOrchestrator && (
                        <Badge variant="default" className="bg-primary/10 text-primary">
                          Multi-agents
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        prompt.priority === "critical" ? "destructive" :
                        prompt.priority === "high" ? "default" :
                        prompt.priority === "medium" ? "secondary" : "outline"
                      }>
                        {prompt.priority === "critical" ? "Critique" : 
                         prompt.priority === "high" ? "Élevée" : 
                         prompt.priority === "medium" ? "Moyenne" : "Faible"}
                      </Badge>
                      <Badge variant="outline">{prompt.category}</Badge>
                      <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-200">
                        Disponible
                      </Badge>
                    </div>
                  </div>
                  <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{prompt.description}</p>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Agents impliqués:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prompt.agents.map((agent, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {agent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <strong>Article LMRSST:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">{prompt.article_lmrsst}</code>
                  </div>
                  
                  <div className="text-sm">
                    <strong>Livrables attendus:</strong>
                    <ul className="list-disc list-inside mt-1 text-xs text-muted-foreground">
                      {prompt.expected_deliverables.map((deliverable, index) => (
                        <li key={index}>{deliverable}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => executeWorkflow(prompt)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Lancer le workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
};

export default PromptCatalog;