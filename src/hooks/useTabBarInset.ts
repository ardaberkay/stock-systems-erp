import { useTabBarInsetStore } from '@/stores/tabBarInsetStore';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Sekme ekranlarında içeriğin tab bar'ın altında kalmaması için gereken alt boşluk.
// iOS'ta çubuk ekranın üstüne biner; Android'de ekran çubuğun üstünde biter.
export function useTabBarInset() {
  const { bottom } = useSafeAreaInsets();
  const learnedBottom = useTabBarInsetStore((state) => state.bottom);
  const setBottom = useTabBarInsetStore((state) => state.setBottom);

  useEffect(() => {
    if (bottom > learnedBottom) {
      setBottom(bottom);
    }
  }, [bottom, learnedBottom, setBottom]);

  // Uygulama yalnızca dikey çalışır, çubuğun yüksekliği sonradan küçülmez
  return Platform.OS === 'ios' ? Math.max(bottom, learnedBottom) : 0;
}
