import { lesionsDataIntegrator } from '@/lib/lesionsDataIntegration';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { 
  RefreshCw, 
  Database, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Download,
  GitBranch,
  Calendar,
  BarChart3,
  Upload,
  Globe
} from 'lucide-react';
import { CnesstDataImport } from './CnesstDataImport';
import { ManualDataUpload } from './ManualDataUpload';

export function SafetyDataSync() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleSyncData = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Synchronisation en cours...",
        description: "Récupération des données depuis SafetyAgentic"
      });

      const { data, error } = await supabase.functions.invoke('git-sst-data-sync', {
        body: {
          action: 'sync_lesions_data',
          gitRepoUrl: 'https://github.com/Preventera/SafetyAgentic',
          dataPath: 'donnees',
          filters: { 
            province: 'QC',
            anneeDebut: 2020,
            anneeFin: 2024
          }
        }
      });

      if (error) throw error;

      setSyncStats(data.data);
      setLastSync(new Date().toISOString());
      
      toast({
        title: "✅ Synchronisation réussie",
        description: `${data.data.recordsProcessed} enregistrements traités`
      });

    } catch (error) {
      console.error('Erreur sync:', error);
      toast({
        title: "❌ Erreur de synchronisation",
        description: "Impossible de synchroniser les données",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeTrends = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('git-sst-data-sync', {
        body: {
          action: 'analyze_trends',
          gitRepoUrl: 'https://github.com/Preventera/SafetyAgentic',
          filters: { anneeDebut: 2020, anneeFin: 2024 }
        }
      });

      if (error) throw error;

      toast({
        title: "📊 Analyse terminée",
        description: `Tendances analysées sur ${data.insights.periodeAnalyse}`
      });

    } catch (error) {
      console.error('Erreur analyse:', error);
      toast({
        title: "❌ Erreur d'analyse",
        description: "Impossible d'analyser les tendances",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchRepoStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('git-sst-data-sync', {
        body: {
          action: 'fetch_git_stats',
          gitRepoUrl: 'https://github.com/Preventera/SafetyAgentic'
        }
      });

      if (error) throw error;

      toast({
        title: "📋 Stats du dépôt",
        description: `Dernière mise à jour: ${new Date(data.repoInfo.lastUpdate).toLocaleDateString('fr-CA')}`
      });

    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec onglets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Intégration des données de lésions
              </CardTitle>
              <CardDescription>
                Synchronisation et import de données réelles de lésions professionnelles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="git" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="git" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                SafetyAgentic
              </TabsTrigger>
              <TabsTrigger value="cnesst" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Import CNESST
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload manuel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="git" className="mt-6">
              <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Synchronisation SafetyAgentic
              </CardTitle>
              <CardDescription>
                Intégration des données réelles de lésions professionnelles du Québec
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Preventera/SafetyAgentic
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleSyncData} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Synchroniser les données
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleAnalyzeTrends}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Analyser les tendances
            </Button>

            <Button 
              variant="ghost" 
              onClick={handleFetchRepoStats}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Stats du dépôt
            </Button>
          </div>
        </CardContent>
      </Card>
            </TabsContent>

            <TabsContent value="cnesst" className="mt-6">
              <CnesstDataImport />
            </TabsContent>

            <TabsContent value="manual" className="mt-6">
              <ManualDataUpload />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Statistiques de synchronisation */}
      {syncStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                Enregistrements traités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{syncStats.recordsProcessed}</div>
              <p className="text-xs text-muted-foreground">
                {syncStats.recordsInserted} nouveaux, {syncStats.recordsUpdated} mis à jour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dernière synchronisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono">
                {lastSync ? new Date(lastSync).toLocaleString('fr-CA') : 'Jamais'}
              </div>
              <p className="text-xs text-muted-foreground">
                Synchronisation automatique
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Statut
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="flex items-center gap-1 w-fit">
                <CheckCircle className="h-3 w-3" />
                Synchronisé
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Données à jour
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Résumé des statistiques */}
      {syncStats?.statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Aperçu des données synchronisées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <div className="text-lg font-semibold">
                  {syncStats.statistics.resume.totalCas.toLocaleString('fr-CA')}
                </div>
                <div className="text-sm text-muted-foreground">Cas totaux</div>
              </div>
              
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <div className="text-lg font-semibold">
                  {Math.round(syncStats.statistics.resume.totalCouts / 1000000)}M$
                </div>
                <div className="text-sm text-muted-foreground">Coûts totaux</div>
              </div>
              
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <div className="text-lg font-semibold">
                  {syncStats.statistics.resume.coutMoyenParCas.toLocaleString('fr-CA')}$
                </div>
                <div className="text-sm text-muted-foreground">Coût moyen/cas</div>
              </div>
              
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <div className="text-lg font-semibold">
                  {syncStats.statistics.periodeAnalysee.nombreAnnees}
                </div>
                <div className="text-sm text-muted-foreground">Années d'historique</div>
              </div>
            </div>

            {/* Top 5 des types de lésions */}
            {syncStats.statistics.topLesions && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Types de lésions les plus fréquents</h4>
                <div className="space-y-2">
                  {syncStats.statistics.topLesions.slice(0, 5).map((lesion: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent/30 rounded">
                      <span className="text-sm">{lesion.type}</span>
                      <Badge variant="secondary">{lesion.cas} cas</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informations sur l'intégration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            À propos de l'intégration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Source:</strong> Dépôt SafetyAgentic (Preventera) avec données CNESST réelles
          </p>
          <p>
            <strong>Fréquence:</strong> Synchronisation manuelle ou automatique via webhook Git
          </p>
          <p>
            <strong>Données:</strong> Lésions professionnelles, statistiques sectorielles, analyses prédictives
          </p>
          <p>
            <strong>Enrichissement:</strong> Diagnostics, recommandations et insights basés sur données réelles
          </p>
        </CardContent>
      </Card>
    </div>
  );
}