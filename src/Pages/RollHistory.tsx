// import {
//   FlatList,
//   StyleSheet,
//   Text,
//   View,
//   ActivityIndicator,
//   TouchableOpacity,
// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import TestComp from '../components/TestComp';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/AntDesign';

// export default function RollHistory() {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const navigation = useNavigation()

//   const handleRefresh = () => {
//     setRefreshing(true);
//     setTimeout(() => setRefreshing(false), 1000);
//   };

//   useEffect(()=>{
//     navigation.setOptions({
//       headerRight:()=><TouchableOpacity style={{marginRight:20}} onPress={handleRefresh}> <Icon name="reload1" size={20} color="#900" />;</TouchableOpacity>
//     })
//   },[])
//   const formatBTC = amount => parseFloat(amount).toFixed(8) + ' BTC';

//   const renderItem = ({item}:any) => (
//     <>
//       {item?.game == 'FREE' && (
//         <View style={styles.card}>
//           <Text style={styles.dateTime}>
//             {item.date} at {item.time}
//           </Text>

//           <View style={styles.row}>
//             <Text style={styles.label}>Roll:</Text>
//             <Text style={styles.value}>{item.roll}</Text>
//           </View>

//           <View style={styles.row}>
//             <Text style={styles.label}>Profit:</Text>
//             <Text
//               style={[
//                 styles.value,
//                 parseFloat(item.profit) >= 0 ? styles.profit : styles.loss,
//               ]}>
//               {formatBTC(item.profit)}
//             </Text>
//           </View>
//         </View>
//       )}
//     </>
//   );

//   return (
//     <View style={styles.container}>
//       <TestComp setHistory={setHistory} setLoading={setLoading} refreshing={refreshing} />
//       {loading ? (
//         <View style={styles.loader}>
//           <ActivityIndicator size="large" color="#6200ee" />
//           <Text style={{marginTop: 10, color: '#6200ee'}}>Loading...</Text>
//         </View>
//       ) : history.length ? (
//         <FlatList
//           data={history}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{padding: 16}}
//           refreshing={refreshing}
//           onRefresh={handleRefresh}
//           showsVerticalScrollIndicator={false}
//         />
//       ) : (
//         <View style={styles.loader}>
//           <Text style={{fontSize: 16, color: '#999'}}>No history found.</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#f9f9f9'},
//   loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 14,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   dateTime: {
//     fontSize: 13,
//     color: '#888',
//     marginBottom: 10,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 6,
//   },
//   label: {
//     fontSize: 14,
//     color: '#555',
//   },
//   value: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#222',
//   },
//   profit: {
//     color: '#27ae60',
//   },
//   loss: {
//     color: '#e74c3c',
//   },
// });



import { StyleSheet, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxios';
import { useNavigation } from '../utils/dalal';
import { 
  IconButton, 
  Text, 
  Card, 
  Divider, 
  ActivityIndicator, 
  useTheme 
} from 'react-native-paper';

export default function RollHistory() {
  const { fetchData } = useAxios();
  const [rolls, setRolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { colors } = useTheme();

  const getRollHistory = async () => {
    try {
      const res = await fetchData({
        url: `/user/roll/my?page=1&limit=100`,
      });
      setRolls(res?.data.data.rolls);
    } catch (error) {
      console.error('Error fetching roll history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    getRollHistory();
  };

  useEffect(() => {
    getRollHistory();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton 
          icon="refresh" 
          size={25} 
          onPress={handleRefresh}
          disabled={refreshing}
        />
      ),
    });
  }, [refreshing]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year} - ${hours}:${minutes} ${ampm}`;
  };

  const formatBTC = btcAmount => {
    return parseFloat(btcAmount).toFixed(8) + ' BTC';
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card} mode="contained">
      <Card.Content>
        <View style={styles.itemHeader}>
          <Text variant="bodyLarge" style={[styles.btcAmount, { color: colors.primary }]}>
            {formatBTC(item.btc)}
          </Text>
          <Text variant="bodyMedium" style={styles.dateText}>
            {formatDate(item.rolledAt)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (rolls.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium" style={styles.emptyText}>
          No roll history found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={rolls}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginVertical: 4,
  },
  listContainer: {
    paddingBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btcAmount: {
    fontWeight: 'bold',
  },
  dateText: {
    color: '#7f8c8d',
  },
  divider: {
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#7f8c8d',
  },
});