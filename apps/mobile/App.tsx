import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import MainNavigator from './src/navigation/MainNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { WalletProvider } from './src/context/WalletContext';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    // Check if user has registered
    const checkRegistration = async () => {
      try {
        const walletAddress = await SecureStore.getItemAsync('walletAddress');
        setHasRegistered(!!walletAddress);
        
        // Check if we have a valid token
        const token = await SecureStore.getItemAsync('userToken');
        setUserToken(token);
      } catch (error) {
        console.error('Error checking registration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistration();
  }, []);

  if (isLoading) {
    // You could show a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <WalletProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!hasRegistered ? (
                  <>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                  </>
                ) : !userToken ? (
                  <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                  <Stack.Screen name="Main" component={MainNavigator} />
                )}
              </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}