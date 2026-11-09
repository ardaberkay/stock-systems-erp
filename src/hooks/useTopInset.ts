import { initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';

// Sekme ekranlarındaki kendi app bar'ımızın üst boşluğu.
// expo-router her sekmeyi ayrı bir SafeAreaProvider ile sarar; sekme ilk açılırken bu sağlayıcı
// bir an 0 bildirebilir ve başlık status bar'ın altına kayar. Uygulama yalnızca dikey çalıştığı
// için açılışta ölçülen değer sabittir, ondan küçüğü kullanılmaz.
export function useTopInset() {
  const { top } = useSafeAreaInsets();
  return Math.max(top, initialWindowMetrics?.insets.top ?? 0);
}
