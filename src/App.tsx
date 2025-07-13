import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import AssistantVocal from "./pages/AssistantVocal";
import Tests from "./pages/Tests";
import ConversationLogs from "./pages/ConversationLogs";
import AnnotationInterface from "./pages/AnnotationInterface";
import LearningDashboard from "./pages/LearningDashboard";
import PromptManagement from "./pages/PromptManagement";
import Diagnostic from "./pages/Diagnostic";
import DocumentGeneration from "./pages/DocumentGeneration";
import SSTKnowledgeBase from "./pages/SSTKnowledgeBase";
import AgentDemo from "./components/AgentDemo";
import VoiceWidget from "./components/VoiceWidget";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div id="main-content">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/assistant-vocal" element={<AssistantVocal />} />
                <Route path="/tests" element={<Tests />} />
                <Route path="/logs" element={<ConversationLogs />} />
                <Route path="/annotation" element={<AnnotationInterface />} />
                <Route path="/learning" element={<LearningDashboard />} />
                <Route path="/prompts" element={<PromptManagement />} />
                <Route path="/diagnostic" element={<Diagnostic />} />
                <Route path="/documents" element={<DocumentGeneration />} />
                <Route path="/sst-knowledge" element={<SSTKnowledgeBase />} />
                <Route path="/demo" element={<AgentDemo />} />
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

export default App;
