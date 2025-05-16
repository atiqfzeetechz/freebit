import {StyleSheet, View, ScrollView} from 'react-native';
import React, {useEffect} from 'react';
import useAxios from '../hooks/useAxios';
import {useAuth} from '../hooks/useAuth';
import {
  Card,
  Text,
  Divider,
  useTheme as PaperTheme,
  IconButton,
  Avatar,
} from 'react-native-paper';
import useTheme from '../hooks/useTheme';
import { wp } from '../helper/hpwp';

export default function UserProfile() {
  const {fetchData} = useAxios();
  const {setuserDetails, userDetails} = useAuth();
  const theme = PaperTheme();
  const {colors} =useTheme()
  
  const getMe = async () => {
    try {
      const {data} = await fetchData({
        url: '/user/auth/me',
      });
      setuserDetails(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  const renderStatus = (status, text) => (
    <View style={styles.statusContainer}>
      <View
        style={[
          styles.statusIndicator,
          {backgroundColor: status ? '#4CAF50' : '#F44336'},
        ]}
      />
      <Text
        style={[styles.statusText, {color: status ? '#4CAF50' : '#F44336'}]}>
        {text || (status ? 'Active' : 'Inactive')}
      </Text>
    </View>
  );

  const renderDetailRow = (label, value, isStatus = false) => (
    <View style={styles.detailRow}>
      <Text variant="labelMedium" style={styles.detailLabel}>
        {label}
      </Text>
      {isStatus ? (
        renderStatus(value)
      ) : (
        <Text variant="bodyMedium" style={styles.detailValue}>
          {value}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
     
      {/* Profile Header Card */}
      <Card style={[styles.card, styles.profileCard]}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            {/* <Avatar.Text
              size={72}
              label={userDetails?.email?.charAt(0).toUpperCase() || 'U'}
              style={styles.avatar}
            /> */}
            {/* <View style={styles.verifiedBadge}>
              <IconButton
                icon={
                  userDetails?.isEmailVerified
                    ? 'check-decagram'
                    : 'alert-decagram'
                }
                iconColor={userDetails?.isEmailVerified ? '#4CAF50' : '#F44336'}
                size={20}
              />
            </View> */}
          </View>

          <Text variant="titleLarge" style={styles.emailText}>
            {userDetails?.email}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="titleMedium" style={styles.statValue}>
                {userDetails?.referralCount || 0}
              </Text>
              <Text variant="labelSmall" style={styles.statLabel}>
                Referrals
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text variant="titleMedium" style={styles.statValue}>
                {new Date(userDetails?.createdAt).toLocaleDateString()}
              </Text>
              <Text variant="labelSmall" style={styles.statLabel}>
                Joined
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Account Details Card */}
      <Card style={styles.card}>
        <Card.Title
          title="Account Details"
          titleVariant="titleMedium"
          left={props => <IconButton {...props} icon="account-details" />}
        />
        <Card.Content style={styles.cardContent}>
          {renderDetailRow(
            'Email Verified',
            userDetails?.isEmailVerified,
            true,
          )}
          <Divider style={styles.divider} />
          {renderDetailRow('2FA Enabled', userDetails?.is2FAEnabled, true)}
          <Divider style={styles.divider} />
          {renderDetailRow('Referral Code', userDetails?.referralCode)}
        </Card.Content>
      </Card>

      {/* Notification Settings Card */}
      <Card style={styles.card}>
        <Card.Title
          title="Notification Settings"
          titleVariant="titleMedium"
          left={props => <IconButton {...props} icon="bell" />}
        />
        <Card.Content style={styles.cardContent}>
          {renderDetailRow(
            'Payment Notifications',
            userDetails?.emailSubscriptions?.paymentNotifications,
            true,
          )}
          <Divider style={styles.divider} />
          {renderDetailRow(
            'Deposit Notifications',
            userDetails?.emailSubscriptions?.depositNotifications,
            true,
          )}
          <Divider style={styles.divider} />
          {renderDetailRow(
            'Ad Account Notifications',
            userDetails?.emailSubscriptions?.adAccountNotifications,
            true,
          )}
          <Divider style={styles.divider} />
          {renderDetailRow(
            'Promotional Emails',
            userDetails?.emailSubscriptions?.promotions,
            true,
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:wp(100)
    
  },
  contentContainer: {
    padding: 16,
   
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileContent: {
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#6200EE',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 2,
  },
  emailText: {
    marginBottom: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  cardContent: {
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '500',
  },
  divider: {
    marginVertical: 0,
    backgroundColor: '#F5F5F5',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontWeight: '500',
  },
});
