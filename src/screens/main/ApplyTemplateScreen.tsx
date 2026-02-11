import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../assets/icons/Icon';
import { colors } from '../../assets/style/colors';
import { typography } from '../../assets/style/typography';
import { spacing } from '../../assets/style/spacing';
import type { ScheduleStackParamList } from '../../navigation/ScheduleStackNavigator';
import { formatDateForApi } from '../../types/availability';
import { useLanguageStore } from '../../store/useLanguageStore';
import { getAvailabilityTemplateTranslations } from '../../i18n/translations';
import { API_BASE_URL, TOKEN_KEY } from '../../config/api';

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

type NavigationProp = NativeStackNavigationProp<
  ScheduleStackParamList,
  'ApplyTemplate'
>;
type RouteProps = RouteProp<ScheduleStackParamList, 'ApplyTemplate'>;

export const ApplyTemplateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const language = useLanguageStore(s => s.language);
  const t = useMemo(
    () => getAvailabilityTemplateTranslations(language),
    [language],
  );

  const { template } = route.params;

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => addDays(new Date(), 6));
  const [overwrite, setOverwrite] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (date) {
      setStartDate(date);
      if (date > endDate) {
        setEndDate(date);
      }
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (date) {
      setEndDate(date);
    }
  };

  const handleApply = async () => {
    if (startDate > endDate) {
      Alert.alert(t.error, t.invalidDateRange);
      return;
    }

    try {
      setApplying(true);
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        Alert.alert(t.error, t.authTokenNotFound);
        return;
      }

      const payload = {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
        overwrite,
      };

      const response = await axios.post(
        `${API_BASE_URL}/availability-templates/apply/${template.id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = response.data?.result || {};
      Alert.alert(
        t.applyResultTitle,
        `${t.created}: ${result.created || 0}\n${t.updated}: ${
          result.updated || 0
        }\n${t.skipped}: ${result.skipped || 0}`,
      );
      navigation.goBack();
    } catch (e: any) {
      console.error('Apply template error:', e);
      Alert.alert(t.error, e.response?.data?.message || t.applyFailed);
    } finally {
      setApplying(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.applyTemplate}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>{template.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.dateRange}</Text>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>{t.startDate}</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formatDateForApi(startDate)}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>{t.endDate}</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formatDateForApi(endDate)}
            </Text>
          </TouchableOpacity>
        </View>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartDateChange}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndDateChange}
            minimumDate={startDate}
          />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <Text style={styles.sectionTitle}>{t.overwrite}</Text>
          <Switch
            value={overwrite}
            onValueChange={setOverwrite}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={overwrite ? colors.primary : colors.white}
          />
        </View>
        <Text style={styles.helperText}>{t.overwriteHelp}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title={applying ? t.applying : t.applyButton}
          onPress={handleApply}
          disabled={applying}
          loading={applying}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  dateLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  dateButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.round,
    backgroundColor: colors.background,
  },
  dateButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    marginTop: spacing.md,
  },
});
