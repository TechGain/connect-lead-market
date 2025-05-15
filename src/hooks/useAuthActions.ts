
import { useLoginAction } from './auth/useLoginAction';
import { useRegisterAction } from './auth/useRegisterAction';
import { useLogoutAction } from './auth/useLogoutAction';

/**
 * Hook for authentication actions (login, register, logout)
 */
export function useAuthActions() {
  const { login, isLoading: loginLoading } = useLoginAction();
  const { register, isLoading: registerLoading } = useRegisterAction();
  const { logout, isLoading: logoutLoading } = useLogoutAction();
  
  // Combine loading states
  const isLoading = loginLoading || registerLoading || logoutLoading;

  return {
    login,
    register,
    logout,
    isLoading
  };
}
