import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

type NetworkType = 'sepolia' | 'mainnet';

const ProfileScreen: React.FC = () => {
  const { colors, isDark, setTheme } = useTheme();
  const { walletAddress, balance } = useWallet();
  const { logout } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('sepolia');

  const formatAddress = (address: string | null) => {
    if (!address) return 'Not connected';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to authenticate with biometrics to log back in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleSecuritySettings = () => {
    Alert.alert(
      'Security Settings',
      'Biometric authentication is active.\n\nYour wallet is secured by your device biometrics. No seed phrase or password is stored.',
      [
        { text: 'OK' },
        {
          text: 'Reset Biometric Data',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Reset Biometric Data',
              'This will clear all locally stored wallet data. You will need to re-register. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await SecureStore.deleteItemAsync('walletAddress');
                      await SecureStore.deleteItemAsync('biowallet_user_secret');
                      await SecureStore.deleteItemAsync('biowallet_salt');
                      await SecureStore.deleteItemAsync('isRegistered');
                      await SecureStore.deleteItemAsync('biometricType');
                      await SecureStore.deleteItemAsync('userToken');
                      await SecureStore.deleteItemAsync('userId');
                      Alert.alert('Reset Complete', 'All wallet data has been cleared. Please restart the app.');
                    } catch (err) {
                      console.error('Error resetting data:', err);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleExportWallet = async () => {
    if (!walletAddress) {
      Alert.alert('No Wallet', 'No wallet address found to export.');
      return;
    }

    Alert.alert(
      'Export Wallet',
      'Choose how to share your wallet address:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: async () => {
            try {
              await Share.share({
                message: `My BioWallet Address: ${walletAddress}`,
                title: 'BioWallet Address',
              });
            } catch (err) {
              console.error('Error sharing:', err);
            }
          },
        },
        {
          text: 'Copy Address',
          onPress: async () => {
            try {
              const Clipboard = (await import('@react-native-clipboard/clipboard')).default;
              Clipboard.setString(walletAddress);
              Alert.alert('Copied!', 'Wallet address copied to clipboard');
            } catch {
              Alert.alert('Error', 'Could not copy to clipboard');
            }
          },
        },
      ]
    );
  };

  const handleNetworkChange = () => {
    Alert.alert(
      'Select Network',
      'Choose your Ethereum network:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sepolia Testnet',
          onPress: () => setSelectedNetwork('sepolia'),
        },
        {
          text: 'Ethereum Mainnet',
          onPress: () => {
            Alert.alert(
              '⚠️ Warning',
              'Mainnet transactions use real ETH. Are you sure you want to switch to Mainnet?',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => {} },
                { text: 'Switch to Mainnet', style: 'destructive', onPress: () => setSelectedNetwork('mainnet') },
              ]
            );
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Security',
      subtitle: 'Biometric authentication settings',
      onPress: handleSecuritySettings,
    },
    {
      icon: 'download-outline' as const,
      title: 'Export Wallet',
      subtitle: 'Share or copy wallet address',
      onPress: handleExportWallet,
    },
    {
      icon: 'globe-outline' as const,
      title: 'Network',
      subtitle: selectedNetwork === 'sepolia' ? 'Sepolia Testnet' : 'Ethereum Mainnet',
      onPress: handleNetworkChange,
    },
    {
      icon: 'notifications-outline' as const,
      title: 'Notifications',
      subtitle: 'Manage transaction alerts',
      onPress: () => Alert.alert('Notifications', 'Notification settings coming soon'),
    },
    {
      icon: isDark ? 'sunny-outline' : 'moon-outline',
      title: 'Theme',
      subtitle: isDark ? 'Dark mode active' : 'Light mode active',
      onPress: handleThemeToggle,
    },
    {
      icon: 'information-circle-outline' as const,
      title: 'About',
      subtitle: 'BioWallet v3.0.0',
      onPress: () => Alert.alert('About BioWallet', 'BioWallet v3.0.0\nA biometric crypto wallet.\nFor Education Purpose Only.'),
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="person" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.walletLabel, { color: colors.secondary }]}>Wallet Address</Text>
        <Text style={[styles.walletAddress, { color: colors.text }]}>{formatAddress(walletAddress)}</Text>
        {balance && (
          <Text style={[styles.balanceText, { color: colors.primary }]}>{balance} ETH</Text>
        )}
        <View style={[styles.networkBadge, { backgroundColor: colors.accent + '20' }]}>
          <View style={[styles.networkDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.networkText, { color: colors.accent }]}>
            {selectedNetwork === 'sepolia' ? 'Sepolia Testnet' : 'Ethereum Mainnet'}
          </Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Settings</Text>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.settingsItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={item.onPress}
          >
            <View style={[styles.settingsIcon, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.settingsInfo}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.settingsSubtitle, { color: colors.secondary }]}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: '#EF4444' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    margin: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '500',
  },
  settingsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsInfo: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;
