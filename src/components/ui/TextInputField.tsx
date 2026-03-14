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
  /** Optional element rendered on the right (e.g. password visibility toggle) */
  rightElement?: React.ReactNode;
}

export const TextInputField: React.FC<Props> = ({
  label,
  rightElement,
  style,
  ...rest
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputRow}>
      <TextInput
        style={[styles.input, rightElement ? styles.inputWithRight : null, style]}
        placeholderTextColor={colors.textLight}
        {...rest}
      />
      {rightElement ? (
        <View style={styles.rightElement} pointerEvents="box-none">
          {rightElement}
        </View>
      ) : null}
    </View>
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
  inputRow: {
    position: 'relative',
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
  inputWithRight: {
    paddingRight: 48,
  },
  rightElement: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
});
