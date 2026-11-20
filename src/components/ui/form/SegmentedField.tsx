import FormFieldLayout, { type FieldLayout } from '@/components/ui/form/FormFieldLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

export type SegmentedFieldOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedFieldProps<T extends string> = {
  label: string;
  value: T;
  options: readonly SegmentedFieldOption<T>[];
  onChange: (value: T) => void;
  // inline: etiket solda, seçici sağda (bkz. FormFieldLayout)
  layout?: FieldLayout;
};

const TRACK_PADDING = SPACING.xxs;
const TRACK_BORDER_WIDTH = 1;
// Kutunun toplam yüksekliği diğer giriş kutularıyla aynı (MIN_TOUCH_SIZE)
const SEGMENT_MIN_HEIGHT = MIN_TOUCH_SIZE - (TRACK_PADDING + TRACK_BORDER_WIDTH) * 2;
// Seçili parçanın köşesi dış kutunun köşesiyle eş merkezli: dış yarıçaptan aradaki boşluk
// düşülür. Daha küçük olursa köşede kalın, daha büyük olursa ince bir boşluk görünür.
const SEGMENT_RADIUS = RADIUS.md - (TRACK_PADDING + TRACK_BORDER_WIDTH);

// Az seçenekli tekli seçim (teslim şekli, kargoyu ödeyen); hepsi aynı anda görünür, tek dokunuşla
// seçilir. Çerçeve ve köşe giriş kutularıyla aynıdır ki form alanı gibi okunsun; detaydaki sekme
// çubuğu (SegmentedControl) yuvarlak hatlıdır, ikisi karışmaz.
export default function SegmentedField<T extends string>({
  label,
  value,
  options,
  onChange,
  layout = 'stacked',
}: SegmentedFieldProps<T>) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <FormFieldLayout label={label} layout={layout}>
      <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.label}
              onPress={() => onChange(option.value)}
              style={[styles.segment, selected && styles.segmentSelected]}
            >
              {/* Satır sınırı yok: büyük yazıda metin kesilmez, kutu uzar */}
              <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </FormFieldLayout>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    track: {
      flexDirection: 'row',
      padding: TRACK_PADDING,
      borderRadius: RADIUS.md,
      borderWidth: TRACK_BORDER_WIDTH,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    segment: {
      flex: 1,
      minHeight: SEGMENT_MIN_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.xs,
      borderRadius: SEGMENT_RADIUS,
    },
    segmentSelected: {
      backgroundColor: colors.chipActive,
    },
    label: {
      ...typography.label,
      textAlign: 'center',
      color: colors.chipInactiveText,
    },
    labelSelected: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.chipActiveText,
    },
  });
}
