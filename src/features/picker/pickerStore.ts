import type { Product, ProductVariant } from '@/features/products/schemas/products';
import type { ReactNode } from 'react';
import { create } from 'zustand';

export type PickerValue = string | number;

export type PickerItem = {
  value: PickerValue;
  label: string;
  // Satırın sağında küçük ek bilgi (ör. "+90"); aramada rakamla da eşleşir
  detail?: string;
  // Pasif satırda nedeni (ör. "Uygulamadan seçilemiyor")
  badge?: string;
  disabled?: boolean;
  // Yazı yerine özel görünüm (ör. durum rozeti)
  content?: ReactNode;
};

// Liste henüz gelmeden de pencere açılır; yükleniyor ve hata durumu pencerenin içinde görünür.
// Alan açık pencereyi tanıyıp liste gelince isteği günceller (bkz. PickerField).
type PickerLoadState = {
  // Hangi alanın açtığı; liste gelince yalnızca o alanın isteği güncellenir
  sourceId?: string;
  isLoading?: boolean;
  loadError?: unknown;
  onRetry?: () => void;
};

export type PickerRequest = PickerLoadState & {
  title: string;
  items: PickerItem[];
  value: PickerValue | null;
  // Listenin üstünde kısa açıklama
  note?: string;
  searchPlaceholder?: string;
  onSelect: (value: PickerValue) => void;
};

export type MultiPickerRequest = PickerLoadState & {
  title: string;
  items: PickerItem[];
  values: PickerValue[];
  searchPlaceholder?: string;
  // Seçim "Tamam"a basınca bir kerede bildirilir
  onConfirm: (values: PickerValue[]) => void;
};

export type ProductPickerRequest = {
  cartQuantities: ReadonlyMap<number, number>;
  onPick: (product: Product, variant: ProductVariant) => void;
};

type PickerState = {
  request: PickerRequest | null;
  multiRequest: MultiPickerRequest | null;
  productRequest: ProductPickerRequest | null;
  setRequest: (request: PickerRequest) => void;
  setMultiRequest: (request: MultiPickerRequest) => void;
  setProductRequest: (request: ProductPickerRequest) => void;
};

// Seçim pencereleri ayrı rota (native sheet) olduğu için liste ve "seçilince ne olacak" bilgisi
// burada taşınır. Formun değeri yine formda kalır; store yalnızca köprüdür, kalıcı değildir.
export const usePickerStore = create<PickerState>((set) => ({
  request: null,
  multiRequest: null,
  productRequest: null,
  setRequest: (request) => set({ request }),
  setMultiRequest: (multiRequest) => set({ multiRequest }),
  setProductRequest: (productRequest) => set({ productRequest }),
}));
