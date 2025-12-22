import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

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
      // Check if user is logged in (e.g., check localStorage or API)
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify token and load user data
        await loadUserData();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Mock API calls - replace with actual endpoints when available
      // const [userRes, balanceRes, vpasRes] = await Promise.all([
      //   fetch(`${API_BASE_URL}/user/profile`, {
      //     headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      //   }),
      //   fetch(`${API_BASE_URL}/user/balance`, {
      //     headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      //   }),
      //   fetch(`${API_BASE_URL}/user/vpas`, {
      //     headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      //   }),
      // ]);

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockUser: UserInfo = {
        id: 'user_1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        accountCreated: '2024-01-01T00:00:00Z',
      };

      const mockBalance = 12500.50;

      const mockVpas: VPA[] = [
        {
          id: 'vpa_1',
          address: 'user@webpe',
          displayName: 'John Doe',
          isPrimary: true,
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'vpa_2',
          address: 'john@webpe',
          displayName: 'John Doe',
          isPrimary: false,
          status: 'ACTIVE',
          createdAt: '2024-01-15T00:00:00Z',
        },
      ];

      setUser(mockUser);
      setBalance(mockBalance);
      setVpas(mockVpas);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Mock API call - replace with actual endpoint when available
      // const response = await fetch(`${API_BASE_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });

      // Mock login - always succeeds for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulate storing token
      localStorage.setItem('authToken', 'mock_token_' + Date.now());

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
    localStorage.removeItem('authToken');
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

