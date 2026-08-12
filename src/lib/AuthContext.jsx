import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();
const AUTH_CHECK_TIMEOUT_MS = 10_000;

export const isAdminUser = (currentUser) => {
  if (!currentUser) return false;

  const email = (currentUser.email || currentUser.user?.email || "").toString().trim().toLowerCase();
  if (email === 'kalyan12.4st@gmail.com') return true;

  const role = (currentUser.role || currentUser.user?.role || "").toString().trim().toLowerCase();
  return role === "admin";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthChecked(false);
    let timeoutId;
    try {
      const currentUser = await Promise.race([
        base44.auth.me(),
        new Promise((_, reject) => {
          timeoutId = window.setTimeout(
            () => reject(new Error('Authentication check timed out')),
            AUTH_CHECK_TIMEOUT_MS,
          );
        }),
      ]);
      setUser(currentUser);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('tara_kauseya_access_token');
    if (!token) {
      setAuthChecked(true);
      return;
    }
    checkUserAuth();
  }, [checkUserAuth]);

  const logout = async (shouldRedirect = true) => {
    await base44.auth.logout();
    setUser(null);
    if (shouldRedirect) window.location.href = '/login';
  };
  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: isAdminUser(user),
    isLoadingAuth,
    isLoadingPublicSettings: false,
    authError: null,
    authChecked,
    appPublicSettings: null,
    logout,
    navigateToLogin: () => { window.location.href = '/login'; },
    checkUserAuth,
    checkAppState: checkUserAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
