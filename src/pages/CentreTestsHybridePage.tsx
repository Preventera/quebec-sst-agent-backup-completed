// src/pages/CentreTestsHybridePage.tsx
// Centre de Tests Hybride - Version Propre et Modulaire
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import VisualBundle from '../data/design-system/AgenticSST_Quebec_VisualBundle.json';
import {
  Play,
  Pause,
  Download,
  Users,
  Building,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  Activity,
  Target,
  Zap,
  BarChart3,
  PlayCircle,
  ArrowLeft,
  Award,
  Shield,
  Briefcase,
  Lightbulb,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { STORMResearchEngine, HybridTestsSTORMIntegration } from '@/lib/storm-integration';

const CentreTestsHybridePage = () => {
  const [currentMode, setCurrentMode] = useState('automatique');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState('');
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [metrics, setMetrics] = useState({
    timeSpent: 0,
    interactions: 0,
    documentsGenerated: 0,
    leadScore: 'medium'
  });
  const [stormEngine] = useState(() => new HybridTestsSTORMIntegration());
  const [stormResults, setStormResults] = useState(null);
  const [isSTORMLoading, setIsSTORMLoading] = useState(false);

  // Fonctions pour les boutons STORM
  const downloadSTORMReport = () => {
    const reportContent = `
RAPPORT STORM - INTELLIGENCE SECTORIELLES
==========================================
Score personnalisé: ${stormResults?.personalizedScores?.scoreGlobal || 63}/100
Benchmark secteur: ${stormResults?.personalizedScores?.benchmarkSecteur || '84% vs moyenne'}
Confiance analyse: ${Math.round((stormResults?.confidence || 0.87) * 100)}%

INSIGHTS SECTORIELLES:
${stormResults?.stormInsights?.map((insight, idx) => `${idx + 1}. ${insight}`).join('\n') || 'Données sectorielles analysées'}

RECOMMANDATIONS:
${stormResults?.recommendations?.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n') || 'Recommandations personnalisées'}

Sources: ${stormResults?.sources?.join(', ') || 'CSTC, SafetyGraph, Base AgenticSST'}
Généré le: ${new Date().toLocaleString('fr-CA')}
==========================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_STORM_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

const openDashboardAnalytics = () => {
  // Créer le contenu HTML complet du dashboard
  const dashboardHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Analytics STORM - AgenticSST</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      min-height: 100vh;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      transition: transform 0.3s ease;
    }
    .metric-card:hover {
      transform: translateY(-5px);
    }
    .metric-title {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .metric-subtitle {
      color: #888;
      font-size: 0.9rem;
    }
    .insights-section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 1.5rem;
      color: #1e40af;
      margin-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
    }
    .insight-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .insight-icon {
      margin-right: 15px;
      font-size: 1.5rem;
    }
    .recommendations {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 40px;
      font-style: italic;
    }
    .progress-bar {
      width: 100%;
      height: 20px;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 10px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6);
      border-radius: 10px;
      width: 63%;
      transition: width 2s ease;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌪️ Dashboard Analytics STORM</h1>
    <p>Intelligence Sectorielles AgenticSST Québec™</p>
  </div>
  
  <div class="dashboard-container">
    <!-- Métriques principales -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">Score Personnalisé</div>
        <div class="metric-value">63<span style="font-size: 1.5rem; color: #666;">/100</span></div>
        <div class="metric-subtitle">Évaluation contextuelle secteur</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Benchmark Secteur</div>
        <div class="metric-value">84<span style="font-size: 1.5rem; color: #666;">%</span></div>
        <div class="metric-subtitle">vs moyenne secteur</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Confiance Analyse</div>
        <div class="metric-value">87<span style="font-size: 1.5rem; color: #666;">%</span></div>
        <div class="metric-subtitle">Basé sur 793K incidents</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Sources Analysées</div>
        <div class="metric-value">4</div>
        <div class="metric-subtitle">CSTC, SafetyGraph, CNESST</div>
      </div>
    </div>

    <!-- Insights sectorielles -->
    <div class="insights-section">
      <h2 class="section-title">🎯 Insights Sectorielles Clés</h2>
      
      <div class="insight-item">
        <span class="insight-icon">⚠️</span>
        <div>
          <strong>Chutes de hauteur :</strong> 34% des accidents secteur construction<br>
          <small>Facteur de risque principal identifié</small>
        </div>
      </div>
      
      <div class="insight-item">
        <span class="insight-icon">💰</span>
        <div>
          <strong>Coût moyen accident :</strong> 127,000$ + arrêts travail<br>
          <small>Impact financier direct et indirect</small>
        </div>
      </div>
      
      <div class="insight-item">
        <span class="insight-icon">📊</span>
        <div>
          <strong>PME construction :</strong> Risque relatif 2.3x vs grandes entreprises<br>
          <small>Vulnérabilité accrue des petites structures</small>
        </div>
      </div>
    </div>

    <!-- Recommandations -->
    <div class="insights-section recommendations">
      <h2 class="section-title">💡 Recommandations Prioritaires</h2>
      
      <div class="insight-item">
        <span class="insight-icon">🎓</span>
        <div>
          <strong>Formation spécialisée :</strong> Budget 9,000$ → ROI 280%<br>
          <small>Évite 1.2 accidents/an selon modélisation</small>
        </div>
      </div>
      
      <div class="insight-item">
        <span class="insight-icon">🛡️</span>
        <div>
          <strong>EPI obligatoires secteur :</strong> 3,000$ → Conformité complète<br>
          <small>Réduction risque + conformité réglementaire</small>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Généré le ${new Date().toLocaleString('fr-CA')} | AgenticSST Québec™ | STORM Research Engine</p>
    <p>🔒 Données protégées - Usage confidentiel entreprise</p>
  </div>

  <script>
    // Animation au chargement
    document.addEventListener('DOMContentLoaded', function() {
      const cards = document.querySelectorAll('.metric-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.style.animation = 'slideInUp 0.6s ease forwards';
        }, index * 200);
      });
    });
  </script>
</body>
</html>`;

  // Ouvrir dans une nouvelle fenêtre
  const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  if (newWindow) {
    newWindow.document.write(dashboardHTML);
    newWindow.document.close();
  } else {
    // Fallback si le popup est bloqué
    const blob = new Blob([dashboardHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};

  // Effet pour timer d'engagement
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Scénarios automatisés pour le prélancement
  const scenariosAutomatises = [
    {
      id: 'pme-manufacturiere',
      titre: 'PME Manufacturière',
      secteur: 'Industriel',
      duree: '4-6 minutes',
      icon: <Building className="h-6 w-6" />,
      description: 'Évaluation conformité Art.51 LMRSST avec génération automatique des documents',
      agents: ['DiagSST', 'LexiNorm', 'DocuGen', 'Prioris'],
      livrables: [
        'Rapport diagnostic conformité LMRSST',
        'Plan d\'action priorisé avec timeline',
        'Checklist inspection terrain',
        'Formulaires CNESST pré-remplis'
      ],
      references: ['Art. 51 LMRSST', 'Guide PME CNESST', 'Normes secteur manufacturier'],
      color: 'bg-blue-500',
      targetAudience: 'PME 50-200 employés'
    },
    {
      id: 'construction-cstc',
      titre: 'Construction CSTC',
      secteur: 'Construction',
      duree: '6-8 minutes',
      icon: <AlertTriangle className="h-6 w-6" />,
      description: 'Conformité multi-législations avec avis CNESST 10 jours',
      agents: ['LexiNorm', 'ALSS', 'DocuGen', 'Hugo', 'Sentinelle'],
      livrables: [
        'Avis CNESST conformité 10j',
        'Analyse multi-législations (LMRSST/CSTC)',
        'Plan santé-sécurité chantier',
        'Documents coordination SST'
      ],
      references: ['Code Sécurité Travaux Construction', 'LMRSST Construction', 'Normes CNESST'],
      color: 'bg-orange-500',
      targetAudience: 'Contracteurs, donneurs d\'ouvrage'
    },
    {
      id: 'incident-critique',
      titre: 'Incident Critique',
      secteur: 'Urgence',
      duree: '3-5 minutes',
      icon: <Activity className="h-6 w-6" />,
      description: 'Gestion incident avec déclaration 24h et formulaires temps réel',
      agents: ['ALSS', 'DocuGen', 'Hugo', 'Sentinelle', 'CoSS'],
      livrables: [
        'Déclaration incident CNESST 24h',
        'Rapport enquête préliminaire',
        'Plan actions correctives immédiates',
        'Communication parties prenantes'
      ],
      references: ['Procédures CNESST urgence', 'LMRSST incidents', 'Protocoles déclaration'],
      color: 'bg-red-500',
      targetAudience: 'Toutes organisations'
    }
  ];

  // Templates de contenu PROFESSIONNELS - VERSION PROPRE
 const getDocumentTemplate = (docType, scenario) => {
  const timestamp = new Date().toLocaleString('fr-CA');
  
  // 1. CHERCHER DANS LE BUNDLE JSON IA
  const blueprint = VisualBundle.blueprints.find(b => 
    b.name.toLowerCase().includes(docType.toLowerCase()) ||
    b.id === docType ||
    (b.form_refs && b.form_refs.some(ref => ref.includes(docType.toLowerCase())))
  );
  
  if (blueprint) {
    return generateFromBlueprint(blueprint, scenario, timestamp);
  }
  
  // 2. FALLBACK VERS TEMPLATES EXISTANTS
  return `# ${docType.toUpperCase()}

**Document généré :** ${timestamp}
**Secteur :** ${scenario?.secteur || 'Général'}

Contenu personnalisé basé sur vos spécifications AgenticSST Québec.

*Document conforme aux standards LMRSST/CNESST*`;
};
// Exposer la fonction globalement pour DocuGen
(window as any).getDocumentTemplate = getDocumentTemplate;

const generateFromBlueprint = (blueprint, scenario, timestamp) => {
  let document = `# ${blueprint.name.toUpperCase()}
═══════════════════════════════════════

📋 **ID Document :** ${blueprint.id}
🔒 **Version :** ${blueprint.version}
📅 **Généré le :** ${timestamp}
⚖️ **Législation :** ${blueprint.legislation?.join(' + ') || 'LMRSST'}
🏭 **Secteurs :** ${blueprint.sectors?.join(', ') || 'Tous secteurs'}

═══════════════════════════════════════

## 📊 IDENTIFICATION ÉTABLISSEMENT

- **Entreprise :** ${scenario?.company_name || 'Entreprise Exemple Inc.'}
- **Secteur :** ${scenario?.secteur || 'Manufacturier'}
- **Date :** ${timestamp}

## 📋 CONTENU STRUCTURÉ

Document généré automatiquement selon les blueprints AgenticSST Québec.
Contenu personnalisé basé sur votre Design System JSON.

═══════════════════════════════════════
Document généré par AgenticSST Québec™
═══════════════════════════════════════`;

  return document;
};
  // Fonction d'enrichissement STORM
  const enrichScenarioWithSTORM = async (scenarioType, companyProfile) => {
    setIsSTORMLoading(true);
    
    try {
      console.log('🌪️ STORM enrichissement démarré...', { scenarioType, companyProfile });
      
  // AJOUT : Simulation de données STORM pour les tests
const mockStormData = {
  confidence: 0.87,
  personalizedScores: {
    scoreGlobal: 63,
    benchmarkSecteur: '84% vs moyenne secteur'
  },
  stormInsights: [
    'Chutes de hauteur : 34% des accidents secteur construction',
    'Coût moyen accident construction : 127,000$ + arrêts travail',
    'PME construction : risque relatif 2.3x vs grandes entreprises'
  ],
  recommendations: [
    'Formation spécialisée général : Budget 9,000$ → ROI 280% (évite 1.2 accidents/an)',
    'EPI obligatoires secteur : 3,000$ → Conformité réglementaire complète'
  ],
  sources: ['CSTC', 'SafetyGraph', 'Base AgenticSST', 'CNESST Secteur']
};

// Délai pour simuler l'analyse
await new Promise(resolve => setTimeout(resolve, 2000));

setStormResults(mockStormData);
console.log('✅ STORM enrichissement terminé', mockStormData);

return mockStormData;   
      setStormResults(enrichment);
      console.log('✅ STORM enrichissement terminé', enrichment);
      
      return enrichment;
    } catch (error) {
      console.error('❌ Erreur STORM:', error);
      return null;
    } finally {
      setIsSTORMLoading(false);
    }
  };

  const startAutoDemonstration = async (scenario) => {
    setSelectedScenario(scenario.id);
    setIsRunning(true);
    setProgress(0);
    setGeneratedDocs([]);

    // Enrichissement STORM avant orchestration
    const stormEnrichment = await enrichScenarioWithSTORM(scenario.id, scenario);

    // Mise à jour métriques avec données STORM
    setMetrics(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
      leadScore: stormEnrichment ? 'premium' : 'high',
      lastAction: 'Analyse STORM démarrée'
    }));

    // Simulation orchestration temps réel
    const agents = scenario.agents;
    const totalSteps = agents.length * 2;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const agentIndex = Math.floor((currentStep - 1) / 2);
      setCurrentAgent(agents[agentIndex] || '✅ Finalisation');
      setProgress((currentStep / totalSteps) * 100);

      // Génération documents simulée avec timing réaliste
      if (currentStep % 2 === 0 && currentStep <= agents.length * 2) {
        const docType = scenario.livrables[Math.floor((currentStep - 1) / 2)];
        if (docType) {
          setGeneratedDocs(prev => [...prev, {
            id: Date.now() + currentStep,
            type: docType,
            agent: agents[agentIndex] || agents[0],
            timestamp: new Date().toLocaleTimeString('fr-CA'),
            scenario: scenario.id
          }]);
        }
      }

      // Métriques temps réel
      setMetrics(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 2,
        documentsGenerated: Math.floor((currentStep / 2))
      }));

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setIsRunning(false);
        setCurrentAgent('✅ Démonstration terminée avec succès');
      }
    }, 1500);
  };

  const stopDemonstration = () => {
    setIsRunning(false);
    setCurrentAgent('⏹️ Démonstration arrêtée');
  };

  // CTA dynamiques selon profil et secteur
  const getCTADynamique = () => {
    const scenario = scenariosAutomatises.find(s => s.id === selectedScenario);
    if (!scenario) return null;

    const ctas = {
      'pme-manufacturiere': {
        primary: 'Demander évaluation PME gratuite',
        secondary: 'Télécharger guide conformité LMRSST',
        contact: 'Parler à un expert manufacturier',
        nextStep: 'Audit conformité sur site',
        urgency: 'Évaluation gratuite limitée - 48h'
      },
      'construction-cstc': {
        primary: 'Obtenir avis CNESST 10 jours',
        secondary: 'Consulter checklist CSTC gratuite',
        contact: 'Expert construction disponible',
        nextStep: 'Planification chantier sécurisé',
        urgency: 'Service express disponible'
      },
      'incident-critique': {
        primary: 'Assistance incident 24/7',
        secondary: 'Formation gestion urgences SST',
        contact: 'Hotline incidents critique',
        nextStep: 'Plan réponse urgence personnalisé',
        urgency: 'Support immédiat disponible'
      }
    };

    return ctas[selectedScenario] || ctas['pme-manufacturiere'];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête avec navigation retour et statut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au tableau de bord</span>
          </Link>
          <div className="h-6 w-px bg-slate-300"></div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Centre de Tests Hybride</h1>
            <p className="text-slate-600 mt-1">Mode automatique - Démonstrations sectorielles immersives</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-green-50 border-green-200">
            <Activity className="h-3 w-3 mr-1 text-green-600" />
            8 Agents Actifs
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 border-blue-200">
            <FileText className="h-3 w-3 mr-1 text-blue-600" />
            196 Docs CNESST
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 bg-purple-100 text-purple-800">
            <Award className="h-3 w-3 mr-1" />
            Mode Prélancement
          </Badge>
        </div>
      </div>

      {/* Métriques engagement temps réel */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-700">{metrics.timeSpent}s</div>
                <div className="text-xs text-slate-600">Temps d'engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-700">{metrics.interactions}</div>
                <div className="text-xs text-slate-600">Interactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-700">{metrics.documentsGenerated}</div>
                <div className="text-xs text-slate-600">Documents générés</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <div>
                <Badge variant={metrics.leadScore === 'high' ? 'default' : metrics.leadScore === 'medium' ? 'secondary' : 'outline'}>
                  {metrics.leadScore === 'high' ? 'Lead Qualifié' :
                   metrics.leadScore === 'medium' ? 'Intéressé' :
                   'Prospect'}
                </Badge>
                <div className="text-xs text-slate-600 mt-1">Lead scoring</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface STORM */}
      {isSTORMLoading && (
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="animate-spin h-6 w-6 border-3 border-blue-500 rounded-full border-t-transparent"></div>
                <div className="absolute inset-0 animate-ping h-6 w-6 border-1 border-blue-300 rounded-full opacity-20"></div>
              </div>
              <div className="flex-1">
                <span className="text-blue-700 font-semibold">🌪️ STORM recherche intelligence sectorielles...</span>
                <div className="text-xs text-blue-600 mt-1">
                  Analyse documentaire CSTC • Benchmarks sectoriels • Insights personnalisés
                </div>
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-600">
                Intelligence temps réel
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats STORM disponibles */}
      {stormResults && !isSTORMLoading && (
        <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              🌪️ STORM Intelligence Sectorielles - Analyse Complétée
            </CardTitle>
            <CardDescription className="text-green-700">
              Données enrichies avec intelligence SafetyGraph • Score confiance: {Math.round((stormResults.confidence || 0.85) * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  {stormResults.personalizedScores?.scoreGlobal || '87'}/100
                </div>
                <div className="text-xs text-gray-600">Score Personnalisé</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">
                  {stormResults.personalizedScores?.benchmarkSecteur || 'Top 15%'}
                </div>
                <div className="text-xs text-gray-600">Benchmark Secteur</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">
                  {stormResults.sources?.length || 12}
                </div>
                <div className="text-xs text-gray-600">Sources CSTC</div>
              </div>
            </div>

            {stormResults.stormInsights && stormResults.stormInsights.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  Insights Sectorielles Clés
                </h4>
                <div className="space-y-2">
                  {stormResults.stormInsights.slice(0, 3).map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded border-l-4 border-l-blue-400">
                      <span className="text-blue-600 font-semibold text-sm">{idx + 1}.</span>
                      <span className="text-sm text-gray-700">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stormResults.recommendations && stormResults.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Recommandations Personnalisées
                </h4>
                <div className="space-y-2">
                  {stormResults.recommendations.slice(0, 2).map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded border-l-4 border-l-green-400">
                      <span className="text-green-600 font-semibold text-sm">→</span>
                      <span className="text-sm text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-3 border-t border-green-200">
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={downloadSTORMReport}>
                <Download className="h-4 w-4 mr-1" />
                Rapport STORM
              </Button>
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={openDashboardAnalytics}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Dashboard Analytics
              </Button>
              <Badge variant="secondary" className="ml-auto">
                Enrichi STORM ✅
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sélection scénarios automatisés */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-600" />
            Démonstrations Automatiques Sectorielles
          </CardTitle>
          <p className="text-slate-600">
            Expérience immersive avec orchestration multi-agents temps réel et génération documentaire automatique
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {scenariosAutomatises.map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer border-2 transition-all hover:shadow-lg transform hover:-translate-y-1 ${
                  selectedScenario === scenario.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${scenario.color} text-white shadow-md`}>
                      {scenario.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{scenario.titre}</h3>
                      <p className="text-sm text-slate-600">{scenario.secteur}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-600 mb-3">{scenario.description}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>Durée: {scenario.duree}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-slate-500" />
                      <span>Cible: {scenario.targetAudience}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Agents mobilisés:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scenario.agents.slice(0, 3).map(agent => (
                          <Badge key={agent} variant="outline" className="text-xs px-1 py-0 bg-white">
                            {agent}
                          </Badge>
                        ))}
                        {scenario.agents.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0 bg-white">
                            +{scenario.agents.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedScenario === scenario.id && (
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      onClick={() => startAutoDemonstration(scenario)}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <>
                          <Activity className="h-4 w-4 mr-2 animate-pulse" />
                          Démonstration en cours...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Démarrer Démonstration
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orchestration multi-agents en temps réel */}
      {isRunning && selectedScenario && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 animate-pulse text-green-600" />
                Orchestration Multi-Agents en Cours
              </CardTitle>
              <Button variant="outline" size="sm" onClick={stopDemonstration} className="hover:bg-white">
                <Pause className="h-4 w-4 mr-2" />
                Arrêter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progression globale</span>
                  <span className="text-sm text-slate-600 font-mono">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-white" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-slate-700">Agent actuel</div>
                  <div className="text-slate-800 text-lg font-semibold">{currentAgent}</div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  En cours
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents générés avec téléchargement fonctionnel */}
      {generatedDocs.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents Générés Automatiquement ({generatedDocs.length})
            </CardTitle>
            <p className="text-sm text-slate-600">
              Documents conformes LMRSST/CNESST générés par l'orchestration multi-agents
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {generatedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-800">{doc.type}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      Généré par <Badge variant="outline" className="text-xs mx-1 bg-blue-50">{doc.agent}</Badge>
                      à {doc.timestamp}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadDocument(doc)}
                    className="ml-3 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA dynamiques contextuels */}
      {selectedScenario && !isRunning && generatedDocs.length > 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Prochaines étapes pour votre organisation
            </CardTitle>
            <p className="text-blue-700 font-medium">
              Suite recommandée: {getCTADynamique()?.nextStep}
            </p>
            {getCTADynamique()?.urgency && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 w-fit">
                {getCTADynamique().urgency}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {getCTADynamique() && (
                <>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transform hover:scale-105 transition-all">
                    {getCTADynamique().primary}
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400">
                    {getCTADynamique().secondary}
                  </Button>
                  <Button variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {getCTADynamique().contact}
                  </Button>
                </>
              )}
            </div>

            <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
              <h4 className="font-medium text-sm text-slate-700 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                Conformité Réglementaire Validée
              </h4>
              <div className="flex flex-wrap gap-2 text-xs mb-3">
                {scenariosAutomatises.find(s => s.id === selectedScenario)?.references.map(ref => (
                  <Badge key={ref} variant="outline" className="text-xs border-green-200 text-green-800 bg-green-50">
                    {ref}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong>Traçabilité complète pour auditeurs</strong> • Validation multi-agents • Conformité CNESST automatisée • Mise à jour réglementaire continue
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information mode existant */}
      <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              Centre de Tests Manuel Toujours Disponible
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Votre interface de tests manuels existante reste accessible avec toutes ses fonctionnalités d'origine
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/tests">
                <Button variant="outline" className="hover:bg-white">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Accéder au Mode Manuel
                </Button>
              </Link>
              <Link to="/agile-functions">
                <Button variant="secondary">
                  <Zap className="h-4 w-4 mr-2" />
                  Fonctions Agiles
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CentreTestsHybridePage;