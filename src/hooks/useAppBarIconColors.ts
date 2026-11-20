import { useAppTheme } from '@/hooks/useAppTheme';
import { Platform } from 'react-native';

// Renkli app bar'daki (ürün moru, sipariş yeşili) ikonların rengi. iOS 26'da her ikon kendi cam
// (Liquid Glass) kapsülündedir; sistem geri okunu temaya göre (açıkta siyah, koyuda beyaz) çizer,
// bizim ikonlar da ona uyar. Android'de kapsül yoktur, ikon doğrudan renkli zemindedir ve beyazdır.
export function useAppBarIconColors() {
  const { colors } = useAppTheme();

  return Platform.OS === 'ios'
    ? { icon: colors.text, iconDisabled: colors.iconDisabled }
    : { icon: colors.onHeader, iconDisabled: colors.onHeaderMuted };
}
