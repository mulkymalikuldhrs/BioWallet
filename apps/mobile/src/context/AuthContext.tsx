import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import type { AuthContextType } from 'utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL — configurable via environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if device ID exists, if not create one
    // Also check for existing token to restore session
    const initializeAuth = async () => {
      try {
        // Initialize device ID
        let deviceId = await SecureStore.getItemAsync('deviceId');
        if (!deviceId) {
          deviceId = uuidv4();
          await SecureStore.setItemAsync('deviceId', deviceId);
        }

        // Check for existing JWT token
        const existingToken = await SecureStore.getItemAsync('userToken');
        if (existingToken) {
          // Verify the token is still valid by checking with backend
          try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
              headers: { Authorization: `Bearer ${existingToken}` },
            });
            if (response.ok) {
              setIsAuthenticated(true);
            } else {
              // Token expired or invalid, clear it
              await SecureStore.deleteItemAsync('userToken');
            }
          } catch {
            // Network error — still consider authenticated if we have a token
            // (offline-first approach)
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      }
    };

    initializeAuth();
  }, []);

  // Register with biometric authentication
  const register = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if device supports biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        throw new Error('This device does not support biometric authentication');
      }

      // Check if biometrics are enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        throw new Error('No biometrics found. Please set up fingerprint or face recognition on your device');
      }

      // Get available biometric types
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const biometricType = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
        ? 'FACE'
        : types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ? 'FINGERPRINT'
        : 'IRIS';

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to register',
        disableDeviceFallback: true,
      });

      if (!result.success) {
        throw new Error('Biometric authentication failed');
      }

      // Store authentication state
      await SecureStore.setItemAsync('isRegistered', 'true');
      await SecureStore.setItemAsync('biometricType', biometricType);

      // Get device ID for backend registration
      const deviceId = await SecureStore.getItemAsync('deviceId');
      if (!deviceId) {
        throw new Error('Device ID not found. Please restart the app.');
      }

      // The wallet address will be set by WalletContext after wallet generation.
      // For now, we register the user on the backend with the deviceId and biometricType.
      // The wallet address will be linked when the wallet is generated.
      // We use a placeholder publicKey that will be updated later.
      const placeholderPublicKey = `biowallet-mobile-${deviceId.slice(0, 8)}`;

      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: `pending-${deviceId.slice(0, 8)}`, // Temporary, will be updated
            publicKey: placeholderPublicKey,
            biometricType,
            deviceId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Store the JWT token from backend
          if (data.token) {
            await SecureStore.setItemAsync('userToken', data.token);
          }
          if (data.id) {
            await SecureStore.setItemAsync('userId', data.id);
          }
        } else {
          const data = await response.json().catch(() => ({}));
          // 409 means user already exists — try to login instead
          if (response.status === 409) {
            try {
              const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  walletAddress: `pending-${deviceId.slice(0, 8)}`,
                  deviceId,
                }),
              });
              if (loginResponse.ok) {
                const loginData = await loginResponse.json();
                if (loginData.token) {
                  await SecureStore.setItemAsync('userToken', loginData.token);
                }
                if (loginData.id) {
                  await SecureStore.setItemAsync('userId', loginData.id);
                }
              }
            } catch (loginErr) {
              console.warn('Backend login fallback failed:', loginErr);
            }
          } else {
            console.warn('Backend registration warning:', data.message || 'Unknown error');
          }
        }
      } catch (backendErr) {
        // Non-blocking: auth works offline, backend sync can retry later
        console.warn('Could not register with backend:', backendErr);
        // Store a local token as fallback
        const fallbackToken = uuidv4();
        await SecureStore.setItemAsync('userToken', fallbackToken);
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

  // Login with biometric authentication
  const login = async (): Promise<{ success: boolean; credentialId?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if registered
      const isRegistered = await SecureStore.getItemAsync('isRegistered');
      if (isRegistered !== 'true') {
        throw new Error('Not registered. Please register first');
      }

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        disableDeviceFallback: true,
      });

      if (!result.success) {
        throw new Error('Biometric authentication failed');
      }

      // Get wallet address and device ID for backend login
      const walletAddress = await SecureStore.getItemAsync('walletAddress');
      const deviceId = await SecureStore.getItemAsync('deviceId');

      // Call backend to get a fresh JWT token
      if (walletAddress) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress,
              deviceId,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Store the JWT token from backend
            if (data.token) {
              await SecureStore.setItemAsync('userToken', data.token);
            }
            if (data.id) {
              await SecureStore.setItemAsync('userId', data.id);
            }
          } else {
            const data = await response.json().catch(() => ({}));
            console.warn('Backend login warning:', data.message || 'Unknown error');
            // Fall back to existing token or generate a new one
            const existingToken = await SecureStore.getItemAsync('userToken');
            if (!existingToken) {
              const fallbackToken = uuidv4();
              await SecureStore.setItemAsync('userToken', fallbackToken);
            }
          }
        } catch (backendErr) {
          // Non-blocking: login works offline
          console.warn('Could not login with backend:', backendErr);
          const existingToken = await SecureStore.getItemAsync('userToken');
          if (!existingToken) {
            const fallbackToken = uuidv4();
            await SecureStore.setItemAsync('userToken', fallbackToken);
          }
        }
      }

      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error('Error logging in:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await SecureStore.deleteItemAsync('userToken');
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Error logging out:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
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
        login,
        logout,
        register,
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
