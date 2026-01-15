import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../assets/style/colors';
import { typography } from '../../assets/style/typography';
import { spacing } from '../../assets/style/spacing';
import {
  TIME_PERIODS,
  SLOT_START,
  SLOT_END,
  slotToTime,
  getPeriodSlots,
} from '../../types/availability';

interface TimeSlotSelectorProps {
  selectedSlots: number[];
  onSlotsChange: (slots: number[]) => void;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedSlots,
  onSlotsChange,
}) => {
  // Generate all available time slots
  const allSlots = useMemo(() => {
    const slots: number[] = [];
    for (let i = SLOT_START; i <= SLOT_END; i++) {
      slots.push(i);
    }
    return slots;
  }, []);

  // Check if a period is fully selected
  const isPeriodFullySelected = useCallback(
    (period: keyof typeof TIME_PERIODS): boolean => {
      const periodSlots = getPeriodSlots(period);
      return periodSlots.every((slot) => selectedSlots.includes(slot));
    },
    [selectedSlots]
  );

  // Check if a period is partially selected
  const isPeriodPartiallySelected = useCallback(
    (period: keyof typeof TIME_PERIODS): boolean => {
      const periodSlots = getPeriodSlots(period);
      const hasSelected = periodSlots.some((slot) => selectedSlots.includes(slot));
      const hasUnselected = periodSlots.some((slot) => !selectedSlots.includes(slot));
      return hasSelected && hasUnselected;
    },
    [selectedSlots]
  );

  // Toggle individual slot
  const toggleSlot = useCallback(
    (slot: number) => {
      if (selectedSlots.includes(slot)) {
        onSlotsChange(selectedSlots.filter((s) => s !== slot));
      } else {
        onSlotsChange([...selectedSlots, slot].sort((a, b) => a - b));
      }
    },
    [selectedSlots, onSlotsChange]
  );

  // Toggle period (morning/afternoon/evening)
  const togglePeriod = useCallback(
    (period: keyof typeof TIME_PERIODS) => {
      const periodSlots = getPeriodSlots(period);
      const allSelected = periodSlots.every((s) => selectedSlots.includes(s));

      if (allSelected) {
        // Remove all slots in this period
        onSlotsChange(selectedSlots.filter((s) => !periodSlots.includes(s)));
      } else {
        // Add all slots in this period
        const newSlots = [...new Set([...selectedSlots, ...periodSlots])].sort(
          (a, b) => a - b
        );
        onSlotsChange(newSlots);
      }
    },
    [selectedSlots, onSlotsChange]
  );

  // Clear all slots
  const clearAll = useCallback(() => {
    onSlotsChange([]);
  }, [onSlotsChange]);

  // Select all slots
  const selectAll = useCallback(() => {
    onSlotsChange(allSlots);
  }, [allSlots, onSlotsChange]);

  // Render period button
  const renderPeriodButton = (
    period: keyof typeof TIME_PERIODS,
    label: string
  ) => {
    const isFullySelected = isPeriodFullySelected(period);
    const isPartiallySelected = isPeriodPartiallySelected(period);

    return (
      <TouchableOpacity
        key={period}
        style={[
          styles.periodButton,
          isFullySelected && styles.periodButtonSelected,
          isPartiallySelected && styles.periodButtonPartial,
        ]}
        onPress={() => togglePeriod(period)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.periodButtonText,
            (isFullySelected || isPartiallySelected) &&
              styles.periodButtonTextSelected,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render time slot button
  const renderSlotButton = (slot: number) => {
    const isSelected = selectedSlots.includes(slot);
    const timeStr = slotToTime(slot);

    return (
      <TouchableOpacity
        key={slot}
        style={[styles.slotButton, isSelected && styles.slotButtonSelected]}
        onPress={() => toggleSlot(slot)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.slotText, isSelected && styles.slotTextSelected]}
        >
          {timeStr}
        </Text>
      </TouchableOpacity>
    );
  };

  // Group slots into rows of 4
  const slotRows = useMemo(() => {
    const rows: number[][] = [];
    for (let i = 0; i < allSlots.length; i += 4) {
      rows.push(allSlots.slice(i, i + 4));
    }
    return rows;
  }, [allSlots]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Select Time Slots</Text>
      <Text style={styles.subtitle}>
        {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''}{' '}
        selected
      </Text>

      {/* Period Quick Select Buttons */}
      <View style={styles.periodButtonsContainer}>
        {renderPeriodButton('morning', 'Morning\n(6-12)')}
        {renderPeriodButton('afternoon', 'Afternoon\n(12-18)')}
        {renderPeriodButton('evening', 'Evening\n(18-24)')}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={selectAll}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={clearAll}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionButtonText, styles.clearButtonText]}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Slots Grid */}
      <ScrollView
        style={styles.gridScrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.gridContainer}>
          {slotRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.slotRow}>
              {row.map((slot) => renderSlotButton(slot))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  periodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  periodButton: {
    flex: 1,
    backgroundColor: colors.lightGrey,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.borderRadius.md,
    marginHorizontal: spacing.xs / 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  periodButtonPartial: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  periodButtonTextSelected: {
    color: colors.white,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.sm,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  clearButton: {
    backgroundColor: colors.lightGrey,
  },
  clearButtonText: {
    color: colors.textSecondary,
  },
  gridScrollView: {
    flex: 1,
    maxHeight: 300,
  },
  gridContainer: {
    paddingBottom: spacing.md,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  slotButton: {
    flex: 1,
    backgroundColor: colors.lightGrey,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs / 2,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  slotButtonSelected: {
    backgroundColor: colors.primary,
  },
  slotText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  slotTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
});
