import Skeleton from '@/components/ui/Skeleton';
import Text from '@/components/ui/Text';
import type { BestSeller } from '@/features/orders/utils/orderStats';
import type { Product } from '@/features/products/schemas/products';
import ReportBarChart from '@/features/reports/components/charts/ReportBarChart';
import { REPORT_BAR_ROW_HEIGHT } from '@/features/reports/constants';
import type { ReportRow } from '@/features/reports/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type AffiliateTopProductsProps = {
  items: BestSeller[];
  productsById: Map<number, Product>;
  isLoading: boolean;
  colors: AppColors;
  locale: string;
};

const SKELETON_KEYS = ['first', 'second', 'third'];

// Ortağın dönemde en çok sattığı ürünler, satış adedine göre yatay çubuklar; kart yok,
// başlık ve çubuklar doğrudan zeminde. Tek renk mor: ürün/adet rengi; sıralamayı çubuk boyu
// anlatır.
export default function AffiliateTopProducts({
  items,
  productsById,
  isLoading,
  colors,
  locale,
}: AffiliateTopProductsProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const rows = useMemo<ReportRow[]>(
    () =>
      items.map((item) => ({
        key: `product${item.productId}`,
        label:
          productsById.get(item.productId)?.name ??
          t('dashboard.productFallback', { id: item.productId }),
        value: item.sold,
        valueLabel: t('reports.units', { value: formatNumber(item.sold, locale) }),
        color: colors.purple,
      })),
    [items, productsById, t, locale, colors.purple],
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletons}>
          {SKELETON_KEYS.map((key) => (
            <Skeleton
              key={key}
              width="100%"
              height={REPORT_BAR_ROW_HEIGHT - SPACING.md}
              radius={RADIUS.sm}
            />
          ))}
        </View>
      );
    }

    // Satış yoksa başlık kalır, altında kısa bir not; bölüm boş bir boşluk gibi görünmez
    if (rows.length === 0) {
      return <Text style={styles.empty}>{t('affiliates.detail.topProductsEmpty')}</Text>;
    }

    return <ReportBarChart rows={rows} colors={colors} selectedKey={null} />;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {t('affiliates.detail.topProductsTitle')}
      </Text>
      {renderBody()}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    section: {
      gap: SPACING.sm,
    },
    // Kart olmadığı için bölümü başlık ayırır; soluk gri yerine ana metin renginde
    title: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    skeletons: {
      gap: SPACING.md,
    },
    empty: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
  });
}
