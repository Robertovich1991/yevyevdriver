import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, CameraOptions, type Asset } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextInputField } from '../../components/ui/TextInputField';
import { Button } from '../../components/ui/Button';
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import { theme } from '../../assets/style/theme';
import { Icon } from '../../assets/icons/Icon';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CarDetail'>;

const TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';
const API_BASE_URL = 'http://192.168.100.12:8000/api/v1';
const API_URL = 'http://192.168.100.12:8000';
interface CarPhoto {
  filename: string;
  path: string;
  url: string;
}

interface CarData {
  id?: number;
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  type: string;
  seats: string;
  photos: CarPhoto[];
}

export const CarDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { carId, car } = route.params || {};
  const isEditing = !!carId || !!car;
  
  const [carData, setCarData] = useState<CarData>({
    brand: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    type: '',
    seats: '',
    photos: [],
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (car) {
      // Load car data from route params
      setCarData({
        id: car.id,
        brand: car.make || car.brand || '',
        model: car.model || '',
        year: car.year?.toString() || '',
        color: car.color || '',
        licensePlate: car.licensePlate || '',
        type: car.type || '',
        seats: car.seats?.toString() || '',
        photos: car.photos?.map((p: any) => ({
          filename: p.filename || p.url?.split('/').pop() || 'photo.jpg',
          url: p.url || p,
          path: p.path || '',
        })) || [],
      });
    } else if (carId) {
      // Fetch car data from API
      loadCarData();
    }
  }, [carId, car]);

  const loadCarData = async (idToLoad?: number) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        return;
      }

      // Use provided id, or carId from route params, or carData.id
      const id = idToLoad || carId || carData.id;
      if (!id) {
        console.error('No car ID available to load');
        return;
      }

      console.log('Loading car data for ID:', id);
      const response = await axios.get(`${API_BASE_URL}/cars/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Car API response:', response.data);
      // Try multiple possible response structures
      const car = response.data?.data || response.data?.car || response.data;
      
      if (!car || (typeof car === 'object' && Object.keys(car).length === 0)) {
        console.error('No car data in response:', response.data);
        Alert.alert('Error', 'No car data received from server.');
        return;
      }

      console.log('Setting car data:', car);
      const updatedCarData = {
        id: car.id || carData.id,
        brand: car.make || car.brand || carData.brand || '',
        model: car.model || carData.model || '',
        year: car.year?.toString() || carData.year || '',
        color: car.color || carData.color || '',
        licensePlate: car.licensePlate || carData.licensePlate || '',
        type: car.type || carData.type || '',
        seats: car.seats?.toString() || carData.seats || '',
        photos: car.photos?.map((p: any) => ({
          filename: p.filename || p.url?.split('/').pop() || 'photo.jpg',
          url: p.url || p,
          path: p.path || '',
        })) || carData.photos || [],
      };
      
      console.log('Updated car data to set:', updatedCarData);
      setCarData(updatedCarData);
    } catch (e: any) {
      console.error('Error loading car:', e);
      console.error('Error response:', e.response?.data);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to load car data.';
      Alert.alert('Error', errorMessage);
      // Don't navigate back on error, keep existing data visible
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const checkResult = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (checkResult) {
        return true;
      }

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message: 'This app needs access to your camera to take photos for your car pictures.',
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
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return null;
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
          console.error('Camera error:', response.errorCode, response.errorMessage);
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
          } else if (response.errorCode === 'others' && 
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

  const uploadImage = async (imageAsset: Asset): Promise<CarPhoto | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        return null;
      }

      if (!imageAsset.uri) {
        Alert.alert('Error', 'Image URI not found.');
        return null;
      }

      const fileName = imageAsset.fileName || `car_photo_${Date.now()}.jpg`;
      const fileType = imageAsset.type || 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? imageAsset.uri : imageAsset.uri.replace('file://', ''),
        type: fileType,
        name: fileName,
      } as any);
console.log(formData,'[[[[[[[[[[[[[[[[[formData[[[[[[[[[[');

      const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // The API returns an object with filename, path, and url
      const uploadResponse = response.data?.data || response.data;
      
      if (!uploadResponse) {
        console.error('Upload response:', response.data);
        Alert.alert('Error', 'Image uploaded but no data received from server.');
        return null;
      }

      // Extract the full object with filename, path, and url
      const photoObject: CarPhoto = {
        filename: uploadResponse.filename || fileName,
        path: uploadResponse.path || '',
        url: uploadResponse.url || uploadResponse.path || '',
      };

      // Validate that at least one of url or path exists
      if (!photoObject.url && !photoObject.path) {
        console.error('Upload response:', response.data);
        Alert.alert('Error', 'Image uploaded but no URL or path received from server.');
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
      Alert.alert('Error', errorMessage);
      return null;
    }
  };

  const handleTakeCarPhoto = async () => {
    try {
      if (carData.photos.length >= 6) {
        Alert.alert('Limit', 'You can add maximum 6 car photos.');
        return;
      }

      if (uploadingPhoto) {
        Alert.alert('Please wait', 'Another photo is being uploaded.');
        return;
      }

      const asset = await takePhoto();
      if (asset && asset.uri) {
        setUploadingPhoto(true);

        try {
          const photoInfo = await uploadImage(asset);
          if (photoInfo) {
            setCarData({ ...carData, photos: [...carData.photos, photoInfo] });
            Alert.alert('Success', 'Car photo uploaded successfully!');
          } else {
            Alert.alert('Error', 'Failed to upload photo. Please try again.');
          }
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (e) {
      console.error('Error taking car photo:', e);
      setUploadingPhoto(false);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handleRemoveCarPhoto = async (index: number) => {
    const photo = carData.photos[index];
    if (!photo) {
      return;
    }

    // Check if we have carId (only for existing cars)
    if (!carData.id) {
      // For new cars, just remove from local state
      Alert.alert(
        'Remove Photo',
        'Are you sure you want to remove this photo?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              const updatedPhotos = carData.photos.filter((_, i) => i !== index);
              setCarData({ ...carData, photos: updatedPhotos });
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem(TOKEN_KEY);
              if (!token) {
                Alert.alert('Error', 'Authentication token not found.');
                return;
              }

              const photoObj = photo as CarPhoto;
              
              if (!photoObj.path) {
                Alert.alert('Error', 'Cannot delete photo: missing path.');
                return;
              }

              // Make DELETE request to cars/delete-photo endpoint with carId and path as query parameters
              const deleteUrl = `${API_BASE_URL}/cars/delete-photo?carId=${carData.id}&path=${encodeURIComponent(photoObj.path)}`;
              await axios.delete(deleteUrl, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              // Reload car data from API to get updated photos using carData.id
              // Store current car data as fallback in case reload fails
              const currentCarData = { ...carData };
              try {
                await loadCarData(carData.id);
              } catch (reloadError) {
                console.error('Failed to reload car after photo deletion:', reloadError);
                // If reload fails, at least remove the photo from local state
                const updatedPhotos = carData.photos.filter((_, i) => i !== index);
                setCarData({ ...currentCarData, photos: updatedPhotos });
              }

              Alert.alert('Success', 'Photo deleted successfully!');
            } catch (e: any) {
              console.error('Delete photo error:', e);
              const errorMessage =
                e.response?.data?.message ||
                e.response?.data?.error ||
                e.message ||
                'Failed to delete photo. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!carData.brand || !carData.model || !carData.licensePlate) {
        Alert.alert('Error', 'Please fill in brand, model, and license plate.');
        setSaving(false);
        return;
      }

      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        setSaving(false);
        return;
      }

      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) {
        Alert.alert('Error', 'User data not found. Please login again.');
        setSaving(false);
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

      const carPayload = {
        userId: userId,
        make: carData.brand,
        model: carData.model,
        year: parseInt(carData.year) || new Date().getFullYear(),
        color: carData.color || '',
        licensePlate: carData.licensePlate,
        seats: parseInt(carData.seats) || 4,
        photos: carData.photos
          .filter((photo) => {
            const photoObj = photo as CarPhoto;
            return photoObj && (photoObj.url || photoObj.path);
          })
          .map((photo): { filename: string; path: string; url: string } => {
            const photoObj = photo as CarPhoto;
            return {
              filename: photoObj.filename || photoObj.url?.split('/').pop() || photoObj.path?.split('/').pop() || 'photo.jpg',
              path: photoObj.path || photoObj.url || '',
              url: photoObj.url || photoObj.path || '',
            };
          }),
      };

      if (isEditing && carData.id) {
        // Update existing car
        await axios.put(`${API_BASE_URL}/cars/update/${carData.id}`, carPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        Alert.alert('Success', 'Car updated successfully!');
      } else {
        // Add new car
        await axios.post(`${API_BASE_URL}/cars/add`, carPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        Alert.alert('Success', 'Car added successfully!');
      }

      navigation.goBack();
    } catch (e: any) {
      console.error('Save car error:', e);
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to save car. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!carData.id) {
      Alert.alert('Error', 'Cannot delete car without ID.');
      return;
    }

    Alert.alert(
      'Delete Car',
      'Are you sure you want to delete this car? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const token = await AsyncStorage.getItem(TOKEN_KEY);
              if (!token) {
                Alert.alert('Error', 'Authentication token not found.');
                return;
              }

              await axios.delete(`${API_BASE_URL}/cars/delete/${carData.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              Alert.alert('Success', 'Car deleted successfully!', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (e: any) {
              console.error('Delete car error:', e);
              const errorMessage =
                e.response?.data?.message ||
                e.response?.data?.error ||
                e.message ||
                'Failed to delete car. Please try again.';
              Alert.alert('Error', errorMessage);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{isEditing ? 'Edit Car' : 'Add New Car'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Car Information</Text>
          
          <TextInputField
            label="Brand"
            placeholder="e.g., Toyota"
            value={carData.brand}
            onChangeText={(text) => setCarData({ ...carData, brand: text })}
          />
          <TextInputField
            label="Model"
            placeholder="e.g., Camry"
            value={carData.model}
            onChangeText={(text) => setCarData({ ...carData, model: text })}
          />
          <TextInputField
            label="Year"
            placeholder="e.g., 2020"
            keyboardType="number-pad"
            value={carData.year}
            onChangeText={(text) => setCarData({ ...carData, year: text })}
          />
          <TextInputField
            label="Color"
            placeholder="e.g., Black"
            value={carData.color}
            onChangeText={(text) => setCarData({ ...carData, color: text })}
          />
          <TextInputField
            label="Car Number (License Plate)"
            placeholder="e.g., ABC-1234"
            autoCapitalize="characters"
            value={carData.licensePlate}
            onChangeText={(text) => setCarData({ ...carData, licensePlate: text })}
          />
          <TextInputField
            label="Car Type"
            placeholder="e.g., Sedan, SUV, Hatchback"
            value={carData.type}
            onChangeText={(text) => setCarData({ ...carData, type: text })}
          />
          <TextInputField
            label="Seats"
            placeholder="e.g., 4, 5, 6, 7"
            keyboardType="number-pad"
            value={carData.seats}
            onChangeText={(text) => setCarData({ ...carData, seats: text })}
          />
        </View>

        {/* Car Photos Section */}
        <View style={styles.section}>
          <View style={styles.photosHeader}>
            <Text style={styles.sectionTitle}>Car Photos</Text>
            {carData.photos.length < 6 && !uploadingPhoto && (
              <TouchableOpacity onPress={handleTakeCarPhoto} style={styles.addPhotoButton}>
                <Text style={styles.addPhotoText}>+ Add Photo</Text>
              </TouchableOpacity>
            )}
            {uploadingPhoto && (
              <View style={styles.uploadingButton}>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </View>
          
          {carData.photos.length > 0 ? (
            <View style={styles.photosGrid}>
              {carData.photos.map((photo, index) => {
                const photoObj = photo as CarPhoto;
                const imageUri = photoObj.path ? `${API_URL}/${photoObj.path}` : (photoObj.url || '');
                return (
                  <View key={index} style={styles.photoContainer}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.carPhoto}
                      resizeMode="cover"
                    />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemoveCarPhoto(index)}
                  >
                    <Icon name="close" size={16} color={theme.colors.white} />
                  </TouchableOpacity>
                  </View>
                );
              })}
              {carData.photos.length < 6 && !uploadingPhoto && (
                <TouchableOpacity
                  onPress={handleTakeCarPhoto}
                  style={styles.addPhotoBox}
                >
                  <Icon name="ok" size={32} color={theme.colors.primary} />
                  <Text style={styles.addPhotoBoxLabel}>Take Photo</Text>
                </TouchableOpacity>
              )}
              {uploadingPhoto && (
                <View style={styles.addPhotoBox}>
                  <Icon name="pending" size={32} color={theme.colors.textSecondary} />
                  <Text style={styles.addPhotoBoxLabel}>Uploading...</Text>
                </View>
              )}
            </View>
            ) : uploadingPhoto ? (
            <View style={styles.emptyPhotosContainer}>
              <Icon name="pending" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyPhotosLabel}>Uploading photo...</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleTakeCarPhoto}
              style={styles.emptyPhotosContainer}
            >
              <Icon name="ok" size={48} color={theme.colors.primary} />
              <Text style={styles.emptyPhotosLabel}>Take your first car photo</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.photoHint}>You can add up to 6 photos (camera only)</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button 
            title={isEditing ? 'Update Car' : 'Add Car'} 
            onPress={handleSave} 
            loading={saving} 
          />
          {isEditing && (
            <View style={styles.deleteButtonContainer}>
              <Button
                title="Delete Car"
                onPress={handleDelete}
                loading={deleting}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 28,
    color: theme.colors.textPrimary,
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
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  addPhotoButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.borderRadius.sm,
  },
  addPhotoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  uploadingButton: {
    backgroundColor: theme.colors.mediumGrey,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.borderRadius.sm,
  },
  uploadingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: '48%',
    marginBottom: theme.spacing.sm,
    position: 'relative',
  },
  carPhoto: {
    width: '100%',
    height: 150,
    borderRadius: theme.spacing.borderRadius.md,
    backgroundColor: theme.colors.lightGrey,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  removePhotoText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 20,
  },
  addPhotoBox: {
    width: '48%',
    height: 150,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    marginBottom: theme.spacing.sm,
  },
  addPhotoBoxLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.xs,
  },
  emptyPhotosContainer: {
    height: 200,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
  },
  emptyPhotosLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.sm,
  },
  photoHint: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  actionsSection: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  deleteButtonContainer: {
    marginTop: theme.spacing.sm,
  },
});
