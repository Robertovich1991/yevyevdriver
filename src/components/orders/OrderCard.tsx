import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { PassengerOrder } from '../../types/order';

interface Props {
  order: PassengerOrder;
  onAccept: () => void;
  disabled?: boolean;
}

export const OrderCard: React.FC<Props> = ({ order, onAccept, disabled }) => (
  <View style={styles.card}>
    <Text style={styles.name}>{order.passengerName}</Text>
    <Text style={styles.line}>
      From: <Text style={styles.bold}>{order.pickup.label}</Text>
    </Text>
    <Text style={styles.line}>
      To: <Text style={styles.bold}>{order.dropoff.label}</Text>
    </Text>
    <Text style={styles.line}>
      Seats: <Text style={styles.bold}>{order.seatsRequested}</Text>
    </Text>

    <TouchableOpacity
      style={[styles.btn, disabled && styles.btnDisabled]}
      onPress={onAccept}
      disabled={disabled}
    >
      <Text style={styles.btnText}>{disabled ? 'Car full' : 'Accept order'}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: { fontWeight: '600', fontSize: 16, marginBottom: 6 },
  line: { color: '#4B5563', marginBottom: 2 },
  bold: { fontWeight: '600' },
  btn: {
    marginTop: 8,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#9CA3AF' },
  btnText: { color: '#FFF', fontWeight: '600' },
});


