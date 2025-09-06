import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Users, 
  Clipboard, 
  FileText, 
  Shield, 
  ChevronDown,
  Building2,
  AlertTriangle,
  BarChart3,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

export type UserRole = 'direction' | 'comite' | 'superviseur' | 'consultant' | 'responsable';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roles = {
  direction: {
    name: "Direction",
    icon: Crown,
    color: "primary",
    description: "Vue stratégique et reporting exécutif",
    priorities: ["Score global %", "ROI conformité", "Actions prioritaires (rapports)"],
    focus: "Vision stratégique & reporting"
  },
  comite: {
    name: "Comité SST",
    icon: Users,
    color: "secondary",
    description: "Suivi légal et planification",
    priorities: ["Obligations respectées", "Échéances", "Non-conformités détaillées"],
    focus: "Suivi légal & planification"
  },
  superviseur: {
    name: "Superviseur",
    icon: Clipboard,
    color: "warning",
    description: "Exécution opérationnelle",
    priorities: ["Actions critiques", "Alertes & échéances", "Programme prévention"],
    focus: "Exécution opérationnelle"
  },
  consultant: {
    name: "Consultant SST",
    icon: FileText,
    color: "accent",
    description: "Expertise et optimisation",
    priorities: ["Agents intelligents", "Données CNESST", "Analyse tendances"],
    focus: "Expertise & optimisation"
  },
  responsable: {
    name: "Responsable conformité",
    icon: Shield,
    color: "success",
    description: "Traçabilité réglementaire",
    priorities: ["Diagnostic", "Prioris (plan d'action)", "DocuGen"],
    focus: "Traçabilité réglementaire"
  }
};

const RoleSelector = ({ selectedRole, onRoleChange }: RoleSelectorProps) => {
  const currentRole = roles[selectedRole];
  const IconComponent = currentRole.icon;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Profil utilisateur
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Personnalisé
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between bg-background/50 hover:bg-background/70"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${currentRole.color}/10`}>
                  <IconComponent className={`h-4 w-4 text-${currentRole.color}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium">{currentRole.name}</div>
                  <div className="text-xs text-muted-foreground">{currentRole.focus}</div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <DropdownMenuLabel className="font-semibold">Choisir votre rôle</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(roles).map(([roleKey, role]) => {
              const RoleIcon = role.icon;
              return (
                <DropdownMenuItem
                  key={roleKey}
                  onClick={() => onRoleChange(roleKey as UserRole)}
                  className="p-3 cursor-pointer"
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`p-2 rounded-lg bg-${role.color}/10 flex-shrink-0`}>
                      <RoleIcon className={`h-4 w-4 text-${role.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-muted-foreground mb-1">{role.description}</div>
                      <div className="text-xs text-muted-foreground">{role.focus}</div>
                    </div>
                    {selectedRole === roleKey && (
                      <div className="text-primary">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Priorités de votre rôle
          </div>
          <div className="space-y-1">
            {currentRole.priorities.map((priority, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 bg-primary rounded-full" />
                {priority}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3 w-3 text-warning mt-0.5 flex-shrink-0" />
            <div>
              Le tableau de bord s'adapte automatiquement à votre rôle pour afficher les informations les plus pertinentes.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleSelector;