import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { DriverAvailability, Weekday } from '../../types/driver';

const DAYS: { key: Weekday; label: string }[] = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

interface Props {
  value: DriverAvailability;
  onChange: (value: DriverAvailability) => void;
}

export const AvailabilityCalendar: React.FC<Props> = ({
  value,
  onChange,
}) => {
  const toggleDay = (day: Weekday) => {
    onChange({ ...value, [day]: !value[day] });
  };

  return (
    <View>
      <Text style={styles.title}>Weekly availability</Text>
      <View style={styles.row}>
        {DAYS.map((d) => {
          const active = value[d.key];
          return (
            <TouchableOpacity
              key={d.key}
              onPress={() => toggleDay(d.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.legend}>
        Tap to toggle: green = available, gray = not available
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontWeight: '600', marginBottom: 8, color: '#111' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  chipActive: {
    backgroundColor: '#22C55E33',
    borderColor: '#22C55E',
  },
  chipText: { color: '#4B5563', fontWeight: '500' },
  chipTextActive: { color: '#15803D' },
  legend: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});


