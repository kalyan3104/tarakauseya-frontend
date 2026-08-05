import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();
export const ALLOWED_ADMIN_EMAILS = ['kalyannchowdary@gmail.com'];
export const ALLOWED_ADMIN_PASSWORD = 'Kalyan@8899';

export const normalizeEmail = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
};

export const isAdminUser = (currentUser) => {
  if (!currentUser) return false;

  const role = (currentUser.role || currentUser.user?.role || "").toString().trim().toLowerCase();
  if (role === "admin") return true;

  const email = normalizeEmail(currentUser.email || currentUser.user?.email || currentUser.username);
  return ALLOWED_ADMIN_EMAILS.includes(email);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try { setUser(await base44.auth.me()); return true; }
    catch { setUser(null); return false; }
    finally { setIsLoadingAuth(false); }
  }, []);
  useEffect(() => { checkUserAuth(); }, [checkUserAuth]);
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
    authChecked: !isLoadingAuth,
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
