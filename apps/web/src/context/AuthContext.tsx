import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (walletAddress: string, publicKey: string, credentialId: string) => Promise<boolean>;
  login: () => Promise<{ success: boolean; credentialId?: string }>;
  logout: () => Promise<void>;
  getRegistrationOptions: (walletAddress: string) => any;
  getAuthenticationOptions: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const getRegistrationOptions = (walletAddress: string) => {
    const randomChallenge = new Uint8Array(32);
    window.crypto.getRandomValues(randomChallenge);

    return {
      challenge: btoa(String.fromCharCode.apply(null, Array.from(randomChallenge))),
      rp: { name: 'BioWallet', id: window.location.hostname },
      user: { id: btoa(walletAddress), name: walletAddress, displayName: 'BioWallet User' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: 60000,
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required'
      },
    };
  };

  const getAuthenticationOptions = () => {
    const randomChallenge = new Uint8Array(32);
    window.crypto.getRandomValues(randomChallenge);

    return {
      challenge: btoa(String.fromCharCode.apply(null, Array.from(randomChallenge))),
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname,
    };
  };

  const register = async (walletAddress: string, publicKey: string, credentialId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          publicKey,
          credentialId,
          biometricType: 'FINGERPRINT',
          deviceId: localStorage.getItem('deviceId') || crypto.randomUUID(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to register on backend');
      }

      const userData = await response.json();
      localStorage.setItem('userToken', userData.id);
      localStorage.setItem('isRegistered', 'true');
      localStorage.setItem('credentialId', credentialId);
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

  const login = async (): Promise<{ success: boolean; credentialId?: string; clientExtensionResults?: any }> => {
    setIsLoading(true);
    setError(null);

    try {
      const isRegistered = localStorage.getItem('isRegistered');
      if (isRegistered !== 'true') {
        throw new Error('Not registered. Please register first');
      }

      const options = getAuthenticationOptions();

      // Add PRF extension request for secure key derivation
      const optionsWithPRF = {
        ...options,
        extensions: {
          prf: {
            eval: {
              first: new TextEncoder().encode('biowallet-key-derivation-v1')
            }
          }
        }
      };

      const credential = await startAuthentication(optionsWithPRF as any);

      // Generate a session token from the credential ID and timestamp
      const sessionToken = crypto.randomUUID();
      localStorage.setItem('userToken', sessionToken);
      localStorage.setItem('credentialId', credential.id);
      setIsAuthenticated(true);
      return {
        success: true,
        credentialId: credential.id,
        clientExtensionResults: (credential as any).clientExtensionResults
      };
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      error,
      register,
      login,
      logout,
      getRegistrationOptions,
      getAuthenticationOptions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
