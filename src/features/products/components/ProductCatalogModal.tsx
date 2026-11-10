import Divider from '@/components/ui/Divider';
import { catalogKindSchema } from '@/features/products/schemas/catalog';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { router } from 'expo-router';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATALOG_PAGES = ['types', 'colors', 'categories', 'brands'] as const;

// Tip, renk, kategori ve marka sayfalarına geçiş noktası.
export default function ProductCatalogModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Sheet kapanır, liste sayfası stokun üstüne açılır; geri gelince stok ekranına dönülür.
  // Henüz yapılmayan sayfalar "yakında" der.
  const openPage = (page: (typeof CATALOG_PAGES)[number]) => {
    const parsedKind = catalogKindSchema.safeParse(page);

    if (!parsedKind.success) {
      Alert.alert(t('common.comingSoon'));
      return;
    }
    router.dismiss();
    router.push({ pathname: '/catalog/[kind]', params: { kind: parsedKind.data } });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
      <Text style={styles.title}>{t('stock.catalog.title')}</Text>

      <View>
        {CATALOG_PAGES.map((page, index) => (
          <Fragment key={page}>
            {index > 0 && <Divider />}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(`stock.catalog.${page}`)}
              onPress={() => openPage(page)}
              style={styles.row}
            >
              <Text style={styles.rowText}>{t(`stock.catalog.${page}`)}</Text>
              <ChevronRight size={ICON_SIZE.md} color={colors.icon} />
            </Pressable>
          </Fragment>
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
