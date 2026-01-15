import React, { useState, useEffect } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextInputField } from '../../components/ui/TextInputField';
import { Button } from '../../components/ui/Button';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const USER_DATA_KEY = '@user_data';
const TOKEN_KEY = '@auth_token';
const API_BASE_URL = 'http://192.168.100.12:8000/api/v1';
const API_URL = 'http://192.168.100.12:8000';
export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    // Try to load saved user data on mount
    loadSavedUser();
  }, []);

  const loadSavedUser = async () => {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      if (data) {
        const userData = JSON.parse(data);
        setEmail(userData.email || '');
      }
    } catch (e) {
      // Ignore errors
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      // Make POST request to login endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.toLowerCase().trim(),
        password: password,
      });

      // Extract token from response (adjust based on your API response structure)
      const token = response.data?.token || response.data?.data?.token || response.data?.access_token;
      
      if (!token) {
        Alert.alert('Error', 'Login successful but no token received.');
        return;
      }

      // Save token to AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token);

      // Update user data in AsyncStorage if available from response
      const userId = response.data?.user?.id || response.data?.data?.user?.id || email.toLowerCase().trim();
      const userName = response.data?.user?.name || response.data?.data?.user?.name || '';
      const userPhone = response.data?.user?.phone || response.data?.data?.user?.phone || '';
      
      const userData = {
        name: userName,
        email: email.toLowerCase().trim(),
        phone: userPhone,
        userId: userId,
      };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      // Update auth store
      setToken(token);
      setUser(userId, email);

      Alert.alert('Success', 'Login successful!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigation will be handled by RootNavigator based on auth state
            // It will automatically navigate to AppTabs (Profile) when token is set
          },
        },
      ]);
    } catch (e: any) {
      console.error('Login error:', e);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to login. Please check your credentials and try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Login</Text>
      <TextInputField
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInputField
        label="Password"
        secureTextEntry
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} loading={loading} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Register</Text>
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

