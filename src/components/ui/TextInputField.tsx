import React from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { colors } from '../../assets/style/colors';
import { spacing } from '../../assets/style/spacing';
import { typography } from '../../assets/style/typography';

interface Props extends TextInputProps {
  label: string;
}

export const TextInputField: React.FC<Props> = ({ label, ...rest }) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholderTextColor={colors.textLight}
      {...rest}
    />
  </View>
);

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.white,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
});
