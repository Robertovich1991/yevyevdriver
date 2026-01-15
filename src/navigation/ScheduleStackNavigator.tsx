import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AvailabilityListScreen } from '../screens/main/AvailabilityListScreen';
import { CreateEditAvailabilityScreen } from '../screens/main/CreateEditAvailabilityScreen';
import type { Availability } from '../types/availability';

export type ScheduleStackParamList = {
  AvailabilityList: undefined;
  CreateEditAvailability: {
    availability?: Availability;
    isEditing?: boolean;
  };
};

const Stack = createNativeStackNavigator<ScheduleStackParamList>();

export const ScheduleStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AvailabilityList" component={AvailabilityListScreen} />
    <Stack.Screen
      name="CreateEditAvailability"
      component={CreateEditAvailabilityScreen}
      options={{ title: 'Availability' }}
    />
  </Stack.Navigator>
);
