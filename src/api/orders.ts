import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface MainRoute {
  id: string;
  name: string;
}

interface GetDailyDriverApprovedOrdersParams {
  token: string;
  mainRouteId: string;
  driverId: string;
  date: string;
}

const getArrayFromResponse = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  if (Array.isArray(data?.routes)) {
    return data.routes;
  }
  if (Array.isArray(data?.mainRoutes)) {
    return data.mainRoutes;
  }
  if (Array.isArray(data?.orders)) {
    return data.orders;
  }
  if (Array.isArray(data?.result)) {
    return data.result;
  }
  return [];
};

export const getMainRoutes = async (token: string): Promise<MainRoute[]> => {
  const response = await axios.get(`${API_BASE_URL}/orders/main-routes`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const routes = response.data?.mainRoutes ?? [];

  return routes

};

export const getDailyDriverApprovedOrders = async ({
  token,
  mainRouteId,
  driverId,
  date,
}: GetDailyDriverApprovedOrdersParams): Promise<any[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/orders/get-dailiy-driver-approved-orders/${mainRouteId}/${driverId}`,
    {
      params: { date },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  );

  return getArrayFromResponse(response.data);
};


