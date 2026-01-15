import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { OrdersScreen } from '../screens/main/OrdersScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { ScheduleStackNavigator } from './ScheduleStackNavigator';

export type AppTabsParamList = {
  Profile: undefined;
  Schedule: undefined;
  Orders: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export const AppTabsNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    <Tab.Screen name="Schedule" component={ScheduleStackNavigator} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);


