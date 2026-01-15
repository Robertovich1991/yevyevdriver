import { create } from 'zustand';
import type { PassengerOrder } from '../types/order';

interface OrdersState {
  orders: PassengerOrder[];
  isLoading: boolean;
  subscribeToOrders: (driverId: string) => void;
  acceptOrderLocal: (orderId: string, driverId: string) => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  isLoading: false,
  subscribeToOrders: (driverId: string) => {
    // TODO: Wire Firestore onSnapshot for realtime orders matching this driver's route
    if (!driverId) {
      return;
    }
    set({ isLoading: true });
    // Placeholder: keep empty list until backend is implemented.
    set({ isLoading: false });
  },
  acceptOrderLocal: (orderId, driverId) => {
    const updated = get().orders.map((o) =>
      o.id === orderId ? { ...o, driverId, status: 'accepted' } : o,
    );
    set({ orders: updated });
  },
}));


