import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  IconButton,
  Appbar,
  useTheme,
  HelperText,
} from 'react-native-paper';
import useAxios from '../hooks/useAxios';
import {useAuth} from '../hooks/useAuth';
import {useSidebar} from '../context/SidebarContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {showNotification} from '../utils/Notify';
import Toast from 'react-native-toast-message';

type WithdrawalItem = {
  id: string;
  btc: string;
  btcPriceThanInINR: {$numberDecimal: string};
  amountToBePaid: {$numberDecimal: string};
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  createdAt: string;
};

const MIN_BTC = '30000';

const Withdrawal = () => {
  const theme = useTheme();
  const {openSidebar} = useSidebar();
  const [amount, setAmount] = useState('');
  const [history, setAllHistory] = useState<WithdrawalItem[]>([]);
  const {fetchData} = useAxios();
  const {userDetails} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ourWallet, setOurWallet] = useState(null);

  const fetchWithdrawalHistory = async () => {
    try {
      const {data} = await fetchData({
        url: '/user/withdraw/my-withdrawals?page=1&limit=10000',
        loader: false,
      });
      setAllHistory(data?.data?.withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
    }
  };

  const ourWalletFn = async () => {
    try {
      const response = await fetchData({
        url: `/user/income/distributeincom/${userDetails?.email}`,
      });
      console.log(response);

      // if (response.data?.success) {
      setOurWallet(response?.data?.wallet?.balance || 0);
      // console.log(response?.data?.wallet?.balance)
      // }
    } catch (error) {
      console.log(error);
      // setSnackbarMessage('Failed to fetch referral data');
      // setVisibleSnackbar(true);
    }
  };

  useEffect(() => {
    fetchWithdrawalHistory();
    ourWalletFn();
  }, []);

  const handleWithdraw = async () => {
    if (!amount || isSubmitting) return;
    console.log(amount);
    if (amount < MIN_BTC) {
      showNotification(`MIN. WITHDRAW  ${MIN_BTC}`, 'error');
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const res = await fetchData({
        url: '/user/withdraw/new',
        method: 'POST',
        data: {btc: amount},
      });
      if (res?.status) {
        setAmount('');
        setTimeout(async () => {
          await fetchWithdrawalHistory();
          ourWalletFn()
        }, 300);
      }

      console.log(res);
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setIsSubmitting(false);
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

  const [text, setText] = React.useState('');

  const onChangeText = (text: any) => {
    console.log(isNaN(text));
    if (!isNaN(text)) {
      setAmount(text);
    }
    console.log(text);
  };

  const hasErrors = () => {
    return amount < MIN_BTC;
  };
  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        {/* <Toast position="top" swipeable topOffset={100} /> */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View
              style={{
                zIndex: 9999,
              }}>
              <Toast position="top" swipeable topOffset={50} />
            </View>
            <Appbar.Header>
              <Appbar.Action icon="menu" onPress={openSidebar} />
              <Appbar.Content title="Withdrawal" />
            </Appbar.Header>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled">
              {/* Balance Card */}
              <Card
                style={[
                  styles.balanceCard,
                  {backgroundColor: theme.colors.primary},
                ]}>
                <Card.Content>
                  <View style={styles.balanceRow}>
                    <Icon name="wallet" size={24} color="#FFF" />
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                  </View>
                  <Text style={styles.balanceAmount}>
                    ₹{ourWallet?.toLocaleString('en-IN') ?? '0.00'}
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
                    onChangeText={onChangeText}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="currency-btc" />}
                    right={<TextInput.Affix text="BTC" />}
                    onSubmitEditing={handleWithdraw}
                    returnKeyType="done"
                  />
                  <HelperText type="error" visible={hasErrors()}>
                    MIN. WITHDRAW: {MIN_BTC}
                  </HelperText>
                  <TouchableOpacity onPress={() => setAmount(MIN_BTC)}>
                    <Text style={{color: theme.colors.primary}}>
                      Tap to auto-fill minimum BTC ({MIN_BTC})
                    </Text>
                  </TouchableOpacity>
                  <Button
                    mode="contained"
                    onPress={handleWithdraw}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                    disabled={hasErrors() || isSubmitting}
                    loading={isSubmitting}
                    icon="send">
                    {isSubmitting ? 'Processing...' : 'Submit Withdrawal'}
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
                  <Text style={styles.emptyText}>
                    No withdrawal history yet
                  </Text>
                </View>
              ) : (
                history.map(item => {
                  const status = getStatusDetails(item.status);
                  return (
                    <Card key={item.id} style={styles.historyCard}>
                      <Card.Content>
                        <View style={styles.historyHeader}>
                          <View style={styles.amountRow}>
                            <Icon
                              name="currency-btc"
                              size={20}
                              color="#FF9800"
                            />
                            <Text style={styles.btcAmount}>{item.btc} BTC</Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              {backgroundColor: status.color},
                            ]}>
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
                        </View>
                      </Card.Content>
                    </Card>
                  );
                })
              )}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
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
    marginBottom: 5,
    backgroundColor: '#FFF',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    // paddingVertical: 6,
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
