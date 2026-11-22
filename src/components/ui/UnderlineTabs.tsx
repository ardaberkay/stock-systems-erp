import Text from '@/components/ui/Text';
import { haptics } from '@/lib/haptics';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type UnderlineTabsProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  // Satırın sağında durur (dönem seçici)
  trailing?: ReactNode;
  colors: AppColors;
};

// İnce, altı çizili metin sekmeleri. Kutulu SegmentedControl rapor sayfalarında fazla yer
// kaplıyordu; dönem seçici de aynı satıra sığar, ikisi birlikte yapışık kalır.
export default function UnderlineTabs<T extends string>({
  options,
  value,
  onChange,
  trailing,
  colors,
}: UnderlineTabsProps<T>) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
              onPress={() => {
                if (!isSelected) {
                  haptics.selection();
                }
                onChange(option.value);
              }}
              style={styles.tab}
            >
              <Text style={[styles.label, isSelected && styles.labelSelected]} numberOfLines={1}>
                {option.label}
              </Text>
              <View style={[styles.indicator, isSelected && styles.indicatorSelected]} />
            </Pressable>
          );
        })}
      </View>
      {trailing}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    tabs: {
      flexShrink: 1,
      flexDirection: 'row',
      gap: SPACING.xl,
    },
    tab: {
      minHeight: MIN_TOUCH_SIZE,
      justifyContent: 'flex-end',
      gap: SPACING.sm,
    },
    label: {
      ...typography.body,
      color: colors.textSecondary,
    },
    labelSelected: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    // Seçili olmayanda da yer tutar; seçim değişince yazılar zıplamaz
    indicator: {
      height: SPACING.xxs,
      borderRadius: RADIUS.full,
      backgroundColor: colors.orange,
      opacity: 0,
    },
    indicatorSelected: {
      opacity: 1,
    },
  });
}
