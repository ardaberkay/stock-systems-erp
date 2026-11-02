import OrderStatusActions from '@/components/modals/OrderStatusActions';
import { ORDER_BULK_ACTIONS, type OrderBulkActionKey } from '@/constants/orderBulkActions';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import { useLocalSearchParams } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Adımlar aynı sheet içinde değişir; üst üste sheet iki platformda farklı davranır.
export default function OrderActionsModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { count } = useLocalSearchParams<{ count: string }>();
  const [activeAction, setActiveAction] = useState<OrderBulkActionKey | null>(null);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
      <View style={styles.header}>
        {activeAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('orders.backToActions')}
            onPress={() => setActiveAction(null)}
            style={styles.backButton}
          >
            <ChevronLeft size={ICON_SIZE.lg} color={colors.text} />
          </Pressable>
        ) : null}

        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {t(activeAction ? `orders.bulkAction.${activeAction}` : 'orders.actionsTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {t('orders.actionsSubtitle', { value: formatNumber(Number(count), locale) })}
          </Text>
        </View>
      </View>

      {activeAction === null ? (
        <View>
          {ORDER_BULK_ACTIONS.map(({ key, icon: Icon }) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={t(`orders.bulkAction.${key}`)}
              onPress={() => setActiveAction(key)}
              style={styles.actionRow}
            >
              <Icon size={ICON_SIZE.md} color={colors.icon} />
              <Text style={styles.actionLabel}>{t(`orders.bulkAction.${key}`)}</Text>
              <ChevronRight size={ICON_SIZE.md} color={colors.icon} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {activeAction === 'status' ? <OrderStatusActions /> : null}

      {activeAction === 'cargo' || activeAction === 'invoice' ? (
        <Text style={styles.subtitle}>{t('orders.actionComingSoon')}</Text>
      ) : null}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      gap: SPACING.md,
      paddingTop: SPACING.xxl,
      paddingHorizontal: SPACING.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    backButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    headerText: {
      flex: 1,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    actionRow: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    actionLabel: {
      ...typography.body,
      flex: 1,
      color: colors.text,
    },
  });
}
