import { getOrderStatusDisplay } from '@/constants/orderStatusDisplay';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { getOrderStatusToneColors } from '@/utils/orderStatusColor';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

type OrderStatusBadgeProps = {
  statusId: number;
  colors: AppColors;
};

const BADGE_ICON_SIZE = ICON_SIZE.sm - SPACING.xxs;

// Durum adı hep tam okunsun diye rozet küçülmez; yer darsa satırın diğer tarafı kısalır.
export default function OrderStatusBadge({ statusId, colors }: OrderStatusBadgeProps) {
  const { t } = useTranslation();
  const { key, icon: Icon, tone } = getOrderStatusDisplay(statusId);
  const toneColors = getOrderStatusToneColors(tone, colors);

  return (
    <View style={[styles.badge, { backgroundColor: toneColors.background }]}>
      <Icon size={BADGE_ICON_SIZE} color={toneColors.text} />
      <Text style={[styles.label, { color: toneColors.text }]} numberOfLines={1}>
        {t(`orders.status.${key}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexShrink: 0,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
  },
  label: {
    ...typography.caption,
    fontFamily: FONT_FAMILY.semiBold,
  },
});
