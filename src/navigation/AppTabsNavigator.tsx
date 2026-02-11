import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { OrdersScreen } from '../screens/main/OrdersScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { ScheduleStackNavigator } from './ScheduleStackNavigator';
import { Icon } from '../assets/icons/Icon';
import { colors } from '../assets/style/colors';
import { useLanguageStore } from '../store/useLanguageStore';
import { getTabNavigatorTranslations } from '../i18n/translations';

export type AppTabsParamList = {
  Profile: undefined;
  Availability: undefined;
  Orders: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export const AppTabsNavigator: React.FC = () => {
  const language = useLanguageStore(s => s.language);
  const t = useMemo(() => getTabNavigatorTranslations(language), [language]);

  // @ts-ignore - React Navigation type definition issue with id property
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: t.profile,
          tabBarIcon: ({ color }) => (
            <Icon name="profile" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Availability"
        component={ScheduleStackNavigator}
        options={{
          tabBarLabel: t.availability,
          tabBarIcon: ({ color }) => (
            <Icon name="calendar" size={22} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: event => {
            event.preventDefault();
            navigation.navigate('Availability', {
              screen: 'AvailabilityList',
            });
          },
        })}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: t.orders,
          tabBarIcon: ({ color }) => (
            <Icon name="orders" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t.settings,
          tabBarIcon: ({ color }) => (
            <Icon name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
