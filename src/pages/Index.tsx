import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, AlertTriangle, Clock, TrendingUp, CheckCircle, 
  FileText, Users, Settings, Download, Filter, MoreHorizontal,
  ChevronRight, Calendar, Bell, Play, Pause, Square,
  Zap, BookOpen, BarChart3, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types pour les données
interface KpiData {
  title: string;
  value: string;
  delta: number;
  status: 'ok' | 'warn' | 'crit';
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'critique' | 'élevé' | 'moyen';
  dueDate: string;
  article: string;
  responsible: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'progress' | 'done';
  urgent: boolean;
  article: string;
  responsible: string;
  dueDate: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  icon: React.ReactNode;
}

const IndexImproved = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('severity');
  const [selectedSort, setSelectedSort] = useState('due');

  // Données simulées basées sur votre page actuelle
  const kpiData: KpiData[] = [
    {
      title: "Conformité générale",
      value: "78%",
      delta: 5,
      status: "warn"
    },
    {
      title: "Obligations respectées",
      value: "23/30",
      delta: 2,
      status: "ok"
    },
    {
      title: "Actions critiques",
      value: "4",
      delta: 0,
      status: "crit"
    }
  ];

  const alerts: AlertItem[] = [
    {
      id: "1",
      title: "Formation SST obligatoire",
      description: "Formation des représentants SST",
      severity: "critique",
      dueDate: "14 janvier 2024",
      article: "Art. 90 LMRSST",
      responsible: "Responsable RH"
    },
    {
      id: "2",
      title: "Mise à jour du programme de prévention",
      description: "Révision annuelle requise",
      severity: "moyen",
      dueDate: "31 janvier 2024",
      article: "Art. 58 LMRSST",
      responsible: "Comité SST"
    },
    {
      id: "3",
      title: "Inspection des équipements",
      description: "Vérification des dispositifs de protection",
      severity: "moyen",
      dueDate: "29 janvier 2024",
      article: "Art. 51 LMRSST",
      responsible: "Superviseur"
    }
  ];

  const tasks: TaskItem[] = [
    {
      id: "1",
      title: "Mettre à jour le registre des accidents",
      description: "Mise à jour obligatoire selon Art. 280 LMRSST",
      status: "todo",
      urgent: true,
      article: "Art. 280",
      responsible: "M. Tremblay",
      dueDate: "2024-08-19"
    },
    {
      id: "2",
      title: "Évaluation des risques chimiques",
      description: "Compléter avant le 15/08",
      status: "progress",
      urgent: true,
      article: "Art. 51",
      responsible: "Mme Leblanc",
      dueDate: "2024-08-14"
    },
    {
      id: "3",
      title: "Plan d'évacuation révisé",
      description: "Suite aux modifications du bâtiment",
      status: "done",
      urgent: false,
      article: "Art. 90",
      responsible: "M. Dubois",
      dueDate: "2024-08-25"
    },
    {
      id: "4",
      title: "Formation premiers secours superviseurs",
      description: "Former 2 superviseurs restants",
      status: "todo",
      urgent: false,
      article: "Service RH",
      responsible: "Service RH",
      dueDate: "2024-08-24"
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: "1",
      title: "Générer rapport PDF",
      description: "Rapport de conformité complet",
      duration: "4 min",
      completed: false,
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: "2",
      title: "Lancer Fonctions Agiles",
      description: "Parcours guidé 200+ actions",
      duration: "30 min",
      completed: false,
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: "3",
      title: "Configuration entreprise",
      description: "Paramètres et préférences",
      duration: "10 min",
      completed: true,
      icon: <Settings className="w-5 h-5" />
    },
    {
      id: "4",
      title: "Exporter les données",
      description: "Sauvegarde complète",
      duration: "2 min",
      completed: false,
      icon: <Download className="w-5 h-5" />
    }
  ];

  // Fonction pour scroller vers une section
  const scrollToSection = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fonctions de navigation vers les vraies pages
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case '1':
        navigate('/docugen');
        break;
      case '2':
        navigate('/agile-functions');
        break;
      case '3':
        navigate('/prompts/admin');
        break;
      case '4':
        // Fonction d'export - à implémenter
        alert('Export des données en cours... Fonctionnalité à implémenter');
console.log('Export des données en cours...');
        break;
      default:
        break;
    }
  };

  // Fonctions Kanban avec vraies actions
  const handleKanbanAction = (taskId: string, action: string) => {
    switch (action) {
      case 'start':
    alert(`Tâche ${taskId} démarrée avec succès`);
      console.log(`Démarrage de la tâche ${taskId}`);
        // Ici vous pourriez appeler votre API Supabase pour changer le statut
        break;
      case 'complete':
        alert(`Tâche ${taskId} terminée avec succès`);
      console.log(`Finalisation de la tâche ${taskId}`);
        // Ici vous pourriez appeler votre API Supabase pour marquer comme terminé
        break;
      case 'details':
        navigate(`/compliance-details/${taskId}`);
        break;
      default:
        break;
    }
  };

  // Fonction pour voir les détails d'une alerte
  const handleAlertDetails = (alertId: string) => {
    navigate('/diagnostic');
  };

  // Composant KPI Card amélioré
  const KpiCard = ({ title, value, delta, status }: KpiData) => (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-slate-600 font-medium">{title}</CardTitle>
        <Badge 
          variant={status === 'crit' ? 'destructive' : status === 'warn' ? 'secondary' : 'outline'}
          className="text-xs"
        >
          {status === 'crit' ? 'Critique' : status === 'warn' ? 'Attention' : 'Conforme'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-slate-900">{value}</div>
        <div className={`mt-1 text-sm flex items-center ${
          delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-600' : 'text-slate-500'
        }`}>
          {delta !== 0 && (
            <>
              <TrendingUp className={`w-3 h-3 mr-1 ${delta < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(delta)}% vs mois dernier
            </>
          )}
          {delta === 0 && "Stable"}
        </div>
      </CardContent>
    </Card>
  );

  // Composant Kanban amélioré
  const KanbanColumn = ({ title, count, status, tasks: columnTasks }: {
    title: string;
    count: number;
    status: string;
    tasks: TaskItem[];
  }) => {
    const getColumnColor = () => {
      switch (status) {
        case 'todo': return 'border-t-slate-400';
        case 'progress': return 'border-t-blue-500';
        case 'done': return 'border-t-green-500';
        default: return 'border-t-slate-400';
      }
    };

    return (
      <div className={`border-t-2 ${getColumnColor()} bg-slate-50/50 rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-slate-900">{title}</h4>
          <Badge variant="outline" className="text-xs">
            {count}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {columnTasks.map((task) => (
            <Card key={task.id} className="border border-slate-200 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm text-slate-900 line-clamp-2">
                        {task.title}
                      </h5>
                      {task.urgent && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div>{task.article} • {task.responsible}</div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-3 flex-shrink-0">
                    {task.status === 'todo' && (
                      <Button 
                        size="sm" 
                        className="h-7 px-3 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleKanbanAction(task.id, 'start')}
                      >
                        Démarrer
                      </Button>
                    )}
                    {task.status === 'progress' && (
                      <Button 
                        size="sm" 
                        className="h-7 px-3 bg-green-600 hover:bg-green-700"
                        onClick={() => handleKanbanAction(task.id, 'complete')}
                      >
                        Terminer
                      </Button>
                    )}
                    {task.status === 'done' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-3"
                        onClick={() => handleKanbanAction(task.id, 'details')}
                      >
                        Voir détails
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header avec titre et strip de synthèse */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Tableau de bord de conformité LMRSST
              </h1>
              <p className="text-slate-600 mt-1">
                Suivez votre conformité en temps réel avec l'intelligence artificielle multi-agents
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate('/diagnostic')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Tester le diagnostic
              </Button>
              <Button 
                onClick={() => navigate('/assistant-vocal')}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Bell className="w-4 h-4 mr-2" />
                Assistant vocal
              </Button>
            </div>
          </div>

          {/* Strip de synthèse - Chips cliquables */}
          <div className="flex gap-2">
            {[
              { label: "Conformité", value: "78%", sub: "+5%", href: "#kpi", tone: "warn" },
              { label: "Actions critiques", value: "4", href: "#kanban", tone: "crit" },
              { label: "Échéances <30j", value: "7", href: "#alerts", tone: "warn" },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => scrollToSection(chip.href)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors focus:ring-2 focus:ring-blue-500/20"
              >
                <span className="font-medium mr-2 text-slate-700">{chip.label}</span>
                <span className={
                  chip.tone === 'crit' ? 'text-red-600 font-semibold' : 
                  chip.tone === 'warn' ? 'text-amber-600 font-semibold' : 
                  'text-slate-700'
                }>
                  {chip.value}
                </span>
                {chip.sub && (
                  <span className="ml-1 text-emerald-600 font-medium">
                    ▲ {chip.sub}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Colonne gauche - 7/12 */}
          <div className="col-span-7 space-y-6">
            
            {/* KPI Cards - Layout 3 colonnes égales */}
            <div id="kpi" className="grid grid-cols-3 gap-4">
              {kpiData.map((kpi, index) => (
                <KpiCard key={index} {...kpi} />
              ))}
            </div>

            {/* Kanban amélioré */}
            <Card id="kanban">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Actions critiques (Kanban)
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Suivi des actions par statut avec workflows optimisés
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <KanbanColumn 
                    title="À faire" 
                    count={tasks.filter(t => t.status === 'todo').length}
                    status="todo"
                    tasks={tasks.filter(t => t.status === 'todo')}
                  />
                  <KanbanColumn 
                    title="En cours" 
                    count={tasks.filter(t => t.status === 'progress').length}
                    status="progress"
                    tasks={tasks.filter(t => t.status === 'progress')}
                  />
                  <KanbanColumn 
                    title="Terminé" 
                    count={tasks.filter(t => t.status === 'done').length}
                    status="done"
                    tasks={tasks.filter(t => t.status === 'done')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions prioritaires - Check Grid 2x2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Actions prioritaires
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Complétez ces actions pour optimiser votre conformité
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <div 
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        action.completed 
                          ? 'border-green-200 bg-green-50/50' 
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            action.completed 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {action.icon}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 text-sm">
                              {action.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {action.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {action.duration}
                              </Badge>
                              {action.completed && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Complété
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          action.completed 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-slate-300'
                        }`}>
                          {action.completed && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - 5/12 */}
          <div className="col-span-5">
            <Card className="h-fit">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Alertes & échéances</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Prochaines actions requises
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  7 dans les 30 jours
                </Badge>
              </CardHeader>

              {/* Filtres et tri */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2">
                  <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="flex-1">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="severity" className="text-xs">Par sévérité</TabsTrigger>
                      <TabsTrigger value="due" className="text-xs">Par échéance</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    Filtrer
                  </Button>
                </div>
              </div>

              {/* Liste des alertes */}
              <CardContent id="alerts" className="pt-0">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      onClick={() => handleAlertDetails(alert.id)}
                      className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={alert.severity === 'critique' ? 'destructive' : 'secondary'}
                              className="text-xs px-2"
                            >
                              {alert.severity}
                            </Badge>
                            <span className="font-medium text-sm text-slate-900">
                              {alert.title}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 mb-2">
                            {alert.description}
                          </p>
                          
                          <div className="text-xs text-slate-500">
                            <div>{alert.article} • {alert.responsible}</div>
                            <div className="flex items-center mt-0.5">
                              <Calendar className="w-3 h-3 mr-1" />
                              Échéance: {alert.dueDate}
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="ml-2 text-blue-600 hover:text-blue-700">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Footer sticky */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Button variant="outline" className="w-full" size="sm">
                    Voir toutes les alertes ({alerts.length + 4} au total)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Section Échéances compacte */}
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Échéances à venir (Top 3)
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-200">
                    <div className="text-sm">
                      <div className="font-medium text-amber-900">Formation SST</div>
                      <div className="text-xs text-amber-700">dans 7 jours</div>
                    </div>
                    <Badge variant="outline" className="text-amber-700 border-amber-300">
                      30 jours
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900">Mise à jour programme</div>
                      <div className="text-xs text-slate-600">dans 24 jours</div>
                    </div>
                    <Badge variant="outline" className="text-slate-600">
                      30 jours
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900">Inspection équipements</div>
                      <div className="text-xs text-slate-600">dans 22 jours</div>
                    </div>
                    <Badge variant="outline" className="text-slate-600">
                      30 jours
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexImproved;