import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatOrderDateTime } from '@/utils/formatter';
import type { OrderTimelineStep } from '@/features/orders/utils/orderDetail';
import Circle from 'lucide-react-native/icons/circle';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type OrderTimelineProps = {
  steps: OrderTimelineStep[];
};

const CONNECTOR_WIDTH = 2;

// Adımlar alt alta; gerçekleşenler yeşil, bekleyenler soluk. Tarihi olmayan adımda "—" yazar.
export default function OrderTimeline({ steps }: OrderTimelineProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      {steps.map((step, index) => {
        const Icon = step.done ? CircleCheck : Circle;
        const isLast = index === steps.length - 1;
        // Çizgi, sonraki adım da gerçekleştiyse yeşil olur
        const nextDone = steps[index + 1]?.done ?? false;

        return (
          <View
            key={step.key}
            style={styles.step}
            accessible
            accessibilityLabel={`${t(`orders.detail.timeline.${step.key}`)}, ${
              step.done ? t('orders.detail.timeline.done') : t('orders.detail.timeline.pending')
            }`}
          >
            <View style={styles.marker}>
              <Icon size={ICON_SIZE.md} color={step.done ? colors.success : colors.iconDisabled} />
              {isLast ? null : (
                <View
                  style={[styles.connector, nextDone ? styles.connectorDone : styles.connectorPending]}
                />
              )}
            </View>

            <View style={[styles.content, !isLast && styles.contentSpaced]}>
              <Text style={[styles.label, !step.done && styles.pendingText]}>
                {t(`orders.detail.timeline.${step.key}`)}
              </Text>
              <Text style={styles.date}>
                {step.dateTime ? formatOrderDateTime(step.dateTime) : '—'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    step: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    marker: {
      alignItems: 'center',
    },
    connector: {
      flex: 1,
      width: CONNECTOR_WIDTH,
      marginVertical: SPACING.xxs,
    },
    connectorDone: {
      backgroundColor: colors.success,
    },
    connectorPending: {
      backgroundColor: colors.border,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    contentSpaced: {
      paddingBottom: SPACING.lg,
    },
    label: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
    pendingText: {
      color: colors.textSecondary,
    },
    date: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
