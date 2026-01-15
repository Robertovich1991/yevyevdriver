import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { TextInputField } from '../ui/TextInputField';
import { Button } from '../ui/Button';
import type { DriverRoute } from '../../types/driver';

interface Props {
  initial?: DriverRoute;
  onSubmit: (route: DriverRoute) => void;
}

export const RouteForm: React.FC<Props> = ({ initial, onSubmit }) => {
  const [startCity, setStartCity] = useState(initial?.startCity ?? '');
  const [startArea, setStartArea] = useState(initial?.startArea ?? '');
  const [destCity, setDestCity] = useState(initial?.destCity ?? '');
  const [destArea, setDestArea] = useState(initial?.destArea ?? '');
  const [startTime, setStartTime] = useState(
    initial?.workingHours.startTime ?? '08:00',
  );
  const [endTime, setEndTime] = useState(
    initial?.workingHours.endTime ?? '18:00',
  );
  const [maxPassengers, setMaxPassengers] = useState(
    String(initial?.maxPassengers ?? 4),
  );

  const submit = () => {
    const max = Number(maxPassengers) || 1;
    const route: DriverRoute = {
      startCity,
      startArea,
      destCity,
      destArea,
      workingHours: { startTime, endTime },
      maxPassengers: max,
      availableSeats: initial?.availableSeats ?? max,
      stops: initial?.stops ?? [],
    };
    onSubmit(route);
  };

  return (
    <ScrollView>
      <Text style={styles.sectionTitle}>Start</Text>
      <TextInputField label="City" value={startCity} onChangeText={setStartCity} />
      <TextInputField label="Area" value={startArea} onChangeText={setStartArea} />

      <Text style={styles.sectionTitle}>Destination</Text>
      <TextInputField label="City" value={destCity} onChangeText={setDestCity} />
      <TextInputField label="Area" value={destArea} onChangeText={setDestArea} />

      <Text style={styles.sectionTitle}>Working hours</Text>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <TextInputField
            label="Start time"
            placeholder="08:00"
            value={startTime}
            onChangeText={setStartTime}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInputField
            label="End time"
            placeholder="18:00"
            value={endTime}
            onChangeText={setEndTime}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Passengers</Text>
      <TextInputField
        label="Max passengers (1-6)"
        keyboardType="number-pad"
        value={maxPassengers}
        onChangeText={setMaxPassengers}
      />

      {/* Map + optional stops can be added here using react-native-maps + markers */}

      <Button title="Save route" onPress={submit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { marginTop: 16, marginBottom: 4, fontWeight: '600', color: '#111' },
  row: { flexDirection: 'row', alignItems: 'center' },
});


