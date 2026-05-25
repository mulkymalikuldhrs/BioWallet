import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { Ionicons } from '@expo/vector-icons';

interface TransactionItem {
  id: string;
  type: string;
  amount: string;
  address: string;
  timestamp: string;
  status: string;
}

const HistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const { walletAddress, isLoading, refreshBalance } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  useEffect(() => {
    // In a production app, transactions would be fetched from the backend API
    // For now, show a placeholder state
    loadTransactions();
  }, [walletAddress]);

  const loadTransactions = async () => {
    // Placeholder: In production, fetch from /api/transactions?address=...
    setTransactions([]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    await loadTransactions();
    setRefreshing(false);
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
          {item.address}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[styles.amountText, { color: item.type === 'SEND' ? colors.primary : colors.success }]}>
          {item.type === 'SEND' ? '-' : '+'}{item.amount} ETH
        </Text>
        <Text style={[styles.statusText, { color: item.status === 'CONFIRMED' ? colors.success : colors.secondary }]}>
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
