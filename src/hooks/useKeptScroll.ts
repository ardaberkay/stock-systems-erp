import { useCallback, useRef, type RefObject } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewInstance,
} from 'react-native';

// İçerik parça parça gelir (iskelet, grafik, form satırları); bu süre boyunca içerik büyüdükçe
// konum yeniden ayarlanır. Sonrasında (ör. bir satır açılınca) kendiliğinden kaydırılmaz.
const RESTORE_WINDOW_MS = 600;

// Aynı yerde sırayla görünen iki kaydırma alanı (ör. detayın okuma ve düzenleme hali) kaldığı
// yeri paylaşsın. Konum piksel değil oran olarak tutulur (0 = baş, 1 = son): iki halin içerik
// yüksekliği farklı olduğu için aynı piksel başka bir alana denk geliyordu. Oran da birebir
// aynı alanı vermez, aşağı yukarı aynı yere getirir.
export function useKeptScroll(ratioRef: RefObject<number>) {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const restoreUntilRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  // Kaydırma alanı her yeniden oluştuğunda (ör. moddan çıkınca) geri yükleme baştan başlar.
  // Ref sabit kalmalı; yoksa her çizimde yeniden bağlanıp süreyi uzatır.
  const ref = useCallback((node: ScrollViewInstance | null) => {
    scrollRef.current = node;
    if (node) {
      restoreUntilRef.current = Date.now() + RESTORE_WINDOW_MS;
    }
  }, []);

  const isRestoring = () => Date.now() < restoreUntilRef.current;

  const getScrollRange = () => contentHeightRef.current - viewportHeightRef.current;

  const scrollToRatio = () => {
    const range = getScrollRange();

    if (ratioRef.current > 0 && range > 0) {
      scrollRef.current?.scrollTo({ y: ratioRef.current * range, animated: false });
    }
  };

  // Geri yükleme sürerken yazılmaz: içerik henüz eksikken hesaplanan oran hedefi bozmasın
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isRestoring()) {
      return;
    }
    const range = getScrollRange();
    const offset = event.nativeEvent.contentOffset.y;

    // iOS'ta aşağı çekip yenilerken konum eksiye, en altta yaylanınca aralığın üstüne çıkar
    ratioRef.current = range > 0 ? Math.min(1, Math.max(0, offset / range)) : 0;
  };

  const onLayout = (event: LayoutChangeEvent) => {
    viewportHeightRef.current = event.nativeEvent.layout.height;
    if (isRestoring()) {
      scrollToRatio();
    }
  };

  const onContentSizeChange = (_width: number, height: number) => {
    contentHeightRef.current = height;
    if (isRestoring()) {
      scrollToRatio();
    }
  };

  // Kullanıcı kaydırmaya başlayınca geri yükleme biter; parmağın altındaki sayfa oynamaz
  const onScrollBeginDrag = () => {
    restoreUntilRef.current = 0;
  };

  return {
    ref,
    onScroll,
    onLayout,
    onContentSizeChange,
    onScrollBeginDrag,
    scrollEventThrottle: 16,
  };
}
