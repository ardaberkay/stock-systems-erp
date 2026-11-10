import DetailNote from '@/components/ui/DetailNote';
import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import { PRODUCT_STATUS } from '@/features/products/constants/products';
import type { Product } from '@/features/products/schemas/products';
import { useTranslation } from 'react-i18next';

type ProductInfoTabProps = {
  product: Product;
};

// Bilgi bölümünün okuma hali; alanlar ürün eklemenin 1. adımıyla aynı sırada
export default function ProductInfoTab({ product }: ProductInfoTabProps) {
  const { t } = useTranslation();
  const isActive = product.status === PRODUCT_STATUS.active;

  return (
    <>
      <DetailSection title={t('stock.create.sections.general')}>
        <DetailRow label={t('stock.create.fields.name')} value={product.name} selectable />
        <DetailRow label={t('stock.create.fields.brand')} value={product.brandName} />
        <DetailNote label={t('stock.create.fields.description')} value={product.details} />
      </DetailSection>

      <DetailSection title={t('stock.create.sections.classification')}>
        <DetailRow label={t('stock.create.fields.type')} value={product.typeName} />
        <DetailRow
          label={t('stock.create.fields.categories')}
          value={product.categories.map((category) => category.name).join(', ')}
        />
      </DetailSection>

      <DetailSection title={t('stock.create.sections.status')}>
        <DetailRow
          label={t('stock.status')}
          value={t(isActive ? 'stock.statusFilter.active' : 'stock.statusFilter.passive')}
        />
      </DetailSection>
    </>
  );
}
