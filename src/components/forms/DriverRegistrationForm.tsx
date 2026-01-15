import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { TextInputField } from '../ui/TextInputField';
import { Button } from '../ui/Button';
import { CarPhotosUploader } from './CarPhotosUploader';
import { useAuthStore } from '../../store/useAuthStore';
import { useDriverStore } from '../../store/useDriverStore';
import { createDriverProfile } from '../../api/drivers';

interface Props {
  onSuccess: () => void;
}

export const DriverRegistrationForm: React.FC<Props> = ({ onSuccess }) => {
  const userId = useAuthStore((s) => s.userId);
  const phoneNumber = useAuthStore((s) => s.phoneNumber);
  const setProfile = useDriverStore((s) => s.setProfile);

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!userId || !phoneNumber) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    if (!name || !licenseNumber || !brand || !model) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const profile = await createDriverProfile({
        userId,
        phoneNumber,
        name,
        dateOfBirth: dob,
        driverLicenseNumber: licenseNumber,
        driverLicenseExpiry: licenseExpiry,
        car: {
          brand,
          model,
          year: Number(year) || new Date().getFullYear(),
          color,
          licensePlate: plate,
          photos: [],
        },
        photoUris,
      });
      setProfile(profile);
      onSuccess();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <TextInputField label="Full name" value={name} onChangeText={setName} />
      <TextInputField
        label="Date of birth"
        placeholder="YYYY-MM-DD"
        value={dob}
        onChangeText={setDob}
      />
      <TextInputField
        label="Driver license number"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
      />
      <TextInputField
        label="License expiry"
        placeholder="YYYY-MM-DD"
        value={licenseExpiry}
        onChangeText={setLicenseExpiry}
      />

      <TextInputField label="Car brand" value={brand} onChangeText={setBrand} />
      <TextInputField label="Model" value={model} onChangeText={setModel} />
      <TextInputField
        label="Year"
        keyboardType="number-pad"
        value={year}
        onChangeText={setYear}
      />
      <TextInputField label="Color" value={color} onChangeText={setColor} />
      <TextInputField label="License plate" value={plate} onChangeText={setPlate} />

      <CarPhotosUploader value={photoUris} onChange={setPhotoUris} />

      <Button title="Create profile" onPress={submit} loading={loading} />
    </ScrollView>
  );
}


