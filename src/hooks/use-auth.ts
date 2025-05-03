
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';

export function useAuth() {
  const {
    user,
    isLoggedIn,
    isLoadingUser,
    role: userRole,
    refreshRole
  } = useAuthState();
  
  const {
    login,
    register,
    logout,
    isLoading: actionsLoading
  } = useAuthActions();

  return {
    user,
    isLoggedIn,
    isLoadingUser, 
    role: userRole,
    login,
    register,
    logout,
    refreshRole,
  };
}
