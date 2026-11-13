import type { Product, ProductVariant } from '@/features/products/schemas/products';
import { create } from 'zustand';

// Sepete ekleme sonucu; kamera ekranı son ekleneni ve sepet özetini yazar
export type BarcodeCartAddResult =
  | {
      kind: 'added';
      productName: string;
      sizeName: string;
      // Bu bedenin sepetteki adedi: aynı ürün tekrar okutulunca arttığı görülsün
      sizeQuantity: number;
      cartCount: number;
      cartTotal: number;
    }
  | { kind: 'outOfStock' };

export type BarcodeScanRequest =
  // Ürünler sekmesi: ürünü bulunan barkod arama kutusuna yazılır, ekran kapanır
  | { mode: 'search'; onScanned: (barcode: string) => void }
  // Yeni sipariş: her okutma bedeni sepete ekler, kamera açık kalır
  | { mode: 'cart'; onAdd: (product: Product, variant: ProductVariant) => BarcodeCartAddResult };

type BarcodeScanState = {
  request: BarcodeScanRequest | null;
  setRequest: (request: BarcodeScanRequest) => void;
};

// Tarama ekranı ayrı rota olduğu için "okununca ne olacak" bilgisi burada taşınır
// (bkz. pickerStore). Kalıcı değildir, yalnızca köprüdür.
export const useBarcodeScanStore = create<BarcodeScanState>((set) => ({
  request: null,
  setRequest: (request) => set({ request }),
}));
