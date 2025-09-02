import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ZeroTrustModal, useZeroTrustModal } from "./components/security/ZeroTrustModal";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import AssistantVocal from "./pages/AssistantVocal";
import Tests from "./pages/Tests";
import ConversationLogs from "./pages/ConversationLogs";
import AnnotationInterface from "./pages/AnnotationInterface";
import PromptManagement from "./pages/PromptManagement";
import PromptCatalog from "./pages/PromptCatalog";
import PromptAdmin from "./pages/PromptAdmin";
import Diagnostic from "./pages/Diagnostic";
import DocuGen from "./pages/DocuGen";
import Analytics from "./pages/Analytics";
import UserManagement from "./pages/UserManagement";
import AgileFunctionsHub from "./components/agile/AgileFunctionsHub";
import SSTKnowledgeBase from "./pages/SSTKnowledgeBase";
import ComplianceDetails from "./pages/ComplianceDetails";
import AgentDemo from "./components/AgentDemo";
import VoiceWidget from "./components/VoiceWidget";
import PresentationScript from "./pages/PresentationScript";
import FAQ from "./pages/FAQ";
import CrawlingDashboard from "./pages/CrawlingDashboard";
import Certifications from "./pages/Certifications";
import HITLTest from "./pages/HITLTest";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import SafeVisionPage from "./pages/SafeVisionPage";

const queryClient = new QueryClient();

const App = () => {
  const { showZeroTrustModal, handleZeroTrustSuccess } = useZeroTrustModal();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            
            {/* Modal Zero-Trust - s'affiche par-dessus tout */}
            <ZeroTrustModal 
              isOpen={showZeroTrustModal}
              onSuccess={handleZeroTrustSuccess}
            />
            
            <BrowserRouter>
              <div id="main-content">
                <Header />
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <Routes>
                    {/* Page d'accueil */}
                    <Route path="/" element={<Index />} />
                    
                    {/* Assistant et IA */}
                    <Route path="/assistant-vocal" element={<AssistantVocal />} />
                    <Route path="/demo" element={<AgentDemo />} />
                    
                    {/* Tests et Logs */}
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/logs" element={<ConversationLogs />} />
                    
                    {/* Apprentissage et Annotations */}
                    <Route path="/annotation" element={<AnnotationInterface />} />
                    
                    {/* Gestion des Prompts */}
                    <Route path="/prompts" element={<PromptManagement />} />
                    <Route path="/prompts/catalog" element={<PromptCatalog />} />
                    <Route path="/prompts/admin" element={<PromptAdmin />} />
                    
                    {/* Routes Admin - NOUVELLES ROUTES AJOUTÉES */}
                    <Route path="/admin" element={<Navigate to="/admin/prompts" replace />} />
                    <Route path="/admin/prompts" element={<PromptManagement />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/analytics" element={<Analytics />} />
                    
                    {/* Analytics et Users - routes existantes maintenues */}
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/users" element={<UserManagement />} />
                    
                    {/* Diagnostic et Documentation */}
                    <Route path="/diagnostic" element={<Diagnostic />} />
                    <Route path="/documents" element={<Navigate to="/docugen" replace />} />
                    <Route path="/docugen" element={<DocuGen />} />
                    
                    {/* SafeVision Integration - NOUVELLE ROUTE SAFEVISION */}
                    <Route path="/safevision" element={<SafeVisionPage />} />
                    <Route path="/video" element={<Navigate to="/safevision" replace />} />
                    <Route path="/formation-video" element={<Navigate to="/safevision" replace />} />
                    
                    {/* Fonctions Agiles */}
                    <Route path="/agile-functions" element={<AgileFunctionsHub />} />
                    <Route path="/agents" element={<AgileFunctionsHub />} />
                    <Route path="/learning" element={<AgileFunctionsHub />} />
                    
                    {/* Base de connaissances */}
                    <Route path="/sst-knowledge" element={<SSTKnowledgeBase />} />
                    <Route path="/compliance-details/:metricType" element={<ComplianceDetails />} />
                    
                    {/* Présentation et FAQ */}
                    <Route path="/presentation-script" element={<PresentationScript />} />
                    <Route path="/faq" element={<FAQ />} />
                    
                    {/* Crawling et Certifications */}
                    <Route path="/crawling-dashboard" element={<CrawlingDashboard />} />
                    <Route path="/certifications" element={<Certifications />} />
                    
                    {/* Route de test HITL */}
                    <Route path="/hitl-test" element={<HITLTest />} />
                    
                    {/* Auth */}
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Route catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
                           
              {/* Widget vocal flottant global */}
              <VoiceWidget />
            </BrowserRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;