// src/pages/AgileFunctions.tsx - Créer ce fichier avec HITL intégré
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { HITLAdvanced } from '@/components/security/HITLAdvanced';
import { 
  Shield, 
  FileText, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Eye,
  Search,
  Calendar,
  TrendingUp,
  Zap,
  Settings,
  Brain,
  UserCheck
} from 'lucide-react';

interface AgileFunction {
  id: string;
  title: string;
  description: string;
  category: 'conformity' | 'prevention' | 'management' | 'analysis' | 'critical';
  priority: 'High' | 'Medium' | 'Critical';
  duration: string;
  compliance: string[];
  agent: string;
  icon: React.ElementType;
  legalBasis: string[];
  criticalityLevel: 'critical' | 'high' | 'medium';
  expectedOutputs: string[];
}

const agileFunctions: AgileFunction[] = [
  {
    id: 'diagnostic-conformity',
    title: 'Diagnostic conformité LMRSST',
    description: 'Contrôle respect articles LMRSST',
    category: 'conformity',
    priority: 'High',
    duration: '15 min',
    compliance: ['% conformité articles...'],
    agent: 'ComplianceAgent',
    icon: Shield,
    legalBasis: ['Art. 27, 90, 123 LMRSST'],
    criticalityLevel: 'high',
    expectedOutputs: ['Rapport de conformité', 'Plan d\'actions correctifs', 'Échéanciers']
  },
  {
    id: 'incident-register',
    title: 'Génération automatique registre des incidents',
    description: 'Document légal obligatoire',
    category: 'management',
    priority: 'High',
    duration: '5 min',
    compliance: ['Nb incidents docum...'],
    agent: 'DocuGenAgent',
    icon: FileText,
    legalBasis: ['Art. 123 LMRSST'],
    criticalityLevel: 'high',
    expectedOutputs: ['Registre officiel', 'Analyse tendances', 'Recommandations']
  },
  {
    id: 'training-tracking',
    title: 'Suivi des échéances formations SST',
    description: 'Gestion des formations obligatoires',
    category: 'management',
    priority: 'Medium',
    duration: '10 min',
    compliance: ['% formations à jour'],
    agent: 'TrainingAgent',
    icon: Calendar,
    legalBasis: ['CNESST programmes'],
    criticalityLevel: 'medium',
    expectedOutputs: ['Calendrier formations', 'Alertes échéances', 'Rapports conformité']
  },
  {
    id: 'audit-planning',
    title: 'Planification agile des audits internes SST',
    description: 'Organisation audits + suivi',
    category: 'analysis',
    priority: 'Medium',
    duration: '20 min',
    compliance: ['Nb audits planifiés/...'],
    agent: 'AuditAgent',
    icon: CheckCircle,
    legalBasis: ['ISO 45001, CNESST guides'],
    criticalityLevel: 'medium',
    expectedOutputs: ['Planning audits', 'Checklists', 'Procédures suivi']
  },
  {
    id: 'inspection-terrain',
    title: 'Outil de gestion des inspections terrain',
    description: 'Remontée terrain & contrôle',
    category: 'prevention',
    priority: 'High',
    duration: '8 min',
    compliance: ['% inspections compli...'],
    agent: 'InspectionAgent',
    icon: Eye,
    legalBasis: ['CNESST procédures'],
    criticalityLevel: 'high',
    expectedOutputs: ['Rapports inspection', 'Actions correctives', 'Suivi terrain']
  },
  {
    id: 'realtime-alerts',
    title: 'Notifications temps réel non-conformités',
    description: 'Alertes proactives',
    category: 'critical',
    priority: 'High',
    duration: 'Temps réel',
    compliance: ['Temps de réaction <...'],
    agent: 'MonitoringAgent',
    icon: AlertTriangle,
    legalBasis: ['Normes CNESST'],
    criticalityLevel: 'critical',
    expectedOutputs: ['Alertes immédiates', 'Escalade automatique', 'Tableau de bord']
  },
  {
    id: 'ergonomics-analysis',
    title: 'Module analyse ergonomique postes',
    description: 'Prévention des TMS',
    category: 'prevention',
    priority: 'Medium',
    duration: '25 min',
    compliance: ['Score ergonomique ...'],
    agent: 'ErgonomicsAgent',
    icon: TrendingUp,
    legalBasis: ['Guides CNESST ergonomie'],
    criticalityLevel: 'medium',
    expectedOutputs: ['Évaluation ergonomique', 'Recommandations', 'Plan amélioration']
  },
  {
    id: 'prevention-planning',
    title: 'Gestion plans de prévention sectoriels',
    description: 'Élaboration / gestion plans prévention',
    category: 'prevention',
    priority: 'High',
    duration: '30 min',
    compliance: ['Plans à jour par sect...'],
    agent: 'PreventionAgent',
    icon: Shield,
    legalBasis: ['Art. 90 LMRSST'],
    criticalityLevel: 'high',
    expectedOutputs: ['Plans sectoriels', 'Procédures', 'Formation équipes']
  }
];

const AgileFunctions: React.FC = () => {
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const { validateAgentAction } = useHITLAgents();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleExecuteFunction = async (func: AgileFunction) => {
    setIsExecuting(func.id);
    console.log('🔥 CLIC DÉTECTÉ sur:', func.title); // AJOUTEZ CETTE LIGNE ICI
    try {
      // Contexte HITL spécialisé par fonction
      const context = {
        agentName: func.agent.replace('Agent', '') as any, // ComplianceAgent -> Compliance
        action: func.title,
        companyProfile: {
          name: 'Entreprise Demo',
          size: 50,
          sector: 'Manufacturing'
        },
        scenario: func.description,
        criticalityLevel: func.criticalityLevel,
        legalBasis: func.legalBasis,
        expectedOutputs: func.expectedOutputs
      };

      // Validation HITL AVANT exécution
      const validation = { 
        approved: window.confirm(`VALIDATION HITL REQUISE

      Agent: ${func.agent}
      Action: ${func.title}
      Entreprise: ${context.companyProfile.name}

      Articles LMRSST: ${func.legalBasis.join(', ')}

      Autoriser l'exécution ?`)
      };
      
      if (!validation.approved) {
        toast({
          title: `${func.title} - Exécution annulée`,
          description: "Validation HITL rejetée par l'utilisateur",
          variant: "destructive"
        });
        return;
      }

      // Fonction approuvée - exécuter avec audit
      toast({
        title: `${func.title} - Validation HITL approuvée`,
        description: `${func.agent} autorisé avec audit centralisé`,
      });

      // Simulation d'exécution (remplacer par votre logique réelle)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: `${func.title} - Terminé`,
        description: `Exécution réussie avec traçabilité HITL complète`,
        variant: "default"
      });

    } catch (error) {
      console.error('Erreur exécution fonction:', error);
      toast({
        title: "Erreur d'exécution",
        description: "Une erreur est survenue lors de l'exécution",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(null);
    }
  };

  const criticalFunctions = agileFunctions.filter(f => f.criticalityLevel === 'critical').length;
  const highPriorityFunctions = agileFunctions.filter(f => f.priority === 'High').length;
  const availableFunctions = agileFunctions.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Zap className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fonctions Agiles SST</h1>
          <p className="text-gray-600">Accélérez votre conformité avec 200+ fonctions basées sur LMRSST, CSTC, RBQ et autres réglementations</p>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{criticalFunctions}</p>
              <p className="text-sm text-gray-600">Critiques</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{highPriorityFunctions}</p>
              <p className="text-sm text-gray-600">Priorité Haute</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{availableFunctions}</p>
              <p className="text-sm text-gray-600">Total Fonctions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{availableFunctions}</p>
              <p className="text-sm text-gray-600">Disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Filtres et recherche</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">Toutes les catégories</Button>
          <Button variant="outline" size="sm">Toutes les priorités</Button>
          <Button variant="outline" size="sm">Effacer les filtres</Button>
        </div>
      </div>

      {/* Grille des fonctions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agileFunctions.map((func) => {
          const IconComponent = func.icon;
          
          return (
            <Card key={func.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded ${
                      func.criticalityLevel === 'critical' ? 'bg-red-100' : 
                      func.criticalityLevel === 'high' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        func.criticalityLevel === 'critical' ? 'text-red-600' : 
                        func.criticalityLevel === 'high' ? 'text-orange-600' : 'text-blue-600'
                      }`} />
                    </div>
                  </div>
                  <Badge className={`${getPriorityColor(func.priority)} text-white text-xs`}>
                    {func.priority}
                  </Badge>
                </div>
                <CardTitle className="text-sm line-clamp-2">{func.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {func.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {func.duration}
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Shield className="h-3 w-3 mr-1" />
                    {func.compliance[0]}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Réglementation:</span> {func.legalBasis[0]}
                  </div>
                  <div className="text-xs text-green-600">
                    <span className="font-medium">Agent:</span> {func.agent}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      console.log('BOUTON CLIQUÉ !');
                      alert('Test direct du bouton');
                    }}
                    disabled={isExecuting === func.id}
                  >
                    {isExecuting === func.id ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Exécution...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-1" />
                        Exécuter (HITL)
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" className="ml-2 p-2">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Test button */}
      <button onClick={() => alert('Bouton de test simple')} style={{background: 'red', color: 'white', padding: '10px'}}>
      TEST DIRECT
      </button>

{/* Footer */}  
      {/* Footer */}
      <div className="mt-12 pt-6 border-t">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Système d'intelligence artificielle distribuée pour la conformité LMRSST
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AgenticSST Québec™ - Solution d'accompagnement intelligente pour la conformité LMRSST
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgileFunctions;