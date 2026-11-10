import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import Text from '@/components/ui/Text';
import ProductImagesRow from '@/features/products/components/detail/ProductImagesRow';
import type { Product } from '@/features/products/schemas/products';
import { getProductImages } from '@/features/products/utils/productList';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type ProductVariantsTabProps = {
  product: Product;
};

// Varyantlar bölümünün okuma hali: renk, model kodu, görseller ve varyant listesi.
// Varyant sayısı bir üründe birkaç tanedir; FlatList yerine düz liste yeterli.
export default function ProductVariantsTab({ product }: ProductVariantsTabProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const images = getProductImages(product);

  return (
    <>
      <DetailSection title={t('stock.create.sections.color')}>
        <DetailRow label={t('stock.create.fields.color')} value={product.colorName} />
        <DetailRow label={t('stock.create.fields.modelCode')} value={product.modelCode} selectable />
        <View style={styles.divider} />
        <Text style={styles.subTitle}>{t('stock.create.fields.images')}</Text>
        <ProductImagesRow
          images={images}
          productName={product.name}
          onImagePress={(index) => router.push(`/product-images?id=${product.id}&index=${index}`)}
        />
      </DetailSection>

      <DetailSection title={t('stock.create.sections.variants')}>
        {product.variants.length === 0 ? (
          <Text style={styles.empty}>{t('stock.detail.noVariants')}</Text>
        ) : (
          product.variants.map((variant, index) => {
            const isOutOfStock = variant.quantity <= 0;

            return (
              <View key={variant.id} style={[styles.variant, index > 0 && styles.divided]}>
                <View style={styles.variantTop}>
                  <Text style={styles.variantName}>{variant.name}</Text>
                  <Text style={[styles.quantity, isOutOfStock && styles.outOfStock]}>
                    {t('stock.stockValue', { value: formatNumber(variant.quantity, locale) })}
                  </Text>
                </View>
                <DetailRow
                  label={t('stock.create.fields.barcode')}
                  value={variant.barcode}
                  selectable
                />
                <DetailRow
                  label={t('stock.create.fields.variantPrice')}
                  value={variant.price === null ? null : formatMoney(variant.price, locale)}
                />
              </View>
            );
          })
        )}
      </DetailSection>
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    },
    subTitle: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
    variant: {
      gap: SPACING.xs,
    },
    divided: {
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    variantTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    variantName: {
      ...typography.body,
      flexShrink: 1,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    quantity: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
    outOfStock: {
      color: colors.error,
    },
    empty: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
  });
}
