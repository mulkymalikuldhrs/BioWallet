import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { register, isLoading, error } = useAuth();
  const { generateWalletFromBiometric } = useWallet();
  
  const [biometricType, setBiometricType] = useState<string>('');
  const [step, setStep] = useState(1);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Start fade animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Start pulse animation
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
    
    // Check available biometric types
    const checkBiometrics = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
          Alert.alert(
            'Incompatible Device',
            'Your device does not support biometric authentication'
          );
          return;
        }
        
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          Alert.alert(
            'Biometrics Not Set Up',
            'Please set up fingerprint or face recognition in your device settings'
          );
          return;
        }
        
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
        } else {
          setBiometricType('Biometric');
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
        Alert.alert('Error', 'Failed to check biometric capabilities');
      }
    };
    
    checkBiometrics();
  }, []);
  
  const handleRegister = async () => {
    try {
      // Register with biometrics
      const success = await register();
      
      if (success) {
        setStep(2);
        
        // Generate wallet from biometric
        const walletAddress = await generateWalletFromBiometric();
        
        if (walletAddress) {
          // Navigate to main app
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as never }],
          });
        } else {
          Alert.alert('Error', 'Failed to generate wallet');
        }
      } else {
        Alert.alert('Registration Failed', error || 'Please try again');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {step === 1 ? (
          <>
            <Text style={[styles.title, { color: colors.text }]}>
              Register with {biometricType}
            </Text>
            
            <Text style={[styles.description, { color: colors.secondary }]}>
              Your {biometricType.toLowerCase()} will be used to generate your unique wallet.
              No biometric data is ever stored or transmitted.
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
                <Ionicons name="shield-checkmark" size={24} color={colors.success} />
                <Text style={[styles.securityText, { color: colors.text }]}>
                  Processed locally on your device
                </Text>
              </View>
              
              <View style={styles.securityItem}>
                <Ionicons name="lock-closed" size={24} color={colors.success} />
                <Text style={[styles.securityText, { color: colors.text }]}>
                  Never stored or transmitted
                </Text>
              </View>
              
              <View style={styles.securityItem}>
                <Ionicons name="key" size={24} color={colors.success} />
                <Text style={[styles.securityText, { color: colors.text }]}>
                  Creates your unique wallet key
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Processing...</Text>
              ) : (
                <>
                  <Text style={styles.buttonText}>Scan {biometricType}</Text>
                  <Ionicons name="scan" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.text }]}>
              Creating Your Wallet
            </Text>
            
            <Text style={[styles.description, { color: colors.secondary }]}>
              Please wait while we generate your secure wallet from your biometric data.
            </Text>
            
            <Animated.View
              style={[
                styles.loadingIcon,
                {
                  transform: [{ rotate: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: ['0deg', '360deg']
                  }) }],
                },
              ]}
            >
              <Ionicons name="sync" size={80} color={colors.primary} />
            </Animated.View>
            
            <Text style={[styles.processingText, { color: colors.accent }]}>
              Processing biometric data...
            </Text>
          </>
        )}
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
    marginBottom: 16,
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
  loadingIcon: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  securityNotes: {
    width: '100%',
    marginBottom: 40,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityText: {
    fontSize: 16,
    marginLeft: 12,
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
  processingText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RegisterScreen;