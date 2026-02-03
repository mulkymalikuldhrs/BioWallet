import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (walletAddress: string, publicKey: string) => Promise<boolean>;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('userToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Register with WebAuthn and Backend
  const register = async (walletAddress: string, publicKey: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. WebAuthn Registration (Simplified for this example)
      const registrationOptions = {
        challenge: btoa('biowallet-challenge'),
        rp: { name: 'BioWallet', id: window.location.hostname },
        user: { id: btoa(walletAddress), name: walletAddress, displayName: 'BioWallet User' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        timeout: 60000,
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
      };

      const credential = await startRegistration(registrationOptions as any);

      // 2. Call Backend API
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          publicKey,
          biometricType: 'FINGERPRINT', // Default for web platform
          deviceId: localStorage.getItem('deviceId'),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to register on backend');
      }

      const userData = await response.json();

      // Store state
      localStorage.setItem('userToken', userData.id);
      localStorage.setItem('isRegistered', 'true');
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error('Error registering:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with WebAuthn
  const login = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const isRegistered = localStorage.getItem('isRegistered');
      if (isRegistered !== 'true') {
        throw new Error('Not registered. Please register first');
      }

      const authenticationOptions = {
        challenge: btoa('biowallet-login-challenge'),
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      };

      await startAuthentication(authenticationOptions as any);

      // In a real app, you would verify this with the backend
      localStorage.setItem('userToken', 'session-token');
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};