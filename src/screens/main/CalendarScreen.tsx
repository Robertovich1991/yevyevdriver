import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AvailabilityCalendar } from '../../components/forms/AvailabilityCalendar';
import { Button } from '../../components/ui/Button';
import { useDriverStore } from '../../store/useDriverStore';
import { saveAvailability } from '../../api/drivers';
import type { DriverAvailability } from '../../types/driver';

export const CalendarScreen: React.FC = () => {
//  const profile = useDriverStore((s) => s.profile);
  const updateAvailability = useDriverStore((s) => s.updateAvailability);
  const [availability, setAvailability] = useState<DriverAvailability>({});

const profile={id:'',availability:{}};

  useEffect(() => {
    if (profile?.availability) {
    //  setAvailability(profile.availability);
    }
  }, [profile]);

  const save = async () => {
    if (!profile) {
      return;
    }
    try {
      await saveAvailability(profile.id, availability);
      updateAvailability(availability);
      Alert.alert('Saved', 'Availability updated.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save availability.');
    }
  };

  return (
    <ScreenContainer>
      <AvailabilityCalendar value={availability} onChange={setAvailability} />
      <Button title="Save availability" onPress={save} />
    </ScreenContainer>
  );
};


