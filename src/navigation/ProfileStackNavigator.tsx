import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { CarDetailScreen } from '../screens/main/CarDetailScreen';
import { EditProfileScreen } from '../screens/main/EditProfileScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  CarDetail: {
    carId?: number;
    car?: any;
  };
  EditProfile: undefined;
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
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
  </Stack.Navigator>
);
