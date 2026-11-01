import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import Calendar from 'lucide-react-native/icons/calendar';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

type PeriodPillProps = {
  label: string;
  onPress: () => void;
  // Liste içi satırlarda kullanılan küçük görünüm
  compact?: boolean;
};

const COMPACT_HEIGHT = MIN_TOUCH_SIZE - SPACING.md;
const COMPACT_ICON_SIZE = ICON_SIZE.sm - SPACING.xxs;
// Küçük görünümde de dokunma alanı 44 kalır
const COMPACT_HIT_SLOP = (MIN_TOUCH_SIZE - COMPACT_HEIGHT) / 2;

// Seçili dönemi gösteren düğme; hangi dönemin seçildiğini kullanan ekran bilir.
export default function PeriodPill({ label, onPress, compact = false }: PeriodPillProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const iconSize = compact ? COMPACT_ICON_SIZE : ICON_SIZE.sm;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('filters.changePeriod')}
      accessibilityHint={label}
      hitSlop={compact ? COMPACT_HIT_SLOP : undefined}
      onPress={onPress}
      style={[styles.trigger, compact && styles.triggerCompact]}
    >
      <Calendar size={iconSize} color={colors.orange} />
      <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={1}>
        {label}
      </Text>
      <ChevronDown size={iconSize} color={colors.icon} />
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    trigger: {
      minHeight: MIN_TOUCH_SIZE - SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    triggerCompact: {
      minHeight: COMPACT_HEIGHT,
      flexShrink: 1,
      paddingHorizontal: SPACING.sm,
    },
    label: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    labelCompact: {
      ...typography.caption,
      flexShrink: 1,
      fontFamily: FONT_FAMILY.semiBold,
    },
  });
}
