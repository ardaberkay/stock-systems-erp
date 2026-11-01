import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type OrderListFooterProps = {
  loadedUntil: string;
  isLoading: boolean;
  onLoadMore: () => void;
};

// Kullanıcı nereye kadar baktığını görür; filtreliyken veya boş dilimde devam etmenin yolu budur.
export default function OrderListFooter({
  loadedUntil,
  isLoading,
  onLoadMore,
}: OrderListFooterProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>{t('orders.loadedUntil', { date: loadedUntil })}</Text>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.orange} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('orders.loadPrevious')}
          onPress={onLoadMore}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{t('orders.loadPrevious')}</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: SPACING.sm,
    },
    caption: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    loader: {
      height: MIN_TOUCH_SIZE,
    },
    button: {
      minHeight: MIN_TOUCH_SIZE,
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
    },
    buttonText: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.orange,
    },
  });
}
