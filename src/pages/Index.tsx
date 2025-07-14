import Header from "@/components/Header";
import ComplianceStats from "@/components/ComplianceStats";
import AlertPanel from "@/components/AlertPanel";
import DiagnosticButton from "@/components/DiagnosticButton";
import QuickActions from "@/components/QuickActions";
import AgentCards from "@/components/AgentCards";
import ComplianceFeedback, { ComplianceStatus } from "@/components/ComplianceFeedback";
import { useAccessibilityContext } from "@/components/AccessibilityProvider";
import { useActionLogger } from "@/hooks/useActionLogger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LegalTooltip, HelpTooltip } from "@/components/LegalTooltip";
import { useEffect, useState } from "react";
import { BarChart3, Users, AlertCircle, Zap, Menu, X } from "lucide-react";

const Index = () => {
  const { announce } = useAccessibilityContext();
  const { logComplianceAction } = useActionLogger();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      
      <main className="container mx-auto px-4 py-6 md:py-8" role="main">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            <LegalTooltip 
              article="Art. 101 LMRSST"
              title="Obligations de conformité"
              summary="L'employeur doit maintenir un système de gestion de la santé et sécurité conforme aux exigences légales"
              obligation="Suivi continu de la conformité réglementaire"
            >
              Tableau de bord de conformité LMRSST
            </LegalTooltip>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Suivez votre conformité en temps réel avec l'intelligence artificielle multi-agents
          </p>
        </div>

        {/* Compliance Statistics - Always visible */}
        <section className="space-y-4 mb-6 md:mb-8">
          <HelpTooltip 
            content="Vue d'ensemble de votre conformité aux obligations de la Loi modernisant le régime de santé et sécurité du travail"
            title="Aperçu de la conformité LMRSST"
          >
            <h3 className="text-lg md:text-xl font-semibold">Aperçu de la conformité</h3>
          </HelpTooltip>
          <ComplianceStats />
        </section>

        {/* Mobile Tab Navigation */}
        <div className="block md:hidden mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full justify-between"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-tab-menu"
          >
            Naviguer dans les sections
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main Content - Tabbed Layout */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`${isMobileMenuOpen ? 'grid' : 'hidden md:grid'} w-full grid-cols-2 md:grid-cols-4 mb-6`} id="mobile-tab-menu">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              <BarChart3 className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Vue</span> Globale
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-xs md:text-sm">
              <Users className="h-4 w-4 mr-1 md:mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs md:text-sm">
              <AlertCircle className="h-4 w-4 mr-1 md:mr-2" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs md:text-sm">
              <Zap className="h-4 w-4 mr-1 md:mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column - Diagnostic */}
              <div className="lg:col-span-1">
                <DiagnosticButton />
              </div>
              
              {/* Right Column - Alerts */}
              <div className="lg:col-span-2">
                <AlertPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6 mt-0">
            {/* Multi-Agent System */}
            <AgentCards />
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-0">
            {/* Compliance Feedback Examples */}
            <section className="space-y-4" aria-labelledby="compliance-feedback-title">
              <HelpTooltip 
                content="Analyse détaillée de votre conformité par article de loi avec recommandations d'actions"
                title="Statut de conformité par obligation"
              >
                <h3 id="compliance-feedback-title" className="text-lg md:text-xl font-semibold">
                  Statut de conformité détaillé
                </h3>
              </HelpTooltip>
              <div className="space-y-4">
                {complianceExamples.map((status, index) => (
                  <ComplianceFeedback 
                    key={index} 
                    status={status}
                  />
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6 mt-0">
            {/* Quick Actions */}
            <section className="space-y-4" aria-labelledby="quick-actions-title">
              <HelpTooltip 
                content="Actions prioritaires pour maintenir et améliorer votre conformité LMRSST"
                title="Actions recommandées"
              >
                <h3 id="quick-actions-title" className="text-lg md:text-xl font-semibold">Actions rapides</h3>
              </HelpTooltip>
              <QuickActions />
            </section>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="text-center pt-6 md:pt-8 border-t mt-8">
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