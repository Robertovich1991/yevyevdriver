import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AvailabilityListScreen } from '../screens/main/AvailabilityListScreen';
import { CreateEditAvailabilityScreen } from '../screens/main/CreateEditAvailabilityScreen';
import { AvailabilityTemplatesListScreen } from '../screens/main/AvailabilityTemplatesListScreen';
import { AvailabilityTemplateEditorScreen } from '../screens/main/AvailabilityTemplateEditorScreen';
import { ApplyTemplateScreen } from '../screens/main/ApplyTemplateScreen';
import type { Availability, AvailabilityTemplate } from '../types/availability';

export type ScheduleStackParamList = {
  AvailabilityList: undefined;
  CreateEditAvailability: {
    availability?: Availability;
    isEditing?: boolean;
  };
  AvailabilityTemplatesList: undefined;
  AvailabilityTemplateEditor: {
    template?: AvailabilityTemplate;
    isEditing?: boolean;
  };
  ApplyTemplate: {
    template: AvailabilityTemplate;
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
    <Stack.Screen
      name="AvailabilityTemplatesList"
      component={AvailabilityTemplatesListScreen}
      options={{ title: 'Availability Templates' }}
    />
    <Stack.Screen
      name="AvailabilityTemplateEditor"
      component={AvailabilityTemplateEditorScreen}
      options={{ title: 'Template Editor' }}
    />
    <Stack.Screen
      name="ApplyTemplate"
      component={ApplyTemplateScreen}
      options={{ title: 'Apply Template' }}
    />
  </Stack.Navigator>
);
