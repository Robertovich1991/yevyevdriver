import React, { useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextInputField } from '../../components/ui/TextInputField';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyCode'>;

export const VerifyCodeScreen: React.FC<Props> = ({ route, navigation }) => {
  const { confirmation, phoneNumber } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const confirmCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Enter verification code.');
      return;
    }
    try {
      setLoading(true);
      const cred = await confirmation.confirm(code);
      setUser(cred.user.uid, phoneNumber);
      navigation.replace('DriverRegistration');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <TextInputField
        label="Verification code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
      />
      <Button title="Verify" onPress={confirmCode} loading={loading} />
    </ScreenContainer>
  );
};


