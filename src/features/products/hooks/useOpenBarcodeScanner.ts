import {
  useBarcodeScanStore,
  type BarcodeScanRequest,
} from '@/features/products/stores/barcodeScanStore';
import { router } from 'expo-router';

// Barkod okutma ekranını açar; okununca ne olacağı istekle verilir (ara veya sepete ekle).
export function useOpenBarcodeScanner() {
  const setRequest = useBarcodeScanStore((state) => state.setRequest);

  return (request: BarcodeScanRequest) => {
    setRequest(request);
    router.push('/barcode-scan');
  };
}
