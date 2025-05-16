import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {hp, wp} from '../helper/hpwp';
import colors from '../utils/colors';
import Toast from 'react-native-toast-message';
import {showNotification} from '../utils/Notify';
import {validateEmail, ValidatePassword} from '../utils/fieldvalidator';
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
import {useAuth} from '../hooks/useAuth';

export default function LoginForm(props: any) {
  const {onSubmit} = props;
  const [referrerCode] = useState(55157605);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [referCode, setReferCode] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const theme = useTheme();
  const {fetchData} = useAxios();
  const {login} = useAuth();
  const [SHOWHIDESsTYLES,SETSHOWHIDESSTYLE]=useState({})

  const userLogin = async (payload: {
    email: string;
    password: string;
    twoFACode?: string;
  }) => {
    try {
      const {data} = await fetchData({
        url: '/user/auth/signin',
        method: 'POST',
        data: payload,
      });
      console.log(data);
      const token = data.data.jwt;
      login(token, {...payload, FA2: payload.twoFACode}, 'login');
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = () => {
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) return;
    if (!ValidatePassword(password)) return;
    if (activeTab === 'login') {
      let payload = {
        email: email,
        password: password,
        twoFACode: twoFACode || undefined,
      };
      userLogin(payload);
      return;
    }

    if (activeTab === 'signup') {
      signUp({
        email,
        activeTab,
        password,
        twoFACode,
        referCode,
      });
    }
  };

  const signUp = async (payload: any) => {
    try {
      const data = await fetchData({
        url: '/user/auth/signUp',
        method: 'POST',
        data: payload,
      });
      console.log(data);
      const _data = data.data.data;
      console.log(_data);
      login(_data.jwt, {...payload, FA2: payload.twoFACode}, 'signUp');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={[styles.overlay, {backgroundColor: theme.colors.backdrop}]}>
      <Toast position="top" swipeable topOffset={100} />
      <Card style={styles.card}>
        <Card.Content>
          {/* Tab Buttons */}
          <SegmentedButtons
            value={activeTab}
            onValueChange={value => setActiveTab(value as 'login' | 'signup')}
            buttons={[
              {
                value: 'login',
                label: 'Login',
                style: activeTab === 'login' ? styles.activeSegment : {},
              },
              {
                value: 'signup',
                label: 'Sign Up',
                style: activeTab === 'signup' ? styles.activeSegment : {},
              },
            ]}
            style={styles.segment}
          />

          {/* Title */}
          <Text
            variant="headlineMedium"
            style={[styles.title, {color: theme.colors.primary}]}>
            {activeTab === 'login' ? 'Login' : 'Sign Up'}
          </Text>

          {/* Email */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
          />

          {/* Password */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={secureTextEntry}
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye-off' : 'eye'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />

          {/* 2FA Code */}
          <TextInput
            label="2FA Code (Optional)"
            value={twoFACode}
            onChangeText={setTwoFACode}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            left={<TextInput.Icon icon="shield-lock" />}
          />
          {activeTab === 'signup' && (
            <HelperText type="info" style={styles.helperText}>
              If you already have an account on freebitco.in with 2FA enabled,
              please enter your 2FA code here
            </HelperText>
          )}

          {/* Referral Code */}
          {activeTab === 'signup' && (
            <TextInput
              label="Referral Code"
              value={referCode}
              onChangeText={setReferCode}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account-multiple-plus" />}
            />
          )}

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            labelStyle={styles.buttonLabel}>
            {activeTab === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </Card.Content>
      </Card>
    </View>
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
