import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Icon } from '../../assets/icons/Icon';
import { colors } from '../../assets/style/colors';
import { typography } from '../../assets/style/typography';
import { spacing } from '../../assets/style/spacing';
import type { ScheduleStackParamList } from '../../navigation/ScheduleStackNavigator';
import type {
  AvailabilityTemplate,
  WeekdayKey,
  WeekPattern,
} from '../../types/availability';
import { WEEKDAY_KEYS } from '../../types/availability';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  getAvailabilityTemplateTranslations,
  getAvailabilityCalendarTranslations,
} from '../../i18n/translations';
import { API_BASE_URL, TOKEN_KEY, USER_DATA_KEY } from '../../config/api';

const getDayLabelMap = (
  tCalendar: ReturnType<typeof getAvailabilityCalendarTranslations>,
) =>
  ({
    mon: tCalendar.monday,
    tue: tCalendar.tuesday,
    wed: tCalendar.wednesday,
    thu: tCalendar.thursday,
    fri: tCalendar.friday,
    sat: tCalendar.saturday,
    sun: tCalendar.sunday,
  } as const);

type NavigationProp = NativeStackNavigationProp<
  ScheduleStackParamList,
  'AvailabilityTemplatesList'
>;

export const AvailabilityTemplatesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const language = useLanguageStore(s => s.language);
  const t = useMemo(
    () => getAvailabilityTemplateTranslations(language),
    [language],
  );
  const tCalendar = useMemo(
    () => getAvailabilityCalendarTranslations(language),
    [language],
  );

  const [templates, setTemplates] = useState<AvailabilityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        setTemplates([]);
        setLoading(false);
        return;
      }

      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) {
        setTemplates([]);
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userDataString);
      let userId = 0;
      if (userData.userId) {
        const parsedId =
          typeof userData.userId === 'string'
            ? parseInt(userData.userId)
            : userData.userId;
        userId = isNaN(parsedId) ? 0 : parsedId;
      }

      const response = await axios.get(
        `${API_BASE_URL}/availability-templates/all?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data =
        response.data?.templates || response.data?.data || response.data || [];
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Error loading templates:', e);
      setTemplates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTemplates();
  };

  const handleCreateTemplate = () => {
    navigation.navigate('AvailabilityTemplateEditor', { isEditing: false });
  };

  const handleEditTemplate = (template: AvailabilityTemplate) => {
    navigation.navigate('AvailabilityTemplateEditor', {
      template,
      isEditing: true,
    });
  };

  const handleApplyTemplate = (template: AvailabilityTemplate) => {
    navigation.navigate('ApplyTemplate', { template });
  };

  const handleDeleteTemplate = (templateId: number) => {
    Alert.alert(t.delete, t.deleteConfirmBody, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) {
              Alert.alert(t.error, t.authTokenNotFound);
              return;
            }

            await axios.delete(
              `${API_BASE_URL}/availability-templates/delete/${templateId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            Alert.alert(t.success, t.deleteSuccess);
            loadTemplates();
          } catch (e: any) {
            console.error('Delete template error:', e);
            Alert.alert(t.error, e.response?.data?.message || t.deleteFailed);
          }
        },
      },
    ]);
  };

  const formatUpdatedAt = (value?: string): string => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleDateString();
  };

  const renderWeekViz = (weekPattern: WeekPattern) => {
    const dayLabels = getDayLabelMap(tCalendar);
    return (
      <View style={styles.weekVizContainer}>
        {WEEKDAY_KEYS.map(day => {
          const isActive = Object.keys(weekPattern?.[day] || {}).length > 0;
          return (
            <View
              key={day}
              style={[styles.dayDot, isActive && styles.dayDotActive]}
            >
              <Text
                style={[styles.dayDotText, isActive && styles.dayDotTextActive]}
              >
                {dayLabels[day].charAt(0)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item }: { item: AvailabilityTemplate }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>
            {formatUpdatedAt(item.updatedAt || item.createdAt)}
          </Text>
        </View>
        <View style={styles.cardHeaderActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleEditTemplate(item)}
          >
            <Text style={styles.iconButtonText}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={() => handleDeleteTemplate(item.id)}
          >
            <Text style={[styles.iconButtonText, styles.deleteButtonText]}>
              ×
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardLabel}>{t.daysWithSlots}</Text>
        {renderWeekViz(item.weekPattern)}
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => handleApplyTemplate(item)}
        activeOpacity={0.8}
      >
        <Text style={styles.applyButtonText}>{t.apply}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🗓️</Text>
      <Text style={styles.emptyTitle}>{t.emptyTitle}</Text>
      <Text style={styles.emptySubtitle}>{t.emptySubtitle}</Text>
    </View>
  );

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.templatesTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <FlatList
        data={templates}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateTemplate}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screen: {
    padding: 0,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for FAB
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  cardHeaderActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  iconButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  deleteButtonText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: -2,
  },
  cardBody: {
    marginBottom: spacing.lg,
  },
  cardLabel: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    color: colors.textLight,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  weekVizContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayDotText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
  },
  dayDotTextActive: {
    color: colors.white,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  applyButtonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    color: colors.grey,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    maxWidth: '80%',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: colors.white,
    marginTop: -4,
  },
});
