
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';

/**
 * Combined authentication hook that provides both state and actions
 */
export function useAuth() {
  const { user, isLoggedIn, isLoadingUser, role: userRole, refreshRole } = useAuthState();
  const { login, register, logout, isLoading: isActionLoading } = useAuthActions();

  return {
    // Auth state
    user,
    isLoggedIn,
    isLoadingUser: isLoadingUser || isActionLoading,
    role: userRole,
    
    // Auth actions
    login,
    register,
    logout,
    refreshRole,
  };
}
