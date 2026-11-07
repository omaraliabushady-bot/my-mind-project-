import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, fullName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;
  switchUser: (userId: string) => void;
  allUsers: Array<{ id: string; email: string; fullName: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [allUsers, setAllUsers] = useState<Array<{ id: string; email: string; fullName: string }>>([]);

  const refreshUsersList = () => {
    const users = StorageService.getAllUsers();
    setAllUsers(users.map(u => ({ id: u.id, email: u.email, fullName: u.fullName })));
  };

  useEffect(() => {
    refreshUsersList();
    const activeId = StorageService.getActiveUserId();
    if (activeId) {
      const store = StorageService.getUserStore(activeId);
      setCurrentUser(store.profile);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = StorageService.loginUser(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthModalOpen(false);
      refreshUsersList();
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid credentials' };
  };

  const register = async (email: string, fullName: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = StorageService.registerUser(email, fullName, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthModalOpen(false);
      refreshUsersList();
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to register' };
  };

  const logout = () => {
    StorageService.setActiveUserId(null);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    // Simulated safe client email notification
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Password reset instructions have been dispatched to ${email}.`,
        });
      }, 500);
    });
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const store = StorageService.updateProfile(currentUser.id, updates);
    setCurrentUser(store.profile);
  };

  const switchUser = (userId: string) => {
    StorageService.setActiveUserId(userId);
    const store = StorageService.getUserStore(userId);
    setCurrentUser(store.profile);
  };

  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        switchUser,
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
