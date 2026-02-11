import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../assets/style/colors';
import { spacing } from '../../assets/style/spacing';
import { typography } from '../../assets/style/typography';

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
    backgroundColor: colors.primary,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.mediumGrey,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
});
