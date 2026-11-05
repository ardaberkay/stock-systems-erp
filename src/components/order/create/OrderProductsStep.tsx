import CartItemRow from '@/components/order/create/CartItemRow';
import ProductPickerModal from '@/components/order/create/ProductPickerModal';
import Button from '@/components/ui/Button';
import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { OrderCreateFormInput } from '@/schemas/orderCreate';
import type { Product, ProductVariant } from '@/schemas/products';
import type { AppColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { formatMoney } from '@/utils/formatter';
import { getItemsTotal } from '@/utils/orderCreate';
import { useCallback, useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

// Sepet: ürün seçiciden beden eklenir, adet ve birim fiyat burada değiştirilir
export default function OrderProductsStep() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const {
    control,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<OrderCreateFormInput>();
  const { fields, append, remove } = useFieldArray({ control, name: 'items', keyName: 'key' });
  const items = useWatch({ control, name: 'items' });

  const cartQuantities = useMemo(
    () => new Map(items.map((item) => [item.variantId, item.quantity])),
    [items],
  );

  // Aynı beden tekrar seçilirse yeni satır açılmaz, adet bir artar
  const handlePick = useCallback(
    (product: Product, variant: ProductVariant) => {
      const current = getValues('items');
      const index = current.findIndex((item) => item.variantId === variant.id);

      if (index >= 0) {
        const quantity = Math.min(current[index].quantity + 1, variant.quantity);
        setValue(`items.${index}.quantity`, quantity, { shouldDirty: true });
      } else {
        append({
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          sizeName: variant.name,
          image: product.image ?? null,
          stock: variant.quantity,
          quantity: 1,
          price: String(product.price),
        });
      }
      clearErrors('items');
    },
    [getValues, setValue, append, clearErrors],
  );

  const itemsError = errors.items?.message ?? errors.items?.root?.message;

  return (
    <>
      <DetailSection title={t('orders.create.steps.products')}>
        {fields.length === 0 ? (
          <Text style={styles.empty}>{t('orders.create.products.empty')}</Text>
        ) : (
          fields.map((field, index) => (
            <CartItemRow
              key={field.key}
              index={index}
              item={field}
              control={control}
              colors={colors}
              locale={locale}
              onRemove={remove}
            />
          ))
        )}
        <Button
          label={t('orders.create.products.add')}
          variant="secondary"
          onPress={() => setIsPickerOpen(true)}
        />
        {itemsError ? <Text style={styles.error}>{t(itemsError)}</Text> : null}
        {fields.length > 0 ? (
          <DetailRow
            label={t('orders.create.products.total')}
            value={formatMoney(getItemsTotal(items), locale)}
            emphasized
          />
        ) : null}
      </DetailSection>

      <ProductPickerModal
        visible={isPickerOpen}
        cartQuantities={cartQuantities}
        onClose={() => setIsPickerOpen(false)}
        onPick={handlePick}
      />
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    empty: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    error: {
      ...typography.caption,
      color: colors.error,
    },
  });
}
