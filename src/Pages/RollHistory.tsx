import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import TestComp from '../components/TestComp';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

export default function RollHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation()

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };


  useEffect(()=>{
    navigation.setOptions({
      headerRight:()=><TouchableOpacity style={{marginRight:20}} onPress={handleRefresh}> <Icon name="reload1" size={20} color="#900" />;</TouchableOpacity>
    })
  },[])
  const formatBTC = amount => parseFloat(amount).toFixed(8) + ' BTC';

  const renderItem = ({item}:any) => (
    <>
      {item?.game == 'FREE' && (
        <View style={styles.card}>
          <Text style={styles.dateTime}>
            {item.date} at {item.time}
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Roll:</Text>
            <Text style={styles.value}>{item.roll}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Profit:</Text>
            <Text
              style={[
                styles.value,
                parseFloat(item.profit) >= 0 ? styles.profit : styles.loss,
              ]}>
              {formatBTC(item.profit)}
            </Text>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <TestComp setHistory={setHistory} setLoading={setLoading} refreshing={refreshing} />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={{marginTop: 10, color: '#6200ee'}}>Loading...</Text>
        </View>
      ) : history.length ? (
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{padding: 16}}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.loader}>
          <Text style={{fontSize: 16, color: '#999'}}>No history found.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9f9f9'},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTime: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  profit: {
    color: '#27ae60',
  },
  loss: {
    color: '#e74c3c',
  },
});
