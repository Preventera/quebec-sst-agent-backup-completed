import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Zap, 
  FileText, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Play,
  Eye,
  Download,
  History
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  agileFunctions, 
  getAgileCategories, 
  getAgilePriorities, 
  filterAgileFunctions,
  type AgileFunction 
} from "@/data/agileFunctions";

interface AgileFunctionCardProps {
  agileFunction: AgileFunction;
  onExecute: (func: AgileFunction) => void;
}

const AgileFunctionCard = ({ agileFunction, onExecute }: AgileFunctionCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critique': return 'destructive';
      case 'High': return 'default';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating': return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Play className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-accent/20 hover:border-accent/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium line-clamp-2 group-hover:text-accent transition-colors">
              {agileFunction.fonction}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {agileFunction.focus}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {getStatusIcon(agileFunction.status)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant={getPriorityColor(agileFunction.priorite)} className="text-xs">
            {agileFunction.priorite}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {agileFunction.categorie.split(' / ')[0]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {agileFunction.status === 'generating' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Génération en cours...</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-1" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {agileFunction.estimated_time || "5 min"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground truncate">
                {agileFunction.kpi || "KPI non défini"}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Réglementation:</span> {agileFunction.liens_reglementaires}
          </div>

          {agileFunction.agent_owner && (
            <div className="text-xs">
              <span className="text-muted-foreground">Agent:</span>{" "}
              <span className="text-accent font-medium">{agileFunction.agent_owner}</span>
            </div>
          )}

          <div className="flex gap-1 pt-2">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onExecute(agileFunction)}
              disabled={agileFunction.status === 'generating'}
            >
              <Play className="h-3 w-3 mr-1" />
              {agileFunction.status === 'generating' ? 'En cours...' : 'Exécuter'}
            </Button>
            
            {agileFunction.status === 'completed' && (
              <Button variant="outline" size="sm" className="h-8 px-2">
                <Download className="h-3 w-3" />
              </Button>
            )}
            
            <Button variant="outline" size="sm" className="h-8 px-2">
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AgileFunctionsHub = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const categories = getAgileCategories();
  const priorities = getAgilePriorities();
  const filteredFunctions = filterAgileFunctions(searchTerm, selectedCategory === 'all' ? '' : selectedCategory, selectedPriority === 'all' ? '' : selectedPriority);

  const handleExecuteFunction = (func: AgileFunction) => {
    if (func.template_id) {
      // Rediriger vers DocuGen avec le template spécifique
      navigate(`/docugen?template=${func.template_id}`);
      toast.success(`Lancement de ${func.fonction} via DocuGen 2.0`);
    } else {
      // Simulation d'exécution pour les fonctions sans template
      toast.success(`Exécution de: ${func.fonction}`);
      // Ici vous pourrez intégrer vos agents spécifiques
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedPriority('all');
  };

  const criticalFunctions = filteredFunctions.filter(f => f.priorite === 'Critique');
  const highPriorityFunctions = filteredFunctions.filter(f => f.priorite === 'High');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold">Fonctions Agiles SST</h1>
        </div>
        <p className="text-muted-foreground">
          Accélérez votre conformité avec 200+ fonctions basées sur LMRSST, CSTC, RBQ et autres réglementations
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-sm font-medium">Critiques</div>
                <div className="text-2xl font-bold">{criticalFunctions.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">Priorité Haute</div>
                <div className="text-2xl font-bold">{highPriorityFunctions.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Total Fonctions</div>
                <div className="text-2xl font-bold">{filteredFunctions.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Disponibles</div>
                <div className="text-2xl font-bold">{filteredFunctions.filter(f => !f.status || f.status === 'available').length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une fonction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les priorités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grille des fonctions */}
      {filteredFunctions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune fonction trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Aucune fonction ne correspond à vos critères de recherche.
            </p>
            <Button onClick={clearFilters}>Effacer les filtres</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFunctions.map((func) => (
            <AgileFunctionCard
              key={func.id}
              agileFunction={func}
              onExecute={handleExecuteFunction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgileFunctionsHub;