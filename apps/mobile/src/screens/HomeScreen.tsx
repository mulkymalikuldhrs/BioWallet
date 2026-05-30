import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, RefreshControl, Modal, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';

const HomeScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { walletAddress, balance, refreshBalance, isLoading } = useWallet();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Refresh balance when component mounts
    refreshBalance();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (walletAddress) {
      Clipboard.setString(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Format wallet address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Animated.View
        style={[
          styles.balanceCard,
          {
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.balanceHeader}>
          <Text style={[styles.balanceLabel, { color: colors.secondary }]}>
            Your Balance
          </Text>
          <TouchableOpacity onPress={() => refreshBalance()}>
            <Ionicons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.balanceAmount, { color: colors.text }]}>
          {isLoading ? '...' : balance ? `${balance} ETH` : '0.00 ETH'}
        </Text>
        
        <View style={[styles.networkBadge, { backgroundColor: colors.accent + '20' }]}>
          <View style={[styles.networkDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.networkText, { color: colors.accent }]}>
            Sepolia Testnet
          </Text>
        </View>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.addressCard,
          {
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.addressLabel, { color: colors.secondary }]}>
          Your Wallet Address
        </Text>
        
        <View style={styles.qrContainer}>
          {walletAddress && (
            <QRCode
              value={walletAddress}
              size={160}
              color={isDark ? '#FFFFFF' : '#000000'}
              backgroundColor="transparent"
            />
          )}
        </View>
        
        <View style={styles.addressContainer}>
          <Text style={[styles.addressText, { color: colors.text }]}>
            {formatAddress(walletAddress)}
          </Text>
          
          <TouchableOpacity
            style={[styles.copyButton, { backgroundColor: colors.primary + '20' }]}
            onPress={copyAddress}
          >
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={20} color={colors.primary} />
            <Text style={[styles.copyText, { color: colors.primary }]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.actionsCard,
          {
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.actionsLabel, { color: colors.secondary }]}>
          Quick Actions
        </Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
            onPress={() => {
              // Navigate to Send tab
              navigation.navigate('Send' as never);
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="send" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success + '10' }]}
            onPress={() => {
              // Show receive modal with QR code
              setShowReceiveModal(true);
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="download" size={24} color={colors.success} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Receive</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent + '10' }]}
            onPress={() => {
              // Navigate to History tab
              navigation.navigate('History' as never);
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="time" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary + '10' }]}
            onPress={() => {
              // Navigate to Profile/Settings tab
              navigation.navigate('Profile' as never);
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="settings" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Receive Modal */}
      <Modal
        visible={showReceiveModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReceiveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Receive ETH</Text>
              <TouchableOpacity onPress={() => setShowReceiveModal(false)}>
                <Ionicons name="close" size={28} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.secondary }]}>
              Share your wallet address to receive ETH on Sepolia testnet
            </Text>

            <View style={styles.modalQrContainer}>
              {walletAddress && (
                <View style={[styles.qrBg, { backgroundColor: colors.background }]}>
                  <QRCode
                    value={walletAddress}
                    size={200}
                    color={isDark ? '#FFFFFF' : '#000000'}
                    backgroundColor="transparent"
                  />
                </View>
              )}
            </View>

            <View style={[styles.modalAddressBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalAddress, { color: colors.text }]} numberOfLines={2}>
                {walletAddress}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.copyFullButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (walletAddress) {
                  Clipboard.setString(walletAddress);
                  Alert.alert('Copied!', 'Wallet address copied to clipboard');
                }
              }}
            >
              <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
              <Text style={styles.copyFullButtonText}>Copy Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  networkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addressCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 16,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  qrContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionsLabel: {
    fontSize: 16,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalQrContainer: {
    marginBottom: 16,
  },
  qrBg: {
    padding: 20,
    borderRadius: 16,
  },
  modalAddressBox: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalAddress: {
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  copyFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  copyFullButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;
