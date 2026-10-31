import Skeleton from '@/components/skeleton/Skeleton';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

// ProductCard'ın kapalı haliyle aynı ölçülerde durur; veri gelince liste zıplamaz.
export default function ProductCardSkeleton() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Skeleton width={100} height={100} radius={RADIUS.md} />

        <View style={styles.info}>
          <Skeleton width="90%" height={14} />
          <Skeleton width="65%" height={12} />
          <Skeleton width="40%" height={12} />
          <Skeleton width="100%" height={18} />
        </View>
      </View>

      <Skeleton width="100%" height={14} />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      gap: SPACING.sm,
      padding: SPACING.md,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    info: {
      flex: 1,
      gap: SPACING.sm,
    },
  });
}
