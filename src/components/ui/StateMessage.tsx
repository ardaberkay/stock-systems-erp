import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type StateMessageProps = {
  message: string;
  // Verilirse "tekrar dene" butonu gösterilir
  onRetry?: () => void;
};

// Boş liste ve hata durumları için ortak mesaj alanı.
export default function StateMessage({ message, onRetry }: StateMessageProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.retry')}
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: SPACING.sm,
      paddingVertical: SPACING.xxl,
      paddingHorizontal: SPACING.xl,
    },
    message: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    retryButton: {
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
    },
    retryText: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.orange,
    },
  });
}
