export interface CarDetails {
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type?: string; // Car type (e.g., Sedan, SUV, Hatchback)
  photos: string[]; // URLs from storage
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DriverAvailability {
  [day in Weekday]?: boolean; // true = available
}

export interface RouteStop {
  id: string;
  label: string; // e.g. "Downtown"
  lat: number;
  lng: number;
}

export interface DriverRoute {
  startCity: string;
  startArea: string;
  startLocation?: { lat: number; lng: number };
  destCity: string;
  destArea: string;
  destLocation?: { lat: number; lng: number };
  stops?: RouteStop[];
  workingHours: {
    startTime: string; // "08:00"
    endTime: string; // "18:00"
  };
  maxPassengers: number; // 1–6
  availableSeats: number;
}

export interface DriverProfile {
  id: string;
  userId: string; // auth uid
  name: string;
  surname?: string; // Optional surname field
  avatar?: string; // Avatar photo URL
  phoneNumber: string;
  dateOfBirth: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string;
  car: CarDetails;
  availability: DriverAvailability;
  route?: DriverRoute;
  createdAt: number;
  updatedAt: number;
}


