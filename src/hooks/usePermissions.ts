import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types/api';

interface Permissions {
  canManageTeam: boolean;
  canManageIntegrations: boolean;
  canManageAPIKeys: boolean;
  canEditOrganization: boolean;
  canEditData: boolean;
  canView: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isViewer: boolean;
}

export function usePermissions(): Permissions {
  const user = useAuthStore((state) => state.user);
  const role: UserRole | null = user?.role ?? null;

  return {
    canManageTeam: role === 'ADMIN',
    canManageIntegrations: role === 'ADMIN',
    canManageAPIKeys: role === 'ADMIN',
    canEditOrganization: role === 'ADMIN',
    canEditData: role === 'ADMIN' || role === 'MEMBER',
    canView: true,
    isAdmin: role === 'ADMIN',
    isMember: role === 'MEMBER',
    isViewer: role === 'VIEWER',
  };
}
