import { Shield, MessageSquare, CheckCircle, TrendingUp, FileText, Mic, Menu, X, Brain, BookOpen, Settings, HelpCircle, Globe, User, LogOut, ChevronDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileSelector } from "@/components/ProfileSelector";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();
  const { hasAccess } = useUserProfile();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Shield className="h-6 w-6 md:h-8 md:w-8" aria-hidden="true" />
            <div>
              <h1 className="text-base md:text-xl font-bold">AgenticSST Québec™</h1>
              <p className="text-xs opacity-90 hidden lg:block">Conformité LMRSST intelligente</p>
            </div>
          </Link>
          
          {/* Mobile menu button - shows at <640px */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden text-primary-foreground hover:bg-primary-glow flex-shrink-0"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label="Menu de navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          {/* Desktop Navigation - Responsive breakpoint at 640px */}
          <nav className="hidden sm:flex items-center gap-2 flex-shrink min-w-0">
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                  Accueil
                </Button>
              </Link>
              
              {/* Assistant Group */}
              <div className="flex items-center gap-1 px-1 border-l border-primary-glow/20">
                {hasAccess('assistant') && (
                  <Link to="/assistant-vocal">
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                      <Mic className="h-3 w-3 mr-1" aria-hidden="true" />
                      Assistant
                    </Button>
                  </Link>
                )}
                {(hasAccess('diagnostic-quick') || hasAccess('diagnostic-detailed')) && (
                  <Link to="/diagnostic">
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                      <Brain className="h-3 w-3 mr-1" aria-hidden="true" />
                      Diagnostic
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Data Group */}
              <div className="flex items-center gap-1 px-1 border-l border-primary-glow/20">
                {hasAccess('documents') && (
                  <Link to="/documents">
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                      <FileText className="h-3 w-3 mr-1" aria-hidden="true" />
                      Documents
                    </Button>
                  </Link>
                )}
                {(hasAccess('compliance-dashboard') || hasAccess('learning-dashboard')) && (
                  <Link to="/learning">
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                      <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
                      Dashboard
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* QA & Analytics Group - Dropdown */}
              {(hasAccess('tests') || hasAccess('conversation-logs') || hasAccess('annotation') || hasAccess('knowledge-base')) && (
                <div className="flex items-center gap-1 px-1 border-l border-primary-glow/20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                        <BarChart3 className="h-3 w-3 mr-1" aria-hidden="true" />
                        QA & Analytics
                        <ChevronDown className="h-3 w-3 ml-1" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {hasAccess('knowledge-base') && (
                        <DropdownMenuItem asChild>
                          <Link to="/sst-knowledge" className="w-full">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Base SST
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {hasAccess('tests') && (
                        <DropdownMenuItem asChild>
                          <Link to="/tests" className="w-full">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Tests & Démo
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {hasAccess('conversation-logs') && (
                        <DropdownMenuItem asChild>
                          <Link to="/logs" className="w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Logs
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {hasAccess('annotation') && (
                        <DropdownMenuItem asChild>
                          <Link to="/annotation" className="w-full">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Annotation
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              
              {/* Admin Group */}
              <div className="flex items-center gap-1 px-1 border-l border-primary-glow/20">
                {(hasAccess('prompt-agents') || hasAccess('prompt-orchestration')) && (
                  <Link to="/prompts">
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                      <Settings className="h-3 w-3 mr-1" aria-hidden="true" />
                      Prompts
                    </Button>
                  </Link>
                )}
                {hasAccess('crawling') && (
                  <Link to="/crawling-dashboard">
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                      <Globe className="h-3 w-3 mr-1" aria-hidden="true" />
                      Crawling
                    </Button>
                  </Link>
                )}
                {hasAccess('faq') && (
                  <Link to="/faq">
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                      <HelpCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                      FAQ
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Profile Selector */}
              <div className="flex items-center gap-2 border-l border-primary-glow/20 pl-2 ml-2">
                <ProfileSelector />
                
                {/* Auth Section */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-primary-foreground/80 max-w-20 truncate">
                      {user?.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={signOut}
                      className="text-primary-foreground hover:bg-primary-glow text-xs px-2"
                    >
                      <LogOut className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                      <User className="h-3 w-3 mr-1" />
                      Connexion
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav id="mobile-navigation" className="sm:hidden mt-4 pb-4 border-t border-primary-glow/20">
            {/* Profile Selector Mobile */}
            <div className="mb-4 px-2">
              <ProfileSelector />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  Accueil
                </Button>
              </Link>
              
              {hasAccess('assistant') && (
                <Link to="/assistant-vocal" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <Mic className="h-4 w-4 mr-2" aria-hidden="true" />
                    Assistant Vocal
                  </Button>
                </Link>
              )}
              
              {(hasAccess('diagnostic-quick') || hasAccess('diagnostic-detailed')) && (
                <Link to="/diagnostic" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <Brain className="h-4 w-4 mr-2" aria-hidden="true" />
                    Diagnostic
                  </Button>
                </Link>
              )}
              
              {hasAccess('documents') && (
                <Link to="/documents" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                    Documents
                  </Button>
                </Link>
              )}
              
              {hasAccess('knowledge-base') && (
                <Link to="/sst-knowledge" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                    Base SST
                  </Button>
                </Link>
              )}
              
              {hasAccess('tests') && (
                <Link to="/tests" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    Tests & Démo
                  </Button>
                </Link>
              )}
              
              {(hasAccess('compliance-dashboard') || hasAccess('learning-dashboard')) && (
                <Link to="/learning" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" aria-hidden="true" />
                    Dashboard
                  </Button>
                </Link>
              )}
              
              {hasAccess('conversation-logs') && (
                <Link to="/logs" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                    Logs
                  </Button>
                </Link>
              )}
              
              {hasAccess('annotation') && (
                <Link to="/annotation" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                    Annotation
                  </Button>
                </Link>
              )}
              
              {(hasAccess('prompt-agents') || hasAccess('prompt-orchestration')) && (
                <Link to="/prompts" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                    Prompts
                  </Button>
                </Link>
              )}
              
              {hasAccess('crawling') && (
                <Link to="/crawling-dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <Globe className="h-4 w-4 mr-2" aria-hidden="true" />
                    Crawling
                  </Button>
                </Link>
              )}
              
              {hasAccess('faq') && (
                <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                    FAQ
                  </Button>
                </Link>
              )}
              
              {/* Auth Section Mobile */}
              <div className="col-span-2 border-t border-primary-glow/20 pt-2 mt-2">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="text-xs text-primary-foreground/80 px-3">
                      Connecté: {user?.email}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={signOut}
                      className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Connexion
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;