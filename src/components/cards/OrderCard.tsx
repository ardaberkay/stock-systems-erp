import OrderStatusBadge from '@/components/ui/order/OrderStatusBadge';
import WhatsAppIcon from '@/components/ui/order/WhatsAppIcon';
import Checkbox from '@/components/ui/Checkbox';
import { getOrderPaymentDisplay } from '@/constants/orderPaymentDisplay';
import type { OrderCargo, OrderPartner } from '@/hooks/useOrderLookups';
import type { Order } from '@/schemas/orders';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import { formatMoney, formatNumber, formatOrderDateTime, formatPhone } from '@/utils/formatter';
import Pencil from 'lucide-react-native/icons/pencil';
import Store from 'lucide-react-native/icons/store';
import Tag from 'lucide-react-native/icons/tag';
import Truck from 'lucide-react-native/icons/truck';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  onEdit: (orderId: number) => void;
  onToggleSelect: (orderId: number) => void;
  onWhatsApp: (phone: string, message: string) => void;
};

const SMALL_ICON_SIZE = ICON_SIZE.sm - SPACING.xxs;
const ITEM_ICON_SIZE = ICON_SIZE.sm - SPACING.xs;
// Görünen satır metin yüksekliğinde kalır, dokunma alanı 44 olur
const ICON_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.sm) / 2;
// Müşteri ve ortak ikonları alt alta durur; dokunma alanları satırların tam ortasında ayrılır
const STACKED_ICON_HIT_SLOP =
  (typography.label.lineHeight / 2 +
    SPACING.sm +
    typography.caption.lineHeight / 2 -
    ICON_SIZE.sm) /
  2;
const EDIT_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.sm) / 2;
// Uzun firma adı desiyi ve ileride eklenecek kargo adımlarını satırdan itmesin
const MAX_CARGO_NAME_WIDTH = '55%';

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
  onEdit,
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
      onPress={() => (isSelecting ? onToggleSelect(order.id) : onOpen(order.id))}
      // Modda da tanımlı kalmalı: kalkarsa parmak çekilince dokunuş sayılır ve seçim geri alınır
      onLongPress={() => {
        if (!isSelecting) {
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
            style={styles.itemBadge}
          >
            <Tag size={ITEM_ICON_SIZE} color={colors.purple} />
            <Text style={styles.itemCount}>{formatNumber(itemCount, locale)}</Text>
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
                  t('orders.whatsappCustomerMessage', { name: customerName, id: order.id }),
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
                    onWhatsApp(partnerPhone, t('orders.whatsappPartnerMessage', { id: order.id }))
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

          {customStatusName ? (
            <View style={styles.customStatus}>
              <Text style={styles.customStatusText} numberOfLines={1}>
                {customStatusName}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.cargo}>
          <CargoIcon size={SMALL_ICON_SIZE} color={colors.icon} />
          <Text style={styles.cargoName} numberOfLines={1}>
            {cargoName}
          </Text>
          {deci ? (
            <Text style={styles.deci} numberOfLines={1}>
              {`· ${t('orders.deci', { value: formatNumber(deci, locale) })}`}
            </Text>
          ) : null}
        </View>

        {isSelecting ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('orders.edit', { id: order.id })}
            hitSlop={EDIT_HIT_SLOP}
            onPress={() => onEdit(order.id)}
          >
            <Pencil size={ICON_SIZE.sm} color={colors.icon} />
          </Pressable>
        )}
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
    itemBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.xs,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.purpleLight,
    },
    itemCount: {
      ...typography.caption,
      color: colors.purple,
      fontFamily: FONT_FAMILY.bold,
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
      color: colors.textSecondary,
      fontFamily: FONT_FAMILY.semiBold,
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
    deci: {
      ...typography.caption,
      flexShrink: 0,
      color: colors.textSecondary,
    },
  });
}
