import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiRequest, parseResponse } from '../utils/api.util';

export interface VPA {
  id: string;
  address: string;
  displayName: string;
  isPrimary: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface UserInfo {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  accountCreated: string;
}

interface AuthContextType {
  // Authentication
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Balance
  balance: number;
  updateBalance: (newBalance: number) => void;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;

  // VPAs
  vpas: VPA[];
  setVpas: (vpas: VPA[]) => void;
  addVpa: (vpa: VPA) => void;
  removeVpa: (vpaId: string) => void;
  updateVpa: (vpaId: string, updates: Partial<VPA>) => void;
  setPrimaryVpa: (vpaId: string) => void;
  getPrimaryVpa: () => VPA | null;

  // Loading states
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [vpas, setVpas] = useState<VPA[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Verify token and load user data
        await loadUserData();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('accessToken');
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const [userRes, balanceRes, vpasRes] = await Promise.all([
        apiRequest('/users/profile'),
        apiRequest('/users/balance'),
        apiRequest('/vpas'),
      ]);

      const [userData, balanceData, vpasData] = await Promise.all([
        parseResponse<{ user: any }>(userRes),
        parseResponse<{ balance: any }>(balanceRes),
        parseResponse<{ vpas: any[] }>(vpasRes),
      ]);

      // Map user data
      const userInfo: UserInfo = {
        id: String(userData.user.id),
        name: userData.user.username,
        email: userData.user.email,
        accountCreated: userData.user.createdAt,
      };

      // Map balance (convert Decimal to number)
      const balanceValue = typeof balanceData.balance === 'object' && balanceData.balance !== null
        ? parseFloat(balanceData.balance.toString())
        : parseFloat(String(balanceData.balance));

      // Map VPAs
      const mappedVpas: VPA[] = vpasData.vpas.map((vpa: any) => ({
        id: String(vpa.id),
        address: vpa.vpa,
        displayName: userInfo.name,
        isPrimary: vpa.isPrimary,
        status: 'ACTIVE' as const,
        createdAt: vpa.createdAt,
      }));

      setUser(userInfo);
      setBalance(balanceValue);
      setVpas(mappedVpas);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify({ userEmail: email, password }),
      });

      const data = await parseResponse<{ accessToken: string; refreshToken: string }>(response);

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Load user data after successful login
      await loadUserData();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    setBalance(0);
    setVpas([]);
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
    // Optionally sync with backend
    // fetch(`${API_BASE_URL}/user/balance`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ balance: newBalance }),
    // });
  };

  const deductBalance = (amount: number) => {
    setBalance((prev) => {
      const newBalance = Math.max(0, prev - amount);
      // Optionally sync with backend
      return newBalance;
    });
  };

  const addBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
    // Optionally sync with backend
  };

  const addVpa = (vpa: VPA) => {
    setVpas((prev) => [...prev, vpa]);
    // Optionally sync with backend
  };

  const removeVpa = (vpaId: string) => {
    setVpas((prev) => prev.filter((v) => v.id !== vpaId));
    // Optionally sync with backend
  };

  const updateVpa = (vpaId: string, updates: Partial<VPA>) => {
    setVpas((prev) =>
      prev.map((v) => (v.id === vpaId ? { ...v, ...updates } : v))
    );
    // Optionally sync with backend
  };

  const setPrimaryVpa = (vpaId: string) => {
    setVpas((prev) =>
      prev.map((v) => ({
        ...v,
        isPrimary: v.id === vpaId,
      }))
    );
    // Optionally sync with backend
  };

  const getPrimaryVpa = (): VPA | null => {
    return vpas.find((v) => v.isPrimary) || null;
  };

  const refreshUserData = async () => {
    if (isAuthenticated) {
      await loadUserData();
    }
  };

  const value: AuthContextType = {
    // Authentication
    isAuthenticated,
    user,
    login,
    logout,

    // Balance
    balance,
    updateBalance,
    deductBalance,
    addBalance,

    // VPAs
    vpas,
    setVpas,
    addVpa,
    removeVpa,
    updateVpa,
    setPrimaryVpa,
    getPrimaryVpa,

    // Loading
    loading,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

