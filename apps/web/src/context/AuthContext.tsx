import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: () => Promise<boolean>;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (token) {
          // In a real app, you would validate the token with the server
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
  }, []);

  // Register with WebAuthn
  const register = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, you would fetch registration options from the server
      // This is a simplified example
      const registrationOptions = {
        challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
        rp: {
          name: 'BioWallet',
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array([1, 2, 3, 4]),
          name: 'user@example.com',
          displayName: 'BioWallet User',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        timeout: 60000,
        attestation: 'none',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false,
        },
      };

      // Start registration
      const credential = await startRegistration(registrationOptions as any);

      // In a real app, you would send the credential to the server for verification
      // This is a simplified example
      console.log('Registration credential:', credential);

      // Store authentication state
      localStorage.setItem('isRegistered', 'true');
      localStorage.setItem('userToken', 'dummy-token');

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
      // Check if registered
      const isRegistered = localStorage.getItem('isRegistered');
      if (isRegistered !== 'true') {
        throw new Error('Not registered. Please register first');
      }

      // In a real app, you would fetch authentication options from the server
      // This is a simplified example
      const authenticationOptions = {
        challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      };

      // Start authentication
      const credential = await startAuthentication(authenticationOptions as any);

      // In a real app, you would send the credential to the server for verification
      // This is a simplified example
      console.log('Authentication credential:', credential);

      // Store authentication state
      localStorage.setItem('userToken', 'dummy-token');

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

  // Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      localStorage.removeItem('userToken');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
      setError(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        error,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};