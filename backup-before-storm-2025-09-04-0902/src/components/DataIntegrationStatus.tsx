import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Calendar
} from 'lucide-react';
import { UserRole } from './RoleSelector';

interface SyncStatus {
  status: 'success' | 'warning' | 'error' | 'pending';
  lastSync: string | null;
  nextSync?: string;
  recordsCount?: number;
  confidence?: number;
}

interface DataIntegrationStatusProps {
  userRole: UserRole;
  syncStatus: SyncStatus;
  onSync?: () => void;
  onViewTrends?: () => void;
  onViewDetails?: () => void;
  isLoading?: boolean;
}

export function DataIntegrationStatus({ 
  userRole, 
  syncStatus, 
  onSync, 
  onViewTrends, 
  onViewDetails,
  isLoading = false 
}: DataIntegrationStatusProps) {
  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (syncStatus.status) {
      case 'success':
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">✅ Synchronisé</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">⚠️ Attention</Badge>;
      case 'error':
        return <Badge variant="destructive">❌ Erreur</Badge>;
      case 'pending':
        return <Badge variant="outline">🔄 En attente</Badge>;
      default:
        return <Badge variant="outline">➖ Non configuré</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Vue Direction - Focus sur confiance et ROI
  if (userRole === 'direction') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              État des données CNESST
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
            <div>
              <div className="text-2xl font-bold text-success">
                {syncStatus.confidence || 95}%
              </div>
              <p className="text-sm text-muted-foreground">Confiance dans les données</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Dernière mise à jour</p>
              <p className="text-xs text-muted-foreground">{formatDate(syncStatus.lastSync)}</p>
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            Vos décisions sont basées sur des données CNESST réelles et à jour
          </p>
          
          {onViewTrends && (
            <Button onClick={onViewTrends} className="w-full" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Voir les tendances
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Vue Comité SST - Focus sur suivi opérationnel
  if (userRole === 'comite') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Suivi des données SST
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-accent/50 rounded-lg">
              <div className="text-lg font-bold">
                {syncStatus.recordsCount?.toLocaleString('fr-CA') || '3,245'}
              </div>
              <p className="text-xs text-muted-foreground">Lésions intégrées</p>
            </div>
            <div className="p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className="text-sm font-medium">
                  {syncStatus.status === 'success' ? 'À jour' : 'Action requise'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Statut global</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">SafetyAgentic</span>
              <Badge variant={syncStatus.status === 'success' ? 'default' : 'secondary'}>
                {syncStatus.status === 'success' ? '✅ Réussi' : '⚠️ En attente'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">CNESST Direct</span>
              <Badge variant="outline">⚠️ Configurer</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {onSync && (
              <Button onClick={onSync} disabled={isLoading} size="sm" className="flex-1">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Synchroniser
              </Button>
            )}
            {onViewDetails && (
              <Button onClick={onViewDetails} variant="outline" size="sm" className="flex-1">
                Configurer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vue Superviseur - Focus sur alertes
  if (userRole === 'superviseur') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Données CNESST</CardTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {syncStatus.status === 'success' ? 'Synchronisé' : 'Action requise'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {syncStatus.status === 'error' && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
              <p className="text-sm text-destructive font-medium">
                ❌ Données CNESST non synchronisées depuis 10 jours
              </p>
              <p className="text-xs text-destructive/80 mt-1">
                Certaines analyses peuvent être obsolètes
              </p>
            </div>
          )}

          {syncStatus.status === 'warning' && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg mb-4">
              <p className="text-sm text-warning font-medium">
                ⚠️ Certaines données manuelles doivent être validées
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {onSync && (
              <Button onClick={onSync} disabled={isLoading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Synchroniser maintenant
              </Button>
            )}
            {onViewDetails && (
              <Button onClick={onViewDetails} variant="outline" size="sm">
                Vérifier anomalies
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vue Consultant/Expert - Focus sur données techniques
  if (userRole === 'consultant') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Intégration technique SafetyAgentic
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Preventera/SafetyAgentic
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Statut synchronisation</p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge()}
                <span className="text-xs text-muted-foreground">
                  {formatDate(syncStatus.lastSync)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Mode</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">Auto</Badge>
                <span className="text-xs text-muted-foreground">Webhook activé ✔</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-accent/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Logs de synchronisation</span>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                Voir détails
              </Button>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>✅ 16 août 2025, 12:30 - 3,245 enregistrements</p>
              <p>✅ 9 août 2025, 12:30 - 3,187 enregistrements</p>
              <p>⚠️ 2 août 2025, 12:30 - Timeout réseau</p>
            </div>
          </div>

          <div className="flex gap-2">
            {onSync && (
              <Button onClick={onSync} disabled={isLoading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Synchroniser
              </Button>
            )}
            {onViewTrends && (
              <Button onClick={onViewTrends} variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyser tendances
              </Button>
            )}
            <Button variant="ghost" size="sm">
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vue Responsable conformité - Focus sur traçabilité
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Traçabilité réglementaire
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-accent/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Journal des imports</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Import CNESST #2024-08-16</span>
              <Badge variant="default" className="text-xs">Certifié</Badge>
            </div>
            <div className="flex justify-between">
              <span>Upload manuel #2024-08-09</span>
              <Badge variant="secondary" className="text-xs">Validé</Badge>
            </div>
          </div>
        </div>

        {syncStatus.status !== 'success' && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-warning font-medium">
              ⚠️ Import CNESST manquant pour période juillet 2024
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {onViewDetails && (
            <Button onClick={onViewDetails} variant="outline" size="sm" className="flex-1">
              Générer preuve
            </Button>
          )}
          {onSync && (
            <Button onClick={onSync} disabled={isLoading} size="sm" className="flex-1">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Importer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}