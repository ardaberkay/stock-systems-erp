import ReportChart from '@/components/charts/ReportChart';
import Skeleton from '@/components/skeleton/Skeleton';
import StateMessage from '@/components/ui/StateMessage';
import {
  REPORT_BODY_HEIGHT,
  REPORT_DEFAULT_SELECTION,
  REPORT_SMALL_BODY_HEIGHT,
  REPORT_SMALL_IDS,
  type ReportId,
} from '@/constants/reports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReportContent } from '@/hooks/useReportContent';
import type { ReportStats } from '@/hooks/useReportData';
import type { Product } from '@/schemas/products';
import { useReportFilterStore } from '@/stores/reportFilterStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { router } from 'expo-router';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ReportCardProps = {
  id: ReportId;
  stats: ReportStats | null;
  productsById: Map<number, Product>;
  paymentNames: Map<number, string>;
  isPaymentNamesLoading: boolean;
  partnerNames: Map<number, string>;
};

const PRESSED_SCALE = 0.98;

export default function ReportCard({
  id,
  stats,
  productsById,
  paymentNames,
  isPaymentNamesLoading,
  partnerNames,
}: ReportCardProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const setSelection = useReportFilterStore((state) => state.setSelection);
  const content = useReportContent(
    id,
    stats ? { stats, productsById, paymentNames, isPaymentNamesLoading, partnerNames } : null,
  );
  const title = t(`reports.${id}.title`);
  const isSmall = REPORT_SMALL_IDS.includes(id);
  const bodyHeight = isSmall ? REPORT_SMALL_BODY_HEIGHT : REPORT_BODY_HEIGHT;
  const bodyPadding = isSmall ? SPACING.lg : SPACING.md;

  const openDetail = () => {
    setSelection(REPORT_DEFAULT_SELECTION);
    router.push({ pathname: '/report-detail/[id]', params: { id } });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={openDetail}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {content?.subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {content.subtitle}
            </Text>
          )}
        </View>
        <ChevronRight size={ICON_SIZE.md} color={colors.icon} />
      </View>

      <View style={[styles.body, { height: bodyHeight, paddingVertical: bodyPadding }]}>
        {!content || !stats ? (
          <Skeleton width="100%" height={bodyHeight - bodyPadding * 2} radius={RADIUS.md} />
        ) : content.isEmpty ? (
          <StateMessage message={t('reports.empty')} />
        ) : (
          <ReportChart
            content={content}
            grid={stats.busyGrid}
            colors={colors}
            interactive={false}
          />
        )}
      </View>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      overflow: 'hidden',
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.card.border,
      backgroundColor: colors.surface,
    },
    pressed: {
      transform: [{ scale: PRESSED_SCALE }],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.background,
    },
    body: {
      justifyContent: 'center',
      paddingHorizontal: SPACING.md,
      overflow: 'hidden',
    },
    titles: {
      flex: 1,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
