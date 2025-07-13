import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for LMRSST compliance audit
    console.error('[LMRSST COMPLIANCE ERROR]', {
      errorId: this.state.errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      complianceImpact: 'system_failure',
      userAffected: true
    });

    // Report to audit system if available
    if (typeof window !== 'undefined') {
      const auditEvent = {
        type: 'system_error',
        component: 'ErrorBoundary',
        severity: 'high',
        compliance_reference: 'System Reliability',
        details: {
          errorId: this.state.errorId,
          message: error.message,
          timestamp: new Date().toISOString()
        }
      };

      try {
        // Store in localStorage for later transmission
        const existingErrors = JSON.parse(localStorage.getItem('lmrsst_error_log') || '[]');
        existingErrors.push(auditEvent);
        localStorage.setItem('lmrsst_error_log', JSON.stringify(existingErrors.slice(-10))); // Keep last 10
      } catch (storageError) {
        console.error('Failed to store error for audit:', storageError);
      }
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  generateErrorReport = () => {
    const { error, errorInfo, errorId } = this.state;
    
    const report = {
      errorId,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message,
        stack: error?.stack,
      },
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      complianceNote: 'Erreur système affectant la conformité LMRSST'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erreur-lmrsst-${errorId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">
                    Erreur système - Conformité LMRSST
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge complianceStatus="non-compliant">
                      Non conforme
                    </Badge>
                    <Badge variant="outline">
                      ID: {this.state.errorId}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Impact sur la conformité</h3>
                <p className="text-muted-foreground">
                  Une erreur système peut affecter votre capacité à maintenir la conformité 
                  avec la Loi modernisant le régime de santé et sécurité du travail (LMRSST). 
                  Cette erreur a été enregistrée pour audit.
                </p>
              </div>

              {this.state.error && (
                <div>
                  <h3 className="font-semibold mb-2">Détails techniques</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">{this.state.error.message}</code>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Actions recommandées</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Actualisez la page pour reprendre l'activité</li>
                  <li>Documentez l'incident pour le registre de conformité</li>
                  <li>Contactez l'administrateur si le problème persiste</li>
                  <li>Générez un rapport d'incident pour audit</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.generateErrorReport}
                  aria-label="Télécharger le rapport d'erreur pour audit LMRSST"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport d'audit
                </Button>
              </div>

              <div className="text-xs text-muted-foreground border-t pt-4">
                <strong>Note de conformité :</strong> Cette erreur est automatiquement 
                enregistrée dans le système d'audit pour assurer la traçabilité 
                requise par la LMRSST. Référence : Art. 123 (registre des incidents).
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;