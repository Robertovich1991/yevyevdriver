import React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';

const USER_DATA_KEY = '@user_data';
const TOKEN_KEY = '@auth_token';

export const SettingsScreen: React.FC = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const logout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(USER_DATA_KEY);
              await AsyncStorage.removeItem(TOKEN_KEY);
            } catch (e) {
              console.error('Error clearing data:', e);
            }
            setUser(null, null);
            setToken(null);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.logoutSection}>
            <Button title="Log out" onPress={logout} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  logoutSection: {
    marginTop: 8,
  },
});
