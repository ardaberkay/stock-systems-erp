import Skeleton from '@/components/ui/Skeleton';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { StyleSheet, View } from 'react-native';

type CatalogItemRowSkeletonProps = {
  // Renk listesinde adın önündeki nokta
  showColorDot: boolean;
  // Kategori listesinde adın altındaki bilgi satırı
  showSubtitle: boolean;
  colors: AppColors;
};

const COUNT_WIDTH = MIN_TOUCH_SIZE + SPACING.lg;

// CatalogItemRow'un yüklenirken görünen hali: aynı yükseklik, boşluk ve sıra; veri gelince
// satırlar yerinden oynamaz
export default function CatalogItemRowSkeleton({
  showColorDot,
  showSubtitle,
  colors,
}: CatalogItemRowSkeletonProps) {
  return (
    <View style={styles.row}>
      {showColorDot && <Skeleton width={ICON_SIZE.sm} height={ICON_SIZE.sm} radius={RADIUS.full} />}
      <View style={styles.texts}>
        <Skeleton width="55%" height={typography.body.lineHeight} />
        {showSubtitle && <Skeleton width="35%" height={typography.caption.lineHeight} />}
      </View>
      <Skeleton width={COUNT_WIDTH} height={typography.caption.lineHeight} />
      <ChevronRight size={ICON_SIZE.md} color={colors.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH_SIZE + SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  texts: {
    flex: 1,
    gap: SPACING.xxs,
  },
});
