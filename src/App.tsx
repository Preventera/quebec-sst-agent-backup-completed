import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import de toutes les pages existantes avec lazy loading
const Index = React.lazy(() => import("./pages/Index"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const AssistantVocal = React.lazy(() => import("./pages/AssistantVocal"));
const Diagnostic = React.lazy(() => import("./pages/Diagnostic"));
const DocuGen = React.lazy(() => import("./pages/DocuGen"));
const LearningDashboard = React.lazy(() => import("./pages/LearningDashboard"));
const PromptManagement = React.lazy(() => import("./pages/PromptManagement"));
const SSTKnowledgeBase = React.lazy(() => import("./pages/SSTKnowledgeBase"));
const UserManagement = React.lazy(() => import("./pages/UserManagement"));
const Tests = React.lazy(() => import("./pages/Tests"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const Auth = React.lazy(() => import("./pages/Auth"));
const ComplianceDetails = React.lazy(() => import("./pages/ComplianceDetails"));
const ConversationLogs = React.lazy(() => import("./pages/ConversationLogs"));
const CrawlingDashboard = React.lazy(() => import("./pages/CrawlingDashboard"));
const AnnotationInterface = React.lazy(() => import("./pages/AnnotationInterface"));
const PresentationScript = React.lazy(() => import("./pages/PresentationScript"));
const PromptAdmin = React.lazy(() => import("./pages/PromptAdmin"));
const PromptCatalog = React.lazy(() => import("./pages/PromptCatalog"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Composant de chargement
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '24px',
    color: '#3b82f6'
  }}>
    ⚡ Chargement...
  </div>
);

// Header de navigation
const Header = () => {
  return (
    <header style={{
      backgroundColor: '#1e40af',
      padding: '1rem',
      color: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <nav style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🚀 AgenticSST Québec™
        </Link>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            🏠 Accueil
          </Link>
          <Link to="/analytics" style={{ color: 'white', textDecoration: 'none' }}>
            📊 Analytics
          </Link>
          <Link to="/diagnostic" style={{ color: 'white', textDecoration: 'none' }}>
            🔍 Diagnostic
          </Link>
          <Link to="/assistant-vocal" style={{ color: 'white', textDecoration: 'none' }}>
            🎙️ Assistant
          </Link>
          <Link to="/learning" style={{ color: 'white', textDecoration: 'none' }}>
            📚 Apprentissage
          </Link>
          <Link to="/knowledge-base" style={{ color: 'white', textDecoration: 'none' }}>
            📖 Base SST
          </Link>
          <Link to="/tests" style={{ color: 'white', textDecoration: 'none' }}>
            🧪 Tests
          </Link>
        </div>
      </nav>
    </header>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
          <Header />
          
          <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Route principale - Dashboard */}
                <Route path="/" element={<Index />} />
                
                {/* Routes Analytics et Business */}
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/admin/users" element={<UserManagement />} />
                
                {/* Routes Agents et Diagnostics */}
                <Route path="/diagnostic" element={<Diagnostic />} />
                <Route path="/assistant-vocal" element={<AssistantVocal />} />
                <Route path="/docugen" element={<DocuGen />} />
                
                {/* Routes Apprentissage et Prompts */}
                <Route path="/learning" element={<LearningDashboard />} />
                <Route path="/prompts" element={<PromptManagement />} />
                <Route path="/prompt-admin" element={<PromptAdmin />} />
                <Route path="/prompt-catalog" element={<PromptCatalog />} />
                
                {/* Routes Base de connaissances */}
                <Route path="/knowledge-base" element={<SSTKnowledgeBase />} />
                <Route path="/faq" element={<FAQ />} />
                
                {/* Routes Tests et Monitoring */}
                <Route path="/tests" element={<Tests />} />
                <Route path="/conversation-logs" element={<ConversationLogs />} />
                <Route path="/crawling" element={<CrawlingDashboard />} />
                <Route path="/annotation" element={<AnnotationInterface />} />
                
                {/* Routes Compliance et Details */}
                <Route path="/compliance-details" element={<ComplianceDetails />} />
                <Route path="/presentation" element={<PresentationScript />} />
                
                {/* Route Auth */}
                <Route path="/auth" element={<Auth />} />
                
                {/* 404 - Page non trouvée */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          
          {/* Footer */}
          <footer style={{
            backgroundColor: '#1e293b',
            color: 'white',
            padding: '2rem',
            marginTop: '4rem',
            textAlign: 'center'
          }}>
            <p>🎊 Phase 2 Enterprise - Complétée avec succès!</p>
            <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
              20 pages fonctionnelles • Multi-agents IA • Analytics Business • Sécurité Enterprise
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;