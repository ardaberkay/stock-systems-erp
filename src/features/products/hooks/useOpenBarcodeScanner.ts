import { useBarcodeScanStore } from '@/features/products/stores/barcodeScanStore';
import { router } from 'expo-router';

type OpenBarcodeScannerOptions = {
  // Sipariş ekranı: yalnızca aktif ürünler bulunmuş sayılır
  activeOnly?: boolean;
};

// Barkod okutma ekranını açar; ürünü bulunan barkod onScanned ile açan ekrana döner.
export function useOpenBarcodeScanner(
  onScanned: (barcode: string) => void,
  options: OpenBarcodeScannerOptions = {},
) {
  const setRequest = useBarcodeScanStore((state) => state.setRequest);

  return () => {
    setRequest({ onScanned, activeOnly: options.activeOnly });
    router.push('/barcode-scan');
  };
}
