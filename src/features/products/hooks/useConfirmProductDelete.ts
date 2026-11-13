import { useRemoveProduct } from '@/features/products/api/products';
import type { Product } from '@/features/products/schemas/products';
import { getErrorDetail, getErrorMessageKey, isApiError, type ApiErrorKind } from '@/lib/apiError';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

// Bunlarda kendi mesajı gösterilir; sebep ürünün kendisi değildir
const GENERAL_ERROR_KINDS: ApiErrorKind[] = [
  'network',
  'timeout',
  'rateLimit',
  'unauthorized',
  'config',
];

type ConfirmProductDeleteOptions = {
  // Düzenlemede yapılıp kaydedilmemiş değişiklik varsa onayda kaybolacağı söylenir
  hasUnsavedChanges?: boolean;
  onDeleted?: () => void;
};

// Ürün silme akışı: kart ve detay sayfası aynı onayı ve aynı isteği kullanır.
export function useConfirmProductDelete() {
  const { t } = useTranslation();
  const removeProduct = useRemoveProduct();

  const showError = (error: unknown) => {
    if (isApiError(error) && GENERAL_ERROR_KINDS.includes(error.kind)) {
      Alert.alert(t(getErrorMessageKey(error)));
      return;
    }
    const detail = getErrorDetail(error);

    Alert.alert(
      t('stock.deleteProduct.failedTitle'),
      [t('stock.deleteProduct.failedMessage'), detail ? t('stock.create.errorCode', { code: detail }) : '']
        .filter(Boolean)
        .join('\n\n'),
    );
  };

  const confirmDelete = (product: Product, options: ConfirmProductDeleteOptions = {}) => {
    if (removeProduct.isPending) {
      return;
    }
    const modelCode = product.modelCode?.trim();
    // Sunucunun ürünü silip silmediği veya pasife çektiği bilinmiyor; "kalıcı" denmez
    const message = [
      t('stock.deleteProduct.message', { name: product.name.trim() }),
      modelCode ? t('stock.deleteProduct.modelCode', { code: modelCode }) : '',
      options.hasUnsavedChanges ? t('stock.deleteProduct.unsavedChanges') : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    Alert.alert(t('stock.deleteProduct.title'), message, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('stock.delete'),
        style: 'destructive',
        onPress: () =>
          removeProduct.mutate(product.id, {
            onSuccess: options.onDeleted,
            onError: showError,
          }),
      },
    ]);
  };

  return { confirmDelete, isDeleting: removeProduct.isPending };
}
