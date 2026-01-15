import type { DriverAvailability, DriverProfile, DriverRoute } from '../types/driver';

interface CreateDriverProfileInput {
  userId: string;
  phoneNumber: string;
  name: string;
  dateOfBirth: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string;
  car: DriverProfile['car'];
  photoUris: string[];
}

export async function createDriverProfile(
  input: CreateDriverProfileInput,
): Promise<DriverProfile> {
  const photos: string[] = [];
  for (const uri of input.photoUris) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ref = storage().ref(`cars/${input.userId}/${fileName}`);
    await ref.putFile(uri);
    const url = await ref.getDownloadURL();
    photos.push(url);
  }

  const docRef = firestore().collection('drivers').doc(input.userId);
  const now = Date.now();
  const profile: DriverProfile = {
    id: docRef.id,
    userId: input.userId,
    name: input.name,
    phoneNumber: input.phoneNumber,
    dateOfBirth: input.dateOfBirth,
    driverLicenseNumber: input.driverLicenseNumber,
    driverLicenseExpiry: input.driverLicenseExpiry,
    car: { ...input.car, photos },
    availability: {},
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(profile);
  return profile;
}

export async function saveAvailability(
  driverId: string,
  availability: DriverAvailability,
) {
  await firestore().collection('drivers').doc(driverId).update({
    availability,
    updatedAt: Date.now(),
  });
}

export async function saveRoute(driverId: string, route: DriverRoute) {
  await firestore().collection('drivers').doc(driverId).update({
    route,
    updatedAt: Date.now(),
  });
}


