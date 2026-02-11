/**
 * Color palette for the application
 * Centralized color definitions for consistent theming
 */

export const colors = {
  // Primary colors
  primary: '#38ab36',
  primaryDark: '#158A3B',
  primaryLight: '#4CD17E',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  grey: '#64748B',
  lightGrey: '#F1F5F9',
  mediumGrey: '#CBD5E1',
  darkGrey: '#1F2937',

  // Background colors
  background: '#F7F8FA',
  backgroundLight: '#FBFCFD',
  surface: '#FFFFFF',

  // Text colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textLight: '#94A3B8',
  textWhite: '#FFFFFF',

  // Border colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  borderGreen: '#158A3B',

  // Status colors
  success: '#1BAC4B',
  error: '#E43B3B',
  warning: '#F5B400',
  info: '#1E7BF6',

  // Semantic colors
  cardBackground: '#FFFFFF',
  divider: '#E0E0E0',
  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowLight: 'rgba(15, 23, 42, 0.04)',
  shadowDark: 'rgba(15, 23, 42, 0.12)',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

// Legacy support (backward compatibility)
export default colors;
