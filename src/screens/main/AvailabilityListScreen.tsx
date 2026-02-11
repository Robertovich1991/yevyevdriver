import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Icon } from '../../assets/icons/Icon';
import { colors } from '../../assets/style/colors';
import { typography } from '../../assets/style/typography';
import { spacing } from '../../assets/style/spacing';
import type { ScheduleStackParamList } from '../../navigation/ScheduleStackNavigator';
import type { Availability } from '../../types/availability';
import {
  formatDate,
  formatDateForApi,
  getStatusColor,
  getStatusLabel,
  type AvailabilityStatus,
} from '../../types/availability';
import { useLanguageStore } from '../../store/useLanguageStore';
import { getAvailabilityListTranslations } from '../../i18n/translations';
import { getCreateEditAvailabilityTranslations } from '../../i18n/translations';

import { API_BASE_URL, TOKEN_KEY, USER_DATA_KEY } from '../../config/api';

type NavigationProp = NativeStackNavigationProp<
  ScheduleStackParamList,
  'AvailabilityList'
>;

export const AvailabilityListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const language = useLanguageStore(s => s.language);
  const t = useMemo(
    () => getAvailabilityListTranslations(language),
    [language],
  );
  const tAvailability = useMemo(
    () => getCreateEditAvailabilityTranslations(language),
    [language],
  );

  // Helper function to translate status labels
  const getTranslatedStatusLabel = (status: AvailabilityStatus): string => {
    switch (status) {
      case 'available':
        return tAvailability.available;
      case 'not-available':
        return tAvailability.notAvailable;
      case 'conditional':
        return tAvailability.conditional;
      default:
        return status;
    }
  };

  // State
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load availabilities on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAvailabilities();
    }, [filterDate]),
  );

  const loadAvailabilities = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) {
        setLoading(false);
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

      // Build query params
      let url = `${API_BASE_URL}/availabilities/all?userId=${userId}`;
      if (filterDate) {
        url += `&date=${formatDateForApi(filterDate)}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data =
        response.data?.availabilities ||
        response.data?.data ||
        response.data ||
        [];
      setAvailabilities(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Error loading availabilities:', e);
      // Don't show error alert on initial load - just set empty array
      setAvailabilities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAvailabilities();
  };

  const handleAddAvailability = () => {
    navigation.navigate('CreateEditAvailability', { isEditing: false });
  };

  const handleOpenTemplates = () => {
    navigation.navigate('AvailabilityTemplatesList');
  };

  const handleEditAvailability = (availability: Availability) => {
    navigation.navigate('CreateEditAvailability', {
      availability,
      isEditing: true,
    });
  };

  const handleDeleteAvailability = (id: number) => {
    Alert.alert(t.deleteAvailability, t.deleteAvailabilityConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) {
              Alert.alert(t.error, t.authTokenNotFound);
              return;
            }

            await axios.delete(`${API_BASE_URL}/availabilities/delete/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            Alert.alert(t.success, t.availabilityDeletedSuccess);
            loadAvailabilities();
          } catch (e: any) {
            console.error('Delete error:', e);
            Alert.alert(
              t.error,
              e.response?.data?.message || t.failedToDeleteAvailability,
            );
          }
        },
      },
    ]);
  };

  const clearFilters = () => {
    setFilterDate(null);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFilterDate(selectedDate);
    }
  };

  const renderStatusBadge = (status: AvailabilityStatus) => {
    const backgroundColor = getStatusColor(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={styles.statusBadgeText}>
          {getTranslatedStatusLabel(status)}
        </Text>
      </View>
    );
  };

  const renderTimeSlots = (slotStatuses: {
    [time: string]: AvailabilityStatus;
  }) => {
    const timeEntries = Object.entries(slotStatuses);
    const displaySlots = timeEntries.slice(0, 5);
    const remaining = timeEntries.length - 5;

    return (
      <View style={styles.timeSlotsContainer}>
        <View style={styles.timeSlotsRow}>
          {displaySlots.map(([time, status], index) => {
            const statusColor = getStatusColor(status);
            return (
              <View
                key={index}
                style={[styles.timeSlotChip, { backgroundColor: statusColor }]}
              >
                <Text style={styles.timeSlotChipText}>{time}</Text>
              </View>
            );
          })}
          {remaining > 0 && (
            <View style={[styles.timeSlotChip, styles.moreChip]}>
              <Text style={styles.moreChipText}>+{remaining}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Availability }) => {
    // Handle both new format (slotStatuses) and legacy format (timeSlots + availability)
    const slotStatuses =
      item.slotStatuses ||
      (item.timeSlots && item.availability
        ? Object.fromEntries(
            item.timeSlots.map(time => [time, item.availability!]),
          )
        : {});
    const slotCount = Object.keys(slotStatuses).length;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleEditAvailability(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
            {slotCount > 0 && (
              <Text style={styles.slotCountBadge}>
                {slotCount} {slotCount !== 1 ? t.timeSlots : t.timeSlot}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAvailability(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          {slotCount > 0 && (
            <>
              <Text style={styles.slotsLabel}>
                {t.timeSlots || 'Time Slots'}:
              </Text>
              {renderTimeSlots(slotStatuses)}
            </>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.tapToEdit}>{t.tapToEdit}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="calendar"
        size={56}
        color={colors.textLight}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>{t.noAvailabilityRecords}</Text>
      <Text style={styles.emptySubtitle}>{t.tapToAddAvailability}</Text>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>{t.filterByDate}</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerButtonText}>
            {filterDate ? formatDateForApi(filterDate) : t.selectDate}
          </Text>
        </TouchableOpacity>
        {filterDate && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFilterText}>{t.clear}</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );

  const renderTemplatesCta = () => (
    <TouchableOpacity
      style={styles.templatesCta}
      onPress={handleOpenTemplates}
      activeOpacity={0.8}
    >
      <View style={styles.templatesCtaAccent} />
      <View style={styles.templatesCtaContent}>
        <Text style={styles.templatesCtaTitle}>{t.templates}</Text>
        <Text style={styles.templatesCtaSubtitle}>{t.tapToEdit}</Text>
      </View>
      <View style={styles.templatesCtaArrowContainer}>
        <Icon
          name="arrow-left"
          size={26}
          color={colors.primary}
          style={styles.templatesCtaArrow}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.myAvailability}</Text>
        <View style={styles.headerActionsRow}>
          <TouchableOpacity
            style={[styles.headerActionButton, styles.filterToggleButton]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={[styles.headerActionText, styles.filterToggleText]}>
              {showFilters ? t.hideFilters : t.filters}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* List */}
      <FlatList
        data={availabilities}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderTemplatesCta}
        ListEmptyComponent={!loading ? renderEmptyList : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddAvailability}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerActionButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  filterToggleButton: {
    backgroundColor: colors.lightGrey,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterToggleText: {
    color: colors.textSecondary,
  },
  templatesCta: {
    backgroundColor: colors.backgroundLight,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  templatesCtaAccent: {
    width: 6,
    height: 48,
    borderRadius: spacing.borderRadius.round,
    backgroundColor: colors.primary,
  },
  templatesCtaContent: {
    flex: 1,
  },
  templatesCtaArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  templatesCtaArrow: {
    transform: [{ rotate: '180deg' }],
  },
  templatesCtaTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  templatesCtaSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  datePickerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background, // Light green background
    borderRadius: spacing.borderRadius.round, // Pill shape
  },
  datePickerButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  clearFilterButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  clearFilterText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardDate: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  slotCountBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    backgroundColor: colors.lightGrey,
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 22,
  },
  cardBody: {
    marginBottom: spacing.sm,
  },
  slotsLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeSlotsContainer: {
    marginTop: spacing.xs,
  },
  timeSlotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  timeSlotChip: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  timeSlotChipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  moreChip: {
    backgroundColor: colors.grey,
  },
  moreChipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  tapToEdit: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    fontWeight: typography.fontWeight.light,
    color: colors.white,
    lineHeight: 34,
  },
});
