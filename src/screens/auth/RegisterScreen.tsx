import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextInputField } from '../../components/ui/TextInputField';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../assets/icons/Icon';
import { theme } from '../../assets/style/theme';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

import { API_BASE_URL, API_URL, TOKEN_KEY, USER_DATA_KEY } from '../../config/api';
import { useAlert } from '../../context/AlertContext';
import {
  ARMENIA_PHONE_PREFIX,
  formatArmeniaPhoneInput,
  isValidArmeniaPhone,
} from '../../utils/phone';
export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(ARMENIA_PHONE_PREFIX);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showAlert('Please fill in all required fields.', 'Error', undefined, 'error');
      return;
    }

    if (!password || password.length < 6) {
      showAlert('Password must be at least 6 characters.', 'Error', undefined, 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Please enter a valid email address.', 'Error', undefined, 'error');
      return;
    }

    if (!isValidArmeniaPhone(phone)) {
      showAlert(
        'Phone number must be +374 followed by 8 digits.',
        'Error',
        undefined,
        'error',
      );
      return;
    }

    try {
      setLoading(true);

      // Combine name and surname if surname exists, otherwise use name
      const fullName = surname ? `${name} ${surname}` : name;

      // Make POST request to register endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: fullName,
        surname: surname || '',
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: password,
      });

      // Extract token from response (adjust based on your API response structure)
      const token = response.data?.token || response.data?.data?.token || response.data?.access_token;
      
      if (!token) {
        showAlert('Registration successful but no token received.', 'Error', undefined, 'error');
        return;
      }

      // Save token to AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token);

      // Save user data to AsyncStorage
      const userData = {
        name: fullName,
        surname: surname || '',
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        userId: response.data?.user?.id || email.toLowerCase().trim(),
      };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      // Update auth store
      setToken(token);
      setUser(userData.userId, email);

      showAlert('Registration successful!', 'Success', [
        {
          text: 'OK',
          onPress: () => {
            // Navigation will be handled by RootNavigator based on auth state
            // It will automatically navigate to AppTabs (Profile) when token is set
          },
        },
      ], 'success');
    } catch (e: any) {
      console.error('Registration error:', e);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to create account. Please try again.';
      showAlert(errorMessage, 'Error', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Register</Text>
      <TextInputField
        label="Name"
        autoCapitalize="words"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <TextInputField
        label="Surname (Optional)"
        autoCapitalize="words"
        placeholder="Enter your surname"
        value={surname}
        onChangeText={setSurname}
      />
      <TextInputField
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInputField
        label="Phone"
        keyboardType="phone-pad"
        placeholder="+374XXXXXXXX"
        value={phone}
        onChangeText={text => setPhone(formatArmeniaPhoneInput(text))}
      />
      <TextInputField
        label="Password"
        secureTextEntry={!showPassword}
        placeholder="Enter your password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        rightElement={
          <TouchableOpacity
            onPress={() => setShowPassword(prev => !prev)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon
              name={showPassword ? 'eye-close' : 'eye'}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        }
      />
      <Button title="Register" onPress={handleRegister} loading={loading} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

