import { useCallback, useRef, type RefObject } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewInstance,
} from 'react-native';

// Aynı yerde sırayla görünen iki kaydırma alanı (ör. detayın okuma ve düzenleme hali) kaldığı
// konumu paylaşsın: biri kaydırdıkça konum `positionRef`'e yazılır, diğeri açılınca oradan
// başlar. İçerik yüksekliği farklı olabileceği için konum aşağı yukarı aynı yere denk gelir.
export function useKeptScroll(positionRef: RefObject<number>) {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const isRestoredRef = useRef(false);

  // Kaydırma alanı her yeniden oluştuğunda (ör. düzenlemeden dönünce) geri yükleme baştan
  // başlar. Ref sabit kalmalı; yoksa her çizimde yeniden bağlanıp bayrağı sıfırlar.
  const ref = useCallback((node: ScrollViewInstance | null) => {
    scrollRef.current = node;
    if (node) {
      isRestoredRef.current = false;
    }
  }, []);

  // Geri yükleme bitene kadar yazılmaz: içerik henüz kısayken kırpılan konum hedefi bozmasın
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isRestoredRef.current) {
      positionRef.current = event.nativeEvent.contentOffset.y;
    }
  };

  // Görünür alanın yüksekliği: konuma ancak içerik bundan o kadar uzunsa kaydırılabilir
  const viewportHeightRef = useRef(0);
  const onLayout = (event: LayoutChangeEvent) => {
    viewportHeightRef.current = event.nativeEvent.layout.height;
  };

  // İçerik parça parça gelir (iskelet, grafik); hedefe yetecek kadar uzayana dek yeniden denenir
  const onContentSizeChange = (_width: number, height: number) => {
    if (isRestoredRef.current) {
      return;
    }
    const target = positionRef.current;

    if (target > 0) {
      scrollRef.current?.scrollTo({ y: target, animated: false });
    }
    if (target <= 0 || height - viewportHeightRef.current >= target) {
      isRestoredRef.current = true;
    }
  };

  // İçerik hedefe hiç yetmezse (ör. en alttayken mod değişti) kullanıcı kaydırınca beklemek biter
  const onScrollBeginDrag = () => {
    isRestoredRef.current = true;
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
