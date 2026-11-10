import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import type { Product } from '@/features/products/schemas/products';
import { useLocale } from '@/hooks/useLocale';
import { formatMoney } from '@/utils/formatter';
import { useTranslation } from 'react-i18next';

type ProductPriceTabProps = {
  product: Product;
};

// 0 girilmemiş sayılır ve "—" görünür; eklemede boş bırakılan alan 0 olarak kaydediliyor
function optionalMoney(value: number | null | undefined, locale: string): string | null {
  return value ? formatMoney(value, locale) : null;
}

// Fiyat bölümünün okuma hali; alanlar ürün eklemenin 2. adımıyla aynı sırada
export default function ProductPriceTab({ product }: ProductPriceTabProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <>
      <DetailSection title={t('stock.create.sections.pricing')}>
        <DetailRow
          label={t('stock.create.fields.salePrice')}
          value={formatMoney(product.price, locale)}
          emphasized
        />
        <DetailRow
          label={t('stock.create.fields.listPrice')}
          value={optionalMoney(product.marketPrice, locale)}
        />
        <DetailRow
          label={t('stock.create.fields.taxRate')}
          value={
            product.taxRate === null || product.taxRate === undefined
              ? null
              : t('stock.create.fields.taxRateOption', { value: product.taxRate })
          }
        />
      </DetailSection>

      <DetailSection title={t('stock.create.sections.costs')}>
        <DetailRow
          label={t('stock.create.fields.costPrice')}
          value={optionalMoney(product.costPrice, locale)}
        />
        {/* Ek maliyet çoğu üründe girilmez; girilmemişse satırı gösterilmez */}
        {product.costPrice2 ? (
          <DetailRow
            label={t('stock.create.fields.costPrice2')}
            value={formatMoney(product.costPrice2, locale)}
          />
        ) : null}
      </DetailSection>
    </>
  );
}
