import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { CarDetailScreen } from '../screens/main/CarDetailScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  CarDetail: {
    carId?: number;
    car?: any;
  };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen
      name="CarDetail"
      component={CarDetailScreen}
      options={{ title: 'Car Details' }}
    />
  </Stack.Navigator>
);
