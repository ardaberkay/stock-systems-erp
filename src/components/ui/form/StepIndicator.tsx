import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type StepIndicatorProps = {
  // Görünen adımlar sırasıyla, çevrilmiş
  labels: string[];
  current: number;
};

const SEGMENT_HEIGHT = 4;

// Üstte "Adım 2 / 4 · Müşteri" ve adım sayısı kadar parça; geçilen ve şimdiki parçalar dolu
export default function StepIndicator({ labels, current }: StepIndicatorProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const stepText = t('orders.create.stepOf', { current: current + 1, total: labels.length });

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${stepText}, ${labels[current]}`}
    >
      <View style={styles.texts}>
        <Text style={styles.title}>{labels[current]}</Text>
        <Text style={styles.step}>{stepText}</Text>
      </View>
      <View style={styles.segments}>
        {labels.map((label, index) => (
          <View
            key={label}
            style={[styles.segment, index <= current ? styles.segmentDone : styles.segmentPending]}
          />
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: SPACING.sm,
    },
    texts: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    title: {
      ...typography.h3,
      flexShrink: 1,
      color: colors.text,
    },
    step: {
      ...typography.caption,
      fontFamily: FONT_FAMILY.medium,
      color: colors.textSecondary,
    },
    segments: {
      flexDirection: 'row',
      gap: SPACING.xs,
    },
    segment: {
      flex: 1,
      height: SEGMENT_HEIGHT,
      borderRadius: RADIUS.full,
    },
    segmentDone: {
      backgroundColor: colors.orange,
    },
    segmentPending: {
      backgroundColor: colors.border,
    },
  });
}
