import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Linking,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  launchCamera,
  CameraOptions,
  type Asset,
} from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useDriverStore } from '../../store/useDriverStore';
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import { theme } from '../../assets/style/theme';
import { Icon } from '../../assets/icons/Icon';
import {
  API_BASE_URL,
  API_URL,
  TOKEN_KEY,
  USER_DATA_KEY,
} from '../../config/api';
import { useAlert } from '../../context/AlertContext';
import { Button } from '../../components/ui/Button';
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
  path?: string;
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
  const { showAlert } = useAlert();
  const profile = useDriverStore(s => s.profile);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    loadUserData();
    loadCars();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reload user data and cars when screen comes into focus (e.g., after editing profile or car)
      loadUserData();
      loadCars();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        // Fallback to AsyncStorage if no token
        const data = await AsyncStorage.getItem(USER_DATA_KEY);
        if (data) {
          setUserData(JSON.parse(data));
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

        const apiResponse = response.data?.data || response.data;
        console.log('API User Data:', JSON.stringify(apiResponse, null, 2));

        // Handle different response structures
        const apiUserData = apiResponse?.user || apiResponse;

        if (apiUserData) {
          console.log('API Avatar value:', apiUserData.avatar);
          const updatedUserData: UserData = {
            name: apiUserData.name || '',
            surname: apiUserData.surname || '',
            email: apiUserData.email || '',
            userId:
              apiUserData.id?.toString() ||
              apiUserData.userId?.toString() ||
              '',
            avatar: apiUserData.avatar || undefined,
          };

          console.log('Updated UserData avatar:', updatedUserData.avatar);
          setUserData(updatedUserData);
          // Also update AsyncStorage
          await AsyncStorage.setItem(
            USER_DATA_KEY,
            JSON.stringify(updatedUserData),
          );
        }
      } catch (apiError) {
        console.error('Error fetching user data from API:', apiError);
        // Fallback to AsyncStorage if API fails
        const data = await AsyncStorage.getItem(USER_DATA_KEY);
        if (data) {
          setUserData(JSON.parse(data));
        }
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    } finally {
      setLoading(false);
    }
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
      const userId =
        userData?.id ||
        apiResponse?.id ||
        response.data?.id ||
        response.data?.data?.id ||
        response.data?.user?.id;
      return userId ? parseInt(userId.toString()) : null;
    } catch (e: any) {
      console.error('Error getting current user ID:', e);
      return null;
    }
  };

  const loadCars = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get userId from API endpoint (more reliable)
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('Could not get userId for loading cars');
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
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (checkResult) {
        return true;
      }

      // Request permission
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message:
            'This app needs access to your camera to take photos for your profile and car pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
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
        showAlert(
          'Camera permission is required to take photos. Please enable it in your device settings.',
          'Permission Required',
          [{ text: 'OK' }],
          'warning',
        );
        return null;
      }
    }

    return new Promise(resolve => {
      const options: CameraOptions = {
        mediaType: 'photo',
        quality: 0.8,
        cameraType: 'back',
        saveToPhotos: false,
        presentationStyle: 'fullScreen',
      };

      launchCamera(options, response => {
        console.log(response, 'ppppppppppppppppppp');

        if (response.didCancel) {
          resolve(null);
          return;
        }

        if (response.errorCode || response.errorMessage) {
          console.error(
            'Camera error:',
            response.errorCode,
            response.errorMessage,
          );

          // Handle the "permission in manifest" error specifically
          if (
            response.errorCode === 'others' &&
            (response.errorMessage?.includes('Manifest.permission.CAMERA') ||
              response.errorMessage?.includes('permission'))
          ) {
            showAlert(
              'Camera permission is required. Please enable it in your device settings, then try again.',
              'Camera Permission Required',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => resolve(null),
                },
                {
                  text: 'Open Settings',
                  onPress: () => {
                    Linking.openSettings();
                    resolve(null);
                  },
                },
              ],
              'warning',
            );
            return;
          }

          // Handle other errors
          let errorMessage = 'Failed to open camera. Please try again.';

          if (response.errorCode === 'camera_unavailable') {
            errorMessage = 'Camera is not available on this device.';
          } else if (response.errorCode === 'permission') {
            errorMessage =
              'Camera permission was denied. Please enable it in your device settings.';
            showAlert(
              errorMessage,
              'Permission Denied',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings(),
                },
              ],
              'error',
            );
            resolve(null);
            return;
          } else if (response.errorMessage) {
            errorMessage = response.errorMessage;
          }

          showAlert(errorMessage, 'Camera Error', undefined, 'error');
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

  const uploadAvatarImage = async (
    imageAsset: Asset,
  ): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        showAlert(
          'Authentication token not found. Please login again.',
          'Error',
          undefined,
          'error',
        );
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
        uri:
          Platform.OS === 'android'
            ? imageAsset.uri
            : imageAsset.uri.replace('file://', ''),
        type: fileType,
        name: fileName,
      } as any);

      const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Upload response:', JSON.stringify(response.data, null, 2));
      const uploadResponse = response.data?.data || response.data;
      console.log('Upload response parsed:', uploadResponse);

      if (!uploadResponse) {
        console.error('No upload response data:', response.data);
        showAlert(
          'Image uploaded but no data received.',
          'Error',
          undefined,
          'error',
        );
        return null;
      }

      // Extract path and url similar to car photos (prioritize path)
      const avatarPath = uploadResponse.path || '';
      const avatarUrl = uploadResponse.url || uploadResponse.path || '';

      console.log('Upload response path:', avatarPath);
      console.log('Upload response url:', uploadResponse.url);
      console.log('Upload response filename:', uploadResponse.filename);

      // Use path if available (like car photos), otherwise use url
      let finalAvatarUrl = avatarPath || avatarUrl;

      if (!finalAvatarUrl) {
        console.error('No URL/path in upload response:', uploadResponse);
        showAlert(
          'Image uploaded but no URL received.',
          'Error',
          undefined,
          'error',
        );
        return null;
      }

      // If the URL is relative, ensure it doesn't start with a slash
      if (
        !finalAvatarUrl.startsWith('http://') &&
        !finalAvatarUrl.startsWith('https://')
      ) {
        finalAvatarUrl = finalAvatarUrl.replace(/^\//, '');
      }

      console.log('Final avatar URL:', finalAvatarUrl);
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
          setTempAvatarUri(avatarUrl);
        }
      }
    } catch (e) {
      showAlert('Failed to take photo.', 'Error', undefined, 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!tempAvatarUri || !userData) {
      return;
    }

    try {
      setSavingAvatar(true);
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        showAlert(
          'Authentication token not found. Please login again.',
          'Error',
          undefined,
          'error',
        );
        return;
      }

      // Get current user ID using the helper function
      let userId = await getCurrentUserId();

      // If getCurrentUserId fails, try to use userId from userData as fallback
      if (!userId && userData.userId) {
        console.log(
          'getCurrentUserId returned null, trying userData.userId:',
          userData.userId,
        );
        const parsedId =
          typeof userData.userId === 'string'
            ? parseInt(userData.userId)
            : parseInt(String(userData.userId));
        if (!isNaN(parsedId) && parsedId > 0) {
          userId = parsedId;
          console.log('Using userId from userData:', userId);
        }
      }

      if (!userId) {
        console.error(
          'Could not get userId. API response structure might be different.',
        );
        console.log('userData:', userData);
        console.log('Attempting to fetch /auth/me directly...');

        // Try one more time with direct API call and better logging
        try {
          const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(
            'Direct /auth/me response:',
            JSON.stringify(meResponse.data, null, 2),
          );
          const apiResponse = meResponse.data?.data || meResponse.data;
          const userData = apiResponse?.user || apiResponse;
          const directUserId =
            userData?.id ||
            apiResponse?.id ||
            meResponse.data?.id ||
            meResponse.data?.data?.id ||
            meResponse.data?.user?.id;
          if (directUserId) {
            userId =
              typeof directUserId === 'number'
                ? directUserId
                : parseInt(directUserId.toString());
            console.log('Found userId from direct call:', userId);
          }
        } catch (directError) {
          console.error('Direct /auth/me call failed:', directError);
        }
      }

      if (!userId) {
        showAlert(
          'Could not retrieve user ID. Please login again.',
          'Error',
          undefined,
          'error',
        );
        return;
      }

      console.log('Saving avatar with URL:', tempAvatarUri);
      console.log('Using userId:', userId);

      // Update user profile with avatar URL
      const updateResponse = await axios.put(
        `${API_BASE_URL}/users/update/${userId}`,
        { avatar: tempAvatarUri },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Update response:', updateResponse.data);

      // Reload user data from API to get the updated avatar
      try {
        const reloadResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const apiResponse = reloadResponse.data?.data || reloadResponse.data;
        const updatedApiUserData = apiResponse?.user || apiResponse;
        if (updatedApiUserData) {
          const updatedUserData: UserData = {
            name: updatedApiUserData.name || userData.name,
            surname: updatedApiUserData.surname || userData.surname,
            email: updatedApiUserData.email || userData.email,
            userId:
              updatedApiUserData.id?.toString() ||
              updatedApiUserData.userId?.toString() ||
              userData.userId,
            avatar: updatedApiUserData.avatar || tempAvatarUri,
          };
          console.log('Reloaded avatar from API:', updatedUserData.avatar);
          setUserData(updatedUserData);
          await AsyncStorage.setItem(
            USER_DATA_KEY,
            JSON.stringify(updatedUserData),
          );
        }
      } catch (reloadError) {
        console.error('Error reloading user data:', reloadError);
        // Fallback: update local storage with tempAvatarUri
        const updatedData = { ...userData, avatar: tempAvatarUri };
        await saveUserData(updatedData);
      }

      setTempAvatarUri(null);

      showAlert(
        'Avatar updated successfully!',
        'Success',
        undefined,
        'success',
      );
    } catch (e: any) {
      console.error('Save avatar error:', e);
      console.error('Error response:', e.response?.data);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to update avatar. Please try again.';
      showAlert(errorMessage, 'Error', undefined, 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleCancelAvatar = () => {
    setTempAvatarUri(null);
  };

  const handleCarPress = (car: Car) => {
    navigation.navigate('CarDetail', { carId: car.id, car });
  };

  const handleAddCar = () => {
    navigation.navigate('CarDetail', {});
  };

  const normalizeName = (value: string) => value.replace(/\s+/g, ' ').trim();
  const rawName = userData?.name || profile?.name || '';
  const rawSurname = userData?.surname || profile?.surname || '';

  let firstName = normalizeName(rawName);
  let lastName = normalizeName(rawSurname);

  if (!lastName && firstName.includes(' ')) {
    const parts = firstName.split(' ');
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ');
  }

  const endsWithSurname =
    lastName &&
    firstName &&
    normalizeName(firstName).toLowerCase().endsWith(lastName.toLowerCase());
  const displayName = normalizeName(
    endsWithSurname
      ? firstName
      : [firstName, lastName].filter(Boolean).join(' '),
  );

  const getInitials = () => {
    const parts = displayName.split(' ').filter(Boolean).slice(0, 2);
    return parts.map(part => part.charAt(0).toUpperCase()).join('');
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
          <View style={styles.avatarWrapper}>
            {tempAvatarUri || userData?.avatar ? (
              <Image
                source={{
                  uri: (() => {
                    const avatarUri = tempAvatarUri || userData?.avatar || '';
                    console.log('Avatar URI from state/storage:', avatarUri);
                    if (!avatarUri) return '';

                    // If it's already a full URL, use it directly
                    if (
                      avatarUri.startsWith('http://') ||
                      avatarUri.startsWith('https://')
                    ) {
                      console.log('Using full URL:', avatarUri);
                      return avatarUri;
                    }

                    // Check if it's a storage path (like storage/images/...)
                    if (avatarUri.startsWith('storage/')) {
                      const finalUri = `${API_URL}/${avatarUri}`;
                      console.log('Storage path - Final Avatar URI:', finalUri);
                      return finalUri;
                    }

                    // Otherwise, prepend API_URL for relative paths
                    const finalUri = `${API_URL}/${avatarUri.replace(
                      /^\//,
                      '',
                    )}`;
                    console.log('Relative path - Final Avatar URI:', finalUri);
                    return finalUri;
                  })(),
                }}
                style={styles.avatar}
                onError={error => {
                  console.error(
                    'Avatar image load error:',
                    error.nativeEvent.error,
                  );
                  console.log('Failed URI:', tempAvatarUri || userData?.avatar);
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleTakeAvatarPhoto}
              style={styles.editIconButton}
              activeOpacity={0.7}
              disabled={uploadingAvatar || savingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Icon name="edit" size={20} color={theme.colors.white} />
              )}
            </TouchableOpacity>
          </View>
          {tempAvatarUri && (
            <View style={styles.avatarActions}>
              <TouchableOpacity
                onPress={handleCancelAvatar}
                style={[styles.avatarActionButton, styles.cancelButton]}
                disabled={savingAvatar}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveAvatar}
                style={[styles.avatarActionButton, styles.saveButton]}
                disabled={savingAvatar}
              >
                {savingAvatar ? (
                  <Text style={styles.saveButtonText}>Saving...</Text>
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Name and Surname */}
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>{displayName}</Text>
              {userData?.email && (
                <Text style={styles.emailText}>{userData.email}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Icon name="edit" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cars List Section */}
        <View style={styles.section}>
          <View style={styles.carsHeader}>
            <Text style={styles.sectionTitle}>My Cars</Text>
            <TouchableOpacity
              onPress={handleAddCar}
              style={styles.addCarButton}
            >
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
              <Text style={styles.emptyCarsHint}>
                Tap to add your first car
              </Text>
            </TouchableOpacity>
          ) : (
            <FlatList
              data={cars}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.carCard}
                  onPress={() => handleCarPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.carCardContent}>
                    {item.photos && item.photos.length > 0 && (
                      <Image
                        source={{
                          uri: (() => {
                            const photo = item.photos[0];
                            const photoPath = photo?.path || photo?.url || '';
                            if (!photoPath) return '';
                            if (
                              photoPath.startsWith('http://') ||
                              photoPath.startsWith('https://')
                            ) {
                              return photoPath;
                            }
                            return `${API_URL}/${photoPath.replace(/^\//, '')}`;
                          })(),
                        }}
                        style={styles.carCardImage}
                        resizeMode="cover"
                      />
                    )}
                    {(!item.photos || item.photos.length === 0) && (
                      <View style={styles.carCardImagePlaceholder}>
                        <Icon
                          name="logo-circle"
                          size={40}
                          color={theme.colors.primary}
                        />
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
                          <Text style={styles.carCardDetail}>
                            {' '}
                            • {item.color}
                          </Text>
                        )}
                        {item.seats && (
                          <Text style={styles.carCardDetail}>
                            {' '}
                            • {item.seats} seats
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.carCardArrow}>
                      <Icon
                        name="arrow-left"
                        size={24}
                        color={theme.colors.textSecondary}
                        style={{ transform: [{ rotate: '180deg' }] }}
                      />
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
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.border,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  editIconButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  avatarActionButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.lightGrey,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  nameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  nameText: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  emailText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  editButton: {
    position: 'absolute',
    right: theme.spacing.md,
    top: 0,
    padding: theme.spacing.xs,
    borderRadius: theme.spacing.borderRadius.sm,
    backgroundColor: theme.colors.lightGrey,
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
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  emptyCarsHint: {
    color: theme.colors.textLight,
  },
  carCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
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
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  carCardSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  carCardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  carCardDetail: {
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
