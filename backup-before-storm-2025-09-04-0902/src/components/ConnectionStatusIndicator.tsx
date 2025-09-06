import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface ConnectionStatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting';
  className?: string;
}

export const ConnectionStatusIndicator = ({ status, className = "" }: ConnectionStatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'En ligne',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
          description: 'Assistant vocal prêt à recevoir vos questions'
        };
      case 'connecting':
        return {
          icon: Loader2,
          text: 'Connexion...',
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          description: 'Établissement de la connexion...'
        };
      case 'disconnected':
      default:
        return {
          icon: WifiOff,
          text: 'Hors ligne',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          description: 'Service temporairement indisponible'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant={config.variant} 
          className={`${config.className} ${className} cursor-help transition-colors`}
        >
          <IconComponent 
            className={`h-3 w-3 mr-1 ${status === 'connecting' ? 'animate-spin' : ''}`} 
          />
          {config.text}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};