import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import Text from '@/components/ui/Text';
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
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
  // Renkli bir başlığın içindeyse o zeminin rengi: çubuk saydam beyaz, seçili parça beyaz,
  // seçili yazı bu renkte olur (ör. ürün detayının mor başlığı)
  onColor?: string;
  // Çubuğun toplam yüksekliği arama çubuğuyla aynı olur (sabit başlıkta yan yana sayfalar
  // aynı yükseklikte dursun diye); dokunma alanı yine en az MIN_TOUCH_SIZE kalır
  compact?: boolean;
};

const TRACK_PADDING = SPACING.xxs;
const TRACK_BORDER_WIDTH = 1;
const SLIDE_DURATION_MS = 200;
// Kısa çubukta parça, çubuğun iç boşluğu ve kenarlığı kadar kısalır; aynı miktar dokunma
// alanına geri eklenir
const COMPACT_INSET = TRACK_PADDING + TRACK_BORDER_WIDTH;
const COMPACT_HIT_SLOP = { top: COMPACT_INSET, bottom: COMPACT_INSET };

// Her zaman tek seçeneğin seçili olduğu bölüm geçişi; parçalar genişliği eşit paylaşır
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  markedHint,
  onColor,
  compact = false,
}: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () => createStyles(colors, onColor, compact),
    [colors, onColor, compact],
  );
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  // onLayout kenarlığı da içeren genişliği verir; parçalar kenarlık ve iç boşluğun içinde kalır
  const innerWidth = trackWidth - (TRACK_PADDING + TRACK_BORDER_WIDTH) * 2;
  const segmentWidth = trackWidth > 0 ? innerWidth / Math.max(options.length, 1) : 0;

  // İlk ölçümde seçili parçaya animasyonsuz yerleşir; kayma yalnızca seçim değişince oynar.
  // Yoksa ikinci/üçüncü bölüm seçiliyken açılan ekranda (ör. düzenleme moduna geçiş) kutu
  // ilk parçadan kayarak gelir, sekme yeniden açılmış gibi görünür.
  const hasPositioned = useRef(false);
  useEffect(() => {
    if (segmentWidth <= 0) {
      return;
    }
    const target = selectedIndex * segmentWidth;

    if (hasPositioned.current) {
      translateX.set(withTiming(target, { duration: SLIDE_DURATION_MS }));
    } else {
      translateX.set(target);
      hasPositioned.current = true;
    }
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
            hitSlop={compact ? COMPACT_HIT_SLOP : undefined}
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

function createStyles(colors: AppColors, onColor: string | undefined, compact: boolean) {
  // Renkli zeminde kenarlık da aynı saydam beyazdır; kenarda hafif bir çizgi gibi görünür
  const palette = onColor
    ? {
        trackBorder: colors.onHeaderSurface,
        track: colors.onHeaderSurface,
        thumb: colors.onHeader,
        label: colors.onHeaderMuted,
        labelSelected: onColor,
      }
    : {
        trackBorder: colors.chipBorder,
        track: colors.chipInactive,
        thumb: colors.chipActive,
        label: colors.chipInactiveText,
        labelSelected: colors.chipActiveText,
      };

  return StyleSheet.create({
    track: {
      flexDirection: 'row',
      padding: TRACK_PADDING,
      borderRadius: RADIUS.full,
      borderWidth: TRACK_BORDER_WIDTH,
      borderColor: palette.trackBorder,
      backgroundColor: palette.track,
    },
    thumb: {
      position: 'absolute',
      top: TRACK_PADDING,
      bottom: TRACK_PADDING,
      left: TRACK_PADDING,
      borderRadius: RADIUS.full,
      backgroundColor: palette.thumb,
    },
    segment: {
      flex: 1,
      minHeight: compact ? MIN_TOUCH_SIZE - COMPACT_INSET * 2 : MIN_TOUCH_SIZE,
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
      color: palette.label,
    },
    dot: {
      width: SPACING.sm,
      height: SPACING.sm,
      borderRadius: RADIUS.full,
      backgroundColor: colors.error,
    },
    labelSelected: {
      fontFamily: FONT_FAMILY.semiBold,
      color: palette.labelSelected,
    },
  });
}
