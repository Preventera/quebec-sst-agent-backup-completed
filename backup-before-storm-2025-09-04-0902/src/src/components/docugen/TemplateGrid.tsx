// Grille adaptative pour les templates avec statuts en temps réel
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  MoreVertical, 
  Play, 
  Eye, 
  History, 
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  legislation: string[];
  priority: 'mandatory' | 'recommended' | 'optional';
  estimatedTime: number; // en minutes
  outputs: string[];
  status: 'available' | 'generating' | 'completed' | 'error';
  progress?: number;
  lastGenerated?: Date;
  error?: string;
}

interface TemplateGridProps {
  templates: Template[];
  onGenerate: (templateId: string) => void;
  onPreview: (templateId: string) => void;
  onViewHistory: (templateId: string) => void;
  onDownload?: (templateId: string) => void;
}

const TemplateCard: React.FC<{
  template: Template;
  onGenerate: (id: string) => void;
  onPreview: (id: string) => void;
  onViewHistory: (id: string) => void;
  onDownload?: (id: string) => void;
}> = ({ template, onGenerate, onPreview, onViewHistory, onDownload }) => {
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'mandatory': return 'bg-red-500';
      case 'recommended': return 'bg-yellow-500';
      case 'optional': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'mandatory': return 'Obligatoire';
      case 'recommended': return 'Recommandé';
      case 'optional': return 'Optionnel';
      default: return priority;
    }
  };

  const getStatusIcon = () => {
    switch (template.status) {
      case 'available':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'generating':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusBadge = () => {
    switch (template.status) {
      case 'available':
        return <Badge variant="outline">Disponible</Badge>;
      case 'generating':
        return <Badge className="bg-blue-500 text-white">En cours...</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white">Terminé</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return null;
    }
  };

  const isActionDisabled = template.status === 'generating';

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg group",
      template.priority === 'mandatory' ? "ring-2 ring-red-500/20" : "",
      template.status === 'error' ? "border-red-500/30" : ""
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <Badge 
                className={cn(
                  "text-white text-xs",
                  getPriorityColor(template.priority)
                )}
              >
                {getPriorityLabel(template.priority)}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isActionDisabled}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onGenerate(template.id)}
                disabled={isActionDisabled}
              >
                <Play className="h-4 w-4 mr-2" />
                Générer
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onPreview(template.id)}
                disabled={isActionDisabled}
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewHistory(template.id)}>
                <History className="h-4 w-4 mr-2" />
                Historique
              </DropdownMenuItem>
              {template.status === 'completed' && onDownload && (
                <DropdownMenuItem onClick={() => onDownload(template.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div>
          <CardTitle className="text-lg leading-tight">
            {template.name}
          </CardTitle>
          <CardDescription className="mt-1">
            {template.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statut et progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{template.estimatedTime} min
            </span>
          </div>
          
          {template.status === 'generating' && template.progress !== undefined && (
            <div className="space-y-1">
              <Progress value={template.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Génération en cours... {template.progress}%
              </p>
            </div>
          )}
          
          {template.status === 'error' && template.error && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {template.error}
            </p>
          )}
          
          {template.status === 'completed' && template.lastGenerated && (
            <p className="text-xs text-green-600">
              Généré le {template.lastGenerated.toLocaleDateString('fr-CA')} à {template.lastGenerated.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Législations */}
        <div className="flex flex-wrap gap-1">
          {template.legislation.map(law => (
            <Badge key={law} variant="secondary" className="text-xs">
              {law}
            </Badge>
          ))}
        </div>

        {/* Formats de sortie */}
        <div className="flex flex-wrap gap-1">
          {template.outputs.map(output => (
            <Badge key={output} variant="outline" className="text-xs">
              {output.toUpperCase()}
            </Badge>
          ))}
        </div>

        {/* Action rapide */}
        {template.status !== 'generating' && (
          <Button
            onClick={() => onGenerate(template.id)}
            className="w-full"
            disabled={isActionDisabled}
            variant={template.status === 'completed' ? 'outline' : 'default'}
          >
            {template.status === 'completed' ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Régénérer
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Lancer la génération
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  onGenerate,
  onPreview,
  onViewHistory,
  onDownload
}) => {
  const [filter, setFilter] = useState<'all' | 'mandatory' | 'available' | 'completed'>('all');

  const filteredTemplates = templates.filter(template => {
    switch (filter) {
      case 'mandatory':
        return template.priority === 'mandatory';
      case 'available':
        return template.status === 'available';
      case 'completed':
        return template.status === 'completed';
      default:
        return true;
    }
  });

  const stats = {
    total: templates.length,
    mandatory: templates.filter(t => t.priority === 'mandatory').length,
    completed: templates.filter(t => t.status === 'completed').length,
    generating: templates.filter(t => t.status === 'generating').length
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Templates disponibles</h3>
            <p className="text-sm text-muted-foreground">
              {stats.total} templates • {stats.mandatory} obligatoires • {stats.completed} terminés
            </p>
          </div>
        </div>

        {/* Filtres rapides */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tous', count: stats.total },
            { key: 'mandatory', label: 'Obligatoires', count: stats.mandatory },
            { key: 'available', label: 'Disponibles', count: templates.filter(t => t.status === 'available').length },
            { key: 'completed', label: 'Terminés', count: stats.completed }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(key as any)}
              className="h-8"
            >
              {label} ({count})
            </Button>
          ))}
        </div>
      </div>

      {/* Grille adaptative */}
      {filteredTemplates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onGenerate={onGenerate}
              onPreview={onPreview}
              onViewHistory={onViewHistory}
              onDownload={onDownload}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Aucun template trouvé pour ce filtre.
          </p>
          <Button
            variant="outline"
            onClick={() => setFilter('all')}
            className="mt-4"
          >
            Voir tous les templates
          </Button>
        </Card>
      )}
    </div>
  );
};