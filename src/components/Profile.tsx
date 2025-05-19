import React, {useEffect, useState} from 'react';
import {StyleSheet, View, ScrollView, Alert} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import useAxios from '../hooks/useAxios';
import {useAuth} from '../hooks/useAuth';
import {
  Card,
  Text,
  Divider,
  useTheme as PaperTheme,
  IconButton,
  Avatar,
  Button,
  Portal,
  Modal,
} from 'react-native-paper';
import useTheme from '../hooks/useTheme';
import {wp} from '../helper/hpwp';
import { imageFullUrl } from '../utils/urlConvertor';

export default function UserProfile() {
  const {fetchData} = useAxios();
  const {setuserDetails, userDetails} = useAuth();
  const theme = PaperTheme();
  const {colors} = useTheme();
  const [avatarSource, setAvatarSource] = useState(null);
  const [visible, setVisible] = useState(false);

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

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleImagePicker = async type => {
    hideModal();
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
    };

    try {
      const response = await (type === 'camera'
        ? launchCamera
        : launchImageLibrary)(options);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to select image');
      } else if (response.assets && response.assets[0].uri) {
        const source = {uri: response.assets[0].uri};
        const asset = response.assets[0];
        const imageFile = {
          uri: asset.uri,
          type: 'image/jpg' || 'image/jpeg',
          name:
            asset.fileName ||
            `profile_image_${Date.now()}.${asset.uri.split('.').pop()}`,
          filename:
            asset.fileName ||
            `profile_image_${Date.now()}.${asset.uri.split('.').pop()}`,
        };

        uploadImage(imageFile);
    
      }
    } catch (error) {
      console.log('ImagePicker Error: ', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadImage = async (_data: any) => {
    const payload = new FormData();
    payload.append('profile-image', _data);
    try {
      const res = await fetchData({
        url: '/user/auth/update-profile',
        method: 'PATCH',
        data: payload,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res);
      getMe()
    } catch (error) {
      console.log(error);
    }
  };

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
            {userDetails?.profileImage ? (
              <Avatar.Image
                size={100}
                source={{
                  uri:imageFullUrl(userDetails?.profileImage)
                }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                size={100}
                label={userDetails?.email?.charAt(0).toUpperCase() || 'U'}
                style={styles.avatar}
              />
            )}
            <IconButton
              icon="pencil"
              size={20}
              style={styles.editButton}
              onPress={showModal}
              iconColor="white"
            />
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

      {/* Bottom Modal for Image Selection */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text variant="titleMedium" style={styles.modalTitle}>
              Update Profile Picture
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                icon="camera"
                onPress={() => handleImagePicker('camera')}
                style={styles.modalButton}>
                Take Photo
              </Button>
              <Button
                mode="contained"
                icon="image"
                onPress={() => handleImagePicker('gallery')}
                style={styles.modalButton}>
                Choose from Gallery
              </Button>
              <Button
                mode="outlined"
                onPress={hideModal}
                style={styles.modalButton}>
                Cancel
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp(100),
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
    width: 100,
    height: 100,
  },
  editButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'green',
    borderRadius: 20,
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
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalContent: {
    padding: 10,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    gap: 10,
  },
  modalButton: {
    borderRadius: 5,
  },
});
