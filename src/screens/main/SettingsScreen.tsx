import React, { useEffect } from 'react';
import { Text, View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore, LANGUAGES, Language } from '../../store/useLanguageStore';

const USER_DATA_KEY = '@user_data';
const TOKEN_KEY = '@auth_token';

export const SettingsScreen: React.FC = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const { language, setLanguage, loadLanguage } = useLanguageStore();

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
  };

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

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.languageList}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  language === lang.code && styles.languageItemSelected,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <View style={styles.languageTextContainer}>
                  <Text
                    style={[
                      styles.languageName,
                      language === lang.code && styles.languageNameSelected,
                    ]}
                  >
                    {lang.name}
                  </Text>
                  <Text style={styles.languageNativeName}>{lang.nativeName}</Text>
                </View>
                {language === lang.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Section */}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  languageList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#38AA35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 14,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  languageNameSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  languageNativeName: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutSection: {
    marginTop: 8,
  },
});
