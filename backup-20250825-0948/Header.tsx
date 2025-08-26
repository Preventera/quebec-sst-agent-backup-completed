import { Shield, MessageSquare, CheckCircle, TrendingUp, FileText, Mic, Menu, X, Brain, BookOpen, Settings, HelpCircle, Globe, User, LogOut, ChevronDown, BarChart3, MoreHorizontal, Database, Search, TestTube, Activity, Workflow, Lock, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileSelector } from "@/components/ProfileSelector";
// import Breadcrumb from "@/components/Breadcrumb";

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
            <img 
              src="/lovable-uploads/f6462ab4-bd80-41f9-856d-f07694dc073f.png" 
              alt="Agentic SST Québec" 
              className="h-6 w-6 md:h-8 md:w-8 object-contain"
            />
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
          
          {/* Desktop Navigation - Simplified */}
          <nav className="hidden sm:flex items-center gap-2 flex-shrink min-w-0">
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                  Accueil
                </Button>
              </Link>
              
              {/* Core Features - Always visible */}
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
              
              {hasAccess('documents') && (
                <Link to="/docugen">
                  <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                    <FileText className="h-3 w-3 mr-1" aria-hidden="true" />
                    Documents
                  </Button>
                </Link>
              )}
              
              <Link to="/agile-functions">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                  <Zap className="h-3 w-3 mr-1" aria-hidden="true" />
                  Fonctions Agiles
                </Button>
              </Link>
              
              
              {/* Analytics & Tools - Grouped */}
              {(hasAccess('learning-dashboard') || hasAccess('tests') || hasAccess('conversation-logs') || hasAccess('annotation') || hasAccess('knowledge-base') || hasAccess('crawling') || hasAccess('prompt-agents') || hasAccess('prompt-admin') || hasAccess('faq')) && (
                <div className="flex items-center gap-1 px-1 border-l border-primary-glow/20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow text-xs px-2">
                        <MoreHorizontal className="h-3 w-3 mr-1" aria-hidden="true" />
                        Plus
                        <ChevronDown className="h-3 w-3 ml-1" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 z-50 bg-background border shadow-md">
                      {/* Analytics Section */}
                      {(hasAccess('compliance-dashboard') || hasAccess('learning-dashboard')) && (
                        <>
                          <DropdownMenuLabel className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Analytics
                          </DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to="/learning" className="w-full">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Dashboard Conformité
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      {/* Knowledge & Resources Section */}
                      {(hasAccess('knowledge-base') || hasAccess('faq')) && (
                        <>
                          <DropdownMenuLabel className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Ressources
                          </DropdownMenuLabel>
                          {hasAccess('knowledge-base') && (
                            <DropdownMenuItem asChild>
                              <Link to="/sst-knowledge" className="w-full">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Base de connaissances SST
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {hasAccess('faq') && (
                            <DropdownMenuItem asChild>
                              <Link to="/faq" className="w-full">
                                <HelpCircle className="h-4 w-4 mr-2" />
                                FAQ
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      {/* Testing & Quality Section */}
                      {(hasAccess('tests') || hasAccess('conversation-logs') || hasAccess('annotation')) && (
                        <>
                          <DropdownMenuLabel className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            Tests & Qualité
                          </DropdownMenuLabel>
                          {hasAccess('tests') && (
                            <DropdownMenuItem asChild>
                              <Link to="/tests" className="w-full">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Tests & Démonstrations
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {hasAccess('conversation-logs') && (
                            <DropdownMenuItem asChild>
                              <Link to="/logs" className="w-full">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Logs conversations
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {hasAccess('annotation') && (
                            <DropdownMenuItem asChild>
                              <Link to="/annotation" className="w-full">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Interface annotation
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      {/* Data Management Section */}
                      {hasAccess('crawling') && (
                        <>
                          <DropdownMenuLabel className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Données
                          </DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to="/crawling-dashboard" className="w-full">
                              <Globe className="h-4 w-4 mr-2" />
                              Crawling SST
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      {/* Workflow Management Section */}
                      {(hasAccess('prompt-agents') || hasAccess('prompt-admin')) && (
                        <>
                          <DropdownMenuLabel className="flex items-center gap-2">
                            <Workflow className="h-4 w-4" />
                            Workflows
                          </DropdownMenuLabel>
                          {hasAccess('prompt-agents') && (
                            <DropdownMenuItem asChild>
                              <Link to="/prompts/catalog" className="w-full">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Catalogue Workflows
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {hasAccess('prompt-admin') && (
                            <DropdownMenuItem asChild>
                              <Link to="/prompts/admin" className="w-full">
                                <Lock className="h-4 w-4 mr-2" />
                                Administration
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              
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
                <Link to="/docugen" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                    Documents
                  </Button>
                </Link>
              )}
              
              <Link to="/agile-functions" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                  <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
                  Fonctions Agiles
                </Button>
              </Link>
              
              
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
              
              {hasAccess('prompt-agents') && (
                <Link to="/prompts/catalog" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                    Catalogue
                  </Button>
                </Link>
              )}
              
              {hasAccess('prompt-admin') && (
                <Link to="/prompts/admin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                    Admin Prompts
                  </Button>
                </Link>
              )}
              
              {hasAccess('crawling') && (
                <Link to="/crawling-dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-glow text-sm justify-start">
                    <Globe className="h-4 w-4 mr-2" aria-hidden="true" />
                    Crawling SST
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
      
      {/* Breadcrumb - Only show on non-homepage */}
      {/* <div className="border-t border-primary-glow/20">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <Breadcrumb />
        </div>
      </div> */}
    </header>
  );
};

export default Header;