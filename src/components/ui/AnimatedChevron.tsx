import { ICON_SIZE } from '@/theme/spacing';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type AnimatedChevronProps = {
  expanded: boolean;
  color: string;
};

const DURATION_MS = 220;

// Açılır alanların yön oku; Collapsible ile aynı sürede döner.
export default function AnimatedChevron({ expanded, color }: AnimatedChevronProps) {
  const rotation = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    rotation.value = withTiming(expanded ? 1 : 0, { duration: DURATION_MS });
  }, [expanded, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ChevronDown size={ICON_SIZE.md} color={color} />
    </Animated.View>
  );
}
