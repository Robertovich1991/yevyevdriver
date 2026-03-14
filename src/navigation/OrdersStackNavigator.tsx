import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersScreen } from '../screens/main/OrdersScreen';
import {
  TripOrdersScreen,
  type OrdersStackParamList,
} from '../screens/main/TripOrdersScreen';

export type { OrdersStackParamList } from '../screens/main/TripOrdersScreen';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export const OrdersStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OrdersList" component={OrdersScreen} />
    <Stack.Screen name="TripOrders" component={TripOrdersScreen} />
  </Stack.Navigator>
);
