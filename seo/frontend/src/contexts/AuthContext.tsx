import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  picture?: string;
  verified?: boolean;
  description?: string;
  website?: string;
  // Socials
  linkedinPage?: string;
  instagramProfile?: string;
  role?: 'user' | 'company';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<User> & Record<string, any>) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  companyLogin: (email: string, password: string) => Promise<boolean>;
  companySignup: (companyData: any) => Promise<boolean>;
  logout: () => void;
  guestUserLogin: () => void;
  guestBusinessLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5001';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isAuthenticated = !!user;

  const normalizeUser = (u: any): User | null => {
    if (!u || !u.id || !u.email) return null;
    const role = (u.role as User["role"]) || (u.companyName ? "company" : "user");
    return { ...u, role };
  };

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('auth_user');
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) setToken(savedToken);
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        const normalized = normalizeUser(parsed);
        if (normalized) {
          setUser(normalized);
          // Ensure role is persisted for Sidebar filtering
          localStorage.setItem('auth_user', JSON.stringify(normalized));
        } else {
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading auth user:', error);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
    }
  }, []);

  // Validate session with backend if token exists
  useEffect(() => {
    const bootstrap = async () => {
      if (!token) return;
      if (token === 'guest-user-token' || token === 'guest-business-token') return; // Skip validation for guest

      // Prevent multiple simultaneous calls
      if (isAuthenticating) return;

      try {
        setIsAuthenticating(true);

        // Determine user type from stored user data first
        const storedUser = localStorage.getItem('auth_user');
        const userType = storedUser ? JSON.parse(storedUser)?.role : null;

        console.log('Auth bootstrap - User type:', userType);
        console.log('Auth bootstrap - Stored user:', storedUser);

        let endpoint, res;

        if (userType === 'company') {
          endpoint = '/api/company/me';
          res = await fetch(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          endpoint = '/api/auth/me';
          res = await fetch(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        if (res.ok) {
          const data = await res.json();
          if (data && (data.company || data.user)) {
            persistUser(data.company || data.user);
            return;
          }
        }

        // Only clear token on genuine authentication errors (401/403)
        // Don't clear on network errors or other issues
        if (res.status === 401 || res.status === 403) {
          console.log('Authentication expired or invalid, clearing token');
          logout();
        } else if (res.status === 404) {
          // Endpoint not found - try fallback
          console.warn(`Endpoint ${endpoint} returned 404, trying fallback`);
          const fallbackEndpoint = userType === 'company' ? '/api/auth/me' : '/api/company/me';
          const fallbackRes = await fetch(`${API_URL}${fallbackEndpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            if (data && (data.company || data.user)) {
              persistUser(data.company || data.user);
              return;
            }
          } else if (fallbackRes.status === 401 || fallbackRes.status === 403) {
            console.log('Fallback authentication failed, clearing token');
            logout();
          }
        } else {
          console.warn(`Unexpected response status ${res.status}, keeping session`);
        }

      } catch (e) {
        // Network errors or other exceptions - don't logout, just log
        console.warn('Session validation failed (network error):', e);
      } finally {
        setIsAuthenticating(false);
      }
    };

    bootstrap();
  }, [token]);

  const persistUser = (u: User | null) => {
    const normalized = u ? normalizeUser(u) : null;
    setUser(normalized);
    try {
      if (normalized) localStorage.setItem('auth_user', JSON.stringify(normalized));
      else localStorage.removeItem('auth_user');
    } catch { }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('User login attempt:', email);
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('User login response status:', res.status);
      console.log('User login response ok:', res.ok);

      if (!res.ok) {
        let message = 'Login failed';
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch { }
        throw new Error(message);
      }
      const data = await res.json();
      console.log('User login success data:', data);

      if (data?.token && data?.user) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        persistUser({ ...data.user, role: 'user' });
        return true;
      }
      throw new Error('Unexpected login response');
    } catch (e) {
      console.error('User login error', e);
      throw e instanceof Error ? e : new Error('Login error');
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      };
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let message = 'Signup failed';
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch { }
        throw new Error(message);
      }
      const data = await res.json();
      if (data?.token && data?.user) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        persistUser({ ...data.user, role: 'user' });
        return true;
      }
      throw new Error('Unexpected signup response');
    } catch (e) {
      console.error('User signup error', e);
      throw e instanceof Error ? e : new Error('Signup error');
    }
  };

  const companyLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Company login attempt:', email);
      const res = await fetch(`${API_URL}/api/company/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('Company login response status:', res.status);
      console.log('Company login response ok:', res.ok);

      if (!res.ok) {
        let message = 'Company login failed';
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch { }
        throw new Error(message);
      }
      const data = await res.json();
      console.log('Company login success data:', data);

      if (data?.token && data?.company) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        persistUser({ ...data.company, role: 'company' });
        return true;
      }
      throw new Error('Unexpected login response');
    } catch (e) {
      console.error('Company login error', e);
      throw e instanceof Error ? e : new Error('Company login error');
    }
  };

  const companySignup = async (companyData: any): Promise<boolean> => {
    try {
      const payload = {
        email: companyData.email,
        password: companyData.password,
        companyName: companyData.companyName,
        industry: companyData.industry,
        location: companyData.location,
        description: companyData.description
      };
      const res = await fetch(`${API_URL}/api/company/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let message = 'Company signup failed';
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch { }
        throw new Error(message);
      }
      const data = await res.json();
      if (data?.token && data?.company) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        persistUser({ ...data.company, role: 'company' });
        return true;
      }
      throw new Error('Unexpected signup response');
    } catch (e) {
      console.error('Company signup error', e);
      throw e instanceof Error ? e : new Error('Company signup error');
    }
  };

  const updateUser = async (updates: Partial<User> & Record<string, any>): Promise<void> => {
    if (!token || token === 'guest-user-token' || token === 'guest-business-token') {
      throw new Error('Authentication required');
    }

    const res = await fetch(`${API_URL}/api/auth/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Failed to update profile');
    }

    if (data?.user) {
      persistUser(data.user as User);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    updateUser,
    login,
    signup,
    companyLogin,
    companySignup,
    logout,
    guestUserLogin: () => {
      const guestUser: User = {
        id: 'guest-user',
        email: 'guest.user@example.com',
        firstName: 'Guest',
        lastName: 'User',
        role: 'user'
      };
      setUser(guestUser);
      setToken('guest-user-token');
      localStorage.setItem('auth_token', 'guest-user-token');
      persistUser(guestUser);
    },
    guestBusinessLogin: () => {
      const guestBusiness: User = {
        id: 'guest-business',
        email: 'guest.business@example.com',
        companyName: 'Guest Business',
        role: 'company'
      };
      setUser(guestBusiness);
      setToken('guest-business-token');
      localStorage.setItem('auth_token', 'guest-business-token');
      persistUser(guestBusiness);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
