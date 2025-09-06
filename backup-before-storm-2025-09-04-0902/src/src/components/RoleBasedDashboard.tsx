import { ReactNode } from "react";
import { UserRole } from "./RoleSelector";
import ComplianceStats from "./ComplianceStats";
import AlertPanel from "./AlertPanel";
import DiagnosticButton from "./DiagnosticButton";
import QuickActions from "./QuickActions";
import AgentCards from "./AgentCards";
import ActionKanbanBoard from "./ActionKanbanBoard";
import { SafetyDataSync } from "./SafetyDataSync";
import ComplianceFeedback, { ComplianceStatus } from "./ComplianceFeedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  FileText, 
  Shield,
  BarChart3,
  Clock,
  Target
} from "lucide-react";

interface RoleBasedDashboardProps {
  selectedRole: UserRole;
  complianceExamples: ComplianceStatus[];
}

interface DashboardSection {
  title: string;
  component: ReactNode;
  priority: 'high' | 'medium' | 'low';
  icon: any;
}

const RoleBasedDashboard = ({ selectedRole, complianceExamples }: RoleBasedDashboardProps) => {
  
  const getSectionsForRole = (role: UserRole): DashboardSection[] => {
    const baseSections = {
      stats: {
        title: "Vue d'ensemble conformité",
        component: <ComplianceStats />,
        priority: 'high' as const,
        icon: BarChart3
      },
      diagnostic: {
        title: "Diagnostic SST intelligent",
        component: <DiagnosticButton />,
        priority: 'medium' as const,
        icon: Target
      },
      alerts: {
        title: "Alertes et échéances",
        component: <AlertPanel />,
        priority: 'high' as const,
        icon: AlertTriangle
      },
      agents: {
        title: "Performance des agents",
        component: <AgentCards />,
        priority: 'low' as const,
        icon: Users
      },
      compliance: {
        title: "Non-conformités détaillées",
        component: (
          <div className="space-y-4">
            {complianceExamples.map((status, index) => (
              <ComplianceFeedback key={index} status={status} />
            ))}
          </div>
        ),
        priority: 'medium' as const,
        icon: FileText
      },
      data: {
        title: "Intégration des données",
        component: <SafetyDataSync userRole={role} />,
        priority: 'low' as const,
        icon: Shield
      },
      actions: {
        title: "Actions prioritaires",
        component: (
          <div className="space-y-6">
            <ActionKanbanBoard />
            <QuickActions />
          </div>
        ),
        priority: 'high' as const,
        icon: Clock
      }
    };

    switch (role) {
      case 'direction':
        return [
          baseSections.stats,
          baseSections.actions,
          baseSections.alerts,
          baseSections.compliance
        ];
      
      case 'comite':
        return [
          baseSections.stats,
          baseSections.compliance,
          baseSections.alerts,
          baseSections.actions,
          baseSections.data
        ];
      
      case 'superviseur':
        return [
          baseSections.alerts,
          baseSections.actions,
          baseSections.stats,
          baseSections.diagnostic,
          baseSections.compliance
        ];
      
      case 'consultant':
        return [
          baseSections.agents,
          baseSections.data,
          baseSections.stats,
          baseSections.diagnostic,
          baseSections.compliance
        ];
      
      case 'responsable':
        return [
          baseSections.diagnostic,
          baseSections.compliance,
          baseSections.actions,
          baseSections.stats,
          baseSections.agents
        ];
      
      default:
        return Object.values(baseSections);
    }
  };

  const sections = getSectionsForRole(selectedRole);
  const highPrioritySections = sections.filter(s => s.priority === 'high');
  const mediumPrioritySections = sections.filter(s => s.priority === 'medium');
  const lowPrioritySections = sections.filter(s => s.priority === 'low');

  const renderSection = (section: DashboardSection, index: number) => {
    const IconComponent = section.icon;
    return (
      <Card key={index} className="h-fit">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-primary" />
              {section.title}
            </CardTitle>
            <Badge 
              variant={
                section.priority === 'high' ? 'default' : 
                section.priority === 'medium' ? 'secondary' : 'outline'
              }
              className="text-xs"
            >
              {section.priority === 'high' ? 'Priorité' : 
               section.priority === 'medium' ? 'Important' : 'Secondaire'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {section.component}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Sections haute priorité */}
      {highPrioritySections.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Priorité élevée</h3>
            <Badge variant="default" className="text-xs">
              {highPrioritySections.length} section{highPrioritySections.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {highPrioritySections.map((section, index) => renderSection(section, index))}
          </div>
        </div>
      )}

      {/* Sections priorité moyenne */}
      {mediumPrioritySections.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            <h3 className="text-xl font-semibold">Informations importantes</h3>
            <Badge variant="secondary" className="text-xs">
              {mediumPrioritySections.length} section{mediumPrioritySections.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {mediumPrioritySections.map((section, index) => renderSection(section, index))}
          </div>
        </div>
      )}

      {/* Sections basse priorité */}
      {lowPrioritySections.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Informations complémentaires</h3>
            <Badge variant="outline" className="text-xs">
              {lowPrioritySections.length} section{lowPrioritySections.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {lowPrioritySections.map((section, index) => renderSection(section, index))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleBasedDashboard;