import Button from '@/components/ui/Button';
import StateMessage from '@/components/ui/StateMessage';
import Text from '@/components/ui/Text';
import StepperField from '@/components/ui/form/StepperField';
import SwitchRow from '@/components/ui/form/SwitchRow';
import TextField from '@/components/ui/form/TextField';
import PickerField from '@/features/picker/components/PickerField';
import { useCategories } from '@/features/products/api/catalog';
import { useSaveCategory } from '@/features/products/api/catalogItems';
import { useConfirmCatalogDelete } from '@/features/products/hooks/useConfirmCatalogDelete';
import {
  categoryFormSchema,
  type CategoryForm as CategoryFormValues,
} from '@/features/products/schemas/catalog';
import {
  countChildCategories,
  getCategoryChanges,
  getCategoryFormDefaults,
  getParentCategoryOptions,
  hasDuplicateSiblingName,
} from '@/features/products/utils/catalog';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CategoryFormContentProps = {
  // Yoksa yeni kategori eklenir
  categoryId?: number;
};

// Kategori ekleme ve düzenleme sheet'i (category-form?id=). Diğer katalog formlarından farkı üst
// kategori, sıra, açıklama, görünürlük ve durum alanları; bu yüzden kendi route'u var.
export default function CategoryForm() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const categoryId = id === undefined ? undefined : Number(id);

  if (categoryId !== undefined && !Number.isInteger(categoryId)) {
    return <StateMessage message={t('errors.notFound')} />;
  }

  return <CategoryFormContent categoryId={categoryId} />;
}

function CategoryFormContent({ categoryId }: CategoryFormContentProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: categories } = useCategories();
  // Açılıştaki kayıt tutulur: silinince liste hemen güncellenir, kapanırken "bulunamadı" görünmesin
  const [category] = useState(() => categories?.find((entry) => entry.id === categoryId));
  const saveCategory = useSaveCategory();
  const { confirmDelete, isDeleting } = useConfirmCatalogDelete('categories');
  const isBusy = saveCategory.isPending || isDeleting;
  const { control, handleSubmit, setError } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: getCategoryFormDefaults(category),
    mode: 'onTouched',
  });
  const rootLabel = t('stock.catalogPages.categories.root');
  const parentOptions = useMemo(
    () => getParentCategoryOptions(categories ?? [], rootLabel, category?.id),
    [categories, rootLabel, category?.id],
  );

  if (categoryId !== undefined && !category) {
    return <StateMessage message={t('stock.catalogPages.categories.notFound')} />;
  }

  const translateError = (message: string | undefined) => (message ? t(message) : undefined);

  const onSubmit = handleSubmit((values) => {
    if (category) {
      // Sunucu kayıtlı açıklamayı boş metne çevirmeyi reddediyor
      if (category.description?.trim() && !values.description) {
        setError('description', {
          message: 'stock.catalogPages.categories.descriptionCannotClear',
        });
        return;
      }
      const changes = getCategoryChanges(category, values);
      // Hiçbir alan değişmediyse istek atılmaz
      if (Object.keys(changes).length === 0) {
        router.back();
        return;
      }
    }
    if (hasDuplicateSiblingName(categories ?? [], values.name, values.parentId, category?.id)) {
      setError('name', { message: 'stock.catalogPages.categories.duplicate' });
      return;
    }
    saveCategory.mutate(
      { original: category, values },
      {
        onSuccess: () => router.back(),
        onError: (error) => Alert.alert(t(getErrorMessageKey(error))),
      },
    );
  });

  const onDelete = () => {
    if (!category) {
      return;
    }
    // Sunucu alt kategorisi olanı da siliyor ve alt kategori güncellenemez kalıyor; engellenir
    const childCount = countChildCategories(categories ?? [], category.id);
    confirmDelete(
      category,
      childCount
        ? {
            title: t('stock.catalogPages.categories.deleteBlockedTitle'),
            message: t('stock.catalogPages.categories.hasChildren', {
              value: formatNumber(childCount, locale),
            }),
          }
        : undefined,
    );
  };

  // Form sheet'ten uzun olabilir ve açıklama yazılırken klavye alt alanları kapatır. iOS klavye
  // kadar boşluk ekler, yazılan alanı görünür yere kaydırır; klavye açıkken butonlar tek dokunuşla çalışır.
  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        {t(
          category
            ? 'stock.catalogPages.categories.editTitle'
            : 'stock.catalogPages.categories.newTitle',
        )}
      </Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <TextField
            label={t('stock.catalogPages.categories.nameLabel')}
            placeholder={t('stock.catalogPages.categories.namePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="words"
            editable={!isBusy}
            required
            error={translateError(error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="parentId"
        render={({ field: { value, onChange } }) => (
          <PickerField
            label={t('stock.catalogPages.categories.parentLabel')}
            placeholder={rootLabel}
            searchPlaceholder={t('stock.catalogPages.categories.searchPlaceholder')}
            value={value}
            options={parentOptions}
            onChange={(option) => onChange(option.value)}
            disabled={isBusy}
          />
        )}
      />

      <Controller
        control={control}
        name="sortNum"
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <StepperField
            label={t('stock.catalogPages.categories.sortLabel')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={translateError(error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <TextField
            label={t('stock.catalogPages.categories.descriptionLabel')}
            placeholder={t('stock.catalogPages.categories.descriptionPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="sentences"
            editable={!isBusy}
            multiline
            error={translateError(error?.message)}
          />
        )}
      />

      <View>
        <Controller
          control={control}
          name="visible"
          render={({ field: { value, onChange } }) => (
            <SwitchRow
              label={t('stock.catalogPages.categories.visibleLabel')}
              hint={t('stock.catalogPages.categories.visibleHint')}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="active"
          render={({ field: { value, onChange } }) => (
            <SwitchRow
              label={t('stock.catalogPages.categories.activeLabel')}
              hint={t('stock.catalogPages.categories.activeHint')}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
      </View>

      <View style={styles.actions}>
        <Button
          label={t('stock.catalogForm.save')}
          onPress={onSubmit}
          loading={saveCategory.isPending}
          disabled={isBusy}
        />
        {category && (
          <Button
            label={t('stock.catalogForm.delete')}
            variant="destructive"
            onPress={onDelete}
            loading={isDeleting}
            disabled={isBusy}
          />
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxl,
      gap: SPACING.lg,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    actions: {
      gap: SPACING.sm,
    },
  });
}
