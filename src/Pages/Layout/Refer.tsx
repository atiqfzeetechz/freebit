import { StyleSheet, View, ScrollView, Linking, FlatList, Share } from 'react-native';
import React, { useEffect, useState } from 'react';
import useAxios from '../../hooks/useAxios';
import { useIsFocused } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, Text, useTheme, Snackbar, List } from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Refer() {
  const { fetchData } = useAxios();
  const isFocused = useIsFocused();
  const theme = useTheme();
  const [referralData, setReferralData] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);
  const [visibleSnackbar, setVisibleSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const myReferral = async () => {
    try {
      const response = await fetchData({
        url: '/user/auth/my-referrals',
      });
      console.log(response);
      if (response.data?.success) {
        setReferralData(response.data.data[0]);
         setReferralHistory(response.data.data);
        // Fetch referral history separately if needed
        await fetchReferralHistory();
      }
    } catch (error) {
      setSnackbarMessage('Failed to fetch referral data');
      setVisibleSnackbar(true);
    }
  };

  // const fetchReferralHistory = async () => {
  //   try {
  //     const response = await fetchData({
  //       url: '/user/auth/my-referrals', // Adjust this endpoint as per your API
  //     });
  //     console.log(response)
  //     if (response.data?.success) {
  //       console.log(response.data)
  //       setReferralHistory(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching referral history:', error);
  //   }
  // };

  const copyToClipboard = () => {
    if (referralData?.referralCode) {
      Clipboard.setString(referralData.referralCode);
      setSnackbarMessage('Referral code copied to clipboard!');
      setVisibleSnackbar(true);
    }
  };
  const onShare = async () => {
    const message = `Join using my referral code: ${referralData.referralCode}\n\nGet bonus rewards when you sign up!`;
    try {
      const result = await Share.share({
        message:message
      });
     
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const shareReferral = async () => {
    onShare()
    return 
    try {
      
      await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
    } catch (error) {
      setSnackbarMessage('WhatsApp not installed');
      setVisibleSnackbar(true);
    }
  };

  useEffect(() => {
    if (isFocused) {
      myReferral();
    }
  }, [isFocused]);

  const renderHistoryItem = ({ item }) => (
    <List.Item
      title={item.email}
      left={props => <List.Icon {...props} icon="account-plus" />}
      right={props => <Text {...props} style={styles.rewardText}>+{item.reward || '0'} points</Text>}
    />
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Refer & Earn</Title>
          <Paragraph style={styles.description}>
            Invite friends and earn rewards when they join using your referral code.
          </Paragraph>

          {referralData ? (
            <>
              <View style={styles.referralContainer}>
                <Text style={styles.label}>Your Referral Code:</Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.code}>{referralData.referralCode}</Text>
                  <Button 
                    mode="text" 
                    onPress={copyToClipboard}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={20} color={theme.colors.primary} />
                  </Button>
                </View>
              </View>

              <View style={styles.stepsContainer}>
                <Title style={styles.howItWorks}>How It Works</Title>
                <View style={styles.step}>
                  <Icon name="numeric-1-circle" size={24} color={theme.colors.primary} />
                  <Text style={styles.stepText}>Share your referral code with friends</Text>
                </View>
                <View style={styles.step}>
                  <Icon name="numeric-2-circle" size={24} color={theme.colors.primary} />
                  <Text style={styles.stepText}>They sign up using your code</Text>
                </View>
                <View style={styles.step}>
                  <Icon name="numeric-3-circle" size={24} color={theme.colors.primary} />
                  <Text style={styles.stepText}>You both earn rewards!</Text>
                </View>
              </View>

              <Button 
                mode="contained" 
                onPress={shareReferral}
                style={styles.shareButton}
                icon="share-variant"
              >
                Share 
              </Button>
            </>
          ) : (
            <Text style={styles.loadingText}>Loading referral data...</Text>
          )}
        </Card.Content>
      </Card>

      {/* Referral History Section */}
      <Card style={[styles.card, styles.historyCard]}>
        <Card.Content>
          <Title style={styles.historyTitle}>Your Referral History</Title>
          {referralHistory.length > 0 ? (
            <FlatList
              data={referralHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyHistory}>
              <Icon name="information-outline" size={24} color={theme.colors.text} />
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
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 24,
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