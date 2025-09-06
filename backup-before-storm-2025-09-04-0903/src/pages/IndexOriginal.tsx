
import ComplianceStats from "@/components/ComplianceStats";
import AlertPanel from "@/components/AlertPanel";
import DiagnosticButton from "@/components/DiagnosticButton";
import QuickActions from "@/components/QuickActions";
import AgentCards from "@/components/AgentCards";
import ComplianceFeedback, { ComplianceStatus } from "@/components/ComplianceFeedback";
import { SafetyDataSync } from "@/components/SafetyDataSync";
import { useAccessibilityContext } from "@/components/AccessibilityProvider";
import { useActionLogger } from "@/hooks/useActionLogger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LegalTooltip, HelpTooltip } from "@/components/LegalTooltip";
import { useEffect, useState } from "react";
import { BarChart3, Users, AlertCircle, Zap, Menu, X, Brain, Mic, Info, TrendingUp, Activity } from "lucide-react";
import ActionKanbanBoard from "@/components/ActionKanbanBoard";
import { Link } from "react-router-dom";
import RoleSelector, { UserRole } from "@/components/RoleSelector";
import RoleBasedDashboard from "@/components/RoleBasedDashboard";

const Index = () => {
  const { announce } = useAccessibilityContext();
  const { logComplianceAction } = useActionLogger();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('direction');
  const [viewMode, setViewMode] = useState<'classic' | 'role-based'>('role-based');

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
      
      <main className="container mx-auto px-4 py-6 md:py-8" role="main">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-6 md:mb-8">
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
          
          {/* Primary CTA - Enhanced */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-xl hover:scale-105 transition-all duration-300 px-10 py-4 text-lg font-semibold"
            >
              <Link to="/diagnostic">
                <Brain className="h-6 w-6 mr-3" />
                Tester le diagnostic
              </Link>
            </Button>
            <Button 
              asChild 
              variant="secondary" 
              size="lg"
              className="bg-accent/10 border-2 border-accent/30 hover:border-accent/50 hover:bg-accent/20 transition-all duration-300 px-8 py-4 text-lg"
            >
              <Link to="/assistant-vocal">
                <Mic className="h-6 w-6 mr-3" />
                Assistant vocal
              </Link>
            </Button>
          </div>
        </div>

        {/* Role Selection */}
        <section className="space-y-4 mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <HelpTooltip 
              content="Personnalisez votre tableau de bord selon votre rôle pour voir les informations les plus pertinentes"
              title="Personnalisation par rôle"
            >
              <h3 className="text-lg md:text-xl font-semibold">Tableau de bord personnalisé</h3>
            </HelpTooltip>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'role-based' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('role-based')}
              >
                Vue par rôle
              </Button>
              <Button
                variant={viewMode === 'classic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('classic')}
              >
                Vue classique
              </Button>
            </div>
          </div>
          
          {viewMode === 'role-based' && (
            <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
          )}
          
          {viewMode === 'classic' && <ComplianceStats />}
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

        {/* Main Content */}
        {viewMode === 'role-based' ? (
          <RoleBasedDashboard 
            selectedRole={selectedRole} 
            complianceExamples={complianceExamples} 
          />
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className={`${isMobileMenuOpen ? 'grid' : 'hidden md:grid'} w-full grid-cols-2 md:grid-cols-5 mb-6`} id="mobile-tab-menu">
              <TabsTrigger value="overview" className="text-xs md:text-sm flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Vue</span> Globale
              </TabsTrigger>
              <TabsTrigger value="agents" className="text-xs md:text-sm flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Perf.</span> Agents
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs md:text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Non-</span>Conformités
              </TabsTrigger>
              <TabsTrigger value="donnees" className="text-xs md:text-sm flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Données</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="text-xs md:text-sm flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Actions</span> Prioritaires
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-0">
              <ComplianceStats />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-1">
                  <DiagnosticButton />
                </div>
                <div className="lg:col-span-2">
                  <AlertPanel />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6 mt-0">
              <AgentCards />
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-0">
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

            <TabsContent value="donnees" className="space-y-6 mt-0">
              <section className="space-y-4">
                <HelpTooltip 
                  content="Synchronisation avec les données réelles de lésions professionnelles du Québec pour des insights basés sur les preuves"
                  title="Données SafetyAgentic"
                >
                  <h3 className="text-lg md:text-xl font-semibold">Intégration des données réelles</h3>
                </HelpTooltip>
                <SafetyDataSync />
              </section>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6 mt-0">
              <section className="space-y-4" aria-labelledby="quick-actions-title">
                <HelpTooltip 
                  content="Actions prioritaires pour maintenir et améliorer votre conformité LMRSST"
                  title="Actions recommandées"
                >
                  <h3 id="quick-actions-title" className="text-lg md:text-xl font-semibold">Actions prioritaires</h3>
                </HelpTooltip>
                <ActionKanbanBoard />
                <QuickActions />
              </section>
            </TabsContent>
          </Tabs>
        )}

        {/* Footer Info */}
        <div className="text-center pt-6 md:pt-8 border-t mt-8 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              AgenticSST Québec™ - Solution d'accompagnement intelligente pour la conformité LMRSST
            </p>
            <p className="text-xs text-muted-foreground">
              Développé avec l'architecture multi-agents pour les employeurs québécois
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Button asChild variant="outline" size="sm">
              <a href="/presentation-script">
                📄 Script de présentation complet
              </a>
            </Button>
            <span className="text-xs text-muted-foreground">
              • Fonctionnalités • Agents • Cas d'usage • Bénéfices •
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;