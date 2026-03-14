import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OrdersStackParamList } from './TripOrdersScreen';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { colors } from '../../assets/style/colors';
import { spacing } from '../../assets/style/spacing';
import { typography } from '../../assets/style/typography';
import { TOKEN_KEY, USER_DATA_KEY } from '../../config/api';
import {
  getDailyDriverApprovedOrders,
  getMainRoutes,
  type MainRoute,
} from '../../api/orders';
import { useAlert } from '../../context/AlertContext';
import { useLanguageStore } from '../../store/useLanguageStore';
import { getOrdersTranslations } from '../../i18n/translations';

const SEEN_ORDERS_KEY = '@seen_orders';

interface Order {
  id: string;
  name: string;
  phoneNumber: string;
  startAddress: string;
  endAddress: string;
  personCount: number;
}

interface TripItem {
  id: string;
  date: string;
  time: string;
  seatCount: number;
  freeCount: number;
  status: string;
  orders: Order[];
  routeGroupKey?: string;
}

interface DriverInfo {
  id: string;
  name: string;
  carModel: string;
  carNumber: string;
  approvedOrdersCount: number;
}

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFormattedOrderDate = (value: unknown, fallbackDate: Date) => {
  if (!value) {
    return formatDateForApi(fallbackDate);
  }

  const parsedDate = new Date(String(value));
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString();
};

const mapNestedOrderToUi = (
  order: any,
  index: number,
  unknownCustomerText: string,
): Order => {
  const rawId = order?.id ?? order?.orderId ?? order?._id ?? `${index}`;
console.log(order,'[[[[[[[[[[[[[[[[[[[[[[');

  return {
    id: String(rawId),
    name:
      order?.client?.name ||
      order?.name ||
      order?.customerName ||
      order?.passengerName ||
      unknownCustomerText,
    phoneNumber:
      order?.client?.phone_number ||
      order?.phone_number ||
      order?.phoneNumber ||
      '-',
    startAddress: order?.start_address || order?.pickupAddress || '-',
    endAddress: order?.end_address || order?.dropoffAddress || '-',
    personCount:
      typeof order?.person_count === 'number'
        ? order.person_count
        : typeof order?.personCount === 'number'
        ? order.personCount
        : 1,
  };
};

const parseTripsFromApi = (
  apiOrders: any[],
  selectedDate: Date,
  unknownCustomerText: string,
): { driverInfo: DriverInfo | null; trips: TripItem[] } => {
  const firstItem = apiOrders?.[0] || null;
  const driver = firstItem?.driver || {};

  const driverInfo: DriverInfo | null = firstItem
    ? {
        id: String(driver?.id ?? ''),
        name: String(driver?.name || '-'),
        carModel: String(driver?.car_model || '-'),
        carNumber: String(driver?.car_number || '-'),
        approvedOrdersCount: Number(firstItem?.approved_orders_count || 0),
      }
    : null;

  const trips: TripItem[] = [];

  apiOrders.forEach(item => {
    const driverObject = item?.driver;
    if (!driverObject || typeof driverObject !== 'object') {
      return;
    }

    Object.entries(driverObject).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        return;
      }

      value.forEach((trip: any, tripIndex: number) => {
        const mappedOrders = Array.isArray(trip?.orders)
          ? trip.orders.map((nestedOrder: any, orderIndex: number) =>
              mapNestedOrderToUi(nestedOrder, orderIndex, unknownCustomerText),
            )
          : [];

        trips.push({
          id: String(trip?.id ?? `${key}-${tripIndex}`),
          date: getFormattedOrderDate(trip?.date, selectedDate),
          time: String(trip?.time || '-'),
          seatCount:
            typeof trip?.seat_count === 'number'
              ? trip.seat_count
              : typeof trip?.seatCount === 'number'
              ? trip.seatCount
              : 0,
          freeCount:
            typeof trip?.free_count === 'number'
              ? trip.free_count
              : typeof trip?.freeCount === 'number'
              ? trip.freeCount
              : 0,
          status: String(trip?.status || '-'),
          routeGroupKey: key,
          orders: mappedOrders,
        });
      });
    });
  });

  return { driverInfo, trips };
};

const getDriverIdFromUserData = (userData: any): string => {
  const rawDriverId =
    userData?.['ev-ev_user_id'] ??
    userData?.ev_ev_user_id ??
    userData?.evEvUserId ??
    userData?.user?.['ev-ev_user_id'] ??
    userData?.user?.ev_ev_user_id ??
    userData?.data?.['ev-ev_user_id'] ??
    userData?.data?.ev_ev_user_id ??
    userData?.userId ??
    userData?.id ??
    userData?.driverId ??
    userData?.driver?.id;
  return rawDriverId ? String(rawDriverId) : '';
};

export const OrdersScreen: React.FC = () => {
  const { showAlert } = useAlert();
  const language = useLanguageStore(s => s.language);
  const t = useMemo(() => getOrdersTranslations(language), [language]);
  const [tripItems, setTripItems] = useState<TripItem[]>([]);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [routes, setRoutes] = useState<MainRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<OrdersStackParamList, 'OrdersList'>>();
  const [seenTripIds, setSeenTripIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSeenOrders();
    loadMainRoutes();
  }, []);

  useEffect(() => {
    if (!selectedRouteId) {
      return;
    }

    loadOrders();
  }, [selectedRouteId, selectedDate]);

  const selectedDateLabel = useMemo(
    () => formatDateForApi(selectedDate),
    [selectedDate],
  );

  const loadSeenOrders = async () => {
    try {
      const data = await AsyncStorage.getItem(SEEN_ORDERS_KEY);
      if (data) {
        const seenIds = JSON.parse(data) as string[];
        setSeenTripIds(new Set(seenIds));
      }
    } catch (e) {
      console.error('Error loading seen orders:', e);
    }
  };

  const loadMainRoutes = useCallback(async () => {
    try {
      setLoadingRoutes(true);
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        showAlert(t.authenticationTokenNotFound, t.error, undefined, 'error');
        return;
      }

      const mainRoutes = await getMainRoutes(token);

      setRoutes(mainRoutes);

      if (mainRoutes.length > 0) {
        setSelectedRouteId(prev => prev || mainRoutes[0].id);
      }
    } catch (error: any) {
      console.error('Error loading main routes:', error);
      showAlert(
        error?.response?.data?.message || t.failedToLoadRoutes,
        t.error,
        undefined,
        'error',
      );
    } finally {
      setLoadingRoutes(false);
    }
  }, [showAlert]);

  const loadOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);

      const [token, userDataString] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
      ]);

      if (!token) {
        showAlert(t.authenticationTokenNotFound, t.error, undefined, 'error');
        setTripItems([]);
        setDriverInfo(null);
        return;
      }

      if (!userDataString) {
        showAlert(t.userDataNotFound, t.error, undefined, 'error');
        setTripItems([]);
        setDriverInfo(null);
        return;
      }

      const userData = JSON.parse(userDataString);
      const driverId = getDriverIdFromUserData(userData);

      if (!driverId) {
        showAlert(t.driverIdNotFound, t.error, undefined, 'error');
        setTripItems([]);
        setDriverInfo(null);
        return;
      }

      const apiOrders = await getDailyDriverApprovedOrders({
        token,
        mainRouteId: selectedRouteId,
        driverId,
        date: selectedDateLabel,
      });

      const parsedResult = parseTripsFromApi(
        apiOrders,
        selectedDate,
        t.unknownCustomer,
      );
      setDriverInfo(parsedResult.driverInfo);
      setTripItems(parsedResult.trips);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setTripItems([]);
      setDriverInfo(null);
      showAlert(
        error?.response?.data?.message || t.failedToLoadOrders,
        t.error,
        undefined,
        'error',
      );
    } finally {
      setLoadingOrders(false);
    }
  }, [selectedDate, selectedDateLabel, selectedRouteId, showAlert, t]);

  const markTripAsSeen = async (tripId: string) => {
    try {
      const updatedSeenIds = new Set(seenTripIds);
      updatedSeenIds.add(tripId);
      setSeenTripIds(updatedSeenIds);
      await AsyncStorage.setItem(
        SEEN_ORDERS_KEY,
        JSON.stringify(Array.from(updatedSeenIds)),
      );
    } catch (e) {
      console.error('Error saving seen orders:', e);
    }
  };

  const handleTripPress = (trip: TripItem) => {
    markTripAsSeen(trip.id);
    navigation.navigate('TripOrders', { trip });
  };

  const onDateChange = (_event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const onPressRefresh = () => {
    if (!selectedRouteId) {
      return;
    }
    loadOrders();
  };

  const totalOrdersCount = useMemo(
    () => tripItems.reduce((sum, trip) => sum + trip.orders.length, 0),
    [tripItems],
  );

  const renderTripItem = ({ item }: { item: TripItem }) => {
    const isSeen = seenTripIds.has(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleTripPress(item)}
        style={[styles.orderCard, isSeen && styles.orderCardSeen]}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderName}>{`${t.trip} ${item.time}`}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{`${t.ordersLabel}:`}</Text>
            <Text style={styles.detailValue}>{item.orders.length}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{`${t.seats}:`}</Text>
            <Text
              style={styles.detailValue}
            >{`${item.freeCount}/${item.seatCount} ${t.free}`}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{`${t.status}:`}</Text>
            <Text style={styles.detailValue}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.ordersTitle}</Text>
        <Text
          style={styles.headerSubtitle}
        >{`${totalOrdersCount} ${t.ordersCount}`}</Text>
      </View>

      {driverInfo && (
        <View style={styles.driverInfoCard}>
          <Text style={styles.driverInfoName}>{driverInfo.name}</Text>
          <Text
            style={styles.driverInfoMeta}
          >{`${driverInfo.carModel} • ${driverInfo.carNumber}`}</Text>
          <Text
            style={styles.driverInfoMeta}
          >{`${t.approved}: ${driverInfo.approvedOrdersCount}`}</Text>
        </View>
      )}

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>{t.route}</Text>
        {loadingRoutes ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>{t.loadingRoutes}</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routesListContent}
          >
            {routes.map((route: any) => {
              const isActive = selectedRouteId === route.id;

              return (
                <TouchableOpacity
                  key={route.id}
                  style={[styles.routeChip, isActive && styles.routeChipActive]}
                  onPress={() => setSelectedRouteId(route.id)}
                >
                  <Text
                    style={[
                      styles.routeChipText,
                      isActive && styles.routeChipTextActive,
                    ]}
                  >
                    {route.route_name || route.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <Text style={styles.filterLabel}>{t.date}</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{selectedDateLabel}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        <Button
          title={t.refresh}
          onPress={onPressRefresh}
          loading={loadingOrders}
          disabled={!selectedRouteId}
        />
      </View>

      <FlatList
        data={tripItems}
        keyExtractor={item => item.id}
        renderItem={renderTripItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loadingOrders ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.emptyText}>{t.noOrdersAvailable}</Text>
            )}
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  driverInfoCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  driverInfoName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  driverInfoMeta: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  routesListContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  routeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  routeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  routeChipText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  routeChipTextActive: {
    color: colors.textWhite,
  },
  dateButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  dateButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm + spacing.xs,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'solid',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  orderCardSelected: {
    borderColor: colors.info,
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: colors.backgroundLight,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  orderCardSeen: {
    borderColor: colors.primary,
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: colors.background,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm + spacing.xs,
    paddingBottom: spacing.sm + spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  orderName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  orderDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm + spacing.xs,
  },
  orderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    width: 120,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
  },
});
