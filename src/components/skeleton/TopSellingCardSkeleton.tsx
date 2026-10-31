import Skeleton from '@/components/skeleton/Skeleton';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

const NAME_LINE_HEIGHT = 14;
const CHART_LINE_HEIGHT = 2;

// TopSellingCard'ın satırlarını birebir izler; veri gelince içerik yerinden oynamaz.
export default function TopSellingCardSkeleton() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Skeleton width={100} height={100} radius={RADIUS.md} />

      <View style={styles.content}>
        <View style={styles.name}>
          <Skeleton width="90%" height={NAME_LINE_HEIGHT} />
          <Skeleton width="60%" height={NAME_LINE_HEIGHT} />
        </View>

        {/* Model kodu ve en çok satan beden */}
        <View style={styles.row}>
          <Skeleton width="35%" height={typography.caption.lineHeight} />
          <Skeleton width="25%" height={typography.caption.lineHeight} />
        </View>

        {/* Renk ve adet rozeti */}
        <View style={styles.spacedRow}>
          <Skeleton width="30%" height={typography.caption.lineHeight} />
          <Skeleton width="20%" height={typography.caption.lineHeight} />
        </View>

        {/* Küçük grafik, ana grafikteki gibi düz çizgiyle başlar; yanında ciro durur */}
        <View style={styles.spacedRow}>
          <Skeleton width="40%" height={CHART_LINE_HEIGHT} />
          <Skeleton width="40%" height={typography.h3.lineHeight} />
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      height: 134,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      padding: SPACING.md,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: SPACING.xs,
    },
    name: {
      gap: SPACING.xxs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    spacedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
  });
}
