import React, { useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextInputField } from '../../components/ui/TextInputField';
import { Button } from '../../components/ui/Button';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import {
  ARMENIA_PHONE_PREFIX,
  formatArmeniaPhoneInput,
  isValidArmeniaPhone,
} from '../../utils/phone';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneAuth'>;

export const PhoneAuthScreen: React.FC<Props> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState(ARMENIA_PHONE_PREFIX);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!isValidArmeniaPhone(phoneNumber)) {
      Alert.alert('Error', 'Phone number must be +374 followed by 8 digits.');
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
        placeholder="+374XXXXXXXX"
        value={phoneNumber}
        onChangeText={text => setPhoneNumber(formatArmeniaPhoneInput(text))}
      />
      <Button title="Send code" onPress={sendCode} loading={loading} />
    </ScreenContainer>
  );
};


