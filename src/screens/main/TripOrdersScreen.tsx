import React, { useMemo } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../assets/icons/Icon';
import { theme } from '../../assets/style/theme';
import { colors } from '../../assets/style/colors';
import { spacing } from '../../assets/style/spacing';
import { typography } from '../../assets/style/typography';
import { useLanguageStore } from '../../store/useLanguageStore';
import { getOrdersTranslations } from '../../i18n/translations';

export interface Order {
  id: string;
  name: string;
  phoneNumber: string;
  startAddress: string;
  endAddress: string;
  personCount: number;
}

export interface TripItem {
  id: string;
  date: string;
  time: string;
  seatCount: number;
  freeCount: number;
  status: string;
  orders: Order[];
  routeGroupKey?: string;
}

export type OrdersStackParamList = {
  OrdersList: undefined;
  TripOrders: { trip: TripItem };
};

type Props = NativeStackScreenProps<OrdersStackParamList, 'TripOrders'>;

export const TripOrdersScreen: React.FC<Props> = ({ route, navigation }) => {
  const { trip } = route.params;
  const language = useLanguageStore(s => s.language);
  const t = useMemo(() => getOrdersTranslations(language), [language]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon
            name="arrow-left"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {`${t.trip} ${trip.time} ${t.ordersLabel}`}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.tripInformation}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{`${t.date}:`}</Text>
            <Text style={styles.detailValue}>{trip.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{`${t.time}:`}</Text>
            <Text style={styles.detailValue}>{trip.time}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.ordersLabel}</Text>
          {trip.orders.length === 0 ? (
            <Text style={styles.emptyText}>{t.noOrdersInTrip}</Text>
          ) : (
            trip.orders.map(order => (
              <View key={order.id} style={styles.orderItem}>
                <Text style={styles.orderName}>{order.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const tel = (order.phoneNumber || '').trim().replace(/\s/g, '');
                    if (tel) {
                      Linking.openURL(`tel:${tel}`);
                    }
                  }}
                  disabled={!order.phoneNumber?.trim()}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.orderText,
                      order.phoneNumber?.trim() && styles.orderPhoneLink,
                    ]}
                  >{`${t.phone}: ${order.phoneNumber}`}</Text>
                </TouchableOpacity>
                <Text style={styles.orderText}>{`${t.from}: ${order.startAddress}`}</Text>
                <Text style={styles.orderText}>{`${t.to}: ${order.endAddress}`}</Text>
                <Text style={styles.orderText}>{`${t.passengers}: ${order.personCount}`}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Button title={t.close} onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  placeholder: {
    width: 36,
    height: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    width: 100,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: typography.fontWeight.medium,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
  },
  orderItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundLight,
  },
  orderName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  orderText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  orderPhoneLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: spacing.md,
  },
});
