import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import Calendar from 'lucide-react-native/icons/calendar';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet } from 'react-native';

type PeriodPillProps = {
  label: string;
  // Ekran okuyucunun okuyacağı tam ad ("Son 30 gün"); görünen ad kısaltılmışsa verilir
  accessibilityHint?: string;
  onPress: () => void;
  // Sayfa başındaki, listenin üstündeki küçük görünüm (ör. siparişler); varsayılan görünüm
  // sayfa içindeki bölümler içindir (ör. dashboard)
  compact?: boolean;
};

const DEFAULT_HEIGHT = MIN_TOUCH_SIZE - SPACING.sm;
const COMPACT_HEIGHT = MIN_TOUCH_SIZE - SPACING.md;
const COMPACT_ICON_SIZE = ICON_SIZE.sm - SPACING.xxs;
// İki görünümde de dokunma alanı 44 kalır
const DEFAULT_HIT_SLOP = (MIN_TOUCH_SIZE - DEFAULT_HEIGHT) / 2;
const COMPACT_HIT_SLOP = (MIN_TOUCH_SIZE - COMPACT_HEIGHT) / 2;

// Seçili dönemi gösteren düğme; hangi dönemin seçildiğini kullanan ekran bilir.
export default function PeriodPill({
  label,
  accessibilityHint,
  onPress,
  compact = false,
}: PeriodPillProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const iconSize = compact ? COMPACT_ICON_SIZE : ICON_SIZE.sm;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('filters.changePeriod')}
      accessibilityHint={accessibilityHint ?? label}
      hitSlop={compact ? COMPACT_HIT_SLOP : DEFAULT_HIT_SLOP}
      onPress={onPress}
      style={[styles.trigger, compact && styles.triggerCompact]}
    >
      <Calendar size={iconSize} color={colors.orange} />
      {/* İkonla metin arası, metinle ok arasından biraz geniş */}
      <Text style={[styles.label, compact && styles.labelCompact, styles.labelOffset]} numberOfLines={1}>
        {label}
      </Text>
      <ChevronDown size={iconSize} color={colors.icon} />
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    trigger: {
      minHeight: DEFAULT_HEIGHT,
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
    labelOffset: {
      marginLeft: SPACING.xxs,
    },
    labelCompact: {
      ...typography.caption,
      flexShrink: 1,
      fontFamily: FONT_FAMILY.semiBold,
    },
  });
}
