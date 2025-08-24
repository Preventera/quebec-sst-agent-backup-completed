import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, MessageSquare, CheckCircle, TrendingUp, FileText, Mic, Menu, X, Brain, BookOpen, Settings, HelpCircle, Globe, User, LogOut, ChevronDown, BarChart3, MoreHorizontal, Database, Search, TestTube, Activity, Workflow, Lock, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Hook d'authentification simulé - remplace useAuth problématique
const useAuthSimulated = () => {
  const [user, setUser] = useState({
    id: "1",
    email: "admin@agenticsst.com",
    role: "admin",
    name: "Administrateur SST",
    organization: "AgenticSST Québec™"
  });

  const [isLoading, setIsLoading] = useState(false);

  const signOut = async () => {
    setIsLoading(true);
    try {
      // Simulation déconnexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(null);
      toast.success("Déconnexion réussie");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, signOut };
};

// Profil utilisateur simulé - remplace useUserProfile problématique  
const useUserProfileSimulated = () => {
  const [profile, setProfile] = useState({
    role: "Administrateur",
    organization: "AgenticSST Québec™",
    permissions: ["admin", "users", "prompts", "analytics"],
    avatar: null,
    preferences: {
      theme: "light",
      language: "fr"
    }
  });

  return { profile, isLoading: false };
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState(3);
  
  // Hooks restaurés mais sécurisés
  const { user, isLoading, signOut } = useAuthSimulated();
  const { profile } = useUserProfileSimulated();

  // Navigation items complets
  const navigationItems = [
    {
      label: "Accueil",
      icon: Shield,
      path: "/",
      description: "Tableau de bord principal"
    },
    {
      label: "Assistant",
      icon: MessageSquare,  
      path: "/assistant-vocal",
      description: "Assistant vocal intelligent",
      badge: "IA"
    },
    {
      label: "Diagnostic",
      icon: CheckCircle,
      path: "/diagnostic", 
      description: "Évaluation conformité SST"
    },
    {
      label: "Documents",
      icon: FileText,
      path: "/docugen",
      description: "Génération documentaire",
      badge: "2.0"
    },
    {
      label: "Fonctions Agiles",
      icon: Zap,
      path: "/agile-functions",
      description: "Hub multi-agents",
      badge: "Multi"
    }
  ];

  const adminItems = [
    {
      label: "Administration",
      icon: Settings,
      items: [
        {
          label: "Gestion Prompts",
          icon: Brain,
          path: "/prompts/admin",
          description: "Orchestration avancée"
        },
        {
          label: "Utilisateurs Enterprise", 
          icon: Users,
          path: "/admin/users",
          description: "Gestion des accès"
        },
        {
          label: "Analytics Business",
          icon: BarChart3,
          path: "/analytics",
          description: "Métriques d'utilisation"
        }
      ]
    },
    {
      label: "Développement",
      icon: TestTube,
      items: [
        {
          label: "Tests & Logs",
          icon: Activity,
          path: "/tests",
          description: "Débogage système"
        },
        {
          label: "Base Connaissances",
          icon: Database,
          path: "/sst-knowledge",
          description: "Sources SST Québec"
        },
        {
          label: "Crawling Dashboard",
          icon: Search,
          path: "/crawling-dashboard", 
          description: "Veille réglementaire"
        }
      ]
    }
  ];

  const isActivePath = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    return location.pathname.startsWith(path) && path !== "/";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo et Branding */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-gray-900">
                AgenticSST Québec™
              </div>
              <div className="text-xs text-gray-600 -mt-1">
                Conformité LMRSST intelligente
              </div>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant={isActivePath(item.path) ? "default" : "ghost"}
                size="sm"
                className={`relative ${isActivePath(item.path) ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 text-xs bg-yellow-100 text-yellow-800"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-3">
            
            {/* Notifications */}
            <Button
              variant="ghost" 
              size="sm"
              className="relative"
              onClick={() => toast.info("Notifications système")}
            >
              <MessageSquare className="w-4 h-4" />
              {activeNotifications > 0 && (
                <Badge 
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeNotifications}
                </Badge>
              )}
            </Button>

            {/* Menu Admin */}
            {user && (user.role === 'admin' || user.role === 'superadmin') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                    <ChevronDown className="w-3 h-3 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {adminItems.map((section) => (
                    <div key={section.label}>
                      <DropdownMenuLabel className="flex items-center">
                        <section.icon className="w-4 h-4 mr-2" />
                        {section.label}
                      </DropdownMenuLabel>
                      {section.items.map((item) => (
                        <DropdownMenuItem
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className="cursor-pointer"
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Profil utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user?.name || 'Utilisateur'}</div>
                    <div className="text-xs text-gray-600">{profile?.role}</div>
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-sm text-gray-600">{user?.email}</div>
                      <div className="text-xs text-gray-500">{profile?.organization}</div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-3" />
                  Mon Profil
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-3" />
                  Paramètres
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/help')}>
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Aide & Support
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  disabled={isLoading}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  {isLoading ? 'Déconnexion...' : 'Se déconnecter'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile étendu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white/95 backdrop-blur">
            <nav className="py-4 space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActivePath(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start ${isActivePath(item.path) ? 'bg-blue-600 text-white' : ''}`}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
              
              {user && (user.role === 'admin' || user.role === 'superadmin') && (
                <>
                  <div className="pt-4 border-t">
                    <div className="px-3 py-2 text-sm font-semibold text-gray-900">Administration</div>
                    {adminItems.flatMap(section => 
                      section.items.map(item => (
                        <Button
                          key={item.path}
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Button>
                      ))
                    )}
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;