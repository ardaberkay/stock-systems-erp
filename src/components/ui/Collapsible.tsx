import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type CollapsibleProps = {
  expanded: boolean;
  children: ReactNode;
};

const DURATION_MS = 220;

// Perde gibi açılır. İçerik ilk açılışta çizilir: kapalı yüzlerce kart boşuna ölçülmez.
// Yükseklik state yerine shared value'da durur; ölçüm React'i yeniden çizdirmez.
export default function Collapsible({ expanded, children }: CollapsibleProps) {
  const [hasOpened, setHasOpened] = useState(expanded);
  const contentHeight = useSharedValue(0);
  const progress = useSharedValue(expanded ? 1 : 0);

  if (expanded && !hasOpened) {
    setHasOpened(true);
  }

  useEffect(() => {
    // İlk açılışta yükseklik henüz bilinmez; animasyon ölçümden sonra başlar
    if (!expanded || contentHeight.value > 0) {
      progress.value = withTiming(expanded ? 1 : 0, { duration: DURATION_MS });
    }
  }, [expanded, contentHeight, progress]);

  const handleLayout = (event: LayoutChangeEvent) => {
    contentHeight.set(event.nativeEvent.layout.height);

    if (expanded) {
      progress.set(withTiming(1, { duration: DURATION_MS }));
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: contentHeight.value * progress.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {hasOpened && (
        <View style={styles.content} onLayout={handleLayout}>
          {children}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  // Ölçülebilsin diye kapsayıcının animasyonlu yüksekliğinden bağımsız durur
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
