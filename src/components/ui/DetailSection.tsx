import DetailNote from '@/components/ui/DetailNote';
import DetailRow from '@/components/ui/DetailRow';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { Children, Fragment, isValidElement, useMemo, type ReactNode } from 'react';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type DetailSectionProps = {
  // Yoksa yalnızca kart çizilir (ör. sekme adı bölümü zaten anlatıyorsa)
  title?: string;
  // Başlığın sağında durur (ör. özetteki "Düzenle")
  action?: ReactNode;
  // card: çerçeveli kutu (varsayılan; düzenleme ve diğer detaylar). plain: çerçevesiz beyaz grup,
  // art arda gelen satırlar ince çizgiyle ayrılır (ürün detayının okuma hali).
  variant?: 'card' | 'plain';
  children: ReactNode;
};

function isDetailLine(node: ReactNode) {
  return isValidElement(node) && (node.type === DetailRow || node.type === DetailNote);
}

// Detay sayfalarında başlıklı bilgi bölümü
export default function DetailSection({
  title,
  action,
  variant = 'card',
  children,
}: DetailSectionProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const items = Children.toArray(children);
  // Yalnızca iki satırın arasına çizgi girer; ayraç, alt başlık, görsel gibi parçalara dokunulmaz
  const content =
    variant === 'card'
      ? children
      : items.map((item, index) => (
          <Fragment key={isValidElement(item) && item.key !== null ? item.key : index}>
            {index > 0 && isDetailLine(item) && isDetailLine(items[index - 1]) ? (
              <View style={styles.divider} />
            ) : null}
            {item}
          </Fragment>
        ));

  return (
    <View style={styles.section}>
      {(title || action) && (
        <View style={styles.header}>
          {title ? (
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {action}
        </View>
      )}
      <View style={styles[variant]}>{content}</View>
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
    // Zemin (background) ile beyaz grup neredeyse aynı renk; çerçeve yerine çok hafif bir gölge
    // grubu zeminden ayırır. Gölge rengi verilmez, platformun varsayılan siyahı kullanılır.
    plain: {
      gap: SPACING.md,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.surface,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 1,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    },
  });
}
