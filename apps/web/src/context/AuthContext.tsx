import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { AuthContextType } from 'utils';

// SSR-safe localStorage wrapper
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

interface WebAuthContextType extends AuthContextType {
  getRegistrationOptions: (walletAddress: string) => any;
  getAuthenticationOptions: () => any;
}

const AuthContext = createContext<WebAuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = safeLocalStorage.getItem('userToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const getRegistrationOptions = (walletAddress: string) => {
    if (typeof window === 'undefined') return {};

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
    if (typeof window === 'undefined') return {};

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
      const deviceId = safeLocalStorage.getItem('deviceId') || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'web-device');

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          publicKey,
          credentialId,
          biometricType: 'FINGERPRINT',
          deviceId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        // 409 means already registered — that's okay
        if (response.status === 409) {
          // Try to login instead
          try {
            const loginResponse = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ walletAddress, deviceId }),
            });
            if (loginResponse.ok) {
              const loginData = await loginResponse.json();
              safeLocalStorage.setItem('userToken', loginData.token);
              safeLocalStorage.setItem('isRegistered', 'true');
              safeLocalStorage.setItem('credentialId', credentialId);
              setIsAuthenticated(true);
              return true;
            }
          } catch {
            // Fall through
          }
        }
        throw new Error(data.message || 'Failed to register on backend');
      }

      const userData = await response.json();
      safeLocalStorage.setItem('userToken', userData.token || userData.id);
      safeLocalStorage.setItem('isRegistered', 'true');
      safeLocalStorage.setItem('credentialId', credentialId);
      if (userData.id) {
        safeLocalStorage.setItem('userId', userData.id);
      }
      setIsAuthenticated(true);

      return true;
    } catch (err) {
      console.error('Error registering:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<{ success: boolean; credentialId?: string; clientExtensionResults?: any }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if window/navigator is available (SSR safety)
      if (typeof window === 'undefined' || !navigator.credentials) {
        throw new Error('WebAuthn is not available in this environment');
      }

      const isRegistered = safeLocalStorage.getItem('isRegistered');
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

      // Get JWT from backend
      const walletAddress = safeLocalStorage.getItem('walletAddress');
      if (walletAddress) {
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress }),
          });
          if (response.ok) {
            const data = await response.json();
            safeLocalStorage.setItem('userToken', data.token);
            if (data.id) {
              safeLocalStorage.setItem('userId', data.id);
            }
          }
        } catch {
          // Fall back to session token
          const sessionToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
          safeLocalStorage.setItem('userToken', sessionToken);
        }
      } else {
        const sessionToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        safeLocalStorage.setItem('userToken', sessionToken);
      }

      safeLocalStorage.setItem('credentialId', credential.id);
      setIsAuthenticated(true);
      return {
        success: true,
        credentialId: credential.id,
        clientExtensionResults: (credential as any).clientExtensionResults
      };
    } catch (err) {
      console.error('Error logging in:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    safeLocalStorage.removeItem('userToken');
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
