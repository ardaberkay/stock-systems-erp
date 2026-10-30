import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type PeriodOptionProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  // Başka bir sayfaya geçen seçenekler (ör. özel tarih) için sağda ok gösterilir
  showChevron?: boolean;
};

export default function PeriodOption({ label, active, onPress, showChevron }: PeriodOptionProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.option, active && styles.optionActive]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      {showChevron && <ChevronRight size={ICON_SIZE.md} color={colors.icon} />}
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    option: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.sm,
      // Seçili olunca kenarlık rengi değişir; boyut zıplamasın diye her zaman 1px
      // ve seçili değilken arka planla aynı renkte (görünmez)
      borderWidth: 1,
      borderColor: colors.surface,
    },
    optionActive: {
      borderColor: colors.orange,
      backgroundColor: colors.orangeLight,
    },
    label: {
      ...typography.body,
      color: colors.text,
    },
    labelActive: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.orange,
    },
  });
}
