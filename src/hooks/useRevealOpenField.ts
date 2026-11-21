import { COLLAPSE_DURATION_MS } from '@/components/ui/Collapsible';
import { useEffect, useRef } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewInstance,
} from 'react-native';

type FieldBox = { y: number; height: number };

// ScrollView içinde alt alta duran açılır alanlardan (SelectField) biri açılınca liste,
// altındaki alan da görünecek kadar kaydırılır. Böylece diğer alana geçmek için açık olanı
// kapatmak gerekmez. Açılan alanın kendi satırı üstten dışarı taşmaz.
export function useRevealOpenField<K extends string>(openKey: K | null) {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const groupY = useRef(0);
  const fields = useRef(new Map<K, FieldBox>());
  const viewportHeight = useRef(0);
  const scrollY = useRef(0);

  useEffect(() => {
    if (openKey === null) {
      return;
    }

    // Açılma ve varsa öbür alanın kapanma animasyonu bitince yerler kesinleşir
    const timer = setTimeout(() => {
      const field = fields.current.get(openKey);

      if (!field) {
        return;
      }

      // Sıradaki alan: açılanın hemen altındaki
      const next = [...fields.current.values()]
        .filter((box) => box.y > field.y)
        .sort((a, b) => a.y - b.y)[0];
      const top = groupY.current + field.y;
      const bottom = groupY.current + (next ? next.y + next.height : field.y + field.height);
      const target = Math.min(top, Math.max(scrollY.current, bottom - viewportHeight.current));

      if (target > scrollY.current) {
        scrollRef.current?.scrollTo({ y: target, animated: true });
      }
    }, COLLAPSE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [openKey]);

  return {
    scrollProps: {
      ref: scrollRef,
      scrollEventThrottle: 16,
      onLayout: (event: LayoutChangeEvent) => {
        viewportHeight.current = event.nativeEvent.layout.height;
      },
      onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollY.current = event.nativeEvent.contentOffset.y;
      },
    },
    // Alanları saran grubun içerikteki yeri; alanların yeri bu gruba göre ölçülür
    onGroupLayout: (event: LayoutChangeEvent) => {
      groupY.current = event.nativeEvent.layout.y;
    },
    onFieldLayout: (key: K) => (event: LayoutChangeEvent) => {
      const { y, height } = event.nativeEvent.layout;
      fields.current.set(key, { y, height });
    },
  };
}
