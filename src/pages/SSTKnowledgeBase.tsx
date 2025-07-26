import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, BookOpen, ExternalLink, TrendingUp, Database, Users, FileText, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface SSTKnowledge {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  source: string;
  category: string;
  created_at: string;
  relevance_score?: number;
}

interface SearchStats {
  totalDocuments: number;
  totalSources: number;
  totalCategories: number;
  searchResults: number;
}

// Données de démonstration temporaires (en attendant la synchronisation des types Supabase)
const demoSources = ['CNESST', 'IRSST', 'ASP Construction', 'ASP Secteur Minier'];
const demoCategories = ['Sécurité générale', 'Construction', 'Santé au travail', 'Recherche'];

const demoKnowledge: SSTKnowledge[] = [
  {
    id: '1',
    title: 'Guide de prévention des chutes de hauteur',
    content: 'Les chutes de hauteur constituent l\'une des principales causes d\'accidents du travail dans le secteur de la construction. Ce guide présente les meilleures pratiques pour prévenir ces accidents, incluant l\'utilisation d\'équipements de protection individuelle, la mise en place de garde-corps et la formation des travailleurs.',
    keywords: ['chutes', 'hauteur', 'prévention', 'EPI', 'construction'],
    source: 'CNESST',
    category: 'Construction',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    title: 'Exposition aux poussières de silice cristalline',
    content: 'La silice cristalline alvéolaire est un agent cancérigène reconnu. Cette recherche de l\'IRSST examine les méthodes de mesure de l\'exposition et propose des stratégies de contrôle pour protéger les travailleurs dans diverses industries.',
    keywords: ['silice', 'poussières', 'cancérigène', 'exposition', 'mesure'],
    source: 'IRSST',
    category: 'Recherche',
    created_at: '2024-02-01'
  },
  {
    id: '3',
    title: 'Formation en manutention sécuritaire',
    content: 'Les troubles musculo-squelettiques représentent une part importante des lésions professionnelles. Cette formation couvre les techniques de levage sécuritaire, l\'organisation du travail et l\'aménagement des postes pour réduire les risques.',
    keywords: ['manutention', 'TMS', 'ergonomie', 'formation', 'prévention'],
    source: 'ASP Construction',
    category: 'Sécurité générale',
    created_at: '2024-01-20'
  },
  {
    id: '4',
    title: 'Protocole de cadenassage et consignation',
    content: 'Le cadenassage est essentiel pour prévenir les accidents lors de la maintenance d\'équipements. Ce protocole détaille les étapes à suivre pour isoler les sources d\'énergie et sécuriser les interventions.',
    keywords: ['cadenassage', 'consignation', 'maintenance', 'énergie', 'sécurité'],
    source: 'CNESST',
    category: 'Sécurité générale',
    created_at: '2024-01-10'
  },
  {
    id: '5',
    title: 'Risques psychosociaux au travail',
    content: 'Les facteurs psychosociaux peuvent avoir des impacts significatifs sur la santé mentale et physique des travailleurs. Cette étude examine les sources de stress au travail et propose des interventions préventives.',
    keywords: ['psychosociaux', 'stress', 'santé mentale', 'prévention', 'organisation'],
    source: 'IRSST',
    category: 'Santé au travail',
    created_at: '2024-02-05'
  },
  {
    id: '6',
    title: 'Sécurité des espaces confinés',
    content: 'Le travail en espaces confinés présente de nombreux risques : atmosphère toxique, manque d\'oxygène, risques d\'englouti ssement. Ce guide détaille les procédures d\'entrée sécuritaire et les équipements de surveillance requis.',
    keywords: ['espaces confinés', 'atmosphère', 'surveillance', 'procédures', 'risques'],
    source: 'CNESST',
    category: 'Sécurité générale',
    created_at: '2024-01-25'
  },
  {
    id: '7',
    title: 'Ergonomie des postes de travail informatiques',
    content: 'L\'ergonomie des postes informatiques est cruciale pour prévenir les troubles musculo-squelettiques. Cette recherche propose des recommandations pour l\'aménagement des postes et l\'organisation du travail.',
    keywords: ['ergonomie', 'informatique', 'postes de travail', 'TMS', 'aménagement'],
    source: 'IRSST',
    category: 'Santé au travail',
    created_at: '2024-02-10'
  },
  {
    id: '8',
    title: 'Formation à l\'utilisation des échafaudages',
    content: 'Les échafaudages sont essentiels en construction mais présentent des risques importants. Cette formation couvre l\'inspection, le montage, l\'utilisation sécuritaire et le démontage des échafaudages.',
    keywords: ['échafaudages', 'montage', 'inspection', 'formation', 'construction'],
    source: 'ASP Construction',
    category: 'Construction',
    created_at: '2024-01-30'
  }
];

const SSTKnowledgeBase = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SSTKnowledge[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>(demoSources);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(demoCategories);
  const [maxResults, setMaxResults] = useState([10]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<SearchStats>({
    totalDocuments: demoKnowledge.length,
    totalSources: demoSources.length,
    totalCategories: demoCategories.length,
    searchResults: 0
  });

  const performSearch = () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setStats(prev => ({ ...prev, searchResults: 0 }));
      return;
    }

    setIsLoading(true);
    
    // Simulation d'une recherche avec délai
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      
      // Filtrer les résultats
      const filteredResults = demoKnowledge
        .filter(item => {
          // Filtres par source et catégorie
          const sourceMatch = selectedSources.includes(item.source);
          const categoryMatch = selectedCategories.includes(item.category);
          
          // Recherche textuelle
          const titleMatch = item.title.toLowerCase().includes(query);
          const contentMatch = item.content.toLowerCase().includes(query);
          const keywordMatch = item.keywords.some(keyword => 
            keyword.toLowerCase().includes(query)
          );
          
          return sourceMatch && categoryMatch && (titleMatch || contentMatch || keywordMatch);
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
    }, 800);
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
    score += contentMatches * 10;

    // Score basé sur les mots-clés
    if (item.keywords.some(keyword => keyword.toLowerCase().includes(queryLower))) {
      score += 30;
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

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Effectuer la recherche quand les filtres changent
  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [selectedSources, selectedCategories, maxResults]);

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
          <div className="text-sm text-muted-foreground">
            Version de démonstration - En attente de synchronisation avec la base de données
          </div>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.totalDocuments}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.totalSources}</div>
              <div className="text-sm text-muted-foreground">Sources</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.totalCategories}</div>
              <div className="text-sm text-muted-foreground">Catégories</div>
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
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {demoSources.map((source) => (
                        <div key={source} className="flex items-center space-x-2">
                          <Checkbox
                            id={`source-${source}`}
                            checked={selectedSources.includes(source)}
                            onCheckedChange={() => handleSourceToggle(source)}
                          />
                          <label 
                            htmlFor={`source-${source}`}
                            className="text-sm cursor-pointer"
                          >
                            {source}
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
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {demoCategories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                          />
                          <label 
                            htmlFor={`category-${category}`}
                            className="text-sm cursor-pointer"
                          >
                            {category}
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
                            {result.source}
                          </Badge>
                          <Badge variant="outline">
                            {result.category}
                          </Badge>
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
                          result.content.length > 300 
                            ? result.content.substring(0, 300) + "..." 
                            : result.content, 
                          searchQuery
                        )}
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
                      
                      <div className="text-sm text-muted-foreground">
                        Ajouté le {new Date(result.created_at).toLocaleDateString('fr-CA')}
                      </div>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery("prévention des chutes")}
                      className="h-auto p-4 text-left flex-col items-start"
                    >
                      <BookOpen className="h-5 w-5 mb-2" />
                      Prévention des chutes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery("équipements protection")}
                      className="h-auto p-4 text-left flex-col items-start"
                    >
                      <Users className="h-5 w-5 mb-2" />
                      Équipements de protection
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery("risques chimiques")}
                      className="h-auto p-4 text-left flex-col items-start"
                    >
                      <ExternalLink className="h-5 w-5 mb-2" />
                      Risques chimiques
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery("ergonomie")}
                      className="h-auto p-4 text-left flex-col items-start"
                    >
                      <TrendingUp className="h-5 w-5 mb-2" />
                      Ergonomie
                    </Button>
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