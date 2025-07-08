import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useSidebar} from '../context/SidebarContext';
import useAxios from '../hooks/useAxios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Appbar, Button} from 'react-native-paper';
import {wp} from '../helper/hpwp';
import {formatBTC} from '../utils/NumerConvertor';
import {useAuth} from '../hooks/useAuth';

export default function LevelReports() {
  const {fetchData} = useAxios();
  const {openSidebar} = useSidebar();

  const [activeTab, setActiveTab] = useState('downline');

  return (
    <View style={styles.container}>
      <Appbar.Header style={{width: wp(100)}}>
        <Appbar.Action icon="menu" onPress={openSidebar} />
        <Appbar.Content title="Level Report" />
      </Appbar.Header>

      {/* Custom Tab Bar */}
      {/* <View style={styles.tabBar}>
        <Button
          mode={activeTab === 'upline' ? 'contained' : 'text'}
          onPress={() => setActiveTab('upline')}
          style={styles.tabButton}
          labelStyle={styles.tabLabel}>
          Upline
        </Button>
        <Button
          mode={activeTab === 'downline' ? 'contained' : 'text'}
          onPress={() => setActiveTab('downline')}
          style={styles.tabButton}
          labelStyle={styles.tabLabel}>
          Your Referrals
        </Button>
      </View> */}

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'upline' ? <UplineNetwork /> : <DownlineNetwork />}
      </View>
    </View>
  );
}

// Keep the UplineNetwork and DownlineNetwork components the same as before
// Keep the styles the same as before

const UplineNetwork = () => {
  const {fetchData} = useAxios();
  const [uplineTree, setUplineTree] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {userDetails} = useAuth();

  const getCommission = async () => {
    try {
      const {data} = await fetchData({
        url: '/user/income/getCommission',
      });

      if (data?.data) {
        // Sort by level ascending to match previous order
        const sorted = data.data.sort((a, b) => a.level - b.level);
        setUplineTree(sorted);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Failed to fetch commission data:', error);
    }
  };

  useEffect(() => {
    getCommission();
  }, []);
  console.log(uplineTree);

  return (
    <View style={uplineStyles.tabContainer}>
      <Text style={uplineStyles.header}>Your Upline Network</Text>

      <View style={uplineStyles.treeContainer}>
        {uplineTree.length > 0 && (
          <Animated.View
            style={[uplineStyles.rootUserCard, {opacity: fadeAnim}]}>
            <View style={[uplineStyles.avatar, uplineStyles.rootAvatar]}>
              <Icon name="star" size={24} color="#fff" />
            </View>
            <View style={uplineStyles.userInfo}>
              <Text style={uplineStyles.userName}>
                {uplineTree[uplineTree.length - 1].email}
              </Text>
              {/* <Text style={uplineStyles.userLevel}>
                Level {uplineTree[uplineTree.length - 1].level} (Root)
              </Text> */}
              <Text style={uplineStyles.userBTC}>
                Earned :{formatBTC(uplineTree[uplineTree.length - 1].totalBTC)}{' '}
                BTC
                {/* Earned: {uplineTree[uplineTree.length - 1].totalBTC} BTC */}
              </Text>
            </View>
            <View style={uplineStyles.badge}>
              <Text style={uplineStyles.badgeText}>FOUNDER</Text>
            </View>
          </Animated.View>
        )}

        {uplineTree
          .slice(0, -1)
          .reverse()
          .map((user, index) => (
            <Animated.View
              key={user.toUserId}
              style={[
                uplineStyles.treeBranch,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20 * (index + 1), 0],
                      }),
                    },
                  ],
                },
              ]}>
              <View style={uplineStyles.connectorLine} />
              <View style={uplineStyles.userCard}>
                <View style={[uplineStyles.avatar, uplineStyles.uplineAvatar]}>
                  <Icon name="person-outline" size={24} color="#fff" />
                </View>
                <View style={uplineStyles.userInfo}>
                  <Text style={uplineStyles.userName}>{user.email}</Text>
                  <Text style={uplineStyles.userLevel}>Level {user.level}</Text>
                  <Text style={uplineStyles.userBTC}>
                    Earned: {user.totalBTC} BTC
                  </Text>
                </View>
                <Icon name="arrow-downward" size={20} color="#4CAF50" />
              </View>
            </Animated.View>
          ))}

        <Animated.View
          style={[uplineStyles.currentUserCard, {opacity: fadeAnim}]}>
          <View style={uplineStyles.avatar}>
            <Icon name="person" size={28} color="#fff" />
          </View>
          <View style={uplineStyles.userInfo}>
            <Text style={uplineStyles.userName}>You ({userDetails.email})</Text>
            <Text style={uplineStyles.userLevel}>Level 0</Text>
          </View>
          <View style={uplineStyles.badge}>
            <Text style={uplineStyles.badgeText}>CURRENT</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const DownlineNetwork = () => {
  const {userDetails} = useAuth();
  const {fetchData} = useAxios();
  const [downlineTree, setDownlineTree] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [commissions, setCommissions] = useState([]);

  const getReports = async () => {
    try {
      const res = await fetchData({
        url: '/user/auth/myReferal?type=downline',
      });

      const {downlines, commissions} = res.data.data;
      console.log(res.data.data);

      // const datas  = res.data.data.downlines.map((user)=>{
      //   let btc =0
      //   if(user._id)

      // })
      const downlineWithCommission = downlines.map(user => {
        // Filter commissions for this user
        const userCommissions = commissions.filter(
          c => c.toUser._id === user._id,
        );

        // Sum btcAmount values
        const totalBTC = userCommissions.reduce((sum, c) => {
          return sum + parseFloat(c.btcAmount);
        }, 0);

        return {
          ...user,
          totalBTC: totalBTC.toFixed(11), // Optional: to keep BTC in fixed decimal format
        };
      });
      setCommissions(res.data.data.commissions);
      setDownlineTree(downlineWithCommission);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getReports();
  }, []);
  const calculateUserCommissions = (userId, transactions) => {
    if (!transactions || !Array.isArray(transactions)) return 0;

    const total = transactions
      .filter(t => t.fromUser._id === userId)
      .reduce((sum, t) => sum + Number(t.btcAmount), 0);

    return parseFloat(total.toFixed(12));
  };

  console.log(downlineTree)
  return (
    <>
      <ScrollView contentContainerStyle={styles.tabContainer}>
        <Text style={styles.header}>Your Referral Network</Text>

        {downlineTree.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={60} color="#dadce0" />
            <Text style={styles.emptyText}>No referrals yet</Text>
            <Text style={styles.emptySubText}>
              Share your referral code to invite others
            </Text>
          </View>
        ) : (
          <View style={styles.treeContainer}>
            {/* Current User (You) */}
            <Animated.View
              style={[styles.currentUserCard, {opacity: fadeAnim}]}>
              <View style={styles.avatar}>
                <Icon name="person" size={28} color="#fff" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>You</Text>
                <Text style={styles.userLevel}>Level 0</Text>
                <Text style={styles.comissions}>
                  Total Commissions:{' '}
                  {calculateUserCommissions(userDetails._id, commissions)} BTC
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>YOU</Text>
              </View>
            </Animated.View>

            {/* Downline Users */}
            {downlineTree.map((user, index) => {
              const userCommissions = calculateUserCommissions(
                user._id,
                commissions,
              );
              return (
                <Animated.View
                  key={user._id}
                  style={[
                    styles.treeBranch,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20 * (index + 1), 0],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <View style={styles.connectorLine} />
                  <View style={styles.userCard}>
                    <View style={[styles.avatar, styles.downlineAvatar]}>
                      <Icon name="person-outline" size={24} color="#fff" />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.referId}</Text>
                      <Text style={styles.userLevel}>Level {user.level}</Text>
                      <Text style={styles.comissions}>
                        Commissions: {user?.totalBTC} BTC
                      </Text>
                    </View>
                    <Icon name="arrow-downward" size={20} color="#EA4335" />
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </>
  );
};

const uplineStyles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  treeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rootUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e67e22',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    width: '95%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rootAvatar: {
    backgroundColor: '#e67e22',
  },
  uplineAvatar: {
    backgroundColor: '#2ecc71',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  userBTC: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7f8c8d',
    textTransform: 'uppercase',
  },
  treeBranch: {
    width: '100%',
    alignItems: 'center',
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#bdc3c7',
    marginVertical: 4,
  },
});

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  tabButton: {
    flex: 1,
    borderRadius: 0,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 10,
  },

  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 25,
    textAlign: 'center',
  },
  treeContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  rootUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA4335',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  rootAvatar: {
    backgroundColor: '#EA4335',
  },
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34A853',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uplineAvatar: {
    backgroundColor: '#FBBC05',
    width: 36,
    height: 36,
  },
  downlineAvatar: {
    backgroundColor: '#34A853',
    width: 36,
    height: 36,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
  },
  userLevel: {
    fontSize: 14,
    color: '#5f6368',
    marginTop: 2,
  },
  joinDate: {
    fontSize: 12,
    color: '#9aa0a6',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#202124',
    fontSize: 10,
    fontWeight: 'bold',
  },
  treeBranch: {
    marginLeft: 30,
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    height: 20,
    width: 2,
    backgroundColor: '#dadce0',
    left: 20,
    top: -20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#5f6368',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9aa0a6',
    marginTop: 5,
    textAlign: 'center',
  },
  comissions: {
    color: 'green',
  },
});
