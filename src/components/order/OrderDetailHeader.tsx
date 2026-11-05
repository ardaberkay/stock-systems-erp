import OrderStatusBadge from '@/components/ui/order/OrderStatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Order } from '@/schemas/orders';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type OrderDetailHeaderProps = {
  order: Order;
  customStatusName: string | undefined;
};

// Sipariş durumu kartının üst satırı. Tarih çizelgenin "alındı" adımında, dış no notlarda durur.
// Durum değiştirme düzenleme adımında gelecek; rozet şimdilik yalnızca gösterir.
export default function OrderDetailHeader({ order, customStatusName }: OrderDetailHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text style={styles.number} selectable>
          #{order.id}
        </Text>
        <OrderStatusBadge statusId={order.orderStatusId} colors={colors} />
      </View>

      {customStatusName ? (
        <View style={styles.customRow}>
          <View style={styles.customStatus}>
            <Text style={styles.customStatusText} numberOfLines={1}>
              {customStatusName}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    header: {
      gap: SPACING.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    number: {
      ...typography.h3,
      flexShrink: 1,
      color: colors.text,
    },
    customRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    customStatus: {
      flexShrink: 1,
      paddingHorizontal: SPACING.xs,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    customStatusText: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
  });
}
