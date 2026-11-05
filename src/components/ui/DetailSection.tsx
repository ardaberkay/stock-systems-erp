import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type DetailSectionProps = {
  title: string;
  // Başlığın sağında durur (ör. özetteki "Düzenle")
  action?: ReactNode;
  children: ReactNode;
};

// Detay sayfalarında başlıklı bilgi kartı
export default function DetailSection({ title, action, children }: DetailSectionProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {action}
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    section: {
      gap: SPACING.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    title: {
      ...typography.label,
      flexShrink: 1,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.textSecondary,
    },
    card: {
      gap: SPACING.md,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
  });
}
