import Skeleton from '@/components/skeleton/Skeleton';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

// TopSellingCard ile aynı ölçülerde durur; veri gelince liste zıplamaz.
export default function TopSellingCardSkeleton() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Skeleton width={100} height={100} radius={RADIUS.md} />

      <View style={styles.content}>
        <Skeleton width="90%" height={14} />
        <Skeleton width="55%" height={12} />
        <Skeleton width="40%" height={12} />

        <View style={styles.bottomRow}>
          <Skeleton width="45%" height={18} />
          <Skeleton width="35%" height={18} />
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
      gap: SPACING.sm,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
}
