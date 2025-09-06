import React from 'react';
import { Zap, ArrowRight, Settings, Users, BarChart3, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AgileFunctionsHub: React.FC = () => {
  const functions = [
    {
      id: 'multi-agents',
      title: 'Architecture Multi-Agents',
      description: 'Orchestration intelligente des agents SST spécialisés',
      status: 'active',
      icon: Users,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'analytics',
      title: 'Analytics Avancés',
      description: 'Métriques et KPI en temps réel pour la conformité',
      status: 'active', 
      icon: BarChart3,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'security',
      title: 'Sécurité Enterprise',
      description: 'RLS Supabase et authentification niveau bancaire',
      status: 'active',
      icon: Shield,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'automation',
      title: 'Automatisation Workflows',
      description: 'Processus SST automatisés et intelligents',
      status: 'beta',
      icon: Zap,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Zap className="w-10 h-10 text-yellow-500" />
              Fonctions Agiles
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hub centralisé des fonctionnalités avancées d'AgenticSST Québec™
            </p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Message de statut */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            🎉 Toutes les Fonctions Agiles sont Opérationnelles !
          </h2>
          <p className="text-green-700">
            Architecture multi-agents, analytics avancés et sécurité enterprise entièrement déployés
          </p>
        </div>

        {/* Grille des fonctions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {functions.map((func) => (
            <Card key={func.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${func.color}`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${func.color} flex items-center justify-center`}>
                      <func.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{func.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          func.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {func.status === 'active' ? '✓ Actif' : '⚡ Beta'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-6">
                  {func.description}
                </CardDescription>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Phase 2 Enterprise
                  </div>
                  <Button className="group">
                    Gérer
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section informative */}
        <div className="mt-12 bg-white rounded-xl p-8 border">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            🚀 Architecture Enterprise Complète
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">8+</div>
              <div className="text-gray-600">Agents Intelligents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Garanti</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Surveillance Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgileFunctionsHub;