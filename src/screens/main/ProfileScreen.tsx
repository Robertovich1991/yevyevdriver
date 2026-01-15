import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, PermissionsAndroid, Linking, FlatList, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, CameraOptions, type Asset } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useDriverStore } from '../../store/useDriverStore';
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import { theme } from '../../assets/style/theme';
import { Icon } from '../../assets/icons/Icon';

const USER_DATA_KEY = '@user_data';
const TOKEN_KEY = '@auth_token';
const API_BASE_URL = 'http://192.168.100.12:8000/api/v1';
const API_URL = 'http://192.168.100.12:8000';
interface UserData {
  name: string;
  surname: string;
  email: string;
  userId: string;
  avatar?: string;
}

interface CarPhoto {
  filename: string;
  url: string;
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

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const profile = useDriverStore((s) => s.profile);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    loadCars();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reload cars when screen comes into focus (e.g., after adding/editing a car)
      loadCars();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadCars = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) {
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userDataString);
      let userId = 0;
      if (userData.userId) {
        const parsedId = typeof userData.userId === 'string' 
          ? parseInt(userData.userId) 
          : userData.userId;
        userId = isNaN(parsedId) ? 0 : parsedId;
      }

      if (userId === 0) {
        console.error('Invalid userId');
        setCars([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/cars/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
console.log(response.data,'[[[[[[[[[[[[[[[[[fffff[[[[[[[[[[[');

      const carsData = response.data?.cars || response.data || [];
      setCars(Array.isArray(carsData) ? carsData : []);
    } catch (e: any) {
      console.error('Error loading cars:', e);
      // If API fails, set empty array
      setCars([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCars();
  };

  const saveUserData = async (data: UserData) => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
      setUserData(data);
    } catch (e) {
      console.error('Error saving user data:', e);
      throw e;
    }
  };


  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      // iOS permissions are handled automatically by the library
      return true;
    }

    try {
      // Check if permission is already granted
      const checkResult = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (checkResult) {
        return true;
      }

      // Request permission
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message: 'This app needs access to your camera to take photos for your profile and car pictures.',
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
    // Request camera permission first on Android
    if (Platform.OS === 'android') {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in your device settings.',
          [{ text: 'OK' }]
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
        console.log(response, 'ppppppppppppppppppp');

        if (response.didCancel) {
          resolve(null);
          return;
        }

        if (response.errorCode || response.errorMessage) {
          console.error('Camera error:', response.errorCode, response.errorMessage);
          
          // Handle the "permission in manifest" error specifically
          if (response.errorCode === 'others' && 
              (response.errorMessage?.includes('Manifest.permission.CAMERA') || 
               response.errorMessage?.includes('permission'))) {
            Alert.alert(
              'Camera Permission Required',
              'Camera permission is required. Please enable it in your device settings, then try again.',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
                {
                  text: 'Open Settings',
                  onPress: () => {
                    Linking.openSettings();
                    resolve(null);
                  },
                },
              ]
            );
            return;
          }
          
          // Handle other errors
          let errorMessage = 'Failed to open camera. Please try again.';
          
          if (response.errorCode === 'camera_unavailable') {
            errorMessage = 'Camera is not available on this device.';
          } else if (response.errorCode === 'permission') {
            errorMessage = 'Camera permission was denied. Please enable it in your device settings.';
            Alert.alert(
              'Permission Denied',
              errorMessage,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings(),
                },
              ]
            );
            resolve(null);
            return;
          } else if (response.errorMessage) {
            errorMessage = response.errorMessage;
          }
          
          Alert.alert('Camera Error', errorMessage);
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


  const handleTakeAvatarPhoto = async () => {
    try {
      const asset = await takePhoto();
      if (asset && asset.uri && userData) {
        // For avatar, we can still save locally or upload if needed
        const updatedData = { ...userData, avatar: asset.uri };
        await saveUserData(updatedData);
        Alert.alert('Success', 'Avatar photo updated!');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handleCarPress = (car: Car) => {
    navigation.navigate('CarDetail', { carId: car.id, car });
  };

  const handleAddCar = () => {
    navigation.navigate('CarDetail', {});
  };

console.log(cars,'[[[[[[[[[[[[[[[[[[[[[[[[[[[[');

  // Use registration data if available, otherwise fall back to profile
  const firstName = userData?.name || (profile?.name ? profile.name.split(' ')[0] : '');
  const lastName = userData?.surname || (profile?.surname || (profile?.name ? profile.name.split(' ').slice(1).join(' ') : ''));

  // Get initials for avatar placeholder
  const getInitials = () => {
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName.charAt(0).toUpperCase();
    return first + (last || '');
  };

  if (loading) {
    return (
      <ScreenContainer>
        <Text>Loading...</Text>
      </ScreenContainer>
    );
  }

  if (!userData && !profile) {
    return (
      <ScreenContainer>
        <Text>No profile found.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleTakeAvatarPhoto} activeOpacity={0.8}>
            {userData?.avatar ? (
              <View>
                <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                <View style={styles.cameraIconOverlay}>
                  <Icon name="ok" size={20} color={theme.colors.white} />
                </View>
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
                <View style={styles.cameraIconOverlay}>
                  <Icon name="ok" size={20} color={theme.colors.white} />
                </View>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to take photo</Text>
        </View>

        {/* Name and Surname */}
        <View style={styles.nameSection}>
          <Text style={styles.nameText}>{firstName}</Text>
          {lastName && <Text style={styles.surnameText}>{lastName}</Text>}
          {userData?.email && (
            <Text style={styles.emailText}>{userData.email}</Text>
          )}
        </View>

        {/* Cars List Section */}
        <View style={styles.section}>
          <View style={styles.carsHeader}>
            <Text style={styles.sectionTitle}>My Cars</Text>
            <TouchableOpacity onPress={handleAddCar} style={styles.addCarButton}>
              <Text style={styles.addCarText}>+ Add Car</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.emptyCarsContainer}>
              <Text style={styles.emptyCarsText}>Loading cars...</Text>
            </View>
          ) : cars.length === 0 ? (
            <TouchableOpacity
              onPress={handleAddCar}
              style={styles.emptyCarsContainer}
            >
              <Icon name="logo-circle" size={64} color={theme.colors.primary} />
              <Text style={styles.emptyCarsText}>No cars added yet</Text>
              <Text style={styles.emptyCarsHint}>Tap to add your first car</Text>
            </TouchableOpacity>
          ) : (
            <FlatList
              data={cars}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                console.log(`${API_URL}/${item.photos[0]?.path}`,'[[[[[[[[[[[[[[[[[item[[[[[[[[[['),
                
                <TouchableOpacity
                  style={styles.carCard}
                  onPress={() => handleCarPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.carCardContent}>
                    {item.photos && item.photos.length > 0 && (
                      <Image
                        source={{ uri: `${API_URL}/${item.photos[0]?.path}`}}
                        style={styles.carCardImage}
                        resizeMode="cover"
                      />
                    )}
                    {(!item.photos || item.photos.length === 0) && (
                      <View style={styles.carCardImagePlaceholder}>
                        <Icon name="logo-circle" size={40} color={theme.colors.primary} />
                      </View>
                    )}
                    <View style={styles.carCardInfo}>
                      <Text style={styles.carCardTitle}>
                        {item.make || 'N/A'} {item.model || ''}
                      </Text>
                      <Text style={styles.carCardSubtitle}>
                        {item.licensePlate || 'No license plate'}
      </Text>
                      <View style={styles.carCardDetails}>
                        {item.year && (
                          <Text style={styles.carCardDetail}>{item.year}</Text>
                        )}
                        {item.color && (
                          <Text style={styles.carCardDetail}> • {item.color}</Text>
                        )}
                        {item.seats && (
                          <Text style={styles.carCardDetail}> • {item.seats} seats</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.carCardArrow}>
                      <Icon name="arrow-left" size={24} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
  cameraIconOverlay: {
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
  cameraIcon: {
    fontSize: 20,
  },
  avatarHint: {
    marginTop: theme.spacing.sm,
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  nameText: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  surnameText: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  emailText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  editSection: {
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    width: 120,
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addPhotoButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addPhotoText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  uploadingButton: {
    backgroundColor: '#9CA3AF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  uploadingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: '48%',
    marginBottom: 12,
    position: 'relative',
  },
  carPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 12,
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
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addPhotoBox: {
    width: '48%',
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  addPhotoBoxText: {
    fontSize: 32,
    marginBottom: 4,
  },
  addPhotoBoxLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyPhotosContainer: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyPhotosText: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyPhotosLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  photoHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  carsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCarButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.borderRadius.md,
  },
  addCarText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.sm,
  },
  emptyCarsContainer: {
    height: 200,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.lg,
  },
  emptyCarsIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  emptyCarsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  emptyCarsHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
  },
  carCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  carCardContent: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  carCardImage: {
    width: 80,
    height: 80,
    borderRadius: theme.spacing.borderRadius.sm,
    backgroundColor: theme.colors.lightGrey,
  },
  carCardImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.spacing.borderRadius.sm,
    backgroundColor: theme.colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCardImagePlaceholderText: {
    fontSize: 32,
  },
  carCardInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  carCardTitle: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  carCardSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  carCardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  carCardDetail: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  carCardArrow: {
    marginLeft: theme.spacing.sm,
  },
  carCardArrowText: {
    fontSize: 24,
    color: theme.colors.textLight,
  },
});
