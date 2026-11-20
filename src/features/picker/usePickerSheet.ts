import {
  usePickerStore,
  type MultiPickerRequest,
  type PickerRequest,
  type ProductPickerRequest,
} from '@/features/picker/pickerStore';
import { router } from 'expo-router';
import { Keyboard } from 'react-native';

// Seçim penceresini açar: istek store'a yazılır, ardından native sheet rotası açılır.
// Kısa listeler içerik kadar, aramalı uzun listeler neredeyse tam boy açılır.
// Açmadan önce klavye kapatılır: odaktaki metin alanı bırakılmazsa sheet kapanınca
// iOS odağı ona geri verir ve klavye kendiliğinden yeniden açılır.
export function usePickerSheet() {
  const setRequest = usePickerStore((state) => state.setRequest);
  const setMultiRequest = usePickerStore((state) => state.setMultiRequest);
  const setProductRequest = usePickerStore((state) => state.setProductRequest);

  const openPicker = (request: PickerRequest, options?: { searchable?: boolean }) => {
    Keyboard.dismiss();
    setRequest(request);
    router.push(options?.searchable ? '/picker-search' : '/picker');
  };

  const openMultiPicker = (request: MultiPickerRequest) => {
    Keyboard.dismiss();
    setMultiRequest(request);
    router.push('/picker-multi');
  };

  const openProductPicker = (request: ProductPickerRequest) => {
    Keyboard.dismiss();
    setProductRequest(request);
    router.push('/product-picker');
  };

  return { openPicker, openMultiPicker, openProductPicker };
}
