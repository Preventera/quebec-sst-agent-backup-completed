import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, BookOpen, ExternalLink, TrendingUp, Database, Users, FileText, BarChart3, Loader2, ArrowUpDown, Calendar, Hash, Tag } from 'lucide-react';
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
  semantic_category: string | null;
  sector: string | null;
  importance: number | null;
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
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title' | 'source' | 'category' | 'importance'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'last_month' | 'last_3_months' | 'last_year'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
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
          semantic_category,
          sector,
          importance,
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
        semantic_category: item.semantic_category,
        sector: item.sector,
        importance: item.importance,
        created_at: item.created_at
      }));

      // Extraire les sources uniques
      const sources = [...new Set(transformedContent.map(item => item.source_name))];
      
      // Extraire tous les tags uniques
      const allTags = transformedContent
        .flatMap(item => item.tags || [])
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
        .sort();

      // Extraire les catégories sémantiques uniques
      const categories = [...new Set(transformedContent
        .map(item => item.semantic_category)
        .filter(Boolean)
      )].sort();

      // Extraire les secteurs uniques
      const sectors = [...new Set(transformedContent
        .map(item => item.sector)
        .filter(Boolean)
      )].sort();
      
      setAllContent(transformedContent);
      setAvailableSources(sources);
      setSelectedSources(sources); // Sélectionner toutes les sources par défaut
      setAvailableTags(allTags);
      setAvailableCategories(categories);
      setAvailableSectors(sectors);
      
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
      let filteredResults = allContent
        .filter(item => {
          // Filtre par source
          const sourceMatch = selectedSources.includes(item.source_name);
          
          // Filtre par tags
          const tagMatch = selectedTags.length === 0 || 
            (item.tags && selectedTags.some(tag => item.tags!.includes(tag)));
          
          // Filtre par catégorie sémantique
          const categoryMatch = selectedCategories.length === 0 || 
            (item.semantic_category && selectedCategories.includes(item.semantic_category));
          
          // Filtre par secteur
          const sectorMatch = selectedSectors.length === 0 || 
            (item.sector && selectedSectors.includes(item.sector));
          
          // Filtre par date
          const dateMatch = applyDateFilter(item.created_at);
          
          // Recherche textuelle
          const titleMatch = item.title.toLowerCase().includes(query);
          const contentMatch = item.content.toLowerCase().includes(query);
          const tagsMatch = item.tags ? item.tags.some(tag => 
            tag.toLowerCase().includes(query)
          ) : false;
          const sectionMatch = item.section ? item.section.toLowerCase().includes(query) : false;
          const articleMatch = item.article_number ? item.article_number.toLowerCase().includes(query) : false;
          
          return sourceMatch && tagMatch && categoryMatch && sectorMatch && dateMatch && (titleMatch || contentMatch || tagsMatch || sectionMatch || articleMatch);
        })
        .map(item => ({
          ...item,
          relevance_score: calculateRelevanceScore(item, query)
        }));

      // Appliquer le tri
      filteredResults = applySorting(filteredResults);
      
      // Limiter les résultats
      filteredResults = filteredResults.slice(0, maxResults[0]);
      
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

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const applyDateFilter = (dateString: string): boolean => {
    if (dateFilter === 'all') return true;
    
    const itemDate = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (dateFilter) {
      case 'last_month':
        return diffDays <= 30;
      case 'last_3_months':
        return diffDays <= 90;
      case 'last_year':
        return diffDays <= 365;
      default:
        return true;
    }
  };

  const applySorting = (items: (SSTKnowledge & { relevance_score: number })[]): (SSTKnowledge & { relevance_score: number })[] => {
    return items.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'relevance':
          comparison = b.relevance_score - a.relevance_score;
          break;
        case 'date':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'source':
          comparison = a.source_name.localeCompare(b.source_name);
          break;
        case 'category':
          comparison = (a.semantic_category || '').localeCompare(b.semantic_category || '');
          break;
        case 'importance':
          comparison = (b.importance || 1) - (a.importance || 1);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
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
  }, [selectedSources, selectedTags, selectedCategories, selectedSectors, dateFilter, sortBy, sortOrder, maxResults, allContent]);

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

                {/* Tri */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Trier par
                  </h4>
                  <div className="space-y-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Pertinence</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="title">Titre</SelectItem>
                        <SelectItem value="source">Source</SelectItem>
                        <SelectItem value="category">Catégorie</SelectItem>
                        <SelectItem value="importance">Importance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Décroissant</SelectItem>
                        <SelectItem value="asc">Croissant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Filtre par date */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Période
                  </h4>
                  <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les dates</SelectItem>
                      <SelectItem value="last_month">Dernier mois</SelectItem>
                      <SelectItem value="last_3_months">3 derniers mois</SelectItem>
                      <SelectItem value="last_year">Dernière année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Filtres par source */}
                <div className="space-y-3">
                  <h4 className="font-medium">Sources</h4>
                  <ScrollArea className="h-32">
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

                <Separator />

                {/* Filtres par tags */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags ({selectedTags.length})
                  </h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {availableTags.slice(0, 20).map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={() => handleTagToggle(tag)}
                            disabled={isLoadingData}
                          />
                          <label 
                            htmlFor={`tag-${tag}`}
                            className="text-sm cursor-pointer"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                      {availableTags.length > 20 && (
                        <p className="text-xs text-muted-foreground">
                          +{availableTags.length - 20} autres tags disponibles
                        </p>
                      )}
                      {isLoadingData && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                {/* Filtres par catégorie sémantique */}
                {availableCategories.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Catégories ({selectedCategories.length})
                    </h4>
                    <ScrollArea className="h-24">
                      <div className="space-y-2">
                        {availableCategories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => handleCategoryToggle(category)}
                              disabled={isLoadingData}
                            />
                            <label 
                              htmlFor={`category-${category}`}
                              className="text-sm cursor-pointer capitalize"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Filtres par secteur */}
                {availableSectors.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Secteurs ({selectedSectors.length})
                      </h4>
                      <ScrollArea className="h-24">
                        <div className="space-y-2">
                          {availableSectors.map((sector) => (
                            <div key={sector} className="flex items-center space-x-2">
                              <Checkbox
                                id={`sector-${sector}`}
                                checked={selectedSectors.includes(sector)}
                                onCheckedChange={() => handleSectorToggle(sector)}
                                disabled={isLoadingData}
                              />
                              <label 
                                htmlFor={`sector-${sector}`}
                                className="text-sm cursor-pointer capitalize"
                              >
                                {sector}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
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
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    Résultats de recherche ({results.length})
                  </h2>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>Triés par: {
                      sortBy === 'relevance' ? 'Pertinence' : 
                      sortBy === 'date' ? 'Date' : 
                      sortBy === 'title' ? 'Titre' : 
                      sortBy === 'source' ? 'Source' :
                      sortBy === 'category' ? 'Catégorie' :
                      sortBy === 'importance' ? 'Importance' : sortBy
                    }</span>
                    <span>({sortOrder === 'desc' ? 'Décroissant' : 'Croissant'})</span>
                  </div>
                </div>
                
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">
                            {result.source_name}
                          </Badge>
                          {result.semantic_category && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              {result.semantic_category}
                            </Badge>
                          )}
                          {result.sector && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {result.sector}
                            </Badge>
                          )}
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
                          {result.importance && result.importance > 1 && (
                            <Badge variant="default" className="bg-orange-100 text-orange-800">
                              Priorité {result.importance}
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