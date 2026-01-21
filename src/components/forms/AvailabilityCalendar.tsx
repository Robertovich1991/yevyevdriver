import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { DriverAvailability, Weekday } from '../../types/driver';
import { useLanguageStore } from '../../store/useLanguageStore';
import { getAvailabilityCalendarTranslations } from '../../i18n/translations';

interface Props {
  value: DriverAvailability;
  onChange: (value: DriverAvailability) => void;
}

export const AvailabilityCalendar: React.FC<Props> = ({
  value,
  onChange,
}) => {
  const language = useLanguageStore((s) => s.language);
  const t = useMemo(() => getAvailabilityCalendarTranslations(language), [language]);

  const DAYS: { key: Weekday; label: string }[] = useMemo(() => [
    { key: 'monday', label: t.monday },
    { key: 'tuesday', label: t.tuesday },
    { key: 'wednesday', label: t.wednesday },
    { key: 'thursday', label: t.thursday },
    { key: 'friday', label: t.friday },
    { key: 'saturday', label: t.saturday },
    { key: 'sunday', label: t.sunday },
  ], [t]);

  const toggleDay = (day: Weekday) => {
    onChange({ ...value, [day]: !value[day] });
  };

  return (
    <View>
      <Text style={styles.title}>{t.weeklyAvailability}</Text>
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
        {t.legend}
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


