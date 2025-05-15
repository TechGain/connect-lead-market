
import React from 'react';
import { UserRoleContext, UserRoleContextType } from '@/contexts/UserRoleContext';
import { useUserRoleState } from '@/hooks/useUserRoleState';
import { useUserRoleActions } from '@/hooks/useUserRoleActions';

/**
 * Provider component that wraps the app and makes auth object available to any
 * child component that calls useUserRole().
 */
export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    isLoggedIn,
    session,
    role,
    loadingUser,
    isAdmin,
    isLoading,
    setIsLoggedIn,
    setUser,
    setRole,
    setSession,
    refreshRole
  } = useUserRoleState();

  const {
    login,
    register,
    logout
  } = useUserRoleActions();

  // Create an alias for refreshRole for backward compatibility
  const refreshUserRole = refreshRole;

  // Handle login with state updates
  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    
    if (result?.session) {
      setIsLoggedIn(true);
      setSession(result.session);
      setUser(result.user);
      
      if (result.role) {
        setRole(result.role);
      }
    }
    
    return result;
  };

  // Handle registration with state updates
  const handleRegister = async (
    email: string, 
    password: string,
    role: 'seller' | 'buyer',
    fullName: string,
    company?: string,
    phone?: string,
    referralSource?: string
  ) => {
    // If the user is already signed in, log them out first
    if (session) {
      await logout();
      // Small delay to ensure logout completes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const result = await register(email, password, role, fullName, company, phone, referralSource);
    
    if (result?.session) {
      setIsLoggedIn(true);
      setSession(result.session);
      setUser(result.user);
      setRole(role);
    }
    
    return result;
  };

  // Handle logout with state updates
  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUser(null);
    setRole(null);
    setSession(null);
  };

  const contextValue: UserRoleContextType = {
    user,
    isLoggedIn,
    session,
    role,
    loadingUser,
    isAdmin,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshRole,
    refreshUserRole
  };

  return (
    <UserRoleContext.Provider value={contextValue}>
      {children}
    </UserRoleContext.Provider>
  );
}
