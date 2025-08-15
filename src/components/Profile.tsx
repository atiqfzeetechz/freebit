import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import LinearGradient from 'react-native-linear-gradient';
import EyeSvg from '../../assets/svg/eye.svg';
import EyeSlashSvg from '../../assets/svg/eye-slash.svg';
import useAxios from '../hooks/useAxios';
import ErrorDisplay from './ui/ErrorDisplay';
import { useNavigation } from '@react-navigation/native';

export default function UserProfile() {
  const { userDetails ,setuserDetails} = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
 const {fetchData}=useAxios()

 const getUser = async ()=>{
  try{
const res = await fetchData({
  url:"/user/auth/me",
  method:"GET"
})
console.log(res)
if(res?.data.success){
setuserDetails(res.data.data)
}
  }catch(error){

  }
 }

 useEffect(()=>{
  getUser()
 },[])

  const profileData = [
    { label: 'Email', value: userDetails?.email },
    {
      label: 'Wallet Balance',
      value: `${userDetails?.wallet?.balance || '0'} BTC`,
    },
    {
      label: 'Withdrawal Address',
      value: userDetails?.withdrawalAddress || 'Not set',
    },
    {
      label: 'Member Since',
      value: new Date(userDetails?.createdAt).toLocaleDateString(),
    },
    { label: 'Your Referral Code', value: userDetails?.referralCode },
    { label: 'Total Rolls', value: userDetails?.rollCount?.toString() },
    {
      label: 'Account Status',
      value: userDetails?.isValidUser === 'valid' ? 'Verified' : 'Not Verified',
      status: userDetails?.isValidUser === 'valid',
    },
  ];

  const navigation = useNavigation()
  return (
    <LinearGradient
      colors={['#ffffff', '#f8f9fa', '#e9ecef']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>MY ACCOUNT</Text>
          <View
            style={[
              styles.statusPill,
              userDetails?.isValidUser === 'valid'
                ? styles.activePill
                : styles.inactivePill,
            ]}
          >
            <Text style={styles.statusText}>
              {userDetails?.isValidUser === 'valid' ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>ACCOUNT DETAILS</Text>
            {/* <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>
                {userDetails?.wallet?.balance || '0'} BTC
              </Text>
            </View> */}
          </View>

          {profileData.map((item, index) => (
            <View key={index}>
              <View style={styles.detailContainer}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text
                  style={[
                    styles.detailValue,
                    item.label.includes('Address') && styles.monoFont,
                    item.status !== undefined &&
                      (item.status ? styles.verified : styles.notVerified),
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {item.value}
                </Text>
              </View>
              {index < profileData.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <Button
            mode="contained"
            style={styles.primaryButton}
            labelStyle={styles.buttonLabel}
            onPress={() => {
              setModalVisible(true);
            }}
          >
            Save Password
          </Button>

          <Button
            mode="contained"
            style={styles.secondaryButton}
            labelStyle={styles.buttonLabel}
            onPress={() =>navigation.navigate('changeWithdrawlAddress')}
          >
            UPDATE WALLET ADDRESS
          </Button>
        </View>

        {/* Referral Section */}
        {/* <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>YOUR REFERRAL CODE</Text>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCode}>
              {userDetails?.freebtcReferCode}
            </Text>
          </View>
          <Text style={styles.referralText}>
            Share with friends to earn bonuses
          </Text>
        </View> */}
      </ScrollView>
      <ChangePasswordModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </LinearGradient>
  );
}

export const ChangePasswordModal = (props: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}) => {
  const { fetchData, error, setError } = useAxios();
  const { modalVisible, setModalVisible } = props;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [SuccessText, setSuccessText] = useState('');

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      // currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    // if (!currentPassword) {
    //   newErrors.currentPassword = 'Current password is required';
    //   valid = false;
    // }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
      valid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handlePasswordChange = async () => {
    if (validateForm()) {
      const res = await fetchData({
        url: '/user/auth/changepassword',
        method: 'PATCH',
        data: {
          currentPassword,
          newPassword,
        },
        loader: true,
      });
      console.log(res);
      const response = res?.data;

      if (response.success) {
        setSuccessText('Password Updated Succesfully');
        setTimeout(() => {
          resetForm();
        setModalVisible(false);
        setSuccessText('')
        }, 500);

      }
      // Call your API to change password here
      console.log('Password change submitted');
      // Then close modal and reset form
      // setModalVisible(false);
      // resetForm();
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError(null);
  };

  console.log(error);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        resetForm();
        setModalVisible(false);
        setError(null);
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <ErrorDisplay apiError={error} />
            {SuccessText && <Text
            style={{
              fontSize:16,
              color:"green",
              fontWeight:"600",
              textAlign:"center",
              marginBottom:15
            }}
            >{SuccessText}</Text>}

            {/* <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.inputField}
              secureTextEntry={!showCurrentPassword}
              mode="outlined"
              error={!!errors.currentPassword}
              right={
                <TextInput.Icon
                  icon={() => showCurrentPassword ? 
                    <EyeSlashSvg width={20} height={20} /> : 
                    <EyeSvg width={20} height={20} />}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
            /> */}
            {errors.currentPassword ? (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            ) : null}

            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.inputField}
              secureTextEntry={!showNewPassword}
              mode="outlined"
              error={!!errors.newPassword}
              right={
                <TextInput.Icon
                  icon={() =>
                    showNewPassword ? (
                      <EyeSlashSvg width={20} height={20} />
                    ) : (
                      <EyeSvg width={20} height={20} />
                    )
                  }
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
            />
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}

            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.inputField}
              secureTextEntry={!showConfirmPassword}
              mode="outlined"
              error={!!errors.confirmPassword}
              right={
                <TextInput.Icon
                  icon={() =>
                    showConfirmPassword ? (
                      <EyeSlashSvg width={20} height={20} />
                    ) : (
                      <EyeSvg width={20} height={20} />
                    )
                  }
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}

            <View style={styles.modalButtonContainer}>
              <Button
                mode="outlined"
                style={styles.modalCancelButton}
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                style={styles.modalSubmitButton}
                onPress={handlePasswordChange}
                labelStyle={styles.submitButtonLabel}
              >
                Update Password
              </Button>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#212529',
    letterSpacing: 1,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activePill: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderWidth: 1,
    borderColor: '#28a745',
  },
  inactivePill: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    letterSpacing: 0.5,
  },
  balanceContainer: {
    backgroundColor: 'rgba(13, 110, 253, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(13, 110, 253, 0.2)',
  },
  balanceText: {
    color: '#0d6efd',
    fontSize: 16,
    fontWeight: '700',
  },
  detailContainer: {
    marginVertical: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  monoFont: {
    fontFamily: 'monospace',
    color: '#6610f2',
  },
  verified: {
    color: '#28a745',
  },
  notVerified: {
    color: '#dc3545',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 12,
    shadowColor: '#0d6efd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: '#198754',
    borderRadius: 10,
    paddingVertical: 10,
    shadowColor: '#198754',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  referralCard: {
    backgroundColor: 'rgba(13, 110, 253, 0.05)',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  referralTitle: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1,
  },
  referralCodeContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  referralCode: {
    color: '#0d6efd',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
  },
  referralText: {
    color: '#6c757d',
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#212529',
    textAlign: 'center',
  },
  inputField: {
    marginBottom: 5,
    backgroundColor: 'white',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#6c757d',
    borderRadius: 8,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: '#0d6efd',
    borderRadius: 8,
  },
  cancelButtonLabel: {
    color: '#6c757d',
  },
  submitButtonLabel: {
    color: 'white',
  },
});
