import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ZeroTrustModal, useZeroTrustModal } from "./components/security/ZeroTrustModal";
import Index from "./pages/Index";
import AssistantVocal from "./pages/AssistantVocal";
import Tests from "./pages/Tests";
import ConversationLogs from "./pages/ConversationLogs";
import AnnotationInterface from "./pages/AnnotationInterface";
import LearningDashboard from "./pages/LearningDashboard";
import PromptManagement from "./pages/PromptManagement";
import PromptCatalog from "./pages/PromptCatalog";
import PromptAdmin from "./pages/PromptAdmin";
import Diagnostic from "./pages/Diagnostic";
import DocuGen from "./pages/DocuGen";
import AgileFunctionsHub from "./components/agile/AgileFunctionsHub";
import SSTKnowledgeBase from "./pages/SSTKnowledgeBase";
import ComplianceDetails from "./pages/ComplianceDetails";
import AgentDemo from "./components/AgentDemo";
import VoiceWidget from "./components/VoiceWidget";
import PresentationScript from "./pages/PresentationScript";
import FAQ from "./pages/FAQ";
import CrawlingDashboard from "./pages/CrawlingDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";

const queryClient = new QueryClient();

const App = () => {
  const { showModal, acceptZeroTrust } = useZeroTrustModal();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            
            {/* Modal Zero-Trust - s'affiche par-dessus tout */}
            <ZeroTrustModal 
              isOpen={showModal}
              onAccept={acceptZeroTrust}
            />
            
            <BrowserRouter>
              <div id="main-content">
                <Header />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/assistant-vocal" element={<AssistantVocal />} />
                  <Route path="/tests" element={<Tests />} />
                  <Route path="/logs" element={<ConversationLogs />} />
                  <Route path="/annotation" element={<AnnotationInterface />} />
                  <Route path="/learning" element={<LearningDashboard />} />
                  <Route path="/prompts" element={<PromptManagement />} />
                  <Route path="/prompts/catalog" element={<PromptCatalog />} />
                  <Route path="/prompts/admin" element={<PromptAdmin />} />
                  <Route path="/diagnostic" element={<Diagnostic />} />
                  <Route path="/documents" element={<Navigate to="/docugen" replace />} />
                  <Route path="/docugen" element={<DocuGen />} />
                  <Route path="/agile-functions" element={<AgileFunctionsHub />} />
                  <Route path="/sst-knowledge" element={<SSTKnowledgeBase />} />
                  <Route path="/compliance-details/:metricType" element={<ComplianceDetails />} />
                  <Route path="/demo" element={<AgentDemo />} />
                  <Route path="/presentation-script" element={<PresentationScript />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/crawling-dashboard" element={<CrawlingDashboard />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
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