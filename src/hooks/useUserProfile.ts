import { useState, useEffect } from 'react';

export type UserRole = 'Employeur' | 'RSS' | 'CoSS' | 'ALSS' | 'Admin';
export type CompanySize = 'micro' | 'pme' | 'grande';

export interface UserProfile {
  role: UserRole;
  companySize: CompanySize;
  companyEmployees: number;
}

const STORAGE_KEY = 'agentsst-user-profile';

const defaultProfile: UserProfile = {
  role: 'Employeur',
  companySize: 'pme',
  companyEmployees: 50
};

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateRole = (role: UserRole) => {
    setProfile(prev => ({ ...prev, role }));
  };

  const updateCompanySize = (companySize: CompanySize, employees: number) => {
    setProfile(prev => ({ 
      ...prev, 
      companySize, 
      companyEmployees: employees 
    }));
  };

  // Module access permissions based on role
  const hasAccess = (module: string): boolean => {
    const permissions: Record<UserRole, string[]> = {
      'Employeur': [
        'home', 'assistant', 'faq', 'diagnostic-quick', 'diagnostic-detailed',
        'documents', 'knowledge-base', 'compliance-dashboard'
      ],
      'RSS': [
        'home', 'assistant', 'faq', 'diagnostic-quick', 'diagnostic-detailed',
        'documents', 'knowledge-base', 'compliance-dashboard', 'learning-dashboard',
        'conversation-logs', 'annotation', 'prompt-agents', 'prompt-admin'
      ],
      'CoSS': [
        'home', 'assistant', 'faq', 'diagnostic-quick', 'diagnostic-detailed',
        'knowledge-base', 'compliance-dashboard', 'prompt-agents'
      ],
      'ALSS': [
        'home', 'assistant', 'faq', 'diagnostic-quick',
        'documents', 'knowledge-base', 'compliance-dashboard', 'prompt-agents'
      ],
      'Admin': [
        'home', 'assistant', 'faq', 'diagnostic-quick', 'diagnostic-detailed',
        'documents', 'knowledge-base', 'compliance-dashboard', 'learning-dashboard',
        'tests', 'demo', 'conversation-logs', 'annotation', 'prompt-agents',
        'prompt-admin', 'crawling'
      ]
    };

    return permissions[profile.role]?.includes(module) || false;
  };

  // Get role display info
  const getRoleInfo = () => {
    const roleInfo: Record<UserRole, { label: string; description: string; color: string }> = {
      'Employeur': {
        label: 'Employeur',
        description: 'Gestionnaire SST et conformité',
        color: 'bg-blue-500'
      },
      'RSS': {
        label: 'Responsable SST',
        description: 'Expert en santé et sécurité',
        color: 'bg-green-500'
      },
      'CoSS': {
        label: 'Comité SST',
        description: 'Membre du comité de santé-sécurité',
        color: 'bg-purple-500'
      },
      'ALSS': {
        label: 'Agent de Liaison SST',
        description: 'Liaison santé-sécurité',
        color: 'bg-orange-500'
      },
      'Admin': {
        label: 'Administrateur',
        description: 'Accès complet et gestion QA',
        color: 'bg-red-500'
      }
    };

    return roleInfo[profile.role];
  };

  return {
    profile,
    updateRole,
    updateCompanySize,
    hasAccess,
    getRoleInfo
  };
};