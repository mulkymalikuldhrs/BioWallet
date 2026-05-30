import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import type { TransactionItem } from 'utils';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const HistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const { walletAddress, isLoading, refreshBalance } = useWallet();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!walletAddress) {
      setTransactions([]);
      return;
    }

    setLoadingTx(true);
    setTxError(null);

    try {
      const token = await SecureStore.getItemAsync('userToken');

      const response = await fetch(`${API_BASE_URL}/wallet/transactions/${walletAddress}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend response to TransactionItem[]
        const txItems: TransactionItem[] = (Array.isArray(data) ? data : []).map((tx: any) => ({
          id: tx.id,
          type: tx.fromAddress === walletAddress ? 'SEND' : 'RECEIVE',
          amount: tx.amount ? parseFloat(tx.amount).toFixed(6) : '0',
          address: tx.fromAddress === walletAddress ? tx.toAddress : tx.fromAddress,
          timestamp: tx.createdAt || new Date().toISOString(),
          status: tx.status || 'PENDING',
          txHash: tx.txHash,
        }));
        setTransactions(txItems);
      } else if (response.status === 404) {
        // User not found in backend yet — no transactions
        setTransactions([]);
      } else {
        const data = await response.json().catch(() => ({}));
        setTxError(data.message || 'Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (err) {
      // Network error or backend unavailable
      console.warn('Could not fetch transactions from backend:', err);
      setTxError('Could not connect to server. Pull to refresh.');
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), loadTransactions()]);
    setRefreshing(false);
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const renderTransaction = ({ item }: { item: TransactionItem }) => (
    <View style={[styles.transactionItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.transactionIcon, { backgroundColor: item.type === 'SEND' ? colors.primary + '20' : colors.success + '20' }]}>
        <Ionicons
          name={item.type === 'SEND' ? 'arrow-up' : 'arrow-down'}
          size={20}
          color={item.type === 'SEND' ? colors.primary : colors.success}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionType, { color: colors.text }]}>
          {item.type === 'SEND' ? 'Sent' : 'Received'}
        </Text>
        <Text style={[styles.transactionAddress, { color: colors.secondary }]} numberOfLines={1}>
          {formatAddress(item.address)}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.secondary }]}>
          {formatDate(item.timestamp)}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[styles.amountText, { color: item.type === 'SEND' ? colors.primary : colors.success }]}>
          {item.type === 'SEND' ? '-' : '+'}{item.amount} ETH
        </Text>
        <Text style={[styles.statusText, { color: item.status === 'CONFIRMED' ? colors.success : item.status === 'FAILED' ? colors.error : colors.secondary }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={colors.secondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Transactions Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
        Your transaction history will appear here once you send or receive ETH.
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.secondary }]}>Loading transactions...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Something Went Wrong</Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
        {txError || 'Failed to load transactions. Pull to refresh.'}
      </Text>
    </View>
  );

  // Show loading state on first load
  if (loadingTx && transactions.length === 0 && !txError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderLoading()}
      </View>
    );
  }

  // Show error state
  if (txError && transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={renderError}
          contentContainerStyle={styles.emptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={transactions.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionAddress: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  transactionDate: {
    fontSize: 11,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default HistoryScreen;
