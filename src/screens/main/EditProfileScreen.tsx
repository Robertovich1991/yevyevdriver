import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Linking,
  Image,
  KeyboardAvoidingView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { launchCamera, CameraOptions, type Asset } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextInputField } from '../../components/ui/TextInputField';
import { Button } from '../../components/ui/Button';
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import { theme } from '../../assets/style/theme';
import { Icon } from '../../assets/icons/Icon';
import { API_BASE_URL, API_URL, TOKEN_KEY, USER_DATA_KEY } from '../../config/api';
import { useAlert } from '../../context/AlertContext';

interface UserData {
  name: string;
  surname: string;
  email: string;
  userId: string;
  phone?: string;
  avatar?: string;
  currentCarId?: number;
  drivingLicencePhotos?: LicencePhoto[];
}

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type?: string;
  seats: number;
  photos: CarPhoto[];
}

interface CarPhoto {
  filename: string;
  path: string;
  url: string;
}

interface LicencePhoto {
  filename: string;
  path: string;
  url: string;
}

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [currentCarId, setCurrentCarId] = useState<number | null>(null);
  const [drivingLicencePhotos, setDrivingLicencePhotos] = useState<LicencePhoto[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLicencePhoto, setUploadingLicencePhoto] = useState(false);

  useEffect(() => {
    loadUserData();
    loadCars();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        // Fallback to AsyncStorage if no token
        const data = await AsyncStorage.getItem(USER_DATA_KEY);
        if (data) {
          const userData: UserData = JSON.parse(data);
          const nameParts = (userData.name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = userData.surname || nameParts.slice(1).join(' ') || '';
          
          setName(firstName);
          setSurname(lastName);
          setEmail(userData.email || '');
          setPhone(userData.phone || '');
          setAvatar(userData.avatar || null);
          setCurrentCarId(userData.currentCarId || null);
          setDrivingLicencePhotos(userData.drivingLicencePhotos || []);
        }
        setLoading(false);
        return;
      }

      // Fetch latest user data from API
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle different response structures
        const apiResponse = response.data?.data || response.data;
        const apiUserData = apiResponse?.user || apiResponse;
        
        if (apiUserData) {
          const nameParts = (apiUserData.name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = apiUserData.surname || nameParts.slice(1).join(' ') || '';
          
          setName(firstName);
          setSurname(lastName);
          setEmail(apiUserData.email || '');
          setPhone(apiUserData.phone || '');
          setAvatar(apiUserData.avatar || null);
          
          // Set currentCarId from API (convert to number if needed)
          const apiCurrentCarId = apiUserData.currentCarId;
          if (apiCurrentCarId !== undefined && apiCurrentCarId !== null) {
            const carId = typeof apiCurrentCarId === 'number' 
              ? apiCurrentCarId 
              : parseInt(String(apiCurrentCarId));
            setCurrentCarId(!isNaN(carId) && carId > 0 ? carId : null);
          } else {
            setCurrentCarId(null);
          }
          
          // Load driving licence photos from API
          const apiDrivingLicence = apiUserData.drivingLicense || apiUserData.drivingLicencePhotos || [];
          console.log('API drivingLicense:', apiDrivingLicence);
          if (Array.isArray(apiDrivingLicence) && apiDrivingLicence.length > 0) {
            const licencePhotos: LicencePhoto[] = apiDrivingLicence.map((item: any) => ({
              filename: item.filename || '',
              path: item.path || '',
              url: item.url || item.path || '',
            }));
            console.log('Parsed driving licence photos:', licencePhotos);
            setDrivingLicencePhotos(licencePhotos);
          } else {
            setDrivingLicencePhotos([]);
          }
          
          // Also update AsyncStorage
          const updatedUserData: UserData = {
            name: firstName,
            surname: lastName,
            email: apiUserData.email || '',
            userId: apiUserData.id?.toString() || apiUserData.userId?.toString() || '',
            phone: apiUserData.phone || undefined,
            avatar: apiUserData.avatar || undefined,
            currentCarId: apiCurrentCarId !== undefined && apiCurrentCarId !== null 
              ? (typeof apiCurrentCarId === 'number' ? apiCurrentCarId : parseInt(String(apiCurrentCarId)))
              : undefined,
            drivingLicencePhotos: Array.isArray(apiDrivingLicence) && apiDrivingLicence.length > 0
              ? apiDrivingLicence.map((item: any) => ({
                  filename: item.filename || '',
                  path: item.path || '',
                  url: item.url || item.path || '',
                }))
              : undefined,
          };
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUserData));
        }
      } catch (apiError) {
        console.error('Error fetching user data from API:', apiError);
        // Fallback to AsyncStorage if API fails
        const data = await AsyncStorage.getItem(USER_DATA_KEY);
        if (data) {
          const userData: UserData = JSON.parse(data);
          const nameParts = (userData.name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = userData.surname || nameParts.slice(1).join(' ') || '';
          
          setName(firstName);
          setSurname(lastName);
          setEmail(userData.email || '');
          setPhone(userData.phone || '');
          setAvatar(userData.avatar || null);
          setCurrentCarId(userData.currentCarId || null);
          setDrivingLicencePhotos(userData.drivingLicencePhotos || []);
        }
      }
    } catch (e) {
      console.error('Error loading user data:', e);
      showAlert('Failed to load user data.', 'Error', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ], 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCars = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        return;
      }

      // Get userId from /auth/me endpoint (more reliable than parsing from AsyncStorage)
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('Could not get userId for loading cars');
        return;
      }

      // Load cars using GET /api/v1/cars/user/:userId
      const response = await axios.get(`${API_BASE_URL}/cars/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle response - API returns cars array
      const carsData = response.data?.cars || response.data || [];
      setCars(Array.isArray(carsData) ? carsData : []);
    } catch (e: any) {
      console.error('Error loading cars:', e);
      setCars([]);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (checkResult) {
        return true;
      }

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message:
            'This app needs access to your camera to take photos for your profile.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const takePhoto = async (): Promise<Asset | null> => {
    if (Platform.OS === 'android') {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        showAlert(
          'Camera permission is required to take photos. Please enable it in your device settings.',
          'Permission Required',
          [{ text: 'OK' }],
          'warning'
        );
        return null;
      }
    }

    return new Promise((resolve) => {
      const options: CameraOptions = {
        mediaType: 'photo',
        quality: 0.8,
        cameraType: 'back',
        saveToPhotos: false,
        presentationStyle: 'fullScreen',
      };

      launchCamera(options, (response) => {
        if (response.didCancel) {
          resolve(null);
          return;
        }

        if (response.errorCode || response.errorMessage) {
          if (response.errorCode === 'permission') {
            showAlert(
              'Camera permission was denied. Please enable it in your device settings.',
              'Permission Denied',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings(),
                },
              ],
              'error'
            );
          } else {
            showAlert(
              response.errorMessage || 'Failed to open camera.',
              'Camera Error',
              undefined,
              'error'
            );
          }
          resolve(null);
          return;
        }

        const asset = response.assets?.[0];
        if (asset && asset.uri) {
          resolve(asset);
        } else {
          resolve(null);
        }
      });
    });
  };

  const uploadAvatarImage = async (imageAsset: Asset): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        showAlert('Authentication token not found. Please login again.', 'Error', undefined, 'error');
        return null;
      }

      if (!imageAsset.uri) {
        showAlert('Image URI not found.', 'Error', undefined, 'error');
        return null;
      }

      const fileName = imageAsset.fileName || `avatar_${Date.now()}.jpg`;
      const fileType = imageAsset.type || 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? imageAsset.uri : imageAsset.uri.replace('file://', ''),
        type: fileType,
        name: fileName,
      } as any);

      const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('EditProfile Upload response:', JSON.stringify(response.data, null, 2));
      const uploadResponse = response.data?.data || response.data;
      console.log('EditProfile Upload response parsed:', uploadResponse);

      if (!uploadResponse) {
        console.error('No upload response data:', response.data);
        showAlert('Image uploaded but no data received.', 'Error', undefined, 'error');
        return null;
      }

      // Extract path and url similar to car photos (prioritize path)
      const avatarPath = uploadResponse.path || '';
      const avatarUrl = uploadResponse.url || uploadResponse.path || '';
      
      console.log('EditProfile Upload response path:', avatarPath);
      console.log('EditProfile Upload response url:', uploadResponse.url);
      console.log('EditProfile Upload response filename:', uploadResponse.filename);
      
      // Use path if available (like car photos), otherwise use url
      let finalAvatarUrl = avatarPath || avatarUrl;
      
      if (!finalAvatarUrl) {
        console.error('No URL/path in upload response:', uploadResponse);
        showAlert('Image uploaded but no URL received.', 'Error', undefined, 'error');
        return null;
      }

      // If the URL is relative, ensure it doesn't start with a slash
      if (!finalAvatarUrl.startsWith('http://') && !finalAvatarUrl.startsWith('https://')) {
        finalAvatarUrl = finalAvatarUrl.replace(/^\//, '');
      }

      console.log('EditProfile Final avatar URL:', finalAvatarUrl);
      return finalAvatarUrl;
    } catch (e: any) {
      console.error('Upload avatar error:', e);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to upload image. Please try again.';
      showAlert(errorMessage, 'Error', undefined, 'error');
      return null;
    }
  };

  const handleTakeAvatarPhoto = async () => {
    try {
      setUploadingAvatar(true);
      const asset = await takePhoto();
      if (asset && asset.uri) {
        const avatarUrl = await uploadAvatarImage(asset);
        if (avatarUrl) {
          setAvatar(avatarUrl);
        }
      }
    } catch (e) {
      showAlert('Failed to take photo.', 'Error', undefined, 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadImage = async (imageAsset: Asset): Promise<LicencePhoto | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        showAlert('Authentication token not found. Please login again.', 'Error', undefined, 'error');
        return null;
      }

      if (!imageAsset.uri) {
        showAlert('Image URI not found.', 'Error', undefined, 'error');
        return null;
      }

      const fileName = imageAsset.fileName || `licence_photo_${Date.now()}.jpg`;
      const fileType = imageAsset.type || 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? imageAsset.uri : imageAsset.uri.replace('file://', ''),
        type: fileType,
        name: fileName,
      } as any);

      const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const uploadResponse = response.data?.data || response.data;

      if (!uploadResponse) {
        console.error('Upload response:', response.data);
        showAlert('Image uploaded but no data received.', 'Error', undefined, 'error');
        return null;
      }

      const photoObject: LicencePhoto = {
        filename: uploadResponse.filename || fileName,
        path: uploadResponse.path || '',
        url: uploadResponse.url || uploadResponse.path || '',
      };

      if (!photoObject.url && !photoObject.path) {
        console.error('Upload response:', response.data);
        showAlert('Image uploaded but no URL received.', 'Error', undefined, 'error');
        return null;
      }

      return photoObject;
    } catch (e: any) {
      console.error('Upload error:', e);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to upload image. Please try again.';
      showAlert(errorMessage, 'Error', undefined, 'error');
      return null;
    }
  };

  const handleTakeLicencePhoto = async () => {
    try {
      if (uploadingLicencePhoto) {
        showAlert('Uploading photo, please wait...', 'Please Wait', undefined, 'info');
        return;
      }

      const asset = await takePhoto();
      if (asset && asset.uri) {
        setUploadingLicencePhoto(true);

        try {
          const photoInfo = await uploadImage(asset);
          if (photoInfo) {
            setDrivingLicencePhotos([...drivingLicencePhotos, photoInfo]);
            showAlert('Driving licence photo uploaded successfully!', 'Success', undefined, 'success');
          } else {
            showAlert('Failed to upload photo.', 'Error', undefined, 'error');
          }
        } finally {
          setUploadingLicencePhoto(false);
        }
      }
    } catch (e) {
      console.error('Error taking licence photo:', e);
      setUploadingLicencePhoto(false);
      showAlert('Failed to take photo.', 'Error', undefined, 'error');
    }
  };

  const handleRemoveLicencePhoto = (index: number) => {
    showAlert(
      'Are you sure you want to remove this photo?',
      'Remove Photo',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedPhotos = drivingLicencePhotos.filter((_, i) => i !== index);
            setDrivingLicencePhotos(updatedPhotos);
          },
        },
      ],
      'warning'
    );
  };

  const getCurrentUserId = async (): Promise<number | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle different response structures
      const apiResponse = response.data?.data || response.data;
      const userData = apiResponse?.user || apiResponse;
      
      // Extract user ID from response
      const userId = userData?.id || apiResponse?.id || response.data?.id || response.data?.data?.id || response.data?.user?.id;
      return userId ? parseInt(userId.toString()) : null;
    } catch (e: any) {
      console.error('Error getting current user ID:', e);
      return null;
    }
  };

  const validateForm = (): { valid: boolean; error?: string } => {
    if (!name.trim()) {
      return { valid: false, error: 'Name is required.' };
    }

    if (!email.trim()) {
      return { valid: false, error: 'Email is required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      showAlert(validation.error || '', 'Validation Error', undefined, 'error');
      return;
    }

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        showAlert('Authentication token not found. Please login again.', 'Error', undefined, 'error');
        setSaving(false);
        return;
      }

      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) {
        showAlert('User data not found.', 'Error', undefined, 'error');
        setSaving(false);
        return;
      }

      const currentUserData: UserData = JSON.parse(userDataString);

      // Get current user ID from /auth/me endpoint
      const userId = await getCurrentUserId();
      if (!userId) {
        showAlert('Could not retrieve user ID. Please login again.', 'Error', undefined, 'error');
        setSaving(false);
        return;
      }

      // Prepare update payload according to API specification
      const updatePayload: any = {
        name: name.trim(),
        surname: surname.trim() || undefined,
        email: email.toLowerCase().trim(),
        phone: phone.trim() || undefined,
      };

      // Add currentCarId if selected
      if (currentCarId !== null) {
        updatePayload.currentCarId = currentCarId;
      }

      // Add avatar if exists
      if (avatar) {
        updatePayload.avatar = avatar;
      }

      // Add drivingLicense array if photos exist
      if (drivingLicencePhotos.length > 0) {
        updatePayload.drivingLicense = drivingLicencePhotos.map((photo) => ({
          filename: photo.filename,
          url: photo.url,
          path: photo.path,
        }));
      }

      // Update user profile via API
      try {
        await axios.put(
          `${API_BASE_URL}/users/update/${userId}`,
          updatePayload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update local storage
        const updatedUserData: UserData = {
          ...currentUserData,
          name: name.trim(),
          surname: surname.trim() || '',
          email: email.toLowerCase().trim(),
          phone: phone.trim() || undefined,
          currentCarId: currentCarId || undefined,
          drivingLicencePhotos: drivingLicencePhotos.length > 0 ? drivingLicencePhotos : undefined,
        };
        
        if (avatar) {
          updatedUserData.avatar = avatar;
        }
        
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUserData));

        showAlert('Profile updated successfully!', 'Success', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ], 'success');
      } catch (apiError: any) {
        console.error('API update error:', apiError);
        const errorMessage =
          apiError.response?.data?.message ||
          apiError.response?.data?.error ||
          apiError.message ||
          'Failed to update profile. Please try again.';
        
        // Still update local storage as fallback
        const updatedUserData: UserData = {
          ...currentUserData,
          name: name.trim(),
          surname: surname.trim() || '',
          email: email.toLowerCase().trim(),
          phone: phone.trim() || undefined,
          currentCarId: currentCarId || undefined,
          drivingLicencePhotos: drivingLicencePhotos.length > 0 ? drivingLicencePhotos : undefined,
        };
        
        if (avatar) {
          updatedUserData.avatar = avatar;
        }
        
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUserData));

        showAlert(`${errorMessage}\n\nChanges saved locally.`, 'Warning', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ], 'warning');
      }
    } catch (e: any) {
      console.error('Save profile error:', e);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to update profile. Please try again.';
      showAlert(errorMessage, 'Error', undefined, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const first = name.charAt(0).toUpperCase() || '';
    const last = surname.charAt(0).toUpperCase() || '';
    return first + (last || '');
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {avatar ? (
                <Image 
                  source={{ 
                    uri: (() => {
                      if (!avatar) return '';
                      console.log('EditProfile Avatar URI:', avatar);
                      // If it's already a full URL, use it directly
                      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
                        console.log('Using full URL:', avatar);
                        return avatar;
                      }
                      
                      // Check if it's a storage path (like storage/images/...)
                      if (avatar.startsWith('storage/')) {
                        const finalUri = `${API_URL}/${avatar}`;
                        console.log('Storage path - Final Avatar URI:', finalUri);
                        return finalUri;
                      }
                      
                      // Otherwise, prepend API_URL for relative paths
                      const finalUri = `${API_URL}/${avatar.replace(/^\//, '')}`;
                      console.log('Relative path - Final Avatar URI:', finalUri);
                      return finalUri;
                    })()
                  }} 
                  style={styles.avatar}
                  onError={(error) => {
                    console.error('EditProfile Avatar image load error:', error.nativeEvent.error);
                    console.log('Failed URI:', avatar);
                  }}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getInitials() || 'U'}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={handleTakeAvatarPhoto}
                style={styles.editIconButton}
                activeOpacity={0.7}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Icon name="edit" size={20} color={theme.colors.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <TextInputField
              label="Name *"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInputField
              label="Surname"
              placeholder="Enter your surname"
              value={surname}
              onChangeText={setSurname}
              autoCapitalize="words"
            />

            <TextInputField
              label="Email *"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInputField
              label="Phone"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* Current Car Selection */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Current Car</Text>
              {cars.length === 0 ? (
                <View style={styles.noCarsContainer}>
                  <Text style={styles.noCarsText}>No cars available. Add a car first.</Text>
                  <TouchableOpacity
                    style={styles.addCarLink}
                    onPress={() => {
                      navigation.goBack();
                      // Navigate to add car screen
                      setTimeout(() => {
                        navigation.navigate('CarDetail' as any, {});
                      }, 100);
                    }}
                  >
                    <Text style={styles.addCarLinkText}>+ Add Car</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.carsScrollView}
                  contentContainerStyle={styles.carsScrollContent}
                >
                  <TouchableOpacity
                    style={[
                      styles.carOption,
                      currentCarId === null && styles.carOptionSelected,
                    ]}
                    onPress={() => setCurrentCarId(null)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.carOptionText,
                        currentCarId === null && styles.carOptionTextSelected,
                      ]}
                    >
                      None
                    </Text>
                  </TouchableOpacity>
                  {cars.map((car) => (
                    <TouchableOpacity
                      key={car.id}
                      style={[
                        styles.carOption,
                        currentCarId === car.id && styles.carOptionSelected,
                      ]}
                      onPress={() => setCurrentCarId(car.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.carOptionText,
                          currentCarId === car.id && styles.carOptionTextSelected,
                        ]}
                      >
                        {car.make} {car.model}
                      </Text>
                      {car.licensePlate && (
                        <Text
                          style={[
                            styles.carPlateText,
                            currentCarId === car.id && styles.carPlateTextSelected,
                          ]}
                        >
                          {car.licensePlate}
                        </Text>
                      )}
                      {car.year && (
                        <Text
                          style={[
                            styles.carYearText,
                            currentCarId === car.id && styles.carYearTextSelected,
                          ]}
                        >
                          {car.year}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Driving Licence Photos */}
            <View style={styles.fieldWrapper}>
              <View style={styles.licenceHeader}>
                <Text style={styles.label}>Driving Licence Photos</Text>
                <TouchableOpacity
                  onPress={handleTakeLicencePhoto}
                  style={styles.addPhotoButton}
                  disabled={uploadingLicencePhoto}
                  activeOpacity={0.7}
                >
                  {uploadingLicencePhoto ? (
                    <Text style={styles.addPhotoButtonText}>Uploading...</Text>
                  ) : (
                    <Text style={styles.addPhotoButtonText}>+ Add Photo</Text>
                  )}
                </TouchableOpacity>
              </View>
              {drivingLicencePhotos.length === 0 ? (
                <View style={styles.emptyPhotosContainer}>
                  <Text style={styles.emptyPhotosText}>No photos added yet</Text>
                  <Text style={styles.emptyPhotosHint}>
                    Tap "Add Photo" to add driving licence photos
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={drivingLicencePhotos}
                  keyExtractor={(item, index) => `${item.filename}-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item, index }) => {
                    // Match exact pattern from CarDetailScreen
                    let imageUri = '';
                    if (item.path) {
                      // If path starts with storage/, use it directly, otherwise prepend API_URL
                      if (item.path.startsWith('storage/')) {
                        imageUri = `${API_URL}/${item.path}`;
                      } else if (item.path.startsWith('http://') || item.path.startsWith('https://')) {
                        imageUri = item.path;
                      } else {
                        imageUri = `${API_URL}/${item.path.replace(/^\//, '')}`;
                      }
                    } else if (item.url) {
                      imageUri = item.url.startsWith('http://') || item.url.startsWith('https://') 
                        ? item.url 
                        : `${API_URL}/${item.url.replace(/^\//, '')}`;
                    }
                    console.log('Driving licence photo URI:', imageUri, 'item:', item);
                    return (
                      <View style={styles.photoContainer}>
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.licencePhoto}
                          resizeMode="cover"
                          onError={(error) => {
                            console.error('Driving licence image load error:', error.nativeEvent.error);
                            console.log('Failed URI:', imageUri, 'item:', item);
                          }}
                        />
                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          onPress={() => handleRemoveLicencePhoto(index)}
                          activeOpacity={0.7}
                        >
                          <Icon name="remove" size={16} color={theme.colors.white} />
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.saveButtonContainer}>
            <Button
              title={saving ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={saving}
              loading={saving}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.border,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  editIconButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.spacing.borderRadius.md,
    backgroundColor: theme.colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  saveButtonContainer: {
    flex: 2,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  noCarsContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  noCarsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  addCarLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  addCarLinkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  carsScrollView: {
    marginVertical: 8,
  },
  carsScrollContent: {
    paddingRight: 8,
  },
  carOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    minWidth: 120,
    alignItems: 'center',
  },
  carOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  carOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  carOptionTextSelected: {
    color: '#FFFFFF',
  },
  carPlateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  carPlateTextSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  carYearText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  carYearTextSelected: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  licenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addPhotoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  addPhotoButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyPhotosContainer: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyPhotosText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyPhotosHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  licencePhoto: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
