import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import type { AvailabilityStatus } from '../../types/availability';
import {
  formatDateForApi,
  getStatusColor,
  getStatusLabel,
} from '../../types/availability';
import { useLanguageStore } from '../../store/useLanguageStore';
import { getCreateEditAvailabilityTranslations } from '../../i18n/translations';

import { API_BASE_URL, TOKEN_KEY, USER_DATA_KEY } from '../../config/api';

type NavigationProp = NativeStackNavigationProp<
  ScheduleStackParamList,
  'CreateEditAvailability'
>;
type RouteProps = RouteProp<ScheduleStackParamList, 'CreateEditAvailability'>;

const STATUS_OPTIONS: AvailabilityStatus[] = [
  'available',
  'not-available',
  'conditional',
];

export const CreateEditAvailabilityScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const { availability, isEditing } = route.params || {};
  const language = useLanguageStore(s => s.language);
  const t = useMemo(
    () => getCreateEditAvailabilityTranslations(language),
    [language],
  );

  // Helper function to translate status labels
  const getTranslatedStatusLabel = (status: AvailabilityStatus): string => {
    switch (status) {
      case 'available':
        return t.available;
      case 'not-available':
        return t.notAvailable;
      case 'conditional':
        return t.conditional;
      default:
        return status;
    }
  };

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slotStatuses, setSlotStatuses] = useState<{
    [time: string]: AvailabilityStatus;
  }>({});
  const [currentStatus, setCurrentStatus] =
    useState<AvailabilityStatus>('available');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (isEditing && availability) {
      // Parse date
      const dateParts = availability.date.split('-');
      if (dateParts.length === 3) {
        const date = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
        );
        setSelectedDate(date);
      }

      // Load slotStatuses from availability
      if (availability.slotStatuses) {
        setSlotStatuses(availability.slotStatuses);
      } else if (availability.timeSlots && availability.availability) {
        // Legacy: convert old format to new format
        const legacySlotStatuses: { [time: string]: AvailabilityStatus } = {};
        availability.timeSlots.forEach(time => {
          legacySlotStatuses[time] = availability.availability!;
        });
        setSlotStatuses(legacySlotStatuses);
      }
    }
  }, [isEditing, availability]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const validateForm = (): { valid: boolean; error?: string } => {
    if (!selectedDate) {
      return { valid: false, error: t.pleaseSelectDate };
    }

    if (Object.keys(slotStatuses).length === 0) {
      return { valid: false, error: t.pleaseSelectTimeSlot };
    }

    // Check for past dates (only for new records)
    if (!isEditing) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      if (selected < today) {
        return { valid: false, error: t.cannotSelectPastDates };
      }
    }

    return { valid: true };
  };

  const handleSave = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      Alert.alert(t.validationError, validation.error || '');
      return;
    }

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        Alert.alert(t.error, t.authTokenNotFound);
        setSaving(false);
        return;
      }

      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) {
        Alert.alert(t.error, t.userDataNotFound);
        setSaving(false);
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
        date: formatDateForApi(selectedDate),
        slotStatuses,
      };

      if (isEditing && availability?.id) {
        // Update existing
        await axios.put(
          `${API_BASE_URL}/availabilities/update/${availability.id}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        Alert.alert(t.success, t.availabilityUpdated);
      } else {
        // Create new
        await axios.post(`${API_BASE_URL}/availabilities/add`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        Alert.alert(t.success, t.availabilityCreated);
      }

      navigation.goBack();
    } catch (e: any) {
      console.error('Save availability error:', e);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        t.failedToSaveAvailability;
      Alert.alert(t.error, errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderStatusOption = (status: AvailabilityStatus) => {
    const isSelected = currentStatus === status;
    const backgroundColor = isSelected
      ? getStatusColor(status)
      : colors.lightGrey;
    const textColor = isSelected ? colors.white : colors.textSecondary;

    return (
      <TouchableOpacity
        key={status}
        style={[styles.statusOption, { backgroundColor }]}
        onPress={() => setCurrentStatus(status)}
        activeOpacity={0.7}
      >
        <Text style={[styles.statusOptionText, { color: textColor }]}>
          {getTranslatedStatusLabel(status)}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSlotToggle = (time: string) => {
    const newSlotStatuses = { ...slotStatuses };
    if (newSlotStatuses[time] === currentStatus) {
      // Remove slot if it already has the current status
      delete newSlotStatuses[time];
    } else {
      // Set slot to current status
      newSlotStatuses[time] = currentStatus;
    }
    setSlotStatuses(newSlotStatuses);
  };

  const handleBatchSlotUpdate = (updates: {
    [time: string]: AvailabilityStatus | null;
  }) => {
    const newSlotStatuses = { ...slotStatuses };
    Object.entries(updates).forEach(([time, status]) => {
      if (status === null) {
        delete newSlotStatuses[time];
      } else {
        newSlotStatuses[time] = status;
      }
    });
    setSlotStatuses(newSlotStatuses);
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.backButton}
              >
                <Icon name="back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.title}>
                {isEditing ? t.editAvailability : t.addAvailability}
              </Text>
              <View style={styles.headerSpacer} />
            </View>
          </View>

          {/* Date Picker Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.date}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Icon
                name="calendar"
                size={20}
                color={colors.textPrimary}
                style={styles.dateButtonIcon}
              />
              <Text style={styles.dateButtonText}>
                {formatDateForApi(selectedDate)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={isEditing ? undefined : new Date()}
              />
            )}
          </View>

          {/* Status Selector Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.statusLabel || 'Status'}</Text>
            <View style={styles.statusOptionsContainer}>
              {STATUS_OPTIONS.map(status => renderStatusOption(status))}
            </View>
          </View>

          {/* Time Slots Section */}
          <View style={styles.section}>
            <TimeSlotSelector
              slotStatuses={slotStatuses}
              currentStatus={currentStatus}
              onSlotToggle={handleSlotToggle}
              onBatchUpdate={handleBatchSlotUpdate}
            />
          </View>

          {/* Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>{t.summary}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t.dateLabel}</Text>
              <Text style={styles.summaryValue}>
                {formatDateForApi(selectedDate)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t.timeSlotsLabel || 'Time Slots'}
              </Text>
              <Text style={styles.summaryValue}>
                {Object.keys(slotStatuses).length} {t.selected || 'selected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t.statusLabel || 'Current Status'}
              </Text>
              <View
                style={[
                  styles.summaryStatusBadge,
                  { backgroundColor: getStatusColor(currentStatus) },
                ]}
              >
                <Text style={styles.summaryStatusText}>
                  {getTranslatedStatusLabel(currentStatus)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
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
              title={saving ? t.saving : t.save}
              onPress={handleSave}
              disabled={saving || Object.keys(slotStatuses).length === 0}
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
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    minHeight: 38,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonIcon: {
    marginRight: spacing.sm,
  },
  dateButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  statusOptionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusOption: {
    flex: 1,
    minHeight: 38,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  summarySection: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    width: 80,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  summaryStatusBadge: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  summaryStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  saveButtonContainer: {
    flex: 2,
  },
});
