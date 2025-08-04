import {
  StyleSheet,
  View,
  TextInput,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import {useTheme} from 'react-native-paper';
import axios from 'axios';
import useAxios from '../hooks/useAxios';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {showNotification} from '../utils/Notify';
import Toast from 'react-native-toast-message';

interface FormData {
  email: string;
  referCode: string;
  newReferCode?: string;
  newEmail: string;
  password: string;
}

export default function InvalidUserRegForm() {
  const theme = useTheme();
  const route = useRoute();
  const params = route.params;
  const navigation = useNavigation();
  console.log(params);
  const paramsEmail = params.email;
  const [formData, setFormData] = useState<FormData>({
    email: paramsEmail || '',
    referCode: '',
    newEmail: '',
    password: '',
  });

  const {fetchData} = useAxios();
  const [step, setStep] = useState<1 | 2>(1); // 1: initial form, 2: success step
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({...prev, [name]: value}));
    if (error) setError('');
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!formData.email && !formData.referCode) {
      setError('Please fill all fields');
      return;
    }
    if (formData.email && formData.referCode) {
      setStep(2);
    }

    console.log('called');

    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const res = await fetchData({
        url: '/user/auth/getUserWithEmailOrReferCode',
        method: 'POST',
        data: formData,
      });
      console.log(res);
      if (res?.data.success) {
        const user = res.data.data;
        console.log(user);
        setFormData(prev => ({
          ...prev, // Keep existing fields
          email: user.email,
          referCode: user.referralCode,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    console.log('submitted');
    console.log(formData.newEmail);
    if (!formData.newEmail.endsWith('.com')) {
      setError('Invalid Email');
      return;
    }
    if (formData.password.length < 8) {
      setError('password too short');
      return;
    }
    try {
      const res = await fetchData({
        url: '/user/auth/createAccountofInvalidUser',
        method: 'POST',
        data: formData,
      });
      console.log(res);
      const data = res?.data;
      if (res?.data.success) {
        // showNotification(res.data.message || 'User Created', 'success');
        navigation.navigate('Login', {
          email: formData.newEmail,
          password: formData.password,
        });
      }
    } catch (err) {
      // return
      setError(err.response?.data?.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Toast position="top" swipeable topOffset={100} />
      <View style={styles.card}>
        <Text style={[styles.title, {color: theme.colors.primary}]}>
          {step === 1 ? 'Account Registration' : 'Create New Referral'}
        </Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Validation successful! Please create a new referral code
            </Text>
          </View>
        )}

        {step === 1 ? (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={text => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Referral Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter referral code"
                placeholderTextColor="#999"
                value={formData.referCode}
                onChangeText={text => handleChange('referCode', text)}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, {backgroundColor: theme.colors.primary}]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Validate</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Add New Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Add new Email"
                placeholderTextColor="#999"
                value={formData.newEmail}
                onChangeText={text => handleChange('newEmail', text)}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Add Password</Text>
              <TextInput
                style={styles.input}
                placeholder="password"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={text => handleChange('password', text)}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, {backgroundColor: theme.colors.primary}]}
              onPress={handleFinalSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Complete Registration</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#eeffee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccffcc',
  },
  successText: {
    color: '#00aa00',
    textAlign: 'center',
  },
});
