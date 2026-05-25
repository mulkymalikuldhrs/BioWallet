import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { login, isLoading, error } = useAuth();
  const { generateWalletFromBiometric } = useWallet();

  const [biometricType, setBiometricType] = useState<string>('Biometric');

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const checkBiometrics = async () => {
      try {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
        }
      } catch (err) {
        console.error('Error checking biometrics:', err);
      }
    };

    checkBiometrics();
  }, []);

  const handleLogin = async () => {
    try {
      const success = await login();
      if (success) {
        const walletAddress = await generateWalletFromBiometric();
        if (walletAddress) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as never }],
          });
        } else {
          Alert.alert('Error', 'Failed to recover wallet');
        }
      } else {
        Alert.alert('Login Failed', error || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome Back
        </Text>

        <Text style={[styles.description, { color: colors.secondary }]}>
          Authenticate with your {biometricType.toLowerCase()} to access your BioWallet.
        </Text>

        <Animated.View
          style={[
            styles.biometricIcon,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: colors.card,
            },
          ]}
        >
          <Ionicons
            name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
            size={80}
            color={colors.primary}
          />
        </Animated.View>

        <View style={styles.securityNotes}>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={[styles.securityText, { color: colors.text }]}>
              Your wallet is recovered locally
            </Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed" size={20} color={colors.success} />
            <Text style={[styles.securityText, { color: colors.text }]}>
              Biometric data never leaves your device
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.buttonText}>Authenticating...</Text>
          ) : (
            <>
              <Text style={styles.buttonText}>Authenticate with {biometricType}</Text>
              <Ionicons name="finger-print" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetLink}
          onPress={() => {
            Alert.alert(
              'Reset Wallet',
              'This will clear your wallet data. You will need to register again. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Welcome' as never }],
                    });
                  },
                },
              ]
            );
          }}
        >
          <Text style={[styles.resetText, { color: colors.secondary }]}>
            Reset Wallet
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  biometricIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  securityNotes: {
    width: '100%',
    marginBottom: 40,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 14,
    marginLeft: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  resetLink: {
    marginTop: 20,
    padding: 8,
  },
  resetText: {
    fontSize: 14,
  },
});

export default LoginScreen;
