import { ReactNode } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, BookOpen } from "lucide-react";

interface LegalTooltipProps {
  children: ReactNode;
  article: string;
  title: string;
  summary: string;
  obligation?: string;
}

export const LegalTooltip = ({ children, article, title, summary, obligation }: LegalTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help inline-flex items-center gap-1">
            {children}
            <Info className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4 space-y-2" side="top">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            <Badge variant="outline" className="text-xs">
              {article}
            </Badge>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">{summary}</p>
            {obligation && (
              <p className="text-xs font-medium text-primary mt-2">
                <strong>Obligation:</strong> {obligation}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Composant pour les tooltips d'aide contextuelle
interface HelpTooltipProps {
  children: ReactNode;
  content: string;
  title?: string;
}

export const HelpTooltip = ({ children, content, title }: HelpTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help inline-flex items-center gap-1">
            {children}
            <Info className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-3" side="top">
          {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
          <p className="text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};