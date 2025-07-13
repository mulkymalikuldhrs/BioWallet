import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  return (
    <LinearGradient
      colors={isDark ? ['#121212', '#1E1E1E'] : ['#FFFFFF', '#F5F5F5']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Ionicons name="finger-print" size={80} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.text }]}>BioWallet</Text>
        </View>
        
        <Text style={[styles.tagline, { color: colors.text }]}>
          Your body is your password
        </Text>
        
        <Text style={[styles.description, { color: colors.secondary }]}>
          The revolutionary crypto wallet that uses your biometrics to secure your digital assets.
          No seed phrases. No passwords. Just you.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={24} color={colors.accent} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Secure biometric authentication
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="globe" size={24} color={colors.accent} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Ethereum compatible
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="lock-closed" size={24} color={colors.accent} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Local-only biometric processing
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Register' as never)}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 16,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
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
});

export default WelcomeScreen;