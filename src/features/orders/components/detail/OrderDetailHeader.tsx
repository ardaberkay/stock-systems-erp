import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import { getOrderStatusDisplay } from '@/features/orders/constants/status';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { Order } from '@/features/orders/schemas/orders';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney, formatOrderDateTime } from '@/utils/formatter';
import { getOrderStatusToneColors } from '@/features/orders/utils/orderStatusColor';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

type OrderDetailHeaderProps = {
  order: Order;
  customStatusName: string | undefined;
  // Düzenlemede formdaki (henüz kaydedilmemiş) durum gösterilir
  statusId?: number;
  // Verilirse rozet basılabilir olur ve durum listesini açar
  onStatusPress?: () => void;
  // Verilirse özel durum basılabilir olur; yoksa "Özel durum ekle" görünür
  onCustomStatusPress?: () => void;
};

// Kutu ince (yaklaşık 27); görünmez pay dokunma alanını 44'e yaklaştırır
const STATUS_HIT_SLOP = SPACING.sm;

// Detay sayfasında bölüm seçiminden bağımsız hep görünen özet: no, durum, tarih ve toplam.
export default function OrderDetailHeader({
  order,
  customStatusName,
  statusId = order.orderStatusId,
  onStatusPress,
  onCustomStatusPress,
}: OrderDetailHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const statusDisplay = getOrderStatusDisplay(statusId);
  const StatusIcon = statusDisplay.icon;
  const statusTone = getOrderStatusToneColors(statusDisplay.tone, colors);

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text style={styles.number} selectable>
          #{order.id}
        </Text>
        {onStatusPress ? (
          // Kutunun kendisi durumun renginde; içinde ayrı rozet yok
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('orders.editMode.changeStatus')}
            accessibilityValue={{ text: t(`orders.status.${statusDisplay.key}`) }}
            hitSlop={STATUS_HIT_SLOP}
            onPress={onStatusPress}
            style={[styles.statusButton, { backgroundColor: statusTone.background }]}
          >
            <StatusIcon size={ICON_SIZE.sm} color={statusTone.text} />
            <Text style={[styles.statusText, { color: statusTone.text }]} numberOfLines={1}>
              {t(`orders.status.${statusDisplay.key}`)}
            </Text>
            <ChevronDown size={ICON_SIZE.sm} color={statusTone.text} />
          </Pressable>
        ) : (
          <OrderStatusBadge statusId={statusId} colors={colors} />
        )}
      </View>

      {onCustomStatusPress ? (
        // Düzenlemede özel durum yoksa da yeri görünür ki eklenebilsin
        <View style={styles.customRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('orders.editMode.changeCustomStatus')}
            accessibilityValue={{ text: customStatusName ?? t('orders.editMode.noCustomStatus') }}
            hitSlop={STATUS_HIT_SLOP}
            onPress={onCustomStatusPress}
            style={[styles.customStatus, styles.customStatusButton]}
          >
            <Text style={styles.customStatusText} numberOfLines={1}>
              {customStatusName ?? t('orders.editMode.addCustomStatus')}
            </Text>
            <ChevronDown size={ICON_SIZE.sm} color={colors.icon} />
          </Pressable>
        </View>
      ) : customStatusName ? (
        <View style={styles.customRow}>
          <View style={styles.customStatus}>
            <Text style={styles.customStatusText} numberOfLines={1}>
              {customStatusName}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.row}>
        <Text style={styles.date}>{formatOrderDateTime(order.orderDateTime)}</Text>
        <Text style={styles.total}>{formatMoney(order.orderAmount, locale)}</Text>
      </View>
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
    // Durumun renginde dolu seçim kutusu: ikon, ad ve ok
    statusButton: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: RADIUS.md,
    },
    statusText: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.semiBold,
    },
    date: {
      ...typography.bodySmall,
      flexShrink: 1,
      color: colors.textSecondary,
    },
    total: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
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
    // Durum kutusuyla aynı görünüm: yazı ve ok tek kutuda
    customStatusButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.xxs,
      borderRadius: RADIUS.md,
    },
    customStatusText: {
      ...typography.caption,
      flexShrink: 1,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
  });
}
