import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { DriverRegistrationForm } from '../../components/forms/DriverRegistrationForm';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<AuthStackParamList & RootStackParamList, 'DriverRegistration'>;

export const DriverRegistrationScreen: React.FC<Props> = ({ navigation }) => (
  <ScreenContainer>
    <DriverRegistrationForm
      onSuccess={() =>
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppTabs' as never }],
        })
      }
    />
  </ScreenContainer>
);


