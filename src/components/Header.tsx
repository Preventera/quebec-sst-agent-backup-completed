import { Shield, MessageSquare, CheckCircle, TrendingUp, FileText, Mic, Menu, X, Brain, BookOpen, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <Shield className="h-6 w-6 md:h-8 md:w-8" aria-hidden="true" />
            <div>
              <h1 className="text-lg md:text-xl font-bold">AgenticSST Québec™</h1>
              <p className="text-xs md:text-sm opacity-90 hidden sm:block">Conformité LMRSST intelligente</p>
            </div>
          </Link>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-primary-foreground hover:bg-primary-glow"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label="Menu de navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link to="/">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                Accueil
              </Button>
            </Link>
            <Link to="/assistant-vocal">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                <Mic className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" aria-hidden="true" />
                Assistant Vocal
              </Button>
            </Link>
            <Link to="/diagnostic">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                <Brain className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" aria-hidden="true" />
                Diagnostic
              </Button>
            </Link>
            <Link to="/documents">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" aria-hidden="true" />
                Documents
              </Button>
            </Link>
            <Link to="/sst-knowledge">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" aria-hidden="true" />
                Base SST
              </Button>
            </Link>
            <Link to="/tests">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                Tests & Démo
              </Button>
            </Link>
            <Link to="/learning">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" aria-hidden="true" />
                Dashboard
              </Button>
            </Link>
            <Link to="/logs">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                <MessageSquare className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" aria-hidden="true" />
                Logs
              </Button>
            </Link>
            <Link to="/annotation">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" aria-hidden="true" />
                Annotation
              </Button>
            </Link>
            <Link to="/prompts">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                <Settings className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" aria-hidden="true" />
                Prompts
              </Button>
            </Link>
            <Link to="/faq">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs lg:text-sm">
                <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" aria-hidden="true" />
                FAQ
              </Button>
            </Link>
          </nav>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav id="mobile-navigation" className="md:hidden mt-4 pb-4 border-t border-primary-glow/20">
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  Accueil
                </Button>
              </Link>
              <Link to="/assistant-vocal" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <Mic className="h-4 w-4 mr-2" aria-hidden="true" />
                  Assistant Vocal
                </Button>
              </Link>
              <Link to="/diagnostic" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <Brain className="h-4 w-4 mr-2" aria-hidden="true" />
                  Diagnostic
                </Button>
              </Link>
              <Link to="/documents" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                  Documents
                </Button>
              </Link>
              <Link to="/sst-knowledge" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                  Base SST
                </Button>
              </Link>
              <Link to="/tests" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  Tests & Démo
                </Button>
              </Link>
              <Link to="/learning" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" aria-hidden="true" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/logs" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                  Logs
                </Button>
              </Link>
              <Link to="/annotation" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                  Annotation
                </Button>
              </Link>
              <Link to="/prompts" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                  Prompts
                </Button>
              </Link>
              <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                  FAQ
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;