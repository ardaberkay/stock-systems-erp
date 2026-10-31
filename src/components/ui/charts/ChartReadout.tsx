import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import type { LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type ChartReadoutItem = {
  key: string;
  icon: LucideIcon;
  value: string;
  color: string;
  background: string;
};

type ChartReadoutProps = {
  label: string;
  items: ChartReadoutItem[];
};

// Grafikte parmağın altındaki noktanın bilgisi; her değer kendi serisinin rengiyle görünür.
export default function ChartReadout({ label, items }: ChartReadoutProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View pointerEvents="none" style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {items.map(({ key, icon: Icon, value, color, background }) => (
        <View
          key={key}
          style={[styles.pill, { borderColor: color, backgroundColor: background }]}
        >
          <Icon size={ICON_SIZE.sm - SPACING.xxs} color={color} />
          <Text style={[styles.value, { color }]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: SPACING.xs,
      left: 0,
      right: 0,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.xl,
    },
    label: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
    },
    value: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.bold,
    },
  });
}
