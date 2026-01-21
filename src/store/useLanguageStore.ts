import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'ru' | 'hy';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'hy', name: 'Armenian', nativeName: 'Hayeren', flag: '🇦🇲' },
];

const LANGUAGE_KEY = '@app_language';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'hy',
  
  setLanguage: async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      set({ language: lang });
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
  
  loadLanguage: async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && ['en', 'ru', 'hy'].includes(savedLanguage)) {
        set({ language: savedLanguage as Language });
      } else {
        // Default to Armenian if no saved language
        set({ language: 'hy' });
      }
    } catch (error) {
      console.error('Error loading language:', error);
      // Default to Armenian on error
      set({ language: 'hy' });
    }
  },
}));
