import ComingSoonRow from '@/components/ui/form/ComingSoonRow';
import MoneyField from '@/components/ui/form/MoneyField';
import StepperField from '@/components/ui/form/StepperField';
import TextField from '@/components/ui/form/TextField';
import AnimatedChevron from '@/components/ui/AnimatedChevron';
import Collapsible from '@/components/ui/Collapsible';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ProductVariantsFormInput } from '@/features/products/schemas/productCreate';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { EAN13_LENGTH } from '@/features/products/utils/productCreate';
import Trash from 'lucide-react-native/icons/trash';
import { useMemo, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

type VariantRowProps = {
  index: number;
  // Tek varyant kaldıysa silinemez; ürünün en az bir varyantı olmalı
  canRemove: boolean;
  onRemove: () => void;
  // Eklemede boş barkodu sunucu üretir, düzenlemede yeni varyantta boş kalır
  barcodePlaceholder: string;
  // Verilmezse "Diğer alanlar" içi doluysa açık gelir (eklemede adım değişince değer gizlenmesin).
  // Düzenlemede kayıtlı her varyantın barkodu dolu olduğu için kapalı başlatılır.
  initiallyExpanded?: boolean;
};

// Bir varyantın satırı; ürün ekleme ve düzenleme formunda ortak. Zorunlu olan varyant adı ve
// stok hep görünür; özel fiyat, barkod ve raf "Diğer alanlar"ın altında durur ki liste uzamasın.
export default function VariantRow({
  index,
  canRemove,
  onRemove,
  barcodePlaceholder,
  initiallyExpanded,
}: VariantRowProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { control, formState } = useFormContext<ProductVariantsFormInput>();
  const [price, barcode] = useWatch({
    control,
    name: [`variants.${index}.price`, `variants.${index}.barcode`],
  });
  // İsteğe bağlı alanlardan biri doluysa veya hatalıysa bölüm açık gelir; girilen değer gizlenmez
  const optionalErrors = formState.errors.variants?.[index];
  const hasOptionalContent =
    Boolean(price || barcode) || Boolean(optionalErrors?.price || optionalErrors?.barcode);
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded ?? hasOptionalContent);
  const showOptional = isExpanded || Boolean(optionalErrors?.price || optionalErrors?.barcode);
  const title = t('stock.create.fields.variantTitle', { index: index + 1 });

  const translateError = (message: string | undefined) => (message ? t(message) : undefined);

  return (
    <View style={[styles.row, index > 0 && styles.divided]}>
      <View style={styles.header}>
        {/* Yalnızca sıra numarası görünür; ekran okuyucu "Varyant 1" der */}
        <View accessible accessibilityRole="header" accessibilityLabel={title} style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
        {canRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('stock.create.fields.removeVariant')}, ${title}`}
            onPress={onRemove}
            style={styles.iconButton}
          >
            <Trash size={ICON_SIZE.md} color={colors.error} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.cells}>
        <View style={styles.cell}>
          <Controller
            control={control}
            name={`variants.${index}.name`}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <TextField
                label={t('stock.create.fields.variantName')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="characters"
                required
                error={translateError(error?.message)}
              />
            )}
          />
        </View>
        <View style={styles.cell}>
          <Controller
            control={control}
            name={`variants.${index}.quantity`}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <StepperField
                label={t('stock.create.fields.quantity')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                required
                error={translateError(error?.message)}
              />
            )}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('stock.create.fields.moreFields')}, ${title}`}
        accessibilityState={{ expanded: showOptional }}
        onPress={() => setIsExpanded(!showOptional)}
        style={styles.toggle}
      >
        <Text style={styles.toggleText}>{t('stock.create.fields.moreFields')}</Text>
        <AnimatedChevron expanded={showOptional} color={colors.icon} />
      </Pressable>

      <Collapsible expanded={showOptional}>
        <View style={styles.optional}>
          <Controller
            control={control}
            name={`variants.${index}.price`}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <MoneyField
                label={t('stock.create.fields.variantPrice')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={translateError(error?.message)}
              />
            )}
          />
          <Controller
            control={control}
            name={`variants.${index}.barcode`}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <TextField
                label={t('stock.create.fields.barcode')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
                placeholder={barcodePlaceholder}
                maxLength={EAN13_LENGTH}
                error={translateError(error?.message)}
              />
            )}
          />
          <ComingSoonRow label={t('stock.create.fields.shelf')} />
        </View>
      </Collapsible>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      gap: SPACING.sm,
    },
    divided: {
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    header: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badge: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeText: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    iconButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cells: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    cell: {
      flex: 1,
    },
    toggle: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleText: {
      ...typography.label,
      color: colors.textSecondary,
    },
    optional: {
      gap: SPACING.md,
      paddingBottom: SPACING.xs,
    },
  });
}
