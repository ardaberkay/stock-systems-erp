import Button from '@/components/ui/Button';
import StateMessage from '@/components/ui/StateMessage';
import Text from '@/components/ui/Text';
import TextField from '@/components/ui/form/TextField';
import { useCatalogItems, useSaveCatalogItem } from '@/features/products/api/catalogItems';
import { useConfirmCatalogDelete } from '@/features/products/hooks/useConfirmCatalogDelete';
import {
  catalogItemFormSchema,
  catalogKindSchema,
  type CatalogItemForm,
  type CatalogKind,
} from '@/features/products/schemas/catalog';
import { hasDuplicateName } from '@/features/products/utils/catalog';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CatalogItemFormContentProps = {
  kind: CatalogKind;
  itemId?: number;
};

// Katalog kaydı ekleme ve düzenleme sheet'i (catalog-form/[kind]); id verilirse düzenleme açılır.
// Tip, renk ve markada yalnızca ad var; kategorinin kendi sheet'i var (category-form).
export default function CatalogItemFormSheet() {
  const { t } = useTranslation();
  const { kind, id } = useLocalSearchParams<{ kind: string; id?: string }>();
  const parsedKind = catalogKindSchema.safeParse(kind);
  const itemId = id === undefined ? undefined : Number(id);

  if (!parsedKind.success || (itemId !== undefined && !Number.isInteger(itemId))) {
    return <StateMessage message={t('errors.notFound')} />;
  }

  return <CatalogItemFormContent kind={parsedKind.data} itemId={itemId} />;
}

function CatalogItemFormContent({ kind, itemId }: CatalogItemFormContentProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: items } = useCatalogItems(kind);
  // Açılıştaki kayıt tutulur: silinince liste hemen güncellenir, kapanırken "bulunamadı" görünmesin
  const [item] = useState(() => items?.find((entry) => entry.id === itemId));
  const saveItem = useSaveCatalogItem(kind);
  const { confirmDelete, isDeleting } = useConfirmCatalogDelete(kind);
  const isBusy = saveItem.isPending || isDeleting;
  const { control, handleSubmit, setError } = useForm<CatalogItemForm>({
    resolver: zodResolver(catalogItemFormSchema),
    defaultValues: { name: item?.name.trim() ?? '' },
    mode: 'onTouched',
  });

  if (itemId !== undefined && !item) {
    return <StateMessage message={t(`stock.catalogPages.${kind}.notFound`)} />;
  }

  const onSubmit = handleSubmit(({ name }) => {
    // Ad değişmediyse istek atılmaz
    if (item && name === item.name.trim()) {
      router.back();
      return;
    }
    if (hasDuplicateName(items ?? [], name, item?.id)) {
      setError('name', { message: `stock.catalogPages.${kind}.duplicate` });
      return;
    }
    saveItem.mutate(
      { id: item?.id, name },
      {
        onSuccess: () => router.back(),
        onError: (error) => Alert.alert(t(getErrorMessageKey(error))),
      },
    );
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
      <Text style={styles.title}>
        {t(item ? `stock.catalogPages.${kind}.editTitle` : `stock.catalogPages.${kind}.newTitle`)}
      </Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <TextField
            label={t(`stock.catalogPages.${kind}.nameLabel`)}
            placeholder={t(`stock.catalogPages.${kind}.namePlaceholder`)}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="words"
            editable={!isBusy}
            required
            error={error?.message ? t(error.message) : undefined}
          />
        )}
      />

      <View style={styles.actions}>
        <Button
          label={t('stock.catalogForm.save')}
          onPress={onSubmit}
          loading={saveItem.isPending}
          disabled={isBusy}
        />
        {item && (
          <Button
            label={t('stock.catalogForm.delete')}
            variant="destructive"
            onPress={() => confirmDelete(item)}
            loading={isDeleting}
            disabled={isBusy}
          />
        )}
      </View>
    </View>
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
