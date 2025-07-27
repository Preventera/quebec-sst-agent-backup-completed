import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Bot, Calendar, Database, Globe, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface SSTSource {
  id: string;
  name: string;
  url: string;
  source_type: string;
  crawl_frequency: number;
  last_crawled_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface CrawledContent {
  id: string;
  title: string;
  content: string;
  url: string;
  article_number: string | null;
  section: string | null;
  tags: string[];
  last_updated_at: string;
  crawled_at: string;
  source_id: string;
  sst_sources?: {
    name: string;
    source_type: string;
  };
}

interface ContentChange {
  id: string;
  change_type: string;
  summary: string;
  detected_at: string;
  notified: boolean;
  sst_crawled_content?: {
    title: string;
    url: string;
    sst_sources?: {
      name: string;
    };
  };
}

interface CrawlStats {
  totalSources: number;
  activeSources: number;
  totalContent: number;
  recentChanges: number;
  lastCrawl: string | null;
}

export default function CrawlingDashboard() {
  const [sources, setSources] = useState<SSTSource[]>([]);
  const [content, setContent] = useState<CrawledContent[]>([]);
  const [changes, setChanges] = useState<ContentChange[]>([]);
  const [stats, setStats] = useState<CrawlStats>({
    totalSources: 0,
    activeSources: 0,
    totalContent: 0,
    recentChanges: 0,
    lastCrawl: null
  });
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSources(),
        loadContent(),
        loadChanges(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de crawling",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSources = async () => {
    const { data, error } = await supabase
      .from('sst_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setSources(data || []);
  };

  const loadContent = async () => {
    const { data, error } = await supabase
      .from('sst_crawled_content')
      .select(`
        *,
        sst_sources!inner(name, source_type)
      `)
      .order('crawled_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    setContent(data || []);
  };

  const loadChanges = async () => {
    const { data, error } = await supabase
      .from('sst_content_changes')
      .select(`
        *,
        sst_crawled_content!inner(
          title,
          url,
          sst_sources!inner(name)
        )
      `)
      .order('detected_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    setChanges(data || []);
  };

  const loadStats = async () => {
    // Statistiques des sources
    const { data: sourcesData } = await supabase
      .from('sst_sources')
      .select('is_active, last_crawled_at');

    // Statistiques du contenu
    const { data: contentData } = await supabase
      .from('sst_crawled_content')
      .select('id');

    // Changements récents (dernière semaine)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data: changesData } = await supabase
      .from('sst_content_changes')
      .select('id')
      .gte('detected_at', oneWeekAgo.toISOString());

    const activeSources = sourcesData?.filter(s => s.is_active) || [];
    const lastCrawl = sourcesData?.reduce((latest: string | null, source) => {
      if (!source.last_crawled_at) return latest;
      return !latest || source.last_crawled_at > latest ? source.last_crawled_at : latest;
    }, null as string | null);

    setStats({
      totalSources: sourcesData?.length || 0,
      activeSources: activeSources.length,
      totalContent: contentData?.length || 0,
      recentChanges: changesData?.length || 0,
      lastCrawl
    });
  };

  const startCrawl = async (sourceId?: string) => {
    setCrawling(true);
    setCrawlProgress(0);

    try {
      const action = sourceId ? 'crawl_source' : 'crawl_all';
      const payload = sourceId ? { action, sourceId } : { action };

      const { data, error } = await supabase.functions.invoke('sst-crawler', {
        body: payload
      });

      if (error) throw error;

      // Simuler le progrès pour l'UI
      const progressInterval = setInterval(() => {
        setCrawlProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Attendre un peu puis finaliser
      setTimeout(() => {
        clearInterval(progressInterval);
        setCrawlProgress(100);
        
        setTimeout(() => {
          setCrawling(false);
          setCrawlProgress(0);
          loadData(); // Recharger les données
          
          toast({
            title: "Crawling terminé",
            description: data.message || "Le crawling s'est terminé avec succès",
          });
        }, 1000);
      }, 2000);

    } catch (error) {
      console.error('Crawl error:', error);
      setCrawling(false);
      setCrawlProgress(0);
      
      toast({
        title: "Erreur de crawling",
        description: "Impossible d'exécuter le crawling",
        variant: "destructive",
      });
    }
  };

  const getSourceTypeColor = (type: string) => {
    const colors = {
      'LMRSST': 'bg-blue-500',
      'RSST': 'bg-green-500',
      'CNESST_GUIDE': 'bg-orange-500',
      'CNESST_BULLETIN': 'bg-purple-500',
      'PUBLICATION_QUEBEC': 'bg-red-500',
      'JURISPRUDENCE': 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-400';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  const filteredContent = selectedSourceType === 'all' 
    ? content 
    : content.filter(c => c.sst_sources?.source_type === selectedSourceType);

  const sourceTypes = [...new Set(sources.map(s => s.source_type))];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Crawling SST</h1>
          <p className="text-muted-foreground">
            Surveillance automatique des mises à jour réglementaires
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => loadData()}
            variant="outline"
            disabled={crawling}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button
            onClick={() => startCrawl()}
            disabled={crawling}
            className="bg-primary hover:bg-primary/90"
          >
            {crawling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Crawling...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Lancer Crawling Global
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Barre de progression du crawling */}
      {crawling && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Crawling en cours...</span>
                <span>{crawlProgress}%</span>
              </div>
              <Progress value={crawlProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sources Totales</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSources}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSources} actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenu Crawlé</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent}</div>
            <p className="text-xs text-muted-foreground">
              Documents disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Changements Récents</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentChanges}</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernier Crawl</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {stats.lastCrawl ? formatTimeAgo(stats.lastCrawl) : 'Jamais'}
            </div>
            <p className="text-xs text-muted-foreground">
              Dernière mise à jour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="content">Contenu Crawlé</TabsTrigger>
          <TabsTrigger value="changes">Changements</TabsTrigger>
        </TabsList>

        {/* Sources */}
        <TabsContent value="sources">
          <div className="grid gap-4">
            {sources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <CardDescription>{source.url}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`text-white ${getSourceTypeColor(source.source_type)}`}
                      >
                        {source.source_type}
                      </Badge>
                      {source.is_active ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Inactif
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>Fréquence: {Math.floor(source.crawl_frequency / 3600)}h</p>
                      <p>
                        Dernier crawl: {
                          source.last_crawled_at 
                            ? formatTimeAgo(source.last_crawled_at)
                            : 'Jamais'
                        }
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => startCrawl(source.id)}
                      disabled={crawling || !source.is_active}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Crawler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contenu Crawlé */}
        <TabsContent value="content">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedSourceType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSourceType('all')}
              >
                Tous
              </Button>
              {sourceTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedSourceType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSourceType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="grid gap-4">
              {filteredContent.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription>
                          Source: {item.sst_sources?.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-white ${getSourceTypeColor(item.sst_sources?.source_type || '')}`}>
                          {item.sst_sources?.source_type}
                        </Badge>
                        {item.article_number && (
                          <Badge variant="outline">
                            Art. {item.article_number}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3 line-clamp-3">
                      {item.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex gap-4">
                        <span>Crawlé: {formatTimeAgo(item.crawled_at)}</span>
                        {item.section && <span>Section: {item.section}</span>}
                      </div>
                      <div className="flex gap-1">
                        {item.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Changements */}
        <TabsContent value="changes">
          <div className="grid gap-4">
            {changes.map((change) => (
              <Card key={change.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <CardTitle className="text-base">
                          {change.sst_crawled_content?.title}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        Source: {change.sst_crawled_content?.sst_sources?.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={change.change_type === 'NEW' ? 'default' : 'secondary'}
                      >
                        {change.change_type === 'NEW' ? 'Nouveau' : 
                         change.change_type === 'UPDATED' ? 'Modifié' : 'Supprimé'}
                      </Badge>
                      {!change.notified && (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Non notifié
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{change.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    Détecté: {formatTimeAgo(change.detected_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}