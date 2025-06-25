import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Text, TextInput, Button, Card, IconButton, Appbar, useTheme} from 'react-native-paper';
import useAxios from '../hooks/useAxios';
import {useAuth} from '../hooks/useAuth';
import {useSidebar} from '../context/SidebarContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type WithdrawalItem = {
  id: string;
  btc: string;
  btcPriceThanInINR: {$numberDecimal: string};
  amountToBePaid: {$numberDecimal: string};
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  createdAt: string;
};

const Withdrawal = () => {
  const theme = useTheme();
  const {openSidebar} = useSidebar();
  const [amount, setAmount] = useState('');
  const [history, setAllHistory] = useState<WithdrawalItem[]>([]);
  const {fetchData} = useAxios();
  const {userDetails} = useAuth();

  const fetchWithdrawalHistory = async () => {
    try {
      const {data} = await fetchData({
        url: '/user/withdraw/my-withdrawals?page=1&limit=10000',
        loader: false
      });
      setAllHistory(data?.data?.withdrawals);
      console.log(data?.data?.withdrawals)
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
    }
  };

  useEffect(() => {
    fetchWithdrawalHistory();
  }, []);

  const handleWithdraw = async () => {
    if (!amount) return;
    
    try {
      await fetchData({
        url: '/user/withdraw/new',
        method: 'POST',
        data: {btc: amount},
      });
      setAmount('');
      fetchWithdrawalHistory();
    } catch (error) {
      console.error('Withdrawal error:', error);
    }
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return {color: '#4CAF50', icon: 'check-circle'};
      case 'REJECTED':
        return {color: '#F44336', icon: 'close-circle'};
      default:
        return {color: '#FFC107', icon: 'clock'};
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={openSidebar} />
        <Appbar.Content title="Withdrawal" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <Card style={[styles.balanceCard, {backgroundColor: theme.colors.primary}]}>
          <Card.Content>
            <View style={styles.balanceRow}>
              <Icon name="wallet" size={24} color="#FFF" />
              <Text style={styles.balanceLabel}>Available Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>
              ₹{userDetails?.wallet?.balance?.toLocaleString('en-IN') ?? '0.00'}
            </Text>
          </Card.Content>
        </Card>

        {/* Withdrawal Form */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Withdraw Funds</Text>
            
            <TextInput
              label="BTC Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="currency-btc" />}
              right={<TextInput.Affix text="BTC" />}
            />

            <Button
              mode="contained"
              onPress={handleWithdraw}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              disabled={!amount ||  Number(amount) <30000}
              icon="send">
              Submit Withdrawal
            </Button>
          </Card.Content>
        </Card>

        {/* History Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity onPress={fetchWithdrawalHistory}>
            <Icon name="refresh" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="history" size={48} color="#DDD" />
            <Text style={styles.emptyText}>No withdrawal history yet</Text>
          </View>
        ) : (
          history.map((item) => {
            const status = getStatusDetails(item.status);
            return (
              <Card key={item.id} style={styles.historyCard}>
                <Card.Content>
                  <View style={styles.historyHeader}>
                    <View style={styles.amountRow}>
                      <Icon name="currency-btc" size={20} color="#FF9800" />
                      <Text style={styles.btcAmount}>{item.btc} BTC</Text>
                    </View>
                    <View style={[styles.statusBadge, {backgroundColor: status.color}]}>
                      <Icon name={status.icon} size={16} color="#FFF" />
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={styles.historyFooter}>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                    {/* <Text style={styles.inrAmount}>
                      ₹{Number(item.amountToBePaid.$numberDecimal).toFixed(2)}
                    </Text> */}
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  balanceCard: {
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceLabel: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 8,
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  formCard: {
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyCard: {
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btcAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  inrAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: '#AAA',
    fontSize: 16,
  },
});

export default Withdrawal;