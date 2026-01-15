import React from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { RouteForm } from '../../components/forms/RouteForm';
import { useDriverStore } from '../../store/useDriverStore';
import { saveRoute } from '../../api/drivers';

export const RouteScreen: React.FC = () => {
  const profile = useDriverStore((s) => s.profile);
  const updateRoute = useDriverStore((s) => s.updateRoute);

  if (!profile) {
    return null;
  }

  const handleSubmit = async (route: any) => {
    try {
      await saveRoute(profile.id, route);
      updateRoute(route);
      Alert.alert('Saved', 'Route updated.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save route.');
    }
  };

  return (
    <ScreenContainer>
      <RouteForm initial={profile.route} onSubmit={handleSubmit} />
    </ScreenContainer>
  );
};


