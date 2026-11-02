import { useOrderCustomStatuses } from '@/api/orders';
import OrderStatusBadge from '@/components/ui/order/OrderStatusBadge';
import SelectField from '@/components/ui/SelectField';
import Switch from '@/components/ui/Switch';
import { ORDER_STATUS_FILTERS } from '@/constants/orderFilters';
import { getOrderStatusDisplay } from '@/constants/orderStatusDisplay';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type OpenSelect = 'status' | 'customStatus' | null;

const ACTIVE_STATUS = 1;
const NO_VALUE = '';
// API'de 0 özel durumu kaldırır
const CLEAR_CUSTOM_STATUS_VALUE = '0';

// İşlemler henüz bağlı değil; "Uygula" bilerek hiçbir şey yapmaz.
const runLater = () => {};

export default function OrderStatusActions() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [statusValue, setStatusValue] = useState(NO_VALUE);
  const [customStatusValue, setCustomStatusValue] = useState(NO_VALUE);
  const [changesStock, setChangesStock] = useState(false);
  const [openSelect, setOpenSelect] = useState<OpenSelect>(null);
  const { data: customStatuses } = useOrderCustomStatuses();

  const toggleSelect = (select: Exclude<OpenSelect, null>) => {
    setOpenSelect((current) => (current === select ? null : select));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <SelectField
          label={t('orders.statusTitle')}
          value={statusValue}
          options={ORDER_STATUS_FILTERS.map((statusId) => ({
            value: String(statusId),
            label: t(`orders.status.${getOrderStatusDisplay(statusId).key}`),
            content: <OrderStatusBadge statusId={statusId} colors={colors} />,
          }))}
          isOpen={openSelect === 'status'}
          onToggle={() => toggleSelect('status')}
          onSelect={(value) => {
            setStatusValue(value);
            setOpenSelect(null);
          }}
          emptyLabel={t('orders.noSelection')}
        />

        <View style={styles.stockRow}>
          <View style={styles.stockText}>
            <Text style={styles.stockTitle}>{t('orders.stockChangeTitle')}</Text>
            <Text style={styles.stockHint}>{t('orders.stockChangeHint')}</Text>
          </View>
          <Switch
            value={changesStock}
            onValueChange={setChangesStock}
            accessibilityLabel={t('orders.stockChangeTitle')}
          />
        </View>

        <SelectField
          label={t('orders.customStatusTitle')}
          value={customStatusValue}
          options={[
            ...(customStatuses ?? [])
              .filter((status) => status.status === ACTIVE_STATUS)
              .map((status) => ({ value: String(status.id), label: status.name })),
            { value: CLEAR_CUSTOM_STATUS_VALUE, label: t('orders.clearCustomStatus') },
          ]}
          isOpen={openSelect === 'customStatus'}
          onToggle={() => toggleSelect('customStatus')}
          onSelect={(value) => {
            setCustomStatusValue(value);
            setOpenSelect(null);
          }}
          emptyLabel={t('orders.noSelection')}
        />
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('filters.apply')}
        onPress={runLater}
        style={styles.applyButton}
      >
        <Text style={styles.applyText}>{t('filters.apply')}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      gap: SPACING.md,
    },
    scroll: {
      flex: 1,
    },
    stockRow: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    stockText: {
      flex: 1,
    },
    stockTitle: {
      ...typography.body,
      color: colors.text,
    },
    stockHint: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    applyButton: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      backgroundColor: colors.buttonPrimary,
    },
    applyText: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.buttonPrimaryText,
    },
  });
}
