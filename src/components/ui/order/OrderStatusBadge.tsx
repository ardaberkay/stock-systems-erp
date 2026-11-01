import { getOrderStatusDisplay, type OrderStatusTone } from '@/constants/orderStatusDisplay';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

type OrderStatusBadgeProps = {
  statusId: number;
  colors: AppColors;
};

const BADGE_ICON_SIZE = ICON_SIZE.sm - SPACING.xxs;

function getToneColors(tone: OrderStatusTone, colors: AppColors) {
  switch (tone) {
    case 'orange':
      return { text: colors.orange, background: colors.orangeLight };
    case 'blue':
      return { text: colors.blue, background: colors.blueLight };
    case 'green':
      return { text: colors.green, background: colors.greenLight };
    case 'purple':
      return { text: colors.purple, background: colors.purpleLight };
    case 'success':
      return { text: colors.success, background: colors.successBackground };
    case 'error':
      return { text: colors.error, background: colors.errorBackground };
    case 'neutral':
      return { text: colors.textSecondary, background: colors.background };
  }
}

// Durum adı hep tam okunsun diye rozet küçülmez; yer darsa satırın diğer tarafı kısalır.
export default function OrderStatusBadge({ statusId, colors }: OrderStatusBadgeProps) {
  const { t } = useTranslation();
  const { key, icon: Icon, tone } = getOrderStatusDisplay(statusId);
  const toneColors = getToneColors(tone, colors);

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
