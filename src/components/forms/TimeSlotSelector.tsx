import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../assets/style/colors';
import { typography } from '../../assets/style/typography';
import { spacing } from '../../assets/style/spacing';
import {
  TIME_PERIODS,
  SLOT_START,
  SLOT_END,
  slotToTime,
  getPeriodSlots,
  type AvailabilityStatus,
  getStatusColor,
} from '../../types/availability';
import { useLanguageStore } from '../../store/useLanguageStore';
import { getCreateEditAvailabilityTranslations } from '../../i18n/translations';

interface TimeSlotSelectorProps {
  slotStatuses: { [time: string]: AvailabilityStatus };
  currentStatus: AvailabilityStatus;
  onSlotToggle: (time: string) => void;
  onBatchUpdate?: (updates: {
    [time: string]: AvailabilityStatus | null;
  }) => void;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  slotStatuses,
  currentStatus,
  onSlotToggle,
  onBatchUpdate,
}) => {
  const language = useLanguageStore(s => s.language);
  const t = useMemo(
    () => getCreateEditAvailabilityTranslations(language),
    [language],
  );

  // Generate all available time slots
  const allSlots = useMemo(() => {
    const slots: number[] = [];
    for (let i = SLOT_START; i <= SLOT_END; i++) {
      slots.push(i);
    }
    return slots;
  }, []);

  // Get slot status for a given slot number
  const getSlotStatus = useCallback(
    (slot: number): AvailabilityStatus | null => {
      const time = slotToTime(slot);
      return slotStatuses[time] || null;
    },
    [slotStatuses],
  );

  // Check if a period has slots with the current status
  const isPeriodFullySelected = useCallback(
    (period: keyof typeof TIME_PERIODS): boolean => {
      const periodSlots = getPeriodSlots(period);
      return periodSlots.every(slot => {
        const time = slotToTime(slot);
        return slotStatuses[time] === currentStatus;
      });
    },
    [slotStatuses, currentStatus],
  );

  // Check if a period is partially selected (has some slots with any status)
  const isPeriodPartiallySelected = useCallback(
    (period: keyof typeof TIME_PERIODS): boolean => {
      const periodSlots = getPeriodSlots(period);
      const hasSelected = periodSlots.some(slot => {
        const time = slotToTime(slot);
        return slotStatuses[time] !== undefined;
      });
      const hasUnselected = periodSlots.some(slot => {
        const time = slotToTime(slot);
        return slotStatuses[time] === undefined;
      });
      return hasSelected && hasUnselected;
    },
    [slotStatuses],
  );

  // Toggle individual slot
  const toggleSlot = useCallback(
    (slot: number) => {
      const time = slotToTime(slot);
      onSlotToggle(time);
    },
    [onSlotToggle],
  );

  // Toggle period (morning/afternoon/evening) - set all to current status or remove if all have current status
  const togglePeriod = useCallback(
    (period: keyof typeof TIME_PERIODS) => {
      const periodSlots = getPeriodSlots(period);
      const allHaveCurrentStatus = periodSlots.every(slot => {
        const time = slotToTime(slot);
        return slotStatuses[time] === currentStatus;
      });

      if (onBatchUpdate) {
        // Use batch update for better performance
        const updates: { [time: string]: AvailabilityStatus | null } = {};
        periodSlots.forEach(slot => {
          const time = slotToTime(slot);
          if (allHaveCurrentStatus) {
            // Remove slots with current status
            if (slotStatuses[time] === currentStatus) {
              updates[time] = null;
            }
          } else {
            // Set all slots to current status
            updates[time] = currentStatus;
          }
        });
        onBatchUpdate(updates);
      } else {
        // Fallback to individual toggles
        if (allHaveCurrentStatus) {
          periodSlots.forEach(slot => {
            const time = slotToTime(slot);
            if (slotStatuses[time] === currentStatus) {
              onSlotToggle(time);
            }
          });
        } else {
          periodSlots.forEach(slot => {
            const time = slotToTime(slot);
            if (slotStatuses[time] !== currentStatus) {
              onSlotToggle(time);
            }
          });
        }
      }
    },
    [slotStatuses, currentStatus, onSlotToggle, onBatchUpdate],
  );

  // Clear all slots
  const clearAll = useCallback(() => {
    if (onBatchUpdate) {
      const updates: { [time: string]: AvailabilityStatus | null } = {};
      Object.keys(slotStatuses).forEach(time => {
        updates[time] = null;
      });
      onBatchUpdate(updates);
    } else {
      Object.keys(slotStatuses).forEach(time => {
        onSlotToggle(time);
      });
    }
  }, [slotStatuses, onSlotToggle, onBatchUpdate]);

  // Select all slots with current status
  const selectAll = useCallback(() => {
    if (onBatchUpdate) {
      const updates: { [time: string]: AvailabilityStatus | null } = {};
      allSlots.forEach(slot => {
        const time = slotToTime(slot);
        if (slotStatuses[time] !== currentStatus) {
          updates[time] = currentStatus;
        }
      });
      onBatchUpdate(updates);
    } else {
      allSlots.forEach(slot => {
        const time = slotToTime(slot);
        if (slotStatuses[time] !== currentStatus) {
          onSlotToggle(time);
        }
      });
    }
  }, [allSlots, slotStatuses, currentStatus, onSlotToggle, onBatchUpdate]);

  // Render period button
  const renderPeriodButton = (
    period: keyof typeof TIME_PERIODS,
    label: string,
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

  // Get status icon
  const getStatusIcon = (status: AvailabilityStatus): string => {
    switch (status) {
      case 'available':
        return '✓';
      case 'not-available':
        return '✕';
      case 'conditional':
        return '!';
      default:
        return '';
    }
  };

  // Render time slot button
  const renderSlotButton = (slot: number) => {
    const timeStr = slotToTime(slot);
    const slotStatus = getSlotStatus(slot);
    const isSelected = slotStatus === currentStatus;
    const backgroundColor = slotStatus
      ? getStatusColor(slotStatus)
      : colors.lightGrey;
    const textColor = slotStatus ? colors.white : colors.textSecondary;

    return (
      <TouchableOpacity
        key={slot}
        style={[styles.slotButton, { backgroundColor }]}
        onPress={() => toggleSlot(slot)}
        activeOpacity={0.7}
      >
        <Text style={[styles.slotText, { color: textColor }]}>
          {timeStr}
          {slotStatus && (
            <Text style={styles.slotIcon}> {getStatusIcon(slotStatus)}</Text>
          )}
        </Text>
      </TouchableOpacity>
    );
  };

  // Group slots into rows of 6 for better fit without scrolling
  const slotRows = useMemo(() => {
    const rows: number[][] = [];
    for (let i = 0; i < allSlots.length; i += 6) {
      rows.push(allSlots.slice(i, i + 6));
    }
    return rows;
  }, [allSlots]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>{t.selectTimeSlots}</Text>
      <Text style={styles.subtitle}>
        {Object.keys(slotStatuses).length}{' '}
        {Object.keys(slotStatuses).length !== 1 ? t.slots : t.slot} {t.selected}
      </Text>

      {/* Period Quick Select Buttons */}
      <View style={styles.periodButtonsContainer}>
        {renderPeriodButton('morning', t.morningWithTime)}
        {renderPeriodButton('afternoon', t.afternoonWithTime)}
        {renderPeriodButton('evening', t.eveningWithTime)}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={selectAll}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>{t.selectAll}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={clearAll}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionButtonText, styles.clearButtonText]}>
            {t.clearAll}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Slots Grid */}
      <View style={styles.gridContainer}>
        {slotRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.slotRow}>
            {row.map(slot => renderSlotButton(slot))}
          </View>
        ))}
      </View>
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
    minHeight: 48,
    justifyContent: 'center',
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
    minHeight: 38,
    justifyContent: 'center',
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
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs / 2,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  slotButtonSelected: {
    backgroundColor: colors.primary,
  },
  slotText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  slotIcon: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
