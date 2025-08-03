// Composant pour afficher les articles légaux sous forme de cartes
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Scale,
  FileText,
  Building,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LegalArticle {
  id: string;
  number: string;
  title: string;
  content: string;
  framework: string;
  category: string;
  applicability: string;
  url?: string;
}

interface LegalContextCardsProps {
  articles: LegalArticle[];
  companyProfile: {
    size: number;
    sector: string;
    riskLevel?: string;
  };
}

const LegalArticleCard: React.FC<{
  article: LegalArticle;
  isApplicable: boolean;
}> = ({ article, isApplicable }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'LMRSST': return 'bg-blue-500';
      case 'LSST': return 'bg-green-500';
      case 'CSTC': return 'bg-orange-500';
      case 'RBQ': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prevention': return <FileText className="h-4 w-4" />;
      case 'organisation': return <Building className="h-4 w-4" />;
      case 'participation': return <Users className="h-4 w-4" />;
      default: return <Scale className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md cursor-pointer",
      isApplicable 
        ? "border-primary bg-primary/5" 
        : "border-muted bg-muted/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              className={cn(
                "text-white text-xs font-medium",
                getFrameworkColor(article.framework)
              )}
            >
              {article.framework}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Art. {article.number}
            </Badge>
            {isApplicable && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                Applicable
              </Badge>
            )}
          </div>
          {getCategoryIcon(article.category)}
        </div>
        
        <CardTitle className="text-lg leading-tight">
          {article.title}
        </CardTitle>
        
        <CardDescription className="flex items-center gap-2 text-sm">
          <span>{article.applicability}</span>
          {article.url && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-primary hover:text-primary/80"
              onClick={(e) => {
                e.stopPropagation();
                window.open(article.url, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </CardDescription>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-6 py-2 text-sm"
          >
            <span>
              {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.content}
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export const LegalContextCards: React.FC<LegalContextCardsProps> = ({ 
  articles, 
  companyProfile 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  // Détermine si un article est applicable selon le profil de l'entreprise
  const isApplicable = (article: LegalArticle): boolean => {
    // Logique simplifiée - à adapter selon les vraies règles
    if (article.number === '90' && companyProfile.size >= 20) return true;
    if (article.number === '101' && companyProfile.size >= 1) return true;
    if (article.framework === 'CSTC' && companyProfile.sector === 'construction') return true;
    return false;
  };

  // Filtrage des articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.number.includes(searchTerm) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFramework = selectedFramework === 'all' || article.framework === selectedFramework;
    
    return matchesSearch && matchesFramework;
  });

  // Tri: articles applicables en premier
  const sortedArticles = filteredArticles.sort((a, b) => {
    const aApplicable = isApplicable(a);
    const bApplicable = isApplicable(b);
    
    if (aApplicable && !bApplicable) return -1;
    if (!aApplicable && bApplicable) return 1;
    return 0;
  });

  const frameworks = ['all', ...new Set(articles.map(a => a.framework))];
  const applicableCount = filteredArticles.filter(isApplicable).length;

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Contexte légal applicable</h3>
            <p className="text-sm text-muted-foreground">
              {applicableCount} article(s) applicable(s) sur {filteredArticles.length} affichés
            </p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article, numéro ou contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres par framework */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {frameworks.map(framework => (
              <Button
                key={framework}
                variant={selectedFramework === framework ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFramework(framework)}
                className="h-8"
              >
                {framework === 'all' ? 'Tous' : framework}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille des cartes d'articles */}
      {sortedArticles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {sortedArticles.map(article => (
            <LegalArticleCard
              key={article.id}
              article={article}
              isApplicable={isApplicable(article)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Aucun article trouvé avec ces critères de recherche.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedFramework('all');
            }}
            className="mt-4"
          >
            Réinitialiser les filtres
          </Button>
        </Card>
      )}
    </div>
  );
};