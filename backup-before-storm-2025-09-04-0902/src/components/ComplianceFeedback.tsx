import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Clock, FileText, ExternalLink } from 'lucide-react';
import { useActionLogger } from '@/hooks/useActionLogger';
import { useAccessibilityContext } from '@/components/AccessibilityProvider';

export interface ComplianceStatus {
  level: 'compliant' | 'non-compliant' | 'pending' | 'warning';
  article: string;
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  }>;
  details?: string;
  lastUpdated?: string;
}

interface ComplianceFeedbackProps {
  status: ComplianceStatus;
  className?: string;
}

const ComplianceFeedback: React.FC<ComplianceFeedbackProps> = ({ status, className }) => {
  const { logComplianceAction } = useActionLogger();
  const { announce } = useAccessibilityContext();

  const getIcon = () => {
    switch (status.level) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'non-compliant':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    const messages = {
      compliant: 'Conforme',
      'non-compliant': 'Non conforme',
      warning: 'Attention requise',
      pending: 'En attente'
    };
    return messages[status.level];
  };

  const handleActionClick = async (action: NonNullable<ComplianceStatus['actions']>[0]) => {
    await logComplianceAction(
      'compliance_action_taken',
      'ComplianceFeedback',
      status.article,
      {
        action_label: action.label,
        status_level: status.level,
        compliance_title: status.title
      }
    );

    announce(`Action prise: ${action.label} pour ${status.title}`, 'assertive');

    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      window.open(action.href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className={`border-l-4 ${
      status.level === 'compliant' ? 'border-l-success' :
      status.level === 'non-compliant' ? 'border-l-destructive' :
      status.level === 'warning' ? 'border-l-warning' :
      'border-l-muted'
    } ${className}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{status.title}</h3>
              <Badge 
                complianceStatus={status.level}
                aria-label={`Statut de conformité: ${getStatusMessage()}`}
              >
                {getStatusMessage()}
              </Badge>
              <Badge 
                legalReference={status.article.replace('Art. ', 'art-') as any}
                aria-label={`Référence légale: ${status.article}`}
              >
                {status.article}
              </Badge>
            </div>

            <p className="text-muted-foreground">{status.message}</p>

            {status.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                  Détails techniques
                </summary>
                <div className="mt-2 p-3 bg-muted rounded text-sm">
                  {status.details}
                </div>
              </details>
            )}

            {status.actions && status.actions.length > 0 && (
              <div className="flex gap-2 pt-2 flex-wrap">
                {status.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    size="sm"
                    onClick={() => handleActionClick(action)}
                    className="flex items-center gap-2"
                    aria-describedby={`action-description-${index}`}
                  >
                    {action.href && <ExternalLink className="h-3 w-3" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {status.lastUpdated && (
              <div className="text-xs text-muted-foreground pt-2">
                Dernière mise à jour: {new Date(status.lastUpdated).toLocaleString('fr-CA')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceFeedback;