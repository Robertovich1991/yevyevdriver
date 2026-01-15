import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { PhoneAuthScreen } from '../screens/auth/PhoneAuthScreen';
import { VerifyCodeScreen } from '../screens/auth/VerifyCodeScreen';
import { DriverRegistrationScreen } from '../screens/auth/DriverRegistrationScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  PhoneAuth: undefined;
  VerifyCode: {
    phoneNumber: string;
    confirmation: any;
  };
  DriverRegistration: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: 'Login' }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Register' }}
    />
    <Stack.Screen
      name="PhoneAuth"
      component={PhoneAuthScreen}
      options={{ title: 'Sign in' }}
    />
    <Stack.Screen
      name="VerifyCode"
      component={VerifyCodeScreen}
      options={{ title: 'Verify code' }}
    />
    <Stack.Screen
      name="DriverRegistration"
      component={DriverRegistrationScreen}
      options={{ title: 'Driver registration' }}
    />
  </Stack.Navigator>
);


