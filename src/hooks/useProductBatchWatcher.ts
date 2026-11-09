import { getProductBatch, productKeys } from '@/api/products';
import {
  BATCH_IN_PROGRESS,
  PRODUCT_BATCH_POLL_MS,
  PRODUCT_BATCH_TIMEOUT_MS,
} from '@/constants/productCreate';
import { useProductBatchStore } from '@/stores/productBatchStore';
import { getBatchFailureReason } from '@/utils/productCreate';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

// Sıraya alınmış ürün işlerini takip eder: durum aralıklarla sorulur, iş bitince katalog
// yenilenir ve sonuç kullanıcıya bildirilir. Ürünler sekmesinde çalışır; sekme açık kaldıkça
// başka sayfaya geçilse de takip sürer.
export function useProductBatchWatcher() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const pending = useProductBatchStore((state) => state.pending);
  const remove = useProductBatchStore((state) => state.remove);

  const results = useQueries({
    queries: pending.map((batch) => ({
      queryKey: productKeys.batch(batch.batchRequestId),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getProductBatch(batch.batchRequestId, signal),
      refetchInterval: PRODUCT_BATCH_POLL_MS,
      gcTime: 0,
    })),
  });

  useEffect(() => {
    results.forEach((result, index) => {
      const batch = pending[index];
      const job = result.data;

      if (!batch) {
        return;
      }

      const isFinished = Boolean(job) && job?.status !== BATCH_IN_PROGRESS;
      const isTimedOut = !isFinished && Date.now() - batch.createdAt > PRODUCT_BATCH_TIMEOUT_MS;

      if (!isFinished && !isTimedOut) {
        return;
      }

      remove(batch.batchRequestId);
      void queryClient.invalidateQueries({ queryKey: productKeys.list() });

      if (!job || isTimedOut) {
        Alert.alert(t('stock.create.stillProcessing', { name: batch.productName }));
        return;
      }

      const failedCount = job.response?.failedItemCount ?? 0;

      if (failedCount === 0 && job.status !== 'Failed') {
        Alert.alert(t('stock.create.added', { name: batch.productName }));
        return;
      }

      const reason = getBatchFailureReason(job.response?.failedItemsDetails?.[0]);

      Alert.alert(
        t('stock.create.failed', { name: batch.productName }),
        reason.kind === 'duplicate'
          ? t('stock.create.errors.duplicate')
          : reason.detail || undefined,
      );
    });
  }, [results, pending, remove, queryClient, t]);
}
