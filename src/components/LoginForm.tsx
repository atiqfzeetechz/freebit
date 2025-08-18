import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { hp, wp } from '../helper/hpwp';
import colors from '../utils/colors';
import Toast from 'react-native-toast-message';
import { showNotification } from '../utils/Notify';
import { validateEmail, ValidatePassword } from '../utils/fieldvalidator';
import {
  Button,
  TextInput,
  Text,
  SegmentedButtons,
  Card,
  useTheme,
  HelperText,
} from 'react-native-paper';
import useAxios from '../hooks/useAxios';
import { useAuth } from '../hooks/useAuth';
import ForInvalidUser from './helper/ForInvalidUser';
import Email from '../../assets/svg/email.svg';
import Password from '../../assets/svg/key.svg';
import EyeSlash from '../../assets/svg/eye-slash.svg';
import Eye from '../../assets/svg/eye.svg';
import Referal from '../../assets/svg/referal.svg';
import Telephone from '../../assets/svg/telephone.svg';
import MyButton from './ui/Button';
import ErrorDisplay from './ui/ErrorDisplay';
import useDeviceInfo from '../hooks/useDeviceInfo';

export default function LoginForm(props: any) {
  const { onSubmit, propsEmail, propsPassword, actTab } = props;
  const [referrerCode, setReferrerCode] = useState(55157605);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
    actTab || 'login',
  );
  const [email, setEmail] = useState(propsEmail || '');
  const [password, setPassword] = useState(propsPassword || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [referCode, setReferCode] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const theme = useTheme();
  const { fetchData, error, setError } = useAxios();
  const deviceInfo = useDeviceInfo();
  const { login, FcmToken } = useAuth();
  const [SHOWHIDESsTYLES, SETSHOWHIDESSTYLE] = useState({});
  const [visible, setVisible] = useState(false);

  const userLogin = async (payload: {
    email: string;
    password: string;
    twoFACode?: string;
    FcmToken: string | undefined | null;
    deviceDetails: any; // ✅ attach device info
  }) => {
    try {
      console.log(payload);
      const res = await fetchData({
        url: '/user/auth/signin',
        method: 'POST',
        data: payload,
        loader: true,
      });
      console.log(res);
      const data = res.data;
      // return
      console.log(data);
      const isValidUser = data.data.user?.isValidUser;

      if (isValidUser === 'invalid') {
        showNotification('You Are not eligble to use our Platform', 'error');
        setVisible(true);
        return;
      }
      if (data.data.user?.isActive === false) {
        showNotification('You have been blocked ', 'error');
        return;
      }
      const token = data.data.jwt;

      login(token, { ...payload, FA2: payload.twoFACode }, 'login');
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = () => {
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) return;
    console.log({ password });
    if (!ValidatePassword(password)) return;
    if (activeTab === 'login') {
      let payload = {
        email: email,
        password: password,
        twoFACode: twoFACode || undefined,
        FcmToken: FcmToken,
        deviceDetails: deviceInfo,
      };
      console.log(payload);
      userLogin(payload);
      return;
    }

    if (activeTab === 'signup') {
      if (password.length < 8) {
        showNotification('Password must be of 8 digits', 'error');
        return;
      }
      if (!mobileNumber) {
        showNotification('Mobile Number is Required', 'error');
        return;
      }
      if (mobileNumber.length < 10) {
        showNotification('Inavlid Mobile Number', 'error');
        return;
      }

      signUp({
        email,
        activeTab,
        password,
        twoFACode,
        referrerCode: referCode,
        FcmToken: FcmToken,
        deviceDetails: deviceInfo,
        mobileNumber: mobileNumber,
      });
    }
  };

  const signUp = async (payload: any) => {
    try {
      const data = await fetchData({
        url: '/user/auth/signUp',
        method: 'POST',
        data: payload,
        loader: true,
      });
      console.log(data);
      const _data = data.data.data;
      console.log(_data);
      login(_data.jwt, { ...payload, FA2: payload.twoFACode }, 'signUp');
    } catch (error) {
      console.log(error);
    }
  };
  console.log(error);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}
        >
          <Toast position="top" swipeable topOffset={100} />
          <Card style={styles.card}>
            <Card.Content>
              {/* Tab Buttons */}
              <SegmentedButtons
                value={activeTab}
                onValueChange={value => {
                  setActiveTab(value as 'login' | 'signup');
                  setError(null);
                }}
                buttons={[
                  {
                    value: 'login',
                    label: 'Login',
                    style: activeTab === 'login' ? styles.activeSegment : {},
                  },
                  {
                    value: 'signup',
                    label: 'Registeration',
                    style: activeTab === 'signup' ? styles.activeSegment : {},
                  },
                ]}
                style={styles.segment}
              />

              {/* Title */}
              <Text
                variant="headlineMedium"
                style={[styles.title, { color: theme.colors.primary }]}
              >
                {activeTab === 'login' ? 'Login' : 'Sign Up'}
              </Text>
              {error && <ErrorDisplay apiError={error} />}
              {/* <FontAwesome name="rocket" size={30} color="#900" />; */}
              {/* Email */}
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                left={
                  <TextInput.Icon
                    icon={() => <Email width={20} height={20} />}
                  />
                }
              />

              {/* Password */}
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry={secureTextEntry}
                mode="outlined"
                left={
                  <TextInput.Icon
                    icon={() => <Password width={20} height={20} />}
                  />
                }
                right={
                  <TextInput.Icon
                    icon={() =>
                      secureTextEntry ? (
                        <EyeSlash width={20} height={20} />
                      ) : (
                        <Eye width={20} height={20} />
                      )
                    }
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  />
                }
              />

              {/* 2FA Code */}
              {/* <TextInput
            label="2FA Code (Optional)"
            value={twoFACode}
            onChangeText={setTwoFACode}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            left={<TextInput.Icon icon="shield-lock" />}
          /> */}
              {/* {activeTab === 'signup' && (
            <HelperText type="info" style={styles.helperText}>
              If you already have an account on freebitco.in with 2FA enabled,
              please enter your 2FA code here
            </HelperText>
          )} */}

              {/* Referral Code */}
              {activeTab === 'signup' && (
                <>
                  <TextInput
                    label="Mobile Number"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    style={styles.input}
                    mode="outlined"
                    left={
                      <TextInput.Icon
                        icon={() => (
                          <Telephone height={20} width={20}></Telephone>
                        )}
                      />
                    }
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                  <TextInput
                    label="Referral Code"
                    value={referCode}
                    onChangeText={setReferCode}
                    style={styles.input}
                    mode="outlined"
                    left={
                      <TextInput.Icon
                        icon={() => <Referal height={20} width={20}></Referal>}
                      />
                    }
                  />
                </>
              )}

              {/* <MyButton
title='Login'
variant='primary'
// loading

/> */}
              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                {activeTab === 'login' ? 'Login' : 'Sign Up'}
              </Button>
            </Card.Content>
          </Card>

          <ForInvalidUser
            visible={visible}
            setVisible={setVisible}
            email={email}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    height: hp(100),
    width: wp(100),
  },
  card: {
    width: wp(90),
    borderRadius: 12,
    padding: wp(1),
  },
  segment: {
    marginBottom: hp(2),
  },
  activeSegment: {
    backgroundColor: colors.primaryLight,
  },
  title: {
    marginBottom: hp(2),
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: hp(1.5),
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: hp(2),
    paddingVertical: hp(0.5),
  },
  buttonLabel: {
    fontSize: hp(2),
    fontWeight: 'bold',
  },
  helperText: {
    marginBottom: hp(1.5),
    fontSize: hp(1.8),
  },
});
