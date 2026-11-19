import PeriodPill from '@/components/ui/PeriodPill';
import StateMessage from '@/components/ui/StateMessage';
import Text from '@/components/ui/Text';
import AffiliateSalesChart from '@/features/affiliates/components/AffiliateSalesChart';
import { usePeriodLabel } from '@/features/period/usePeriodLabel';
import { useProductSales } from '@/features/products/hooks/useProductSales';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatNumber } from '@/utils/formatter';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type ProductSalesSectionProps = {
  productId: number;
};

const TITLE_SEPARATOR = ' · ';

// Ürün detayının başındaki satış grafiği. Kutusuz: grafik görsel içeriktir, çerçeve bir şey
// katmaz. Tek mor çizgi (adet); sipariş ve ciro çizgisi tek üründe adetle aynı şekli çizdiği
// için yok. Dönemin adedi başlığın yanında; ciro yalnızca basılı tutunca o günün kutusunda.
export default function ProductSalesSection({ productId }: ProductSalesSectionProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selection, window, points, sold, hasData, error, refetch } = useProductSales(productId);
  const periodLabel = usePeriodLabel(selection);

  const renderBody = () => {
    if (error && !hasData) {
      return <StateMessage message={t(getErrorMessageKey(error))} onRetry={() => void refetch()} />;
    }
    if (hasData && sold === 0) {
      return <Text style={styles.empty}>{t('stock.detail.sales.empty')}</Text>;
    }

    return (
      <AffiliateSalesChart
        points={points}
        granularity={window.granularity}
        metric="sold"
        secondaryMetric="revenue"
        isLoading={!hasData}
        colors={colors}
        locale={locale}
      />
    );
  };

  return (
    <View style={styles.section}>
      {/* Başlık satırı detay bölümlerinin başlığıyla aynı yazı; sağda dönem */}
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
          {t('stock.detail.sales.title')}
          {hasData ? (
            <>
              {TITLE_SEPARATOR}
              <Text style={styles.sold}>
                {t('stock.detail.sales.sold', { value: formatNumber(sold, locale) })}
              </Text>
            </>
          ) : null}
        </Text>
        <PeriodPill
          compact
          label={periodLabel}
          onPress={() => router.push({ pathname: '/period/[scope]', params: { scope: 'product' } })}
        />
      </View>
      {renderBody()}
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
    sold: {
      color: colors.purple,
    },
    empty: {
      ...typography.bodySmall,
      textAlign: 'center',
      paddingVertical: SPACING.xl,
      color: colors.textSecondary,
    },
  });
}
