import Header from "@/components/Header";
import ComplianceStats from "@/components/ComplianceStats";
import AlertPanel from "@/components/AlertPanel";
import DiagnosticButton from "@/components/DiagnosticButton";
import QuickActions from "@/components/QuickActions";
import AgentCards from "@/components/AgentCards";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
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

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Actions rapides</h3>
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