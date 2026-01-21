import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppTabsNavigator } from './AppTabsNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';

export type RootStackParamList = {
  Auth: undefined;
  AppTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const TOKEN_KEY = '@auth_token';

export const RootNavigator: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const loadLanguage = useLanguageStore((s) => s.loadLanguage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      // Load language first (defaults to Armenian)
      await loadLanguage();
      
      // Load token
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        setToken(savedToken);
      }
    } catch (e) {
      console.error('Error loading app data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="AppTabs" component={AppTabsNavigator} />
      )}
    </Stack.Navigator>
  );
};


