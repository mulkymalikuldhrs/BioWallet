import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { Ionicons } from '@expo/vector-icons';

const SendScreen: React.FC = () => {
  const { colors } = useTheme();
  const { sendTransaction, isLoading, walletAddress } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = async () => {
    if (!recipientAddress.trim()) {
      Alert.alert('Error', 'Please enter a recipient address');
      return;
    }
    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ETH to ${recipientAddress.substring(0, 10)}...?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const txHash = await sendTransaction(recipientAddress, amount);
            if (txHash) {
              Alert.alert('Success', `Transaction sent!\nHash: ${txHash.substring(0, 20)}...`);
              setRecipientAddress('');
              setAmount('');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Ionicons name="send" size={40} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Send ETH</Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
          Transfer Ethereum on Sepolia testnet
        </Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.card }]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Recipient Address</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="0x..."
            placeholderTextColor={colors.secondary}
            value={recipientAddress}
            onChangeText={setRecipientAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Amount (ETH)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="0.0"
            placeholderTextColor={colors.secondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoCapitalize="none"
          />
        </View>

        {walletAddress && (
          <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              Biometric authentication will be required to sign this transaction.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }]}
          onPress={handleSend}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? 'Processing...' : 'Send with Biometrics'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  formCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  sendButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SendScreen;
