import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  // Kırmızı nokta: bölümde dikkat isteyen bir şey var (ör. hatalı alan)
  marked?: boolean;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  // Noktanın ekran okuyucudaki karşılığı (çevrilmiş)
  markedHint?: string;
};

const TRACK_PADDING = SPACING.xxs;
const TRACK_BORDER_WIDTH = 1;
const SLIDE_DURATION_MS = 200;

// Her zaman tek seçeneğin seçili olduğu bölüm geçişi; parçalar genişliği eşit paylaşır
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  markedHint,
}: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  // onLayout kenarlığı da içeren genişliği verir; parçalar kenarlık ve iç boşluğun içinde kalır
  const innerWidth = trackWidth - (TRACK_PADDING + TRACK_BORDER_WIDTH) * 2;
  const segmentWidth = trackWidth > 0 ? innerWidth / Math.max(options.length, 1) : 0;

  useEffect(() => {
    translateX.set(withTiming(selectedIndex * segmentWidth, { duration: SLIDE_DURATION_MS }));
  }, [selectedIndex, segmentWidth, translateX]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View accessibilityRole="tablist" style={styles.track} onLayout={handleLayout}>
      {/* Genişlik ölçülmeden kaydırılacak yer bilinmez; o ana kadar seçili arka plan gizli */}
      {segmentWidth > 0 ? (
        <Animated.View style={[styles.thumb, { width: segmentWidth }, thumbStyle]} />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            accessibilityHint={option.marked ? markedHint : undefined}
            onPress={() => onChange(option.value)}
            style={styles.segment}
          >
            <View style={styles.labelRow}>
              <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
                {option.label}
              </Text>
              {option.marked ? <View style={styles.dot} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    track: {
      flexDirection: 'row',
      padding: TRACK_PADDING,
      borderRadius: RADIUS.full,
      borderWidth: TRACK_BORDER_WIDTH,
      borderColor: colors.chipBorder,
      backgroundColor: colors.chipInactive,
    },
    thumb: {
      position: 'absolute',
      top: TRACK_PADDING,
      bottom: TRACK_PADDING,
      left: TRACK_PADDING,
      borderRadius: RADIUS.full,
      backgroundColor: colors.chipActive,
    },
    segment: {
      flex: 1,
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.sm,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    label: {
      ...typography.label,
      flexShrink: 1,
      color: colors.chipInactiveText,
    },
    dot: {
      width: SPACING.sm,
      height: SPACING.sm,
      borderRadius: RADIUS.full,
      backgroundColor: colors.error,
    },
    labelSelected: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.chipActiveText,
    },
  });
}
