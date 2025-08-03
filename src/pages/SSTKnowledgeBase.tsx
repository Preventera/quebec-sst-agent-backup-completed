import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, BookOpen, ExternalLink, TrendingUp, Database, Users, FileText, BarChart3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

interface SSTKnowledge {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  source_name: string;
  url: string;
  section: string | null;
  article_number: string | null;
  created_at: string;
  relevance_score?: number;
}

interface SearchStats {
  totalDocuments: number;
  totalSources: number;
  searchResults: number;
}

const SSTKnowledgeBase = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SSTKnowledge[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [maxResults, setMaxResults] = useState([10]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [allContent, setAllContent] = useState<SSTKnowledge[]>([]);
  const [stats, setStats] = useState<SearchStats>({
    totalDocuments: 0,
    totalSources: 0,
    searchResults: 0
  });

  // Charger les données depuis Supabase
  const loadSSTData = async () => {
    try {
      setIsLoadingData(true);
      
      // Récupérer le contenu avec les sources
      const { data: contentData, error: contentError } = await supabase
        .from('sst_crawled_content')
        .select(`
          id,
          title,
          content,
          tags,
          url,
          section,
          article_number,
          created_at,
          sst_sources!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (contentError) {
        throw contentError;
      }

      // Transformer les données pour l'interface
      const transformedContent: SSTKnowledge[] = (contentData || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        tags: item.tags,
        source_name: (item.sst_sources as any)?.name || 'Source inconnue',
        url: item.url,
        section: item.section,
        article_number: item.article_number,
        created_at: item.created_at
      }));

      // Extraire les sources uniques
      const sources = [...new Set(transformedContent.map(item => item.source_name))];
      
      setAllContent(transformedContent);
      setAvailableSources(sources);
      setSelectedSources(sources); // Sélectionner toutes les sources par défaut
      
      setStats({
        totalDocuments: transformedContent.length,
        totalSources: sources.length,
        searchResults: 0
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données SST:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la base de connaissances",
        variant: "destructive"
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const performSearch = () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setStats(prev => ({ ...prev, searchResults: 0 }));
      return;
    }

    setIsLoading(true);
    
    // Simulation d'un délai pour l'expérience utilisateur
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      
      // Filtrer les résultats
      const filteredResults = allContent
        .filter(item => {
          // Filtre par source
          const sourceMatch = selectedSources.includes(item.source_name);
          
          // Recherche textuelle
          const titleMatch = item.title.toLowerCase().includes(query);
          const contentMatch = item.content.toLowerCase().includes(query);
          const tagsMatch = item.tags ? item.tags.some(tag => 
            tag.toLowerCase().includes(query)
          ) : false;
          const sectionMatch = item.section ? item.section.toLowerCase().includes(query) : false;
          const articleMatch = item.article_number ? item.article_number.toLowerCase().includes(query) : false;
          
          return sourceMatch && (titleMatch || contentMatch || tagsMatch || sectionMatch || articleMatch);
        })
        .map(item => ({
          ...item,
          relevance_score: calculateRelevanceScore(item, query)
        }))
        .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
        .slice(0, maxResults[0]);
      
      setResults(filteredResults);
      setStats(prev => ({ ...prev, searchResults: filteredResults.length }));
      setIsLoading(false);
    }, 300);
  };

  const calculateRelevanceScore = (item: SSTKnowledge, query: string): number => {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Score basé sur la correspondance dans le titre (poids plus élevé)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    // Score basé sur la correspondance dans le contenu
    const contentMatches = (item.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
    score += contentMatches * 5;

    // Score basé sur les tags
    if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
      score += 30;
    }

    // Score basé sur la section
    if (item.section && item.section.toLowerCase().includes(queryLower)) {
      score += 20;
    }

    // Score basé sur le numéro d'article
    if (item.article_number && item.article_number.toLowerCase().includes(queryLower)) {
      score += 40;
    }

    return Math.min(score, 100);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    // Safe text highlighting using React components instead of dangerouslySetInnerHTML
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-primary/20 text-primary font-medium">
          {part}
        </mark>
      ) : part
    );
  };

  const handleSourceToggle = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };


  // Charger les données au montage du composant
  useEffect(() => {
    loadSSTData();
  }, []);

  // Effectuer la recherche quand les filtres changent
  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [selectedSources, maxResults, allContent]);

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
            Recherche dans les ressources de santé et sécurité au travail du Québec
          </p>
          {isLoadingData && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de la base de connaissances...
            </div>
          )}
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">
                {isLoadingData ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.totalDocuments}
              </div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">
                {isLoadingData ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.totalSources}
              </div>
              <div className="text-sm text-muted-foreground">Sources</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.searchResults}</div>
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
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {availableSources.map((source) => (
                        <div key={source} className="flex items-center space-x-2">
                          <Checkbox
                            id={`source-${source}`}
                            checked={selectedSources.includes(source)}
                            onCheckedChange={() => handleSourceToggle(source)}
                            disabled={isLoadingData}
                          />
                          <label 
                            htmlFor={`source-${source}`}
                            className="text-sm cursor-pointer"
                          >
                            {source}
                          </label>
                        </div>
                      ))}
                      {isLoadingData && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
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
                    disabled={isLoading || isLoadingData}
                    size="lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {isLoading ? "Recherche..." : "Rechercher"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* État de chargement */}
            {isLoadingData && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Chargement de la base de connaissances SST...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Résultats */}
            {!isLoadingData && results.length > 0 && (
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
                            {result.source_name}
                          </Badge>
                          {result.section && (
                            <Badge variant="outline">
                              {result.section}
                            </Badge>
                          )}
                          {result.article_number && (
                            <Badge variant="outline">
                              Article {result.article_number}
                            </Badge>
                          )}
                          {result.relevance_score && (
                            <Badge variant="default">
                              Score: {result.relevance_score}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">
                        {highlightText(result.title, searchQuery)}
                      </h3>
                      
                      <div className="text-muted-foreground mb-4">
                        {highlightText(
                          result.content.length > 400 
                            ? result.content.substring(0, 400) + "..." 
                            : result.content, 
                          searchQuery
                        )}
                      </div>
                      
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-4">
                          {result.tags.slice(0, 6).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          Publié le {new Date(result.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(result.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Voir la source
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Message d'introduction si aucune recherche */}
            {!isLoadingData && !searchQuery && allContent.length > 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Recherche dans la base de connaissances SST
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Utilisez la barre de recherche ci-dessus pour explorer notre collection de ressources en santé et sécurité au travail. 
                    Vous pouvez rechercher par mots-clés, sujets spécifiques, références réglementaires, ou numéros d'articles.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-2">
                      <h4 className="font-medium">Exemples de recherche :</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• "prévention des chutes"</li>
                        <li>• "équipement de protection"</li>
                        <li>• "exposition chimique"</li>
                        <li>• "article 51"</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Sources disponibles :</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {availableSources.slice(0, 4).map(source => (
                          <li key={source}>• {source}</li>
                        ))}
                        {availableSources.length > 4 && (
                          <li className="text-xs">... et {availableSources.length - 4} autres</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Message si aucune donnée chargée */}
            {!isLoadingData && allContent.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Base de connaissances vide
                  </h3>
                  <p className="text-muted-foreground">
                    Aucun contenu SST n'a encore été crawlé. Utilisez le tableau de bord de crawling pour ajouter des sources.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Message si aucun résultat */}
            {!isLoadingData && searchQuery && results.length === 0 && !isLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Votre recherche "{searchQuery}" n'a donné aucun résultat.
                  </p>
                  <div className="text-left max-w-md mx-auto">
                    <h4 className="font-medium mb-2">Suggestions :</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Vérifiez l'orthographe de vos mots-clés</li>
                      <li>• Essayez des termes plus généraux</li>
                      <li>• Modifiez les filtres de source</li>
                      <li>• Utilisez des synonymes</li>
                    </ul>
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