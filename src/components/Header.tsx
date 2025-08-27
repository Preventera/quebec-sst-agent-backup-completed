import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Home, 
  MessageCircle, 
  TestTube, 
  FileText, 
  UserCog, 
  Settings, 
  Brain, 
  BookOpen, 
  Activity, 
  Shield, 
  Lightbulb,
  BarChart3,
  FileSpreadsheet,
  Zap,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileSelector } from "@/components/ProfileSelector";
// import { useSupabase } from "@/integrations/supabase/SupabaseProvider";
// import { toast } from "sonner";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  // const { user, signOut } = useSupabase(); // Temporairement désactivé
  const user = null; // Simulation pour le moment

  const navigation = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Assistant", href: "/assistant-vocal", icon: MessageCircle },
    { name: "Diagnostic", href: "/diagnostic", icon: Activity },
    { name: "Documents", href: "/docugen", icon: FileText },
    { name: "Fonctions Agiles", href: "/agile-functions", icon: Zap },
  ];

  // Menu Plus avec sous-menu
  const plusMenuItems = [
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Tests", href: "/tests", icon: TestTube },
    { name: "Logs", href: "/logs", icon: FileSpreadsheet },
    { name: "Learning", href: "/learning", icon: Brain },
    { name: "Prompts", href: "/prompts", icon: Lightbulb },
    { name: "Users", href: "/users", icon: UserCog },
    { name: "FAQ", href: "/faq", icon: BookOpen },
  ];

  const handleSignOut = async () => {
    // Temporairement désactivé - sera réactivé quand Supabase sera configuré
    console.log("Déconnexion simulée");
    // try {
    //   await signOut();
    //   toast.success("Déconnexion réussie");
    // } catch (error) {
    //   toast.error("Erreur lors de la déconnexion");
    // }
  };

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-white" />
              <div className="flex flex-col justify-center">
                <span className="text-lg font-bold text-white leading-tight">
                  AgenticSST Québec™
                </span>
                <span className="text-sm text-white/90 font-medium leading-tight">
                  Suite SST réglementaire
                </span>
              </div>
            </Link>
            
            {/* Certifications - Sous le logo */}
            <div className="hidden xl:flex items-center space-x-1 ml-6">
              <Link 
                to="/certifications" 
                className="bg-green-500/20 text-green-200 border border-green-400/30 px-2 py-1 rounded-full text-xs font-medium hover:bg-green-500/30 transition-colors cursor-pointer"
                title="Voir les détails de certification Zero-Trust"
              >
                Zero-Trust
              </Link>
              <Link 
                to="/certifications" 
                className="bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-500/30 transition-colors cursor-pointer"
                title="Voir les détails de certification Gov-Ready"
              >
                Gov-Ready  
              </Link>
              <Link 
                to="/certifications" 
                className="bg-purple-500/20 text-purple-200 border border-purple-400/30 px-2 py-1 rounded-full text-xs font-medium hover:bg-purple-500/30 transition-colors cursor-pointer"
                title="Voir les détails de certification Données QC"
              >
                Données QC
              </Link>
              <span className="text-blue-200 text-xs ml-2">+</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant="ghost"
                    className={`
                      flex items-center space-x-2 text-sm font-medium transition-colors
                      hover:bg-white/20 text-white px-3 py-2
                      ${isActive ? 'bg-white/20' : ''}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}

            {/* Menu Plus avec dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:bg-white/20 text-white px-3 py-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Plus</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {plusMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link to={item.href} className="flex items-center space-x-2 w-full">
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* User Menu & Profile Selector */}
          <div className="flex items-center space-x-3">
            {/* Profile Selector - RESTAURÉ */}
            <div className="hidden md:block">
              <ProfileSelector />
            </div>

            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-blue-100">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-white hover:text-red-300 hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <User className="h-4 w-4 mr-1" />
                  Connexion
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-blue-500 py-4">
            <div className="space-y-1">
              {/* Profile Selector Mobile */}
              <div className="px-3 pb-3 border-b border-blue-500 mb-3">
                <ProfileSelector />
              </div>

              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors
                      ${isActive 
                        ? 'text-white bg-white/20' 
                        : 'text-blue-100 hover:text-white hover:bg-white/20'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Plus menu items in mobile */}
              <div className="border-t border-blue-500 pt-3 mt-3">
                <div className="text-xs text-blue-200 px-3 mb-2 font-medium">Plus</div>
                {plusMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors
                        ${isActive 
                          ? 'text-white bg-white/20' 
                          : 'text-blue-100 hover:text-white hover:bg-white/20'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile User Menu */}
              <div className="border-t border-blue-500 pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="text-xs text-blue-200 px-3">
                      Connecté: {user.email}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-blue-100 hover:text-red-300 hover:bg-white/20 text-sm justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-blue-100 hover:text-white hover:bg-white/20 text-sm justify-start">
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