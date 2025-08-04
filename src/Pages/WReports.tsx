import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import React, { useEffect, useState } from 'react';
import {Appbar, Badge, useTheme, ActivityIndicator} from 'react-native-paper';
import {useSidebar} from '../context/SidebarContext';
import useAxios from '../hooks/useAxios';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';

export default function WReports() {
  const {openSidebar} = useSidebar();
  const {fetchData} = useAxios();
  const [history, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const fetchWithdrawalHistory = async () => {
    try {
      setLoading(true);
      const {data} = await fetchData({
        url: '/user/withdraw/my-withdrawals?page=1&limit=10000',
        loader: false,
      });
      setAllHistory(data?.data?.withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return '#4CAF50'; // Green
      case 'REJECTED':
        return '#F44336'; // Red
      default:
        return '#FFC107'; // Yellow for pending or other statuses
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD MMM YYYY, hh:mm A');
  };

  const formatBTC = (amount) => {
    return parseFloat(amount).toFixed(8) + ' BTC';
  };

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.transactionCard,
        {backgroundColor: theme.colors.surface}
      ]}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>{formatBTC(item.btc)}</Text>
          <Badge 
            style={[
              styles.statusBadge, 
              {backgroundColor: getStatusColor(item.status)}
            ]}
          >
            {item.status}
          </Badge>
        </View>
        {/* <Icon 
          name={
            item.status === 'ACCEPTED' ? 'check-circle' : 
            item.status === 'REJECTED' ? 'close-circle' : 'clock'
          } 
          size={24} 
          color={getStatusColor(item.status)} 
        /> */}
      </View>
      
      {/* {item.walletAddress && (
        <View style={styles.detailRow}>
          <Icon name="wallet-outline" size={18} color={theme.colors.text} />
          <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="middle">
            {item.walletAddress}
          </Text>
        </View>
      )} */}
      
      <View style={styles.detailRow}>
        {/* <Icon name="calendar" size={18} color={theme.colors.text} /> */}
        <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
      </View>
      

      
      
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {/* <Icon name="file-document-outline" size={60} color={theme.colors.text} /> */}
      <Text style={styles.emptyText}>No withdrawal history found</Text>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Appbar.Header style={styles.header}>
        <Appbar.Action icon="menu" onPress={openSidebar} />
        <Appbar.Content title="Withdrawal Reports" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Withdrawal Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Withdrawals</Text>
                <Text style={styles.summaryValue}>{history.length}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Completed</Text>
                <Text style={styles.summaryValue}>
                  {history.filter(item => item.status === 'ACCEPTED').length}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Rejected</Text>
                <Text style={styles.summaryValue}>
                  {history.filter(item => item.status === 'REJECTED').length}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          <FlatList
            data={history}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E88E5',
    elevation: 0,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  listContentContainer: {
    paddingBottom: 32,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'center',
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  transactionId: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});