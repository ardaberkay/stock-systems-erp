import { useCatalogProductCounts, useDeleteCatalogItem } from '@/features/products/api/catalogItems';
import type { CatalogItem, CatalogKind } from '@/features/products/schemas/catalog';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey, isApiError, type ApiErrorKind } from '@/lib/apiError';
import { formatNumber } from '@/utils/formatter';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

// Silme reddinde kendi mesajı gösterilen hatalar; bunların sebebi bağlı ürün değildir
const GENERAL_ERROR_KINDS: ApiErrorKind[] = [
  'network',
  'timeout',
  'rateLimit',
  'unauthorized',
  'config',
];

type DeleteBlock = {
  title: string;
  message: string;
};

// Katalog kaydını silme akışı: bağlı ürün varsa istek atılmadan sebebi söylenir, yoksa onay
// sorulur. Silinince sheet kapanır. blockedBy: sayfaya özel engel (ör. alt kategori).
export function useConfirmCatalogDelete(kind: CatalogKind) {
  const { t } = useTranslation();
  const locale = useLocale();
  const deleteItem = useDeleteCatalogItem(kind);
  const { productCounts } = useCatalogProductCounts(kind);

  const confirmDelete = (item: CatalogItem, blockedBy?: DeleteBlock) => {
    if (blockedBy) {
      Alert.alert(blockedBy.title, blockedBy.message);
      return;
    }
    // Sunucu ürünü olan kaydı açıklamasız bir hatayla reddediyor; sebebi biz söyleriz, istek
    // atılmaz. Katalog yüklenmediyse sayı bilinmez; o zaman silme denenir.
    const productCount = productCounts?.get(item.id);
    if (productCount) {
      Alert.alert(
        t(`stock.catalogPages.${kind}.deleteBlockedTitle`),
        t(`stock.catalogPages.${kind}.deleteBlocked`, { value: formatNumber(productCount, locale) }),
      );
      return;
    }
    Alert.alert(
      t(`stock.catalogPages.${kind}.deleteTitle`),
      t(`stock.catalogPages.${kind}.deleteMessage`, { name: item.name.trim() }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('stock.catalogForm.delete'),
          style: 'destructive',
          onPress: () =>
            deleteItem.mutate(item.id, {
              onSuccess: () => router.back(),
              // Bağlantı ve oturum hataları kendi mesajıyla; geri kalan red büyük ihtimalle
              // katalogda görünmeyen pasif veya silinmiş ürünlerden
              onError: (error) =>
                isApiError(error) && GENERAL_ERROR_KINDS.includes(error.kind)
                  ? Alert.alert(t(getErrorMessageKey(error)))
                  : Alert.alert(
                      t(`stock.catalogPages.${kind}.deleteFailedTitle`),
                      t(`stock.catalogPages.${kind}.deleteFailed`),
                    ),
            }),
        },
      ],
    );
  };

  return { confirmDelete, isDeleting: deleteItem.isPending };
}
