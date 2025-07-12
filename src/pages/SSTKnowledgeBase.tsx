import { useState, useEffect } from "react";
import { Search, Filter, BarChart3, FileText, Database, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

interface SSTKnowledge {
  id: string;
  title: string;
  content: string;
  source_id: string;
  category_id: string;
  keywords: string[];
  url?: string;
  relevance_score?: number;
  created_at: string;
  updated_at: string;
  source?: {
    name: string;
    type: string;
    region: string;
  };
  category?: {
    name: string;
    description: string;
  };
}

interface SearchStats {
  total_documents: number;
  total_sources: number;
  total_categories: number;
  results_count: number;
}

const SSTKnowledgeBase = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SSTKnowledge[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxResults, setMaxResults] = useState([10]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<SearchStats>({
    total_documents: 0,
    total_sources: 0,
    total_categories: 0,
    results_count: 0
  });

  // Charger les sources et catégories au montage
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Charger les sources
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('sst_sources')
        .select('*')
        .order('name');

      if (sourcesError) throw sourcesError;

      // Charger les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('sst_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Charger les statistiques
      const { data: knowledgeCount } = await supabase
        .from('sst_knowledge')
        .select('id', { count: 'exact' });

      setSources(sourcesData || []);
      setCategories(categoriesData || []);
      setSelectedSources(sourcesData?.map(s => s.id) || []);
      setSelectedCategories(categoriesData?.map(c => c.id) || []);
      
      setStats(prev => ({
        ...prev,
        total_documents: knowledgeCount?.length || 0,
        total_sources: sourcesData?.length || 0,
        total_categories: categoriesData?.length || 0
      }));

    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données initiales",
        variant: "destructive"
      });
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Recherche vide",
        description: "Veuillez entrer un terme de recherche",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Recherche avec filtres
      let query = supabase
        .from('sst_knowledge')
        .select(`
          *,
          source:sst_sources(*),
          category:sst_categories(*)
        `)
        .limit(maxResults[0]);

      // Filtrer par sources sélectionnées
      if (selectedSources.length > 0) {
        query = query.in('source_id', selectedSources);
      }

      // Filtrer par catégories sélectionnées
      if (selectedCategories.length > 0) {
        query = query.in('category_id', selectedCategories);
      }

      // Recherche textuelle dans le titre et le contenu
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,keywords.cs.{${searchQuery}}`);

      const { data, error } = await query;

      if (error) throw error;

      // Calculer un score de pertinence simple
      const resultsWithScore = (data || []).map(item => ({
        ...item,
        relevance_score: calculateRelevanceScore(item, searchQuery)
      })).sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

      setResults(resultsWithScore);
      setStats(prev => ({ ...prev, results_count: resultsWithScore.length }));

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible d'effectuer la recherche",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRelevanceScore = (item: any, query: string): number => {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Score basé sur la correspondance dans le titre (poids plus élevé)
    if (item.title?.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Score basé sur la correspondance dans le contenu
    const contentMatches = (item.content?.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
    score += contentMatches * 2;

    // Score basé sur les mots-clés
    if (item.keywords?.some((keyword: string) => keyword.toLowerCase().includes(queryLower))) {
      score += 5;
    }

    return Math.min(score, 100); // Normaliser sur 100
  };

  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-primary/20 text-primary font-medium">$1</mark>');
  };

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Base de Connaissances SST
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recherche sémantique dans les ressources de santé et sécurité au travail du Québec
          </p>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.total_documents}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.total_sources}</div>
              <div className="text-sm text-muted-foreground">Sources</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.total_categories}</div>
              <div className="text-sm text-muted-foreground">Catégories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.results_count}</div>
              <div className="text-sm text-muted-foreground">Résultats</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filtres */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtres de recherche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nombre de résultats */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Nombre de résultats: {maxResults[0]}
                  </label>
                  <Slider
                    value={maxResults}
                    onValueChange={setMaxResults}
                    max={50}
                    min={5}
                    step={5}
                  />
                </div>

                <Separator />

                {/* Filtres par source */}
                <div className="space-y-3">
                  <h4 className="font-medium">Sources</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {sources.map((source) => (
                        <div key={source.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`source-${source.id}`}
                            checked={selectedSources.includes(source.id)}
                            onCheckedChange={() => handleSourceToggle(source.id)}
                          />
                          <label 
                            htmlFor={`source-${source.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {source.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                {/* Filtres par catégorie */}
                <div className="space-y-3">
                  <h4 className="font-medium">Catégories</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => handleCategoryToggle(category.id)}
                          />
                          <label 
                            htmlFor={`category-${category.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Barre de recherche */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Rechercher dans la base de connaissances SST... (ex: prévention des chutes, EPI, risques chimiques)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                      className="text-lg"
                    />
                  </div>
                  <Button 
                    onClick={performSearch}
                    disabled={isLoading}
                    size="lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {isLoading ? "Recherche..." : "Rechercher"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Résultats */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Résultats de recherche ({results.length})
                </h2>
                
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">
                            {result.source?.name || 'Source inconnue'}
                          </Badge>
                          <Badge variant="outline">
                            {result.category?.name || 'Catégorie inconnue'}
                          </Badge>
                          {result.relevance_score && (
                            <Badge variant="default">
                              Score: {result.relevance_score}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">
                        <span 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(result.title, searchQuery) 
                          }} 
                        />
                      </h3>
                      
                      <div className="text-muted-foreground mb-4">
                        <span 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(
                              result.content.length > 300 
                                ? result.content.substring(0, 300) + "..." 
                                : result.content, 
                              searchQuery
                            ) 
                          }} 
                        />
                      </div>
                      
                      {result.keywords && result.keywords.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-4">
                          {result.keywords.slice(0, 5).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {result.url && (
                        <div className="text-right">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto"
                            onClick={() => window.open(result.url, '_blank')}
                          >
                            Voir la source originale →
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Message d'accueil ou aucun résultat */}
            {!isLoading && results.length === 0 && searchQuery && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
                  <p className="text-muted-foreground">
                    Essayez de modifier vos termes de recherche ou vos filtres
                  </p>
                </CardContent>
              </Card>
            )}

            {!searchQuery && results.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Database className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Bienvenue dans la base de connaissances SST
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Recherchez dans les ressources officielles de santé et sécurité au travail du Québec
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <h4 className="font-medium mb-2">Exemples de recherche</h4>
                      <div className="space-y-1">
                        {[
                          "prévention des chutes",
                          "équipements de protection",
                          "risques chimiques",
                          "formation sécurité",
                          "cadenassage"
                        ].map((example) => (
                          <Button
                            key={example}
                            variant="link"
                            className="p-0 h-auto text-sm"
                            onClick={() => {
                              setSearchQuery(example);
                              performSearch();
                            }}
                          >
                            {example}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SSTKnowledgeBase;