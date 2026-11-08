import { useOrder } from '@/api/orders';
import { useProductsByIds } from '@/api/products';
import ContactActions from '@/components/order/ContactActions';
import OrderDetailHeader from '@/components/order/OrderDetailHeader';
import OrderEditView from '@/components/order/edit/OrderEditView';
import OrderItemRow from '@/components/order/OrderItemRow';
import OrderTimeline from '@/components/order/OrderTimeline';
import Skeleton from '@/components/skeleton/Skeleton';
import Button from '@/components/ui/Button';
import DetailNote from '@/components/ui/DetailNote';
import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import SegmentedControl from '@/components/ui/SegmentedControl';
import StateMessage from '@/components/ui/StateMessage';
import {
  isDeliveryPlace,
  isShippingPayer,
  ORDER_DETAIL_TABS,
  type OrderDetailTab,
} from '@/constants/orderDetail';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useOrderLookups } from '@/hooks/useOrderLookups';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney, formatNumber, formatPhone } from '@/utils/formatter';
import {
  getAddressLine,
  getCargoSteps,
  getFullName,
  getOrderTimeline,
} from '@/utils/orderDetail';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// İskelet blokları gerçek bölümlerin kabaca yüksekliğinde; içerik gelince sayfa zıplamasın
const SKELETON_BLOCK_HEIGHTS = [240, 280, 200, 240];
// Pasif butonlar için; basılamadıkları için hiç çağrılmaz
const noop = () => {};

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  // Düzenleme modu sayfa parametresidir: başlıktaki kalem ve listedeki kartın kalemi edit=1 yapar
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const orderId = Number(id);
  const isEditing = edit === '1';
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Gösterge yalnızca kullanıcı aşağı çekince döner; açılıştaki arka plan güncellemesi sessizdir
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Sayfa her açılışta Sipariş bölümüyle başlar
  const [activeTab, setActiveTab] = useState<OrderDetailTab>('order');

  const { data: order, isPending, error, refetch } = useOrder(orderId);
  const orders = useMemo(() => (order ? [order] : []), [order]);
  const lookups = useOrderLookups(orders);
  const productIds = useMemo(
    () => [
      ...new Set(
        (order?.items ?? []).flatMap((item) => (item.productId === null ? [] : [item.productId])),
      ),
    ],
    [order],
  );
  const { data: products, isPending: isProductsPending } = useProductsByIds(productIds);
  const productsById = useMemo(
    () => new Map((products ?? []).map((product) => [product.id, product])),
    [products],
  );

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Başlıktaki kalem rota tanımında (src/app/_layout.tsx); sayfa başlığa hiçbir şey eklemez.
  if (!order) {
    return (
      <View style={styles.screen}>
        {isPending ? (
          <View style={styles.content}>
            {SKELETON_BLOCK_HEIGHTS.map((height, index) => (
              <Skeleton key={index} width="100%" height={height} radius={RADIUS.lg} />
            ))}
          </View>
        ) : error ? (
          <StateMessage message={t(getErrorMessageKey(error))} onRetry={() => void refetch()} />
        ) : (
          <StateMessage message={t('orders.detail.notFound')} />
        )}
      </View>
    );
  }

  const customerName = getFullName(order.deliveryFirstName, order.deliveryLastName);
  const customerPhone = order.deliveryPhone;
  const cargo =
    order.shippingCargoCompanyId === null ? undefined : lookups.cargos.get(order.shippingCargoCompanyId);
  const partner =
    order.affiliateAccountId === null ? undefined : lookups.partners.get(order.affiliateAccountId);
  const customStatusName =
    order.orderCustomStatusId === null
      ? undefined
      : lookups.customStatusNames.get(order.orderCustomStatusId);
  const paymentName =
    order.orderPaymentTypeId === null
      ? undefined
      : lookups.paymentNames.get(order.orderPaymentTypeId);
  const itemCount = order.items.reduce((total, item) => total + item.qty, 0);

  if (isEditing) {
    return (
      <OrderEditView
        order={order}
        customStatusName={customStatusName}
        partnerName={partner?.name}
        productsById={productsById}
        isProductsPending={isProductsPending}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExit={() => router.setParams({ edit: undefined })}
      />
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.orange}
            colors={[colors.orange]}
          />
        }
        // 1. çocuk bölüm seçimi; kaydırınca üstte yapışık kalır
        stickyHeaderIndices={[1]}
      >
        {/* Bölümden bağımsız hep görünen özet */}
        <View style={styles.summaryCard}>
          <OrderDetailHeader order={order} customStatusName={customStatusName} />
        </View>

        <View style={styles.tabBar}>
          <SegmentedControl
            options={ORDER_DETAIL_TABS.map((tab) => ({
              value: tab,
              label: t(`orders.detail.tabs.${tab}`),
            }))}
            value={activeTab}
            onChange={setActiveTab}
          />
        </View>

        {activeTab === 'order' ? (
          <>
            {/* Sipariş alındı, barkod, kargoya verildi ve teslim tarihleri */}
            <DetailSection title={t('orders.detail.sections.timeline')}>
              <OrderTimeline steps={getOrderTimeline(order)} />
            </DetailSection>

            {/* Ürünler, tutar ve ödeme tek kartta: sipariş toplamı ürünlerin hemen altında okunur */}
            <DetailSection
              title={`${t('orders.detail.sections.items')} · ${t('orders.itemCount', {
                value: formatNumber(itemCount, locale),
              })}`}
            >
              {order.items.map((item, index) => (
                <OrderItemRow
                  key={item.id ?? index}
                  item={item}
                  product={item.productId === null ? undefined : productsById.get(item.productId)}
                  isProductLoading={isProductsPending}
                  orderStatusId={order.orderStatusId}
                  locale={locale}
                />
              ))}
              <View style={styles.divider} />
              <DetailRow
                label={t('orders.detail.productsTotal')}
                value={
                  order.orderProductsValue === null
                    ? null
                    : formatMoney(order.orderProductsValue, locale)
                }
              />
              <DetailRow
                label={t('orders.detail.shippingFee')}
                value={formatMoney(order.orderShippingValue, locale)}
              />
              <DetailRow
                label={t('orders.detail.total')}
                value={formatMoney(order.orderAmount, locale)}
                emphasized
              />
              <View style={styles.divider} />
              <DetailRow label={t('orders.detail.paymentType')} value={paymentName} />
              <DetailRow
                label={t('orders.detail.paymentConfirm')}
                value={order.orderPaymentConfirm === 1 ? t('orders.detail.paymentConfirmed') : null}
              />
              <DetailRow
                label={t('orders.detail.partner')}
                value={partner?.name}
                actions={
                  partner?.phone ? (
                    <ContactActions
                      phone={partner.phone}
                      whatsappLabel={t('orders.whatsappPartner', { name: partner.name })}
                      whatsappMessage={t('orders.whatsappPartnerMessage', { id: order.id })}
                    />
                  ) : null
                }
              />
            </DetailSection>

            {/* Dış no notlarda her zaman geçmez (19 siparişin 2'si), bu yüzden ayrı satırda */}
            <DetailSection title={t('orders.detail.sections.notes')}>
              <DetailRow
                label={t('orders.detail.externalId')}
                value={order.customOrderId}
                selectable
              />
              <View style={styles.divider} />
              {/* Paneldeki "Açıklama" description'a, "Ek bilgiler" description2'ye yazılır */}
              <DetailNote label={t('orders.detail.description')} value={order.description} />
              <DetailNote label={t('orders.detail.description2')} value={order.description2} />
            </DetailSection>
          </>
        ) : null}

        {activeTab === 'customer' ? (
          <>
            <DetailSection title={t('orders.detail.sections.customer')}>
              <DetailRow label={t('orders.detail.name')} value={customerName} />
              <DetailRow
                label={t('orders.detail.phone')}
                value={customerPhone ? formatPhone(customerPhone) : null}
                selectable
                actions={
                  customerPhone ? (
                    <ContactActions
                      phone={customerPhone}
                      whatsappLabel={t('orders.whatsappCustomer')}
                      whatsappMessage={t('orders.whatsappCustomerMessage', {
                        name: customerName,
                        id: order.id,
                      })}
                    />
                  ) : null
                }
              />
              <DetailRow label={t('orders.detail.email')} value={order.orderEmail} selectable />
              <DetailRow
                label={t('orders.detail.address')}
                value={getAddressLine(
                  order.deliveryAddress,
                  order.deliveryDistrict,
                  order.deliveryCity,
                )}
                selectable
              />
              <DetailRow
                label={t('orders.detail.deliveryPlace')}
                value={
                  order.deliveryCargoPlaceOfDelivery
                    ? isDeliveryPlace(order.deliveryCargoPlaceOfDelivery)
                      ? t(`orders.detail.deliveryPlaces.${order.deliveryCargoPlaceOfDelivery}`)
                      : t('orders.detail.unknown')
                    : null
                }
              />
            </DetailSection>

            {/* Teslimatla aynı olsa da ayrı durur; kartlar ileride yerinde düzenlenecek.
                API'de TC alanı yok, TC vergi no alanında gelir */}
            <DetailSection title={t('orders.detail.sections.billing')}>
              <DetailRow
                label={t('orders.detail.name')}
                value={getFullName(order.billingFirstName, order.billingLastName)}
              />
              <DetailRow
                label={t('orders.detail.taxNumber')}
                value={order.billingTaxNumber}
                selectable
              />
              <DetailRow label={t('orders.detail.taxOffice')} value={order.billingTaxOffice} />
              <DetailRow label={t('orders.detail.city')} value={order.billingCity} />
              <DetailRow label={t('orders.detail.district')} value={order.billingDistrict} />
              <DetailRow
                label={t('orders.detail.address')}
                value={order.billingAddress}
                selectable
              />
              <DetailRow
                label={t('orders.detail.phone')}
                value={order.billingPhone ? formatPhone(order.billingPhone) : null}
                selectable
              />
              <DetailRow label={t('orders.detail.email')} value={order.billingMail} selectable />
            </DetailSection>
          </>
        ) : null}

        {activeTab === 'cargo' ? (
          <>
            <DetailSection title={t('orders.detail.sections.cargo')}>
              <DetailRow
                label={t('orders.detail.cargoCompany')}
                value={cargo?.isStorePickup ? t('orders.storePickup') : cargo?.name}
              />
              <DetailRow
                label={t('orders.detail.carrier')}
                value={order.shippingCarrierBranchName}
              />
              <DetailRow
                label={t('orders.detail.trackCode')}
                value={order.shippingTrackCode}
                selectable
              />
              <DetailRow
                label={t('orders.detail.barcode')}
                value={order.shippingTrackCode2}
                selectable
              />
              <DetailRow
                label={t('orders.detail.deci')}
                value={
                  order.shippingPackageDeciValue === null
                    ? null
                    : formatNumber(order.shippingPackageDeciValue, locale)
                }
              />
              <DetailRow
                label={t('orders.detail.shippingPayer')}
                value={
                  order.deliveryWhoPaysShipping
                    ? isShippingPayer(order.deliveryWhoPaysShipping)
                      ? t(`orders.detail.shippingPayers.${order.deliveryWhoPaysShipping}`)
                      : t('orders.detail.unknown')
                    : null
                }
              />
              {order.shippingTrackCode || order.shippingTrackCode2 ? (
                <Text style={styles.note}>{t('orders.detail.copyHint')}</Text>
              ) : null}
              <View style={styles.divider} />
              {/* Kargo firmasının bildirimleri; veri gelene kadar adımlar bekliyor görünür */}
              <Text style={styles.subTitle} accessibilityRole="header">
                {t('orders.detail.cargoSteps')}
              </Text>
              <OrderTimeline steps={getCargoSteps()} />
              <Text style={styles.note}>{t('orders.detail.cargoStepsEmpty')}</Text>
              <View style={styles.divider} />
              {/* API'de kargoya gönderme servisi yok; yeri hazır, servis gelince bağlanır */}
              <Button label={t('orders.editMode.shipToCargo')} onPress={noop} disabled />
              <Text style={styles.note}>{t('orders.editMode.comingSoon')}</Text>
            </DetailSection>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      gap: SPACING.xl,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.md,
    },
    summaryCard: {
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    // Yapışık kalınca alttan kayan kartları örtsün diye zemin rengi ve dikey boşluk taşır
    tabBar: {
      paddingVertical: SPACING.sm,
      backgroundColor: colors.background,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    },
    subTitle: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
    note: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
