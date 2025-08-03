import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  roles, 
  fallback 
}) => {
  const { profile } = useUserProfile();

  if (!roles.includes(profile.role)) {
    return fallback || (
      <Alert className="max-w-md mx-auto">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          Accès restreint. Cette fonctionnalité nécessite des permissions spéciales.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};