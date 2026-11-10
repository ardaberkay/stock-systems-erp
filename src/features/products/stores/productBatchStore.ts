import { create } from 'zustand';

export type PendingProductBatch = {
  batchRequestId: string;
  // Sonuç mesajında hangi ürün olduğu görünsün
  productName: string;
  createdAt: number;
};

type ProductBatchState = {
  pending: PendingProductBatch[];
  add: (batch: PendingProductBatch) => void;
  remove: (batchRequestId: string) => void;
};

// Sıraya alınmış ürün ekleme işleri. Form kapandıktan sonra da takip edilir (bkz.
// useProductBatchWatcher). Kalıcı değildir: uygulama kapanırsa takip biter, ürün yine oluşur.
export const useProductBatchStore = create<ProductBatchState>((set) => ({
  pending: [],
  add: (batch) => set((state) => ({ pending: [...state.pending, batch] })),
  remove: (batchRequestId) =>
    set((state) => ({
      pending: state.pending.filter((batch) => batch.batchRequestId !== batchRequestId),
    })),
}));
