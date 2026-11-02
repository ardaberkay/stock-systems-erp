import { useOrderSearch } from '@/api/orders';
import ReportOrderCard from '@/components/cards/ReportOrderCard';
import OrderCardSkeleton from '@/components/skeleton/OrderCardSkeleton';
import StateMessage from '@/components/ui/StateMessage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useOrderLookups } from '@/hooks/useOrderLookups';
import { getErrorMessageKey } from '@/lib/apiError';
import type { Order } from '@/schemas/orders';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { mergeOrders } from '@/utils/orderList';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SKELETON_CARD_KEYS = ['first', 'second', 'third'];

// Telefonla arama tarih sınırına takılmaz; müşterinin tüm geçmişi gelir.
export default function ReportCustomerScreen() {
  const { t } = useTranslation();
  const { phone, name } = useLocalSearchParams<{ phone: string; name?: string }>();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data, isPending, error, refetch } = useOrderSearch({ kind: 'phone', value: phone });
  const orders = useMemo(() => mergeOrders(data ?? []), [data]);
  const lookups = useOrderLookups(orders);

  const renderOrder = useCallback<ListRenderItem<Order>>(
    ({ item }) => (
      <ReportOrderCard order={item} lookups={lookups} colors={colors} locale={locale} />
    ),
    [lookups, colors, locale],
  );

  return (
    <>
      <Stack.Screen options={{ title: name || t('reports.customers.history') }} />
      {isPending ? (
        <View style={[styles.screen, styles.list]}>
          {SKELETON_CARD_KEYS.map((key) => (
            <OrderCardSkeleton key={key} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.screen}>
          <StateMessage message={t(getErrorMessageKey(error))} onRetry={() => void refetch()} />
        </View>
      ) : (
        <FlatList
          style={styles.screen}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + SPACING.xl }]}
          data={orders}
          keyExtractor={(order) => String(order.id)}
          renderItem={renderOrder}
          ListEmptyComponent={<StateMessage message={t('reports.empty')} />}
        />
      )}
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      gap: SPACING.sm,
      padding: SPACING.md,
    },
  });
}
