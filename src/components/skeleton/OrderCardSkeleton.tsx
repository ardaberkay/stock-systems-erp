import Skeleton from '@/components/skeleton/Skeleton';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

// OrderCard'ın ek satırsız haliyle aynı ölçülerde durur; veri gelince liste zıplamaz.
export default function OrderCardSkeleton() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const captionHeight = typography.caption.lineHeight;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Skeleton width="45%" height={captionHeight} />
        <Skeleton width="30%" height={captionHeight + SPACING.xs} />
      </View>

      <View style={styles.row}>
        <Skeleton width="45%" height={typography.label.lineHeight} />
        <Skeleton width="30%" height={typography.label.lineHeight} />
      </View>

      <View style={styles.row}>
        <Skeleton width="40%" height={typography.label.lineHeight} />
        <Skeleton width="25%" height={captionHeight} />
      </View>

      <View style={styles.footer}>
        <Skeleton width="50%" height={captionHeight} />
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      gap: SPACING.sm,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footer: {
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
  });
}
