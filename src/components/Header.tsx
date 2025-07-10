import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">AgenticSST Québec™</h1>
              <p className="text-sm opacity-90">Conformité LMRSST intelligente</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
              Accueil
            </Button>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
              Diagnostic
            </Button>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
              Alertes
            </Button>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
              Rapports
            </Button>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
              Paramètres
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;