import React, { type ReactNode } from 'react';
import { SafeAreaView, StyleSheet, type ViewStyle } from 'react-native';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
}

export const ScreenContainer: React.FC<Props> = ({ children, style }) => (
  <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
});


