import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  disabled,
  loading,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
    disabled={disabled || loading}
  >
    {loading ? (
      <ActivityIndicator color="#FFF" />
    ) : (
      <Text style={styles.text}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});


