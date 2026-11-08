import type { Product, ProductVariant } from '@/schemas/products';
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

export type PickerRequest = {
  title: string;
  items: PickerItem[];
  value: PickerValue | null;
  // Listenin üstünde kısa açıklama
  note?: string;
  searchPlaceholder?: string;
  onSelect: (value: PickerValue) => void;
};

export type ProductPickerRequest = {
  cartQuantities: ReadonlyMap<number, number>;
  onPick: (product: Product, variant: ProductVariant) => void;
};

type PickerState = {
  request: PickerRequest | null;
  productRequest: ProductPickerRequest | null;
  setRequest: (request: PickerRequest) => void;
  setProductRequest: (request: ProductPickerRequest) => void;
};

// Seçim pencereleri ayrı rota (native sheet) olduğu için liste ve "seçilince ne olacak" bilgisi
// burada taşınır. Formun değeri yine formda kalır; store yalnızca köprüdür, kalıcı değildir.
export const usePickerStore = create<PickerState>((set) => ({
  request: null,
  productRequest: null,
  setRequest: (request) => set({ request }),
  setProductRequest: (productRequest) => set({ productRequest }),
}));
