import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface PopularSearchesProps {
  onSearchClick: (query: string) => void;
}

const popularQueries = [
  "article 51",
  "prévention des chutes", 
  "équipement de protection",
  "programme de prévention",
  "exposition chimique",
  "formation SST"
];

const PopularSearches: React.FC<PopularSearchesProps> = ({ onSearchClick }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        Recherches populaires
      </div>
      <div className="flex flex-wrap gap-2">
        {popularQueries.map((query) => (
          <Badge
            key={query}
            variant="secondary"
            className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onSearchClick(query)}
          >
            {query}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PopularSearches;