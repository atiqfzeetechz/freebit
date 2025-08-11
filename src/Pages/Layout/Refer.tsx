import {
  StyleSheet,
  View,
  ScrollView,
  Linking,
  FlatList,
  Share,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import useAxios from '../../hooks/useAxios';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  useTheme,
  Snackbar,
  List,
  Avatar,
} from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';
import CopySvg from '../../../assets/svg/copy.svg';
import ShareSvg from '../../../assets/svg/share.svg';
import UserSvg from '../../../assets/svg/user.svg';

export default function Refer() {
  const { fetchData } = useAxios();
  const isFocused = useIsFocused();
  const theme = useTheme();
  const [referralHistory, setReferralHistory] = useState([]);
  const [visibleSnackbar, setVisibleSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { userDetails } = useAuth();
  const navigation = useNavigation()

  const myReferral = async () => {
    try {
      const response = await fetchData({
        url: '/user/auth/myReferal?type=downline',
      });
      if (response.data?.success) {
        console.log(response.data.data);
        setReferralHistory(response.data.data);
      }
    } catch (error) {
      setSnackbarMessage('Failed to fetch referral data');
      setVisibleSnackbar(true);
    }
  };

  const copyToClipboard = () => {
    if (userDetails?.referralCode) {
      Clipboard.setString(userDetails.referralCode);
      setSnackbarMessage('Referral code copied to clipboard!');
      setVisibleSnackbar(true);
    }
  };

  const onShare = async () => {
    const message = `Join using my referral code: ${userDetails.referralCode}\n\nGet bonus rewards when you sign up!`;
    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      setSnackbarMessage(error.message);
      setVisibleSnackbar(true);
    }
  };

  useEffect(() => {
    if (isFocused) {
      myReferral();
    }
  }, [isFocused]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await myReferral();
    setRefreshing(false);
  };

  const renderHistoryItem = ({ item }) => (
    <>
      {item.level == 1 && (
        <List.Item
          title={item.email || 'New User'}
          description={item?.referId}
          left={props => (
            <List.Icon
              {...props}
              icon={() => (
                <>
                  <UserSvg width={25} height={25} />
                </>
              )}
            />
          )}
          // right={props => (
          //   <Text {...props} style={styles.rewardText}>
          //     +{item.reward || '0'} points
          //   </Text>
          // )}
        />
      )}
    </>
  );

  
  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      refreshControl={
        <RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />
      }
    >
      {/* User Profile Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={64}
              label={userDetails?.email?.charAt(0).toUpperCase() || 'U'}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.email}>{userDetails?.email}</Title>
              <Text style={styles.memberSince}>
                Member since:{' '}
                {new Date(userDetails?.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userDetails?.referralCount || 0}
              </Text>
              <Text style={styles.statLabel}>Referrals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {referralHistory?.totalCommission || '0.00000000'}
              </Text>
              <Text style={styles.statLabel}>Referal BTC Balance</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.statItem,
              {
                // backgroundColor:"gray",
                maxWidth: 150,
                alignSelf:"center"
              },
            ]}
            onPress={() => {
              // Handle the press event here
              console.log('Teams pressed');
              // You might want to navigate to a teams screen:
              // navigation.navigate('Teams');
            }}
          >
            
            <Text style={styles.statValue}>
             Your Team ({referralHistory?.downlines?.length || 0} )
            </Text>
            <Button mode="contained" onPress={() => navigation.navigate('levelreports')}>
              Details ⏩
            </Button>

          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Referral Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Refer & Earn</Title>
          <Paragraph style={styles.description}>
            Invite friends and earn rewards when they join using your referral
            code.
          </Paragraph>

          <View style={styles.referralContainer}>
            <Text style={styles.label}>Your Referral Code:</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.code}>
                {userDetails?.referralCode || '------'}
              </Text>
              <Button
                mode="text"
                onPress={copyToClipboard}
                style={styles.copyButton}
              >
                <CopySvg height={30} width={30} />
              </Button>
            </View>
          </View>

          <View style={styles.stepsContainer}>
            <Title style={styles.howItWorks}>How It Works</Title>
            <View style={styles.step}>
              {/* <Icon
                name="numeric-1-circle"
                size={24}
                color={theme.colors.primary}
              /> */}
              <Text style={styles.stepText}>
                Share your referral code with friends
              </Text>
            </View>
            <View style={styles.step}>
              {/* <Icon
                name="numeric-2-circle"
                size={24}
                color={theme.colors.primary}
              /> */}
              <Text style={styles.stepText}>They sign up using your code</Text>
            </View>
            <View style={styles.step}>
              {/* <Icon
                name="numeric-3-circle"
                size={24}
                color={theme.colors.primary}
              /> */}
              <Text style={styles.stepText}>You both earn rewards!</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={onShare}
            style={styles.shareButton}
            icon={() => {
              return <ShareSvg height={30} width={30} />;
            }}
          >
            Share Your Code
          </Button>
        </Card.Content>
      </Card>

      {/* Referral History Section */}
      <Card style={[styles.card, styles.historyCard]}>
        <Card.Content>
          <Title style={styles.historyTitle}>Your Referral History</Title>
          {referralHistory?.downlines?.length > 0 ? (
            <FlatList
              data={referralHistory?.downlines}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyHistory}>
              {/* <Icon
                name="information-outline"
                size={24}
                color={theme.colors.text}
              /> */}
              <Text style={styles.emptyText}>No referrals yet</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Snackbar
        visible={visibleSnackbar}
        onDismiss={() => setVisibleSnackbar(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.primary }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  historyCard: {
    marginTop: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#6200ee',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberSince: {
    color: '#666',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    padding: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  referralContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  code: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  copyButton: {
    marginLeft: 8,
  },
  stepsContainer: {
    marginVertical: 16,
  },
  howItWorks: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 16,
    marginLeft: 8,
  },
  shareButton: {
    marginTop: 24,
  },
  rewardText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    marginLeft: 8,
    color: '#666',
  },
});
