import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATALOG_PAGES = ['types', 'colors', 'categories', 'brands'] as const;

// Tip, renk, kategori ve marka sayfalarına geçiş noktası; sayfalar sonraki adımda bağlanır.
export default function ProductCatalogModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
      <Text style={styles.title}>{t('stock.catalog.title')}</Text>

      <View>
        {CATALOG_PAGES.map((page) => (
          <Pressable
            key={page}
            accessibilityRole="button"
            accessibilityLabel={t(`stock.catalog.${page}`)}
            onPress={() => Alert.alert(t('common.comingSoon'))}
            style={styles.row}
          >
            <Text style={styles.rowText}>{t(`stock.catalog.${page}`)}</Text>
            <ChevronRight size={ICON_SIZE.md} color={colors.icon} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxl,
      gap: SPACING.md,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    row: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowText: {
      ...typography.body,
      color: colors.text,
    },
  });
}
