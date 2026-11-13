import { create } from 'zustand';

export type BarcodeScanRequest = {
  // Okunan barkod, tarama ekranını açan ekrana verilir (ör. arama kutusuna yazılır)
  onScanned: (barcode: string) => void;
  // Sipariş ekranı: pasif ürün satışa kapalıdır, okutulsa da "pasif" denir
  activeOnly?: boolean;
};

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
