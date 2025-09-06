import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Users,
  Activity,
  Target,
  DollarSign,
  Shield,
  Clock,
  Award,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown
} from 'lucide-react';

// Types pour Analytics Enterprise
interface BusinessMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  retentionRate: number;
  avgSessionDuration: number;
  totalDiagnostics: number;
  documentsGenerated: number;
  complianceScore: number;
  revenueGrowth: number;
  customerSatisfaction: number;
}

interface UsageData {
  date: string;
  users: number;
  diagnostics: number;
  documents: number;
  sessions: number;
}

interface AgentPerformance {
  name: string;
  usage: number;
  accuracy: number;
  satisfaction: number;
  growth: number;
  color: string;
}

interface OrganizationStats {
  name: string;
  users: number;
  diagnostics: number;
  compliance: number;
  subscription: 'starter' | 'professional' | 'enterprise';
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Données simulées (en production, viendraient de votre API)
  const businessMetrics: BusinessMetrics = {
    totalUsers: 2847,
    activeUsers: 1923,
    newUsersThisMonth: 342,
    retentionRate: 87.5,
    avgSessionDuration: 23.8,
    totalDiagnostics: 15462,
    documentsGenerated: 9834,
    complianceScore: 94.2,
    revenueGrowth: 28.7,
    customerSatisfaction: 4.6
  };

  const usageData: UsageData[] = [
    { date: '2025-07-01', users: 1200, diagnostics: 890, documents: 567, sessions: 2340 },
    { date: '2025-07-08', users: 1350, diagnostics: 945, documents: 623, sessions: 2567 },
    { date: '2025-07-15', users: 1580, diagnostics: 1123, documents: 734, sessions: 2890 },
    { date: '2025-07-22', users: 1742, diagnostics: 1256, documents: 812, sessions: 3124 },
    { date: '2025-07-29', users: 1923, diagnostics: 1387, documents: 901, sessions: 3456 },
    { date: '2025-08-05', users: 2156, diagnostics: 1534, documents: 1023, sessions: 3789 },
    { date: '2025-08-12', users: 2347, diagnostics: 1689, documents: 1145, sessions: 4012 },
    { date: '2025-08-19', users: 2589, diagnostics: 1823, documents: 1267, sessions: 4234 }
  ];

  const agentPerformance: AgentPerformance[] = [
    { name: 'Hugo', usage: 2847, accuracy: 96.8, satisfaction: 4.7, growth: 15.3, color: '#3b82f6' },
    { name: 'DiagSST', usage: 2234, accuracy: 94.2, satisfaction: 4.5, growth: 12.7, color: '#10b981' },
    { name: 'LexiNorm', usage: 1892, accuracy: 92.5, satisfaction: 4.3, growth: 18.9, color: '#f59e0b' },
    { name: 'Prioris', usage: 1654, accuracy: 95.1, satisfaction: 4.6, growth: 14.2, color: '#ef4444' },
    { name: 'CoSS', usage: 1423, accuracy: 91.7, satisfaction: 4.2, growth: 22.1, color: '#8b5cf6' },
    { name: 'ALSS', usage: 1156, accuracy: 89.3, satisfaction: 4.0, growth: 19.8, color: '#06b6d4' },
    { name: 'DocuGen', usage: 987, accuracy: 93.4, satisfaction: 4.4, growth: 16.5, color: '#84cc16' }
  ];

  const organizationStats: OrganizationStats[] = [
    { name: 'Construction Bolduc', users: 245, diagnostics: 1234, compliance: 96.8, subscription: 'enterprise' },
    { name: 'Métallurgie Québec', users: 189, diagnostics: 987, compliance: 94.2, subscription: 'professional' },
    { name: 'Transport Laval', users: 156, diagnostics: 756, compliance: 91.5, subscription: 'professional' },
    { name: 'Manufacture MTL', users: 134, diagnostics: 654, compliance: 89.7, subscription: 'starter' },
    { name: 'Services Industriels', users: 123, diagnostics: 589, compliance: 92.3, subscription: 'professional' }
  ];

  const revenueData = [
    { month: 'Jan 2025', revenue: 45600, growth: 12.3, arr: 547200 },
    { month: 'Fév 2025', revenue: 52300, growth: 14.7, arr: 627600 },
    { month: 'Mar 2025', revenue: 48900, growth: 7.2, arr: 586800 },
    { month: 'Avr 2025', revenue: 56700, growth: 15.9, arr: 680400 },
    { month: 'Mai 2025', revenue: 63400, growth: 11.8, arr: 760800 },
    { month: 'Jun 2025', revenue: 71200, growth: 12.3, arr: 854400 },
    { month: 'Jul 2025', revenue: 78900, growth: 10.8, arr: 946800 },
    { month: 'Aoû 2025', revenue: 85600, growth: 8.5, arr: 1027200 }
  ];

  // Composant KPI Card
  const KpiCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
    prefix?: string;
  }> = ({ title, value, change, icon, color, suffix = '', prefix = '' }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Composant Select personnalisé
  const CustomSelect: React.FC<{
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
  }> = ({ value, onValueChange, options, placeholder }) => (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  // Composant Tabs personnalisé
  const CustomTabs: React.FC<{
    tabs: { value: string; label: string }[];
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }> = ({ tabs, value, onValueChange, children }) => (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onValueChange(tab.value)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                value === tab.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">📊 Analytics Business</h1>
              <p className="text-blue-100 mt-2">Dashboard métriques AgenticSST Québec™</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLoading(!isLoading)}
                className="flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <button className="flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contrôles */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Période :</span>
              <CustomSelect
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as any)}
                options={[
                  { value: '7d', label: '7 derniers jours' },
                  { value: '30d', label: '30 derniers jours' },
                  { value: '90d', label: '90 derniers jours' },
                  { value: '1y', label: '1 année' }
                ]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Vue :</span>
              <CustomSelect
                value={selectedMetric}
                onValueChange={setSelectedMetric}
                options={[
                  { value: 'overview', label: 'Vue d\'ensemble' },
                  { value: 'agents', label: 'Performance Agents' },
                  { value: 'organizations', label: 'Organisations' },
                  { value: 'revenue', label: 'Revenus' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Utilisateurs Actifs"
            value={businessMetrics.activeUsers}
            change={15.3}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-blue-500"
          />
          <KpiCard
            title="Diagnostics Réalisés"
            value={businessMetrics.totalDiagnostics}
            change={12.7}
            icon={<Activity className="w-6 h-6 text-white" />}
            color="bg-green-500"
          />
          <KpiCard
            title="Score Conformité"
            value={businessMetrics.complianceScore}
            change={2.3}
            icon={<Shield className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            suffix="%"
          />
          <KpiCard
            title="Satisfaction Client"
            value={businessMetrics.customerSatisfaction}
            change={5.8}
            icon={<Award className="w-6 h-6 text-white" />}
            color="bg-yellow-500"
            suffix="/5"
          />
        </div>

        {/* Tabs et Contenu */}
        <CustomTabs
          tabs={[
            { value: 'overview', label: '📊 Vue d\'Ensemble' },
            { value: 'agents', label: '🤖 Performance Agents' },
            { value: 'organizations', label: '🏢 Organisations' },
            { value: 'revenue', label: '💰 Revenus & Croissance' }
          ]}
          value={selectedMetric}
          onValueChange={setSelectedMetric}
        >
          {/* Vue d'ensemble */}
          {selectedMetric === 'overview' && (
            <div className="space-y-8">
              {/* Évolution Usage */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution de l'Utilisation</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Utilisateurs"
                    />
                    <Area
                      type="monotone"
                      dataKey="diagnostics"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Diagnostics"
                    />
                    <Area
                      type="monotone"
                      dataKey="documents"
                      stackId="3"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Documents"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Métriques Complémentaires */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rétention Utilisateurs</h3>
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">{businessMetrics.retentionRate}%</div>
                      <div className="text-sm text-gray-500 mt-2">Taux de rétention mensuel</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Durée Session Moyenne</h3>
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600">{businessMetrics.avgSessionDuration}</div>
                      <div className="text-sm text-gray-500 mt-2">Minutes par session</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Agents */}
          {selectedMetric === 'agents' && (
            <div className="space-y-8">
              {/* Graphique Performance */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par Agent</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={agentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="usage" fill="#3b82f6" name="Utilisation" />
                    <Bar dataKey="accuracy" fill="#10b981" name="Précision %" />
                    <Bar dataKey="satisfaction" fill="#f59e0b" name="Satisfaction (x20)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tableau détaillé */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Détails Performance Agents</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Précision
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Satisfaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Croissance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {agentPerformance.map((agent) => (
                        <tr key={agent.name} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: agent.color }} />
                              <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {agent.usage.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {agent.accuracy}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ⭐ {agent.satisfaction}/5
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="flex items-center text-sm text-green-600">
                              <ArrowUp className="w-4 h-4 mr-1" />
                              +{agent.growth}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Organisations */}
          {selectedMetric === 'organizations' && (
            <div className="space-y-8">
              {/* Statistiques Organizations */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top Organisations Clientes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organisation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateurs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diagnostics
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Conformité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {organizationStats.map((org) => (
                        <tr key={org.name} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{org.name}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {org.users}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {org.diagnostics.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {org.compliance}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              org.subscription === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                              org.subscription === 'professional' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {org.subscription}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Revenus */}
          {selectedMetric === 'revenue' && (
            <div className="space-y-8">
              {/* Évolution Revenus */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution Revenus Mensuels</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      name="Revenus Mensuels ($)"
                    />
                    <Line
                      type="monotone"
                      dataKey="arr"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      name="ARR Projeté ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Métriques Revenus */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">$85,600</div>
                  <div className="text-sm text-gray-500 mt-2">MRR Actuel</div>
                  <div className="flex items-center justify-center mt-2">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+28.7%</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">$1,027,200</div>
                  <div className="text-sm text-gray-500 mt-2">ARR Projeté</div>
                  <div className="flex items-center justify-center mt-2">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+45.2%</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">$1,847</div>
                  <div className="text-sm text-gray-500 mt-2">ARPU Moyen</div>
                  <div className="flex items-center justify-center mt-2">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+12.3%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CustomTabs>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Dernière mise à jour : {new Date().toLocaleString('fr-CA', {
                timeZone: 'America/Toronto',
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>🚀 AgenticSST Québec™</span>
              <span>•</span>
              <span>Phase 2 Enterprise</span>
              <span>•</span>
              <span className="text-green-600 font-medium">✅ OPÉRATIONNEL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;