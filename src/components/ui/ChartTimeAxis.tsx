import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ChartTimeAxisProps = {
  labels: string[];
  colors: AppColors;
};

// Grafiğin altında ayrı satır; çizgi tam genişlikte kalırken etiketler üstüne binmez.
export default function ChartTimeAxis({ labels, colors }: ChartTimeAxisProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {labels.map((label, index) => (
        <Text key={`${label}-${index}`} style={styles.label}>
          {label}
        </Text>
      ))}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      minHeight: typography.caption.lineHeight,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING.sm,
      paddingHorizontal: SPACING.xl,
    },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
