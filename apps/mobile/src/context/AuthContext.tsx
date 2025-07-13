import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  register: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if device ID exists, if not create one
    const initializeDeviceId = async () => {
      try {
        const deviceId = await SecureStore.getItemAsync('deviceId');
        if (!deviceId) {
          const newDeviceId = uuidv4();
          await SecureStore.setItemAsync('deviceId', newDeviceId);
        }
      } catch (error) {
        console.error('Error initializing device ID:', error);
      }
    };

    initializeDeviceId();
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
      
      // Generate a token
      const token = uuidv4();
      await SecureStore.setItemAsync('userToken', token);
      
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

  // Login with biometric authentication
  const login = async (): Promise<boolean> => {
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

      // Generate a token
      const token = uuidv4();
      await SecureStore.setItemAsync('userToken', token);
      
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
      await SecureStore.deleteItemAsync('userToken');
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