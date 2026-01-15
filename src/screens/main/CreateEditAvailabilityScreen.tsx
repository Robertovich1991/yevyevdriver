import React, { useState, useEffect, useCallback } from 'react';
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
import { colors } from '../../assets/style/colors';
import { typography } from '../../assets/style/typography';
import { spacing } from '../../assets/style/spacing';
import type { ScheduleStackParamList } from '../../navigation/ScheduleStackNavigator';
import type { AvailabilityStatus } from '../../types/availability';
import {
  formatDateForApi,
  slotsToTimes,
  timesToSlots,
  getStatusColor,
  getStatusLabel,
} from '../../types/availability';

type NavigationProp = NativeStackNavigationProp<ScheduleStackParamList, 'CreateEditAvailability'>;
type RouteProps = RouteProp<ScheduleStackParamList, 'CreateEditAvailability'>;

const API_BASE_URL = 'http://192.168.100.12:8000/api/v1';
const TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

const STATUS_OPTIONS: AvailabilityStatus[] = ['available', 'not-available', 'conditional'];

export const CreateEditAvailabilityScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  const { availability, isEditing } = route.params || {};

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('available');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
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
          parseInt(dateParts[2])
        );
        setSelectedDate(date);
      }

      // Convert time strings to slot numbers
      if (availability.timeSlots && availability.timeSlots.length > 0) {
        const slots = timesToSlots(availability.timeSlots);
        setSelectedSlots(slots);
      }

      // Set status
      if (availability.availability) {
        setAvailabilityStatus(availability.availability);
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
      return { valid: false, error: 'Please select a date.' };
    }

    if (selectedSlots.length === 0) {
      return { valid: false, error: 'Please select at least one time slot.' };
    }

    // Check for past dates (only for new records)
    if (!isEditing) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      
      if (selected < today) {
        return { valid: false, error: 'Cannot select past dates.' };
      }
    }

    return { valid: true };
  };

  const handleSave = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        setSaving(false);
        return;
      }

      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) {
        Alert.alert('Error', 'User data not found. Please login again.');
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

      // Convert slot numbers to time strings
      const timeSlots = slotsToTimes(selectedSlots);

      const payload = {
        userId,
        date: formatDateForApi(selectedDate),
        timeSlots,
        availability: availabilityStatus,
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
          }
        );
        Alert.alert('Success', 'Availability updated successfully!');
      } else {
        // Create new
        await axios.post(`${API_BASE_URL}/availabilities/add`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        Alert.alert('Success', 'Availability created successfully!');
      }

      navigation.goBack();
    } catch (e: any) {
      console.error('Save availability error:', e);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to save availability. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderStatusOption = (status: AvailabilityStatus) => {
    const isSelected = availabilityStatus === status;
    const backgroundColor = isSelected ? getStatusColor(status) : colors.lightGrey;
    const textColor = isSelected ? colors.white : colors.textSecondary;

    return (
      <TouchableOpacity
        key={status}
        style={[styles.statusOption, { backgroundColor }]}
        onPress={() => {
          setAvailabilityStatus(status);
          setShowStatusPicker(false);
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.statusOptionText, { color: textColor }]}>
          {getStatusLabel(status)}
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {isEditing ? 'Edit Availability' : 'Add Availability'}
            </Text>
          </View>

          {/* Date Picker Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateButtonIcon}>📅</Text>
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

          {/* Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusOptionsContainer}>
              {STATUS_OPTIONS.map(renderStatusOption)}
            </View>
          </View>

          {/* Time Slots Section */}
          <View style={styles.section}>
            <TimeSlotSelector
              selectedSlots={selectedSlots}
              onSlotsChange={setSelectedSlots}
            />
          </View>

          {/* Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{formatDateForApi(selectedDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <View
                style={[
                  styles.summaryStatusBadge,
                  { backgroundColor: getStatusColor(availabilityStatus) },
                ]}
              >
                <Text style={styles.summaryStatusText}>
                  {getStatusLabel(availabilityStatus)}
                </Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time Slots:</Text>
              <Text style={styles.summaryValue}>
                {selectedSlots.length} selected
              </Text>
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
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.saveButtonContainer}>
            <Button
              title={saving ? 'Saving...' : 'Save'}
              onPress={handleSave}
              disabled={saving || selectedSlots.length === 0}
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
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
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
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonIcon: {
    fontSize: 24,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
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
    paddingVertical: 12,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
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
