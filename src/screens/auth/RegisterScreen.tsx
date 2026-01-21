import React, { useState } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextInputField } from '../../components/ui/TextInputField';
import { Button } from '../../components/ui/Button';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

import { API_BASE_URL, API_URL, TOKEN_KEY, USER_DATA_KEY } from '../../config/api';
export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // Basic phone validation
    if (phone.trim().length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number.');
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
        Alert.alert('Error', 'Registration successful but no token received.');
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

      Alert.alert('Success', 'Registration successful!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigation will be handled by RootNavigator based on auth state
            // It will automatically navigate to AppTabs (Profile) when token is set
          },
        },
      ]);
    } catch (e: any) {
      console.error('Registration error:', e);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to create account. Please try again.';
      Alert.alert('Error', errorMessage);
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
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInputField
        label="Password"
        secureTextEntry
        placeholder="Enter your password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
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

