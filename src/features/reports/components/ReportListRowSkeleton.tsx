import Skeleton from '@/components/ui/Skeleton';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

const VALUE_WIDTH = MIN_TOUCH_SIZE + SPACING.xl;

// ReportListRow'un yüklenirken görünen hali: ad solda, değer sağda, altında aynı çizgi
export default function ReportListRowSkeleton() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.label}>
        <Skeleton width="60%" height={typography.bodySmall.lineHeight} />
      </View>
      <Skeleton width={VALUE_WIDTH} height={typography.label.lineHeight} />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    label: {
      flex: 1,
    },
  });
}
