import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type FloatingActionButtonProps = {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  // Alt sekme çubuğu ekranın üstüne biniyorsa buton onun üzerinde durur
  bottomOffset?: number;
  // Varsayılan görünümden farklı bir işlem yapıldığını renkle belli etmek için
  backgroundColor?: string;
  iconColor?: string;
  // Değişince buton kısa süre büyür; işlevinin değiştiği fark edilsin diye
  pulseKey?: string | number | boolean;
};

const BUTTON_SIZE = 56;
const PULSE_SCALE = 1.15;
const PULSE_GROW_MS = 90;
const PULSE_SPRING = { damping: 20, stiffness: 400 };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FloatingActionButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  bottomOffset = 0,
  backgroundColor,
  iconColor,
  pulseKey,
}: FloatingActionButtonProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(1);
  const lastPulseKey = useRef(pulseKey);

  useEffect(() => {
    // İlk çizimde değil, yalnızca değer değişince oynar
    if (lastPulseKey.current !== pulseKey) {
      lastPulseKey.current = pulseKey;
      scale.set(
        withSequence(
          withTiming(PULSE_SCALE, { duration: PULSE_GROW_MS }),
          withSpring(1, PULSE_SPRING),
        ),
      );
    }
  }, [pulseKey, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[
        styles.button,
        { bottom: bottomOffset + SPACING.xl },
        backgroundColor ? { backgroundColor } : undefined,
        pulseStyle,
      ]}
    >
      <Icon size={ICON_SIZE.lg} color={iconColor ?? colors.buttonPrimaryText} />
    </AnimatedPressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    button: {
      position: 'absolute',
      right: SPACING.xl,
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.full,
      backgroundColor: colors.buttonPrimary,
    },
  });
}
