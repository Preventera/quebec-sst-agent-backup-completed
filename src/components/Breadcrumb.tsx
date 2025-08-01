import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();
  
  // Génération automatique des breadcrumbs basée sur l'URL
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Accueil', href: '/', icon: Home }
    ];

    const routeLabels: Record<string, string> = {
      'assistant-vocal': 'Assistant Vocal',
      'diagnostic': 'Diagnostic',
      'documents': 'Documents',
      'learning': 'Dashboard',
      'tests': 'Tests & Démo',
      'logs': 'Logs Conversations',
      'annotation': 'Annotation',
      'prompts': 'Gestion Prompts',
      'sst-knowledge': 'Base SST',
      'crawling-dashboard': 'Crawling SST',
      'faq': 'FAQ',
      'compliance-details': 'Détails Conformité',
      'auth': 'Connexion'
    };

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : path
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null; // Ne pas afficher si seulement l'accueil
  }

  return (
    <nav 
      aria-label="Fil d'Ariane" 
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const IconComponent = item.icon;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="h-4 w-4 mx-1 text-muted-foreground/50" 
                  aria-hidden="true" 
                />
              )}
              
              {isLast ? (
                <span 
                  className="flex items-center gap-1 font-medium text-foreground"
                  aria-current="page"
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.href!}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;