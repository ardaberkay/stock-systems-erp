import { useAppTheme } from '@/hooks/useAppTheme';
import { RADIUS } from '@/theme/spacing';
import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SkeletonProps = {
  width: DimensionValue;
  height: number;
  radius?: number;
};

const PULSE_DURATION_MS = 800;
const MIN_OPACITY = 0.45;

// Veri yüklenirken içeriğin yerini tutar; boyutlar içerikle aynı verilir ki ekran zıplamasın.
export default function Skeleton({ width, height, radius = RADIUS.sm }: SkeletonProps) {
  const { colors } = useAppTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(MIN_OPACITY, { duration: PULSE_DURATION_MS }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.border },
        animatedStyle,
      ]}
    />
  );
}
