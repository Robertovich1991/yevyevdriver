import React from 'react';
import { Text } from 'react-native';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useDriverStore } from '../../store/useDriverStore';

export const HomeScreen: React.FC = () => {
  const profile = useDriverStore((s) => s.profile);
  return (
    <ScreenContainer>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
        {profile ? `Hi, ${profile.name}` : 'Welcome'}
      </Text>
      <Text>Use the tabs below to manage your availability, route, and orders.</Text>
    </ScreenContainer>
  );
};


