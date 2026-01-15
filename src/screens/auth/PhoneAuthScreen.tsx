import React, { useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextInputField } from '../../components/ui/TextInputField';
import { Button } from '../../components/ui/Button';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneAuth'>;

export const PhoneAuthScreen: React.FC<Props> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Enter phone number.');
      return;
    }
    try {
      setLoading(true);
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      navigation.navigate('VerifyCode', { confirmation, phoneNumber });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <TextInputField
        label="Phone number"
        keyboardType="phone-pad"
        placeholder="+1 555 123 4567"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <Button title="Send code" onPress={sendCode} loading={loading} />
    </ScreenContainer>
  );
};


