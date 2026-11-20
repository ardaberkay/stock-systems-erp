import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import ContactActions from '@/features/orders/components/detail/ContactActions';
import { isDeliveryPlace } from '@/features/orders/constants/detail';
import type { Order } from '@/features/orders/schemas/orders';
import { getAddressLine, getFullName } from '@/features/orders/utils/orderDetail';
import { formatMessageAmount, formatMessageDateTime, formatPhone } from '@/utils/formatter';
import { useTranslation } from 'react-i18next';

type OrderDetailCustomerTabProps = {
  order: Order;
};

// Müşteri bölümünün okuma hali: teslimat ve fatura bilgileri
export default function OrderDetailCustomerTab({ order }: OrderDetailCustomerTabProps) {
  const { t } = useTranslation();
  const customerName = getFullName(order.deliveryFirstName, order.deliveryLastName);
  const customerPhone = order.deliveryPhone;

  return (
    <>
      <DetailSection title={t('orders.detail.sections.customer')} variant="plain">
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
                  date: formatMessageDateTime(order.orderDateTime),
                  amount: formatMessageAmount(order.orderAmount),
                })}
              />
            ) : null
          }
        />
        <DetailRow label={t('orders.detail.email')} value={order.orderEmail} selectable />
        <DetailRow
          label={t('orders.detail.address')}
          value={getAddressLine(order.deliveryAddress, order.deliveryDistrict, order.deliveryCity)}
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

      {/* Teslimatla aynı olsa da ayrı durur. API'de TC alanı yok, TC vergi no alanında gelir */}
      <DetailSection title={t('orders.detail.sections.billing')} variant="plain">
        <DetailRow
          label={t('orders.detail.name')}
          value={getFullName(order.billingFirstName, order.billingLastName)}
        />
        <DetailRow label={t('orders.detail.taxNumber')} value={order.billingTaxNumber} selectable />
        <DetailRow label={t('orders.detail.taxOffice')} value={order.billingTaxOffice} />
        <DetailRow label={t('orders.detail.city')} value={order.billingCity} />
        <DetailRow label={t('orders.detail.district')} value={order.billingDistrict} />
        <DetailRow label={t('orders.detail.address')} value={order.billingAddress} selectable />
        <DetailRow
          label={t('orders.detail.phone')}
          value={order.billingPhone ? formatPhone(order.billingPhone) : null}
          selectable
        />
        <DetailRow label={t('orders.detail.email')} value={order.billingMail} selectable />
      </DetailSection>
    </>
  );
}
