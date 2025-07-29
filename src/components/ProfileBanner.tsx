import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Users, Shield, UserCheck, Settings } from 'lucide-react';
import { useUserProfile, UserRole } from '@/hooks/useUserProfile';

export const ProfileBanner: React.FC = () => {
  const { profile, getRoleInfo } = useUserProfile();
  const roleInfo = getRoleInfo();

  const getBannerContent = (role: UserRole) => {
    const content = {
      'Employeur': {
        icon: <Shield className="h-4 w-4" />,
        message: "Mode Employeur activé : Accès aux outils de gestion SST et de conformité LMRSST."
      },
      'RSS': {
        icon: <Shield className="h-4 w-4" />,
        message: "Mode RSS activé : Accès complet aux outils d'expertise et de gestion des prompts."
      },
      'CoSS': {
        icon: <Users className="h-4 w-4" />,
        message: "Mode CoSS activé : Accès aux outils de décision collective et de participation."
      },
      'ALSS': {
        icon: <UserCheck className="h-4 w-4" />,
        message: "Mode ALSS activé : Accès aux outils de liaison et diagnostic rapide."
      },
      'Admin': {
        icon: <Settings className="h-4 w-4" />,
        message: "Mode Administrateur activé : Accès complet à tous les modules et outils QA."
      }
    };

    return content[role];
  };

  const bannerContent = getBannerContent(profile.role);

  return (
    <Alert className="mb-4 border-l-4 border-l-primary bg-muted/30">
      <div className="flex items-center gap-2">
        {bannerContent.icon}
        <Info className="h-4 w-4" />
      </div>
      <AlertDescription className="ml-6">
        <span className="font-medium text-primary">
          {bannerContent.message}
        </span>
        <span className="text-sm text-muted-foreground ml-2">
          • {profile.companyEmployees} employés • {profile.companySize === 'micro' ? 'Micro-entreprise' : 
               profile.companySize === 'pme' ? 'PME' : 'Grande entreprise'}
        </span>
      </AlertDescription>
    </Alert>
  );
};