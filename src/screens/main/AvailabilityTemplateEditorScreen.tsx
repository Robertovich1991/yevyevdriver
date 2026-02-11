import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { TimeSlotSelector } from '../../components/forms/TimeSlotSelector';
import { Icon } from '../../assets/icons/Icon';
import { colors } from '../../assets/style/colors';
import { typography } from '../../assets/style/typography';
import { spacing } from '../../assets/style/spacing';
import type { ScheduleStackParamList } from '../../navigation/ScheduleStackNavigator';
import type {
  AvailabilityStatus,
  AvailabilityTemplate,
  WeekdayKey,
  WeekPattern,
} from '../../types/availability';
import { WEEKDAY_KEYS } from '../../types/availability';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  getAvailabilityTemplateTranslations,
  getAvailabilityCalendarTranslations,
  getCreateEditAvailabilityTranslations,
} from '../../i18n/translations';
import { API_BASE_URL, TOKEN_KEY, USER_DATA_KEY } from '../../config/api';

const STATUS_OPTIONS: AvailabilityStatus[] = [
  'available',
  'not-available',
  'conditional',
];

type NavigationProp = NativeStackNavigationProp<
  ScheduleStackParamList,
  'AvailabilityTemplateEditor'
>;
type RouteProps = RouteProp<
  ScheduleStackParamList,
  'AvailabilityTemplateEditor'
>;

const buildEmptyWeekPattern = (): WeekPattern =>
  WEEKDAY_KEYS.reduce((acc, day) => ({ ...acc, [day]: {} }), {} as WeekPattern);

const normalizeWeekPattern = (pattern?: WeekPattern): WeekPattern => {
  const normalized = buildEmptyWeekPattern();
  WEEKDAY_KEYS.forEach(day => {
    normalized[day] = pattern?.[day] || {};
  });
  return normalized;
};

export const AvailabilityTemplateEditorScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const language = useLanguageStore(s => s.language);
  const t = useMemo(
    () => getAvailabilityTemplateTranslations(language),
    [language],
  );
  const tCalendar = useMemo(
    () => getAvailabilityCalendarTranslations(language),
    [language],
  );
  const tAvailability = useMemo(
    () => getCreateEditAvailabilityTranslations(language),
    [language],
  );

  const { template, isEditing } = route.params || {};

  const [name, setName] = useState('');
  const [selectedDay, setSelectedDay] = useState<WeekdayKey>('mon');
  const [weekPattern, setWeekPattern] = useState<WeekPattern>(() =>
    buildEmptyWeekPattern(),
  );
  const [currentStatus, setCurrentStatus] =
    useState<AvailabilityStatus>('available');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setWeekPattern(normalizeWeekPattern(template.weekPattern));
    }
  }, [template]);

  const dayLabelMap = useMemo(
    () => ({
      mon: tCalendar.monday,
      tue: tCalendar.tuesday,
      wed: tCalendar.wednesday,
      thu: tCalendar.thursday,
      fri: tCalendar.friday,
      sat: tCalendar.saturday,
      sun: tCalendar.sunday,
    }),
    [tCalendar],
  );

  const handleCopyToOtherDays = () => {
    setWeekPattern(prev => {
      const source = prev[selectedDay];
      const updated = { ...prev };
      WEEKDAY_KEYS.forEach(day => {
        if (day !== selectedDay) {
          updated[day] = { ...source };
        }
      });
      return updated;
    });
    Alert.alert(t.success, t.copiedToOtherDays);
  };

  const updateSelectedDaySlots = (nextSlots: {
    [time: string]: AvailabilityStatus;
  }) => {
    setWeekPattern(prev => ({ ...prev, [selectedDay]: nextSlots }));
  };

  const handleSlotToggle = (time: string) => {
    const daySlots = weekPattern[selectedDay] || {};
    const updated = { ...daySlots };
    if (updated[time] === currentStatus) {
      delete updated[time];
    } else {
      updated[time] = currentStatus;
    }
    updateSelectedDaySlots(updated);
  };

  const handleBatchSlotUpdate = (updates: {
    [time: string]: AvailabilityStatus | null;
  }) => {
    const daySlots = { ...weekPattern[selectedDay] };
    Object.entries(updates).forEach(([time, status]) => {
      if (status === null) {
        delete daySlots[time];
      } else {
        daySlots[time] = status;
      }
    });
    updateSelectedDaySlots(daySlots);
  };

  const validateForm = (): { valid: boolean; error?: string } => {
    if (!name.trim()) {
      return { valid: false, error: t.validationNameRequired };
    }

    const hasAnySlots = WEEKDAY_KEYS.some(
      day => Object.keys(weekPattern[day] || {}).length > 0,
    );
    if (!hasAnySlots) {
      return { valid: false, error: t.validationSlotsRequired };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      Alert.alert(t.error, validation.error || '');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        Alert.alert(t.error, t.authTokenNotFound);
        return;
      }

      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) {
        Alert.alert(t.error, t.userDataNotFound);
        return;
      }

      const userData = JSON.parse(userDataString);
      let userId = 0;
      if (userData.userId) {
        const parsedId =
          typeof userData.userId === 'string'
            ? parseInt(userData.userId)
            : userData.userId;
        userId = isNaN(parsedId) ? 0 : parsedId;
      }

      const payload = {
        userId,
        name: name.trim(),
        weekPattern,
      };

      if (isEditing && template?.id) {
        await axios.put(
          `${API_BASE_URL}/availability-templates/update/${template.id}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/availability-templates/add`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      Alert.alert(t.success, isEditing ? t.updatedTemplate : t.createdTemplate);
      navigation.goBack();
    } catch (e: any) {
      console.error('Save template error:', e);
      Alert.alert(t.error, e.response?.data?.message || t.failedToSaveTemplate);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderStatusOption = (status: AvailabilityStatus) => {
    const isSelected = currentStatus === status;
    const backgroundColor = isSelected ? colors.primary : colors.lightGrey;
    const textColor = isSelected ? colors.white : colors.textSecondary;
    const label =
      status === 'available'
        ? tAvailability.available
        : status === 'not-available'
        ? tAvailability.notAvailable
        : tAvailability.conditional;

    return (
      <TouchableOpacity
        key={status}
        style={[styles.statusOption, { backgroundColor }]}
        onPress={() => setCurrentStatus(status)}
        activeOpacity={0.7}
      >
        <Text style={[styles.statusOptionText, { color: textColor }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.backButton}
              >
                <Icon name="back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.title}>
                {isEditing ? t.editTemplateTitle : t.createTemplateTitle}
              </Text>
              <View style={styles.headerSpacer} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.templateName}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t.templateNamePlaceholder}
              placeholderTextColor={colors.textLight}
              style={styles.input}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.weekPattern}</Text>
            <TouchableOpacity onPress={handleCopyToOtherDays}>
              <Text style={styles.copyText}>{t.copyToOtherDays}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dayTabs}
          >
            {WEEKDAY_KEYS.map(day => {
              const isActive = selectedDay === day;
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayTab, isActive && styles.dayTabActive]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text
                    style={[
                      styles.dayTabText,
                      isActive && styles.dayTabTextActive,
                    ]}
                  >
                    {dayLabelMap[day]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tAvailability.status}</Text>
            <View style={styles.statusOptionsContainer}>
              {STATUS_OPTIONS.map(status => renderStatusOption(status))}
            </View>
          </View>

          <View style={styles.section}>
            <TimeSlotSelector
              slotStatuses={weekPattern[selectedDay] || {}}
              currentStatus={currentStatus}
              onSlotToggle={handleSlotToggle}
              onBatchUpdate={handleBatchSlotUpdate}
            />
          </View>
        </ScrollView>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>{t.cancel}</Text>
          </TouchableOpacity>
          <View style={styles.saveButtonContainer}>
            <Button
              title={
                saving ? t.saving : isEditing ? t.saveChanges : t.saveTemplate
              }
              onPress={handleSave}
              disabled={saving}
              loading={saving}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  copyText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  dayTabs: {
    marginBottom: spacing.md,
  },
  dayTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.round,
    marginRight: spacing.sm,
    backgroundColor: colors.lightGrey,
  },
  dayTabActive: {
    backgroundColor: colors.primary,
  },
  dayTabText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  dayTabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  statusOptionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.round,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  saveButtonContainer: {
    flex: 1,
  },
});
