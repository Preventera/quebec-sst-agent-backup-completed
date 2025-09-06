import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, User, Users, Shield, UserCheck, Settings, Info } from 'lucide-react';
import { useUserProfile, UserRole } from '@/hooks/useUserProfile';

export const ProfileSelector: React.FC = () => {
  const { profile, updateRole, getRoleInfo, hasAccess } = useUserProfile();
  const roleInfo = getRoleInfo();
  
  // Count accessible modules for current role
  const accessibleModules = [
    'assistant', 'diagnostic-quick', 'diagnostic-detailed', 'documents', 'docugen',
    'knowledge-base', 'compliance-dashboard', 'learning-dashboard', 'tests',
    'conversation-logs', 'annotation', 'prompt-agents', 'prompt-admin', 'crawling'
  ].filter(module => hasAccess(module)).length;

  const roles: Array<{
    value: UserRole;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      value: 'Employeur',
      label: 'Employeur',
      icon: <User className="h-4 w-4" />,
      description: 'Gestion SST et conformité'
    },
    {
      value: 'RSS',
      label: 'Responsable SST',
      icon: <Shield className="h-4 w-4" />,
      description: 'Expert en santé et sécurité'
    },
    {
      value: 'CoSS',
      label: 'Comité SST',
      icon: <Users className="h-4 w-4" />,
      description: 'Membre du comité SST'
    },
    {
      value: 'ALSS',
      label: 'Agent de Liaison SST',
      icon: <UserCheck className="h-4 w-4" />,
      description: 'Liaison santé-sécurité'
    },
    {
      value: 'Admin',
      label: 'Administrateur',
      icon: <Settings className="h-4 w-4" />,
      description: 'Accès complet et QA'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 h-9">
          <div className={`w-2 h-2 rounded-full ${roleInfo.color}`} />
          <span className="hidden sm:inline">{roleInfo.label}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${roleInfo.color}`} />
          Profil actuel : {roleInfo.label}
        </DropdownMenuLabel>
        <div className="px-2 pb-2 space-y-1">
          <Badge variant="secondary" className="text-xs">
            {roleInfo.description}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            Accès à {accessibleModules} modules
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Changer de profil
        </DropdownMenuLabel>
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={() => updateRole(role.value)}
            className={`gap-3 cursor-pointer ${
              profile.role === role.value ? 'bg-muted' : ''
            }`}
          >
            {role.icon}
            <div className="flex-1">
              <div className="font-medium">{role.label}</div>
              <div className="text-xs text-muted-foreground">
                {role.description}
              </div>
            </div>
            {profile.role === role.value && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};