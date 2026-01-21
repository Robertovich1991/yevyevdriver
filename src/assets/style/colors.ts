/**
 * Color palette for the application
 * Centralized color definitions for consistent theming
 */

export const colors = {
  // Primary colors
  primary: '#38AA35',
  primaryDark: '#2D882A',
  primaryLight: '#4BC548',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  grey: '#575757',
  lightGrey: '#F1F1F1',
  mediumGrey: '#CCCCCC',
  darkGrey: '#333333',
  
  // Background colors
  background: '#E8F5E9',
  backgroundLight: '#F1F8E9',
  surface: '#FFFFFF',
  
  // Text colors
  textPrimary: '#000000',
  textSecondary: '#575757',
  textLight: '#999999',
  textWhite: '#FFFFFF',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  borderGreen: '#2D882A',
  
  // Status colors
  success: '#38AA35',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  
  // Semantic colors
  cardBackground: '#FFFFFF',
  divider: '#E0E0E0',
  shadow: 'rgba(56, 170, 53, 0.15)',
  shadowLight: 'rgba(56, 170, 53, 0.1)',
  shadowDark: 'rgba(45, 136, 42, 0.2)',
  
  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

// Legacy support (backward compatibility)
export default colors;
