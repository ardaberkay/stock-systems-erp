import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { Order } from '@/features/orders/schemas/orders';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney, formatOrderDateTime } from '@/utils/formatter';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, type ReactNode } from 'react';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type OrderDetailHeaderProps = {
  order: Order;
  // En altta duran bölüm seçimi (sekmeler)
  children?: ReactNode;
};

// Alt köşelerin yuvarlaklığı (ürün detayının mor başlığıyla aynı)
const HEADER_RADIUS = RADIUS.xl;
// Gradyan dikey açılır: üst kenar app bar'ın rengiyle aynı olduğu için ikisi tek parça görünür
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 0, y: 1 };

// Sipariş detayının app bar'la birleşik yeşil başlığı: no, durum, tarih, toplam ve sekmeler.
// Siparişin kayıtlı halini gösterir, düzenlemede de değişmez (durum Sipariş bölümündeki alandan
// değişir). Özel durum Sipariş bölümündedir: mağaza kendisi oluşturur, adı uzun olabilir.
// İki modda aynı yerde durur, sayfa altında kayar.
export default function OrderDetailHeader({ order, children }: OrderDetailHeaderProps) {
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <LinearGradient
      colors={[colors.orderHeaderStart, colors.orderHeaderEnd]}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.number} selectable>
            #{order.id}
          </Text>
          <OrderStatusBadge statusId={order.orderStatusId} colors={colors} spacious />
        </View>

        <View style={styles.row}>
          <Text style={styles.date}>{formatOrderDateTime(order.orderDateTime)}</Text>
          <Text style={styles.total}>{formatMoney(order.orderAmount, locale)}</Text>
        </View>

        {children}
      </View>
    </LinearGradient>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    gradient: {
      borderBottomLeftRadius: HEADER_RADIUS,
      borderBottomRightRadius: HEADER_RADIUS,
    },
    // Tablette içerik ortalanır, yeşil zemin ise ekranın tamamını kaplar
    content: {
      ...SCREEN_CONTENT,
      gap: SPACING.md,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xs,
      paddingBottom: SPACING.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    // Durum rozeti küçülmez (bkz. OrderStatusBadge); yer darsa no kısalır
    number: {
      ...typography.h3,
      flexShrink: 1,
      color: colors.onHeader,
    },
    date: {
      ...typography.bodySmall,
      flexShrink: 1,
      color: colors.onHeaderMuted,
    },
    // Ürün başlığındaki fiyatla aynı ağırlık
    total: {
      ...typography.h3,
      fontFamily: FONT_FAMILY.bold,
      flexShrink: 0,
      color: colors.onHeader,
    },
  });
}
