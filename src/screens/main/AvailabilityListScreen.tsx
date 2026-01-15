import React, { useState, useEffect, useCallback } from 'react';
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
import { colors } from '../../assets/style/colors';
import { typography } from '../../assets/style/typography';
import { spacing } from '../../assets/style/spacing';
import type { ScheduleStackParamList } from '../../navigation/ScheduleStackNavigator';
import type { Availability, AvailabilityStatus } from '../../types/availability';
import {
  formatDate,
  formatDateForApi,
  getStatusColor,
  getStatusLabel,
  slotToTime,
} from '../../types/availability';

type NavigationProp = NativeStackNavigationProp<ScheduleStackParamList, 'AvailabilityList'>;

const API_BASE_URL = 'http://192.168.100.12:8000/api/v1';
const TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export const AvailabilityListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

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
    }, [filterDate])
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

      const data = response.data?.availabilities || response.data?.data || response.data || [];
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

  const handleEditAvailability = (availability: Availability) => {
    navigation.navigate('CreateEditAvailability', {
      availability,
      isEditing: true,
    });
  };

  const handleDeleteAvailability = (id: number) => {
    Alert.alert(
      'Delete Availability',
      'Are you sure you want to delete this availability record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem(TOKEN_KEY);
              if (!token) {
                Alert.alert('Error', 'Authentication token not found.');
                return;
              }

              await axios.delete(`${API_BASE_URL}/availabilities/delete/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              Alert.alert('Success', 'Availability deleted successfully.');
              loadAvailabilities();
            } catch (e: any) {
              console.error('Delete error:', e);
              Alert.alert(
                'Error',
                e.response?.data?.message || 'Failed to delete availability.'
              );
            }
          },
        },
      ]
    );
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
        <Text style={styles.statusBadgeText}>{getStatusLabel(status)}</Text>
      </View>
    );
  };

  const renderTimeSlots = (timeSlots: string[]) => {
    const displaySlots = timeSlots.slice(0, 5);
    const remaining = timeSlots.length - 5;

    return (
      <View style={styles.timeSlotsContainer}>
        <View style={styles.timeSlotsRow}>
          {displaySlots.map((slot, index) => (
            <View key={index} style={styles.timeSlotChip}>
              <Text style={styles.timeSlotChipText}>{slot}</Text>
            </View>
          ))}
          {remaining > 0 && (
            <View style={[styles.timeSlotChip, styles.moreChip]}>
              <Text style={styles.moreChipText}>+{remaining}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Availability }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleEditAvailability(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
          {renderStatusBadge(item.availability)}
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
        <Text style={styles.slotsLabel}>
          {item.timeSlots.length} time slot{item.timeSlots.length !== 1 ? 's' : ''}:
        </Text>
        {renderTimeSlots(item.timeSlots)}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.tapToEdit}>Tap to edit →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>No Availability Records</Text>
      <Text style={styles.emptySubtitle}>
        Tap the button below to add your availability
      </Text>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Filter by Date:</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerButtonText}>
            {filterDate ? formatDateForApi(filterDate) : 'Select Date'}
          </Text>
        </TouchableOpacity>
        {filterDate && (
          <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilters}>
            <Text style={styles.clearFilterText}>Clear</Text>
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

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Availability</Text>
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* List */}
      <FlatList
        data={availabilities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  filterToggleButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.lightGrey,
    borderRadius: spacing.borderRadius.sm,
  },
  filterToggleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.lightGrey,
    borderRadius: spacing.borderRadius.sm,
  },
  datePickerButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
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
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 64,
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
    shadowColor: colors.black,
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
