import Badge from '@/components/ui/Badge';
import CargoStepBar from '@/features/orders/components/CargoStepBar';
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import WhatsAppIcon from '@/features/orders/components/WhatsAppIcon';
import Checkbox from '@/components/ui/Checkbox';
import { getOrderPaymentDisplay } from '@/features/orders/constants/list';
import type { OrderCargo, OrderPartner } from '@/features/orders/hooks/useOrderLookups';
import type { Order } from '@/features/orders/schemas/orders';
import { haptics } from '@/lib/haptics';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import {
  formatMessageAmount,
  formatMessageDateTime,
  formatMoney,
  formatNumber,
  formatOrderDateTime,
  formatPhone,
} from '@/utils/formatter';
import Store from 'lucide-react-native/icons/store';
import Tag from 'lucide-react-native/icons/tag';
import Truck from 'lucide-react-native/icons/truck';
import Weight from 'lucide-react-native/icons/weight';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

type OrderCardProps = {
  order: Order;
  paymentName: string | undefined;
  cargo: OrderCargo | undefined;
  customStatusName: string | undefined;
  partner: OrderPartner | undefined;
  colors: AppColors;
  locale: string;
  isSelecting: boolean;
  isSelected: boolean;
  onOpen: (orderId: number) => void;
  onToggleSelect: (orderId: number) => void;
  onWhatsApp: (phone: string, message: string) => void;
};

const SMALL_ICON_SIZE = ICON_SIZE.sm - SPACING.xxs;
// Görünen satır metin yüksekliğinde kalır, dokunma alanı 44 olur
const ICON_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.sm) / 2;
// Müşteri ve ortak ikonları alt alta durur; dokunma alanları satırların tam ortasında ayrılır
const STACKED_ICON_HIT_SLOP =
  (typography.label.lineHeight / 2 +
    SPACING.sm +
    typography.caption.lineHeight / 2 -
    ICON_SIZE.sm) /
  2;
// Uzun firma adı desiyi ve ileride eklenecek kargo adımlarını satırdan itmesin
const MAX_CARGO_NAME_WIDTH = '55%';
// GEÇİCİ: kargo adımı verisi yok; tasarım denemesi için adım sipariş numarasından türetilir
const CARGO_STEP_COUNT = 5;

// Yüzlerce kart aynı stili kullanır; her kartta yeniden oluşturulmasın.
const stylesByTheme = new WeakMap<AppColors, ReturnType<typeof createStyles>>();

function getStyles(colors: AppColors) {
  const cached = stylesByTheme.get(colors);

  if (cached) {
    return cached;
  }

  const styles = createStyles(colors);
  stylesByTheme.set(colors, styles);
  return styles;
}

function OrderCard({
  order,
  paymentName,
  cargo,
  customStatusName,
  partner,
  colors,
  locale,
  isSelecting,
  isSelected,
  onOpen,
  onToggleSelect,
  onWhatsApp,
}: OrderCardProps) {
  const { t } = useTranslation();
  const styles = getStyles(colors);
  const customerName = `${order.deliveryFirstName ?? ''} ${order.deliveryLastName ?? ''}`.trim();
  const phone = order.deliveryPhone;
  const partnerPhone = partner?.phone;
  const itemCount = order.items.reduce((total, item) => total + item.qty, 0);
  const deci = order.shippingPackageDeciValue;
  const { icon: PaymentIcon } = getOrderPaymentDisplay(order.orderPaymentTypeId);
  const CargoIcon = cargo?.isStorePickup ? Store : Truck;
  const cargoName = cargo?.isStorePickup ? t('orders.storePickup') : cargo?.name;

  return (
    <Pressable
      accessibilityRole={isSelecting ? 'checkbox' : 'button'}
      accessibilityLabel={t(isSelecting ? 'orders.selectOrder' : 'orders.openDetail', {
        id: order.id,
      })}
      accessibilityState={isSelecting ? { checked: isSelected } : undefined}
      onPress={() => {
        if (isSelecting) {
          haptics.selection();
          onToggleSelect(order.id);
        } else {
          onOpen(order.id);
        }
      }}
      // Modda da tanımlı kalmalı: kalkarsa parmak çekilince dokunuş sayılır ve seçim geri alınır
      onLongPress={() => {
        if (!isSelecting) {
          haptics.longPress();
          onToggleSelect(order.id);
        }
      }}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      <View style={styles.row}>
        {isSelecting ? <Checkbox checked={isSelected} colors={colors} /> : null}
        <Text style={styles.meta} numberOfLines={1}>
          <Text style={styles.orderNumber}>#{order.id}</Text>
          {` · ${formatOrderDateTime(order.orderDateTime)}`}
        </Text>
        <OrderStatusBadge statusId={order.orderStatusId} colors={colors} />
      </View>

      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          {customerName}
        </Text>

        <View style={styles.price}>
          <View
            accessible
            accessibilityLabel={t('orders.itemCount', { value: formatNumber(itemCount, locale) })}
          >
            <Badge label={formatNumber(itemCount, locale)} tone="purple" icon={Tag} compact slim />
          </View>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.amount} numberOfLines={1}>
            {formatMoney(order.orderAmount, locale)}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        {phone ? (
          <View style={styles.contact}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('orders.whatsappCustomer')}
              accessibilityState={{ disabled: isSelecting }}
              disabled={isSelecting}
              hitSlop={{
                top: ICON_HIT_SLOP,
                bottom: partnerPhone ? STACKED_ICON_HIT_SLOP : ICON_HIT_SLOP,
                left: ICON_HIT_SLOP,
                right: ICON_HIT_SLOP,
              }}
              onPress={() =>
                onWhatsApp(
                  phone,
                  t('orders.whatsappCustomerMessage', {
                    name: customerName,
                    date: formatMessageDateTime(order.orderDateTime),
                    amount: formatMessageAmount(order.orderAmount),
                  }),
                )
              }
            >
              <WhatsAppIcon />
            </Pressable>
            <Text style={styles.phone} numberOfLines={1}>
              {formatPhone(phone)}
            </Text>
          </View>
        ) : (
          <View />
        )}

        {paymentName ? (
          <View style={styles.payment}>
            <PaymentIcon size={SMALL_ICON_SIZE} color={colors.icon} />
            <Text style={styles.paymentName} numberOfLines={1}>
              {paymentName}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Çoğu siparişte ikisi de yok; boş satır taşımamak için yalnızca gerektiğinde açılır */}
      {partner || customStatusName ? (
        <View style={styles.row}>
          {partner ? (
            <View style={styles.contact}>
              {partnerPhone ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('orders.whatsappPartner', { name: partner.name })}
                  accessibilityState={{ disabled: isSelecting }}
                  disabled={isSelecting}
                  hitSlop={{
                    top: STACKED_ICON_HIT_SLOP,
                    bottom: ICON_HIT_SLOP,
                    left: ICON_HIT_SLOP,
                    right: ICON_HIT_SLOP,
                  }}
                  onPress={() =>
                    onWhatsApp(
                      partnerPhone,
                      t('orders.whatsappPartnerMessage', {
                        partner: partner.name,
                        date: formatMessageDateTime(order.orderDateTime),
                        amount: formatMessageAmount(order.orderAmount),
                        customer: customerName,
                      }),
                    )
                  }
                >
                  <WhatsAppIcon />
                </Pressable>
              ) : null}
              <Text style={styles.partnerName} numberOfLines={1}>
                {partner.name}
              </Text>
            </View>
          ) : (
            <View />
          )}

          {customStatusName ? <Badge label={customStatusName} tone="outline" shrink slim /> : null}
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.cargo}>
          <CargoIcon size={SMALL_ICON_SIZE} color={colors.icon} />
          <Text style={styles.cargoName} numberOfLines={1}>
            {cargoName}
          </Text>
        </View>

        <View style={styles.cargoProgress}>
          <CargoStepBar
            current={order.id % (CARGO_STEP_COUNT + 1)}
            total={CARGO_STEP_COUNT}
            colors={colors}
          />
          {deci ? (
            <View
              accessible
              accessibilityLabel={t('orders.deci', { value: formatNumber(deci, locale) })}
            >
              <Badge label={formatNumber(deci, locale)} icon={Weight} compact slim />
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// Filtre veya yeni sayfa geldiğinde yalnızca değişen kartlar çizilir.
export default memo(OrderCard);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      gap: SPACING.sm,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    cardSelected: {
      borderColor: colors.orange,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
      minWidth: 0,
    },
    meta: {
      ...typography.caption,
      flex: 1,
      color: colors.textSecondary,
    },
    orderNumber: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    name: {
      ...typography.label,
      flex: 1,
      color: colors.text,
      fontFamily: FONT_FAMILY.bold,
    },
    price: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 0,
    },
    separator: {
      ...typography.label,
      marginHorizontal: SPACING.xs,
      color: colors.textSecondary,
      fontSize: FONT_SIZE.md,
    },
    amount: {
      ...typography.label,
      color: colors.orangeWhite,
      fontSize: FONT_SIZE.md,
      fontFamily: FONT_FAMILY.bold,
    },
    contact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 1,
      minWidth: 0,
    },
    phone: {
      ...typography.label,
      flexShrink: 1,
      color: colors.text,
    },
    partnerName: {
      ...typography.caption,
      flexShrink: 1,
      color: colors.text,
      fontFamily: FONT_FAMILY.semiBold,
    },
    payment: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 1,
      minWidth: 0,
    },
    paymentName: {
      ...typography.caption,
      flexShrink: 1,
      color: colors.textSecondary,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    cargo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      minWidth: 0,
    },
    cargoName: {
      ...typography.caption,
      maxWidth: MAX_CARGO_NAME_WIDTH,
      color: colors.textSecondary,
    },
    cargoProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      flexShrink: 0,
    },
  });
}
