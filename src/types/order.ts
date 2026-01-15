import type { RouteStop } from './driver';

export interface PassengerOrder {
  id: string;
  passengerName: string;
  passengerPhone: string;
  pickup: RouteStop;
  dropoff: RouteStop;
  seatsRequested: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  driverId?: string;
  routeId?: string;
  createdAt: number;
}


