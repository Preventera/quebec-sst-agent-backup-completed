import { Shield, MessageSquare, CheckCircle, TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">AgenticSST Québec™</h1>
              <p className="text-sm opacity-90">Conformité LMRSST intelligente</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
                Accueil
              </Button>
            </Link>
            <Link to="/tests">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
                Tests & Démo
              </Button>
            </Link>
            <Link to="/logs">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
                <MessageSquare className="h-4 w-4 mr-2" />
                Logs
              </Button>
            </Link>
            <Link to="/annotation">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
                <CheckCircle className="h-4 w-4 mr-2" />
                Annotation
              </Button>
            </Link>
            <Link to="/learning">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
                <TrendingUp className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/prompts">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
                <FileText className="h-4 w-4 mr-2" />
                Prompts
              </Button>
            </Link>
            <Link to="/documents">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Button>
            </Link>
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