import React, { useEffect, useState } from 'react';
import { View, StyleSheet,ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, IconButton } from 'react-native-paper';
import useAxios from '../hooks/useAxios';
import { useAuth } from '../hooks/useAuth';
// import moment from 'moment';
const Withdrawal = () => {
  type WithdrawalItem = {
  id: string;
  btc: string;
  btcPriceThanInINR: { $numberDecimal: string };
  amountToBePaid: { $numberDecimal: string };
  status: 'ACCEPTED' | 'REJECTED';
  createdAt: string;
};


  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [history, setAllHistory] = useState<WithdrawalItem[]>([]);
const {fetchData} = useAxios();
const {setuserDetails, userDetails} = useAuth();
console.log(userDetails)
 

    const gethistory = async () => {
    try {
      const {data} = await fetchData({
        url: '/user/withdraw/my-withdrawals?page=1&limit=10000',
      });
      console.log(data)
      setAllHistory(data?.data?.withdrawals);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(()=>{
    gethistory()
  },[])

  const handleWithdraw = async (_data: any) => {
   console.log(amount)
    try {
      const res = await fetchData({
        url: `/user/withdraw/new`,
        method: 'POST',
        data: {
          btc: amount,
        },
      });
      
      console.log(res);
      gethistory()
    } catch (error) {
      console.log(error);
    }
  };


   return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card style={styles.card}>
  <Card.Content>
    <View style={styles.titleRow}>
      <Text style={styles.titleText}>Withdraw Funds</Text>
      <Text style={styles.balanceText}>₹{userDetails?.wallet?.balance ?? '0.00'}</Text>
    </View>

    <TextInput
      label="Amount"
      value={amount}
      onChangeText={setAmount}
      keyboardType="numeric"
      style={styles.input}
    />
    <Button mode="contained" onPress={handleWithdraw} style={styles.button}>
      Submit Withdrawal
    </Button>
  </Card.Content>
</Card>

      <View style={styles.historyHeader}>
  <Text style={styles.historyTitle}>Withdrawal History</Text>
  <IconButton
    icon="refresh"
    size={20}
    onPress={gethistory}
  />
</View>

      {history?.map((item,indx) => {
        const statusColor = item?.status === 'ACCEPTED' ? '#2e7d32' : '#c62828';
        return (
          <Card key={item?.id} style={styles.historyCard}>
            <Card.Content>
              <Text style={styles.label}>BTC: {item.btc}</Text>
              {/* <Text style={styles.label}>
                INR: ₹{Number(item.amountToBePaid.$numberDecimal).toFixed(2)}
              </Text> */}
              <Text style={[styles.label, { color: statusColor }]}>
                Status: {item.status}
              </Text>
              <Text style={styles.date}>
                {/* {moment(item.createdAt).format('DD MMM YYYY, hh:mm A')} */}
                {new Date(item.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </Card.Content>
          </Card>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
 scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  button: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
  },
  historyCard: {
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceText: {
    fontSize: 16,
    color: 'green',
    fontWeight: '600',
  },
  historyHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 20,
  marginBottom: 10,
},
});

export default Withdrawal;
