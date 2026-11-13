import CartItemRow from '@/features/orders/components/create/CartItemRow';
import Button from '@/components/ui/Button';
import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { usePickerSheet } from '@/features/picker/usePickerSheet';
import type { OrderCreateFormInput } from '@/features/orders/schemas/orderCreate';
import type { Product, ProductVariant } from '@/features/products/schemas/products';
import type { BarcodeCartAddResult } from '@/features/products/stores/barcodeScanStore';
import type { AppColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { formatMoney } from '@/utils/formatter';
import { getItemsTotal } from '@/features/orders/utils/orderCreate';
import { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { StyleSheet } from 'react-native';

// Sepet: ürün seçiciden beden eklenir, adet ve birim fiyat burada değiştirilir
export default function OrderProductsStep() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { openProductPicker } = usePickerSheet();
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
          colorName: product.colorName ?? null,
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

  // Barkodla ekleme kamera açıkken arka arkaya yapılır. Elle eklemede adet sessizce stokta
  // kalır; okutan kullanıcı bunu görmez, bu yüzden stok dolduysa eklenmez ve söylenir.
  const handleScanAdd = useCallback(
    (product: Product, variant: ProductVariant): BarcodeCartAddResult => {
      const inCart =
        getValues('items').find((item) => item.variantId === variant.id)?.quantity ?? 0;

      if (inCart >= variant.quantity) {
        return { kind: 'outOfStock' };
      }
      handlePick(product, variant);
      const next = getValues('items');

      return {
        kind: 'added',
        productName: product.name,
        sizeName: variant.name,
        sizeQuantity: inCart + 1,
        cartCount: next.reduce((count, item) => count + item.quantity, 0),
        cartTotal: getItemsTotal(next),
      };
    },
    [getValues, handlePick],
  );

  const itemsError = errors.items?.message ?? errors.items?.root?.message;

  // Toplam ve buton sabit üstte durur; yeni eklenen en üstte görünür, eskiler aşağı kayar.
  // Yalnızca görünüm ters; siparişe giden sıra eklenme sırasıdır.
  const newestFirst = fields.map((field, index) => ({ field, index })).reverse();

  return (
    <>
      <DetailSection title={t('orders.create.steps.products')}>
        {fields.length > 0 ? (
          <DetailRow
            label={t('orders.create.products.total')}
            value={formatMoney(getItemsTotal(items), locale)}
            emphasized
          />
        ) : null}
        <Button
          label={t('orders.create.products.add')}
          variant="secondary"
          onPress={() =>
            openProductPicker({ cartQuantities, onPick: handlePick, onScanAdd: handleScanAdd })
          }
        />
        {itemsError ? <Text style={styles.error}>{t(itemsError)}</Text> : null}
        {newestFirst.map(({ field, index }) => (
          <CartItemRow
            key={field.key}
            index={index}
            item={field}
            control={control}
            colors={colors}
            locale={locale}
            onRemove={remove}
          />
        ))}
      </DetailSection>
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    error: {
      ...typography.caption,
      color: colors.error,
    },
  });
}
