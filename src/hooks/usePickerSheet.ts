import { usePickerStore, type PickerRequest, type ProductPickerRequest } from '@/stores/pickerStore';
import { router } from 'expo-router';

// Seçim penceresini açar: istek store'a yazılır, ardından native sheet rotası açılır.
// Kısa listeler içerik kadar, aramalı uzun listeler neredeyse tam boy açılır.
export function usePickerSheet() {
  const setRequest = usePickerStore((state) => state.setRequest);
  const setProductRequest = usePickerStore((state) => state.setProductRequest);

  const openPicker = (request: PickerRequest, options?: { searchable?: boolean }) => {
    setRequest(request);
    router.push(options?.searchable ? '/picker-search' : '/picker');
  };

  const openProductPicker = (request: ProductPickerRequest) => {
    setProductRequest(request);
    router.push('/product-picker');
  };

  return { openPicker, openProductPicker };
}
