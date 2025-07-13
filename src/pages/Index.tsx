import Header from "@/components/Header";
import ComplianceStats from "@/components/ComplianceStats";
import AlertPanel from "@/components/AlertPanel";
import DiagnosticButton from "@/components/DiagnosticButton";
import QuickActions from "@/components/QuickActions";
import AgentCards from "@/components/AgentCards";
import ComplianceFeedback, { ComplianceStatus } from "@/components/ComplianceFeedback";
import { useAccessibilityContext } from "@/components/AccessibilityProvider";
import { useActionLogger } from "@/hooks/useActionLogger";
import { useEffect } from "react";

const Index = () => {
  const { announce } = useAccessibilityContext();
  const { logComplianceAction } = useActionLogger();

  // Log page access for audit trail
  useEffect(() => {
    logComplianceAction(
      'page_access',
      'Index',
      'Art. 101 LMRSST',
      { 
        page: 'dashboard',
        purpose: 'compliance_monitoring'
      }
    );
    announce('Tableau de bord de conformité LMRSST chargé', 'polite');
  }, [logComplianceAction, announce]);

  // Example compliance statuses for demonstration
  const complianceExamples: ComplianceStatus[] = [
    {
      level: 'compliant',
      article: 'Art. 101',
      title: 'Diagnostic de conformité',
      message: 'Votre diagnostic est à jour et conforme aux exigences LMRSST.',
      lastUpdated: new Date().toISOString(),
      actions: [
        { label: 'Voir le rapport', variant: 'outline' }
      ]
    },
    {
      level: 'warning',
      article: 'Art. 90',
      title: 'Programme de prévention',
      message: 'Votre programme de prévention expire dans 30 jours.',
      details: 'Le programme de prévention doit être mis à jour annuellement selon l\'article 90 de la LMRSST.',
      actions: [
        { label: 'Mettre à jour', variant: 'default' },
        { label: 'Planifier révision', variant: 'outline' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8" role="main">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">
            Tableau de bord de conformité LMRSST
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suivez votre conformité en temps réel avec l'intelligence artificielle multi-agents
          </p>
        </div>

        {/* Compliance Statistics */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Aperçu de la conformité</h3>
          <ComplianceStats />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Diagnostic */}
          <div className="lg:col-span-1">
            <DiagnosticButton />
          </div>
          
          {/* Right Column - Alerts */}
          <div className="lg:col-span-2">
            <AlertPanel />
          </div>
        </div>

        {/* Multi-Agent System */}
        <AgentCards />

        {/* Compliance Feedback Examples */}
        <section className="space-y-4" aria-labelledby="compliance-feedback-title">
          <h3 id="compliance-feedback-title" className="text-xl font-semibold">
            Statut de conformité détaillé
          </h3>
          <div className="space-y-4">
            {complianceExamples.map((status, index) => (
              <ComplianceFeedback 
                key={index} 
                status={status}
              />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4" aria-labelledby="quick-actions-title">
          <h3 id="quick-actions-title" className="text-xl font-semibold">Actions rapides</h3>
          <QuickActions />
        </section>

        {/* Footer Info */}
        <div className="text-center pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            AgenticSST Québec™ - Solution d'accompagnement intelligente pour la conformité LMRSST
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Développé avec l'architecture multi-agents pour les employeurs québécois
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;