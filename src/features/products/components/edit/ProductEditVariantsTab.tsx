import Button from '@/components/ui/Button';
import DetailSection from '@/components/ui/DetailSection';
import LockedField from '@/components/ui/form/LockedField';
import Text from '@/components/ui/Text';
import VariantRow from '@/features/products/components/create/VariantRow';
import ProductImagesRow from '@/features/products/components/detail/ProductImagesRow';
import type { ProductEditFormInput } from '@/features/products/schemas/productEdit';
import type { Product } from '@/features/products/schemas/products';
import { createEmptyEditVariant } from '@/features/products/utils/productEdit';
import { getProductImages } from '@/features/products/utils/productList';
import { router } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import Plus from 'lucide-react-native/icons/plus';
import { useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

type ProductEditVariantsTabProps = {
  product: Product;
};

// Varyantlar bölümünün düzenleme hali. Renk ve model kodu API'de değişmediği için kilitli;
// görseller yalnızca sıralanabilir (ekleme ve silme servisi yok, test 10.11.2026).
export default function ProductEditVariantsTab({ product }: ProductEditVariantsTabProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { control, formState, setValue } = useFormContext<ProductEditFormInput>();
  // keyName: satırların kendi `id` alanı (kayıtlı varyant id'si) ezilmesin
  const { fields, append, remove } = useFieldArray({ control, name: 'variants', keyName: 'fieldKey' });
  const images = useWatch({ control, name: 'images' });
  const variantsError = formState.errors.variants?.root?.message ?? formState.errors.variants?.message;

  // Galeri kayıtlı sırayı gösterir; düzenlemede sıra değişmiş olabilir, görsel adresle bulunur
  const openImage = (index: number) => {
    const savedIndex = Math.max(getProductImages(product).indexOf(images[index]), 0);

    router.push(`/product-images?id=${product.id}&index=${savedIndex}`);
  };

  const makeCover = (index: number) => {
    const cover = images[index];

    setValue('images', [cover, ...images.filter((_, other) => other !== index)], {
      shouldDirty: true,
    });
  };

  // Görsel yükleme servisi henüz yok; yer şimdiden görünür ki özellik aranınca bulunsun
  const addImage = () => Alert.alert(t('common.comingSoon'));

  // Kayıtlı varyant kaydedince kalıcı silinir (panel arşivler, API siler); önce sorulur.
  // Yeni eklenen satır henüz sunucuda olmadığı için sormadan kalkar.
  const removeVariant = (index: number) => {
    const field = fields[index];

    if (field.id === null) {
      remove(index);
      return;
    }
    Alert.alert(
      t('stock.editMode.removeVariantTitle', { name: field.name }),
      t('stock.editMode.removeVariantMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('stock.create.fields.removeVariant'),
          style: 'destructive',
          onPress: () => remove(index),
        },
      ],
    );
  };

  return (
    <>
      <DetailSection title={t('stock.create.sections.color')}>
        <LockedField label={t('stock.create.fields.color')} value={product.colorName} />
        <LockedField label={t('stock.create.fields.modelCode')} value={product.modelCode} />
        <View style={styles.divider} />
        {/* Ekleme başlıkta durur: görsel çoğalınca satır kaysa da hep görünür */}
        <View style={styles.imagesHeader}>
          <Text style={styles.subTitle}>{t('stock.create.fields.images')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('stock.editMode.addImage')}
            onPress={addImage}
            style={styles.addButton}
          >
            <Plus size={ICON_SIZE.sm} color={colors.orange} />
            <Text style={styles.addText}>{t('stock.editMode.addImage')}</Text>
          </Pressable>
        </View>
        <ProductImagesRow
          images={images}
          productName={product.name}
          onImagePress={openImage}
          onSetCover={makeCover}
          onAddImage={addImage}
        />
      </DetailSection>

      <DetailSection title={t('stock.create.sections.variants')}>
        {fields.map((field, index) => (
          <VariantRow
            key={field.fieldKey}
            index={index}
            canRemove={fields.length > 1}
            onRemove={() => removeVariant(index)}
            barcodePlaceholder={t('stock.editMode.barcodePlaceholder')}
            initiallyExpanded={false}
          />
        ))}
        {variantsError ? <Text style={styles.error}>{t(variantsError)}</Text> : null}
        <Button
          label={t('stock.create.fields.addVariant')}
          variant="secondary"
          onPress={() => append(createEmptyEditVariant())}
        />
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
    imagesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    subTitle: {
      ...typography.label,
      flexShrink: 1,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
    addButton: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingLeft: SPACING.sm,
    },
    addText: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.orange,
    },
    error: {
      ...typography.caption,
      color: colors.error,
    },
  });
}
