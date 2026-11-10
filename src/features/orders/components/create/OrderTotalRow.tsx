import DetailRow from '@/components/ui/DetailRow';
import { useLocale } from '@/hooks/useLocale';
import type { OrderCreateFormInput } from '@/features/orders/schemas/orderCreate';
import { formatMoney } from '@/utils/formatter';
import { getProductsValue, parseMoney } from '@/features/orders/utils/orderCreate';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// API'ye gidecek tutarla aynı hesap: sipariş tutarı (veya ürün toplamı) + alınan kargo ücreti
export default function OrderTotalRow() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { control } = useFormContext<OrderCreateFormInput>();
  const [items, productsValue, chargeShipping, shippingFee] = useWatch({
    control,
    name: ['items', 'productsValue', 'chargeShipping', 'shippingFee'],
  });
  const total =
    getProductsValue({ items, productsValue }) + (chargeShipping ? parseMoney(shippingFee) : 0);

  return (
    <DetailRow label={t('orders.create.total')} value={formatMoney(total, locale)} emphasized />
  );
}
