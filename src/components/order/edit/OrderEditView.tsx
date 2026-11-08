import { useOrderCustomStatuses, useUpdateOrder } from '@/api/orders';
import OrderDetailHeader from '@/components/order/OrderDetailHeader';
import OrderEditHeaderButton from '@/components/order/OrderEditHeaderButton';
import OrderEditCargoTab from '@/components/order/edit/OrderEditCargoTab';
import OrderEditCustomerTab from '@/components/order/edit/OrderEditCustomerTab';
import OrderEditOrderTab from '@/components/order/edit/OrderEditOrderTab';
import OrderStatusBadge from '@/components/ui/order/OrderStatusBadge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { ORDER_DETAIL_TABS, type OrderDetailTab } from '@/constants/orderDetail';
import {
  ACTIVE_CUSTOM_STATUS,
  LOCKED_ORDER_STATUSES,
  NO_CUSTOM_STATUS,
  ORDER_EDIT_STATUSES,
} from '@/constants/orderEdit';
import { getOrderStatusDisplay } from '@/constants/orderStatusDisplay';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePickerSheet } from '@/hooks/usePickerSheet';
import { getErrorDetail, getErrorMessageKey } from '@/lib/apiError';
import { createOrderEditSchema, type OrderEditForm } from '@/schemas/orderEdit';
import type { Order } from '@/schemas/orders';
import type { Product } from '@/schemas/products';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import {
  buildOrderUpdatePayload,
  getApiErrorField,
  getOrderEditDefaults,
  getTabOfField,
  getTabsWithErrors,
} from '@/utils/orderEdit';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useNavigation, usePreventRemove } from 'expo-router';
import Check from 'lucide-react-native/icons/check';
import X from 'lucide-react-native/icons/x';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type OrderEditViewProps = {
  order: Order;
  customStatusName: string | undefined;
  partnerName: string | undefined;
  productsById: Map<number, Product>;
  isProductsPending: boolean;
  activeTab: OrderDetailTab;
  onTabChange: (tab: OrderDetailTab) => void;
  // Düzenlemeden çıkar, sayfa okuma haline döner
  onExit: () => void;
};

// İkon 24; dokunma alanı 44'e tamamlanır
const HEADER_BUTTON_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.lg) / 2;

// Detay sayfasının düzenleme hali. Üç bölüm tek formu paylaşır, tek "Kaydet" hepsini gönderir.
// Form yalnızca bu mod açıkken vardır; okuma halinde hiçbir maliyeti yok.
export default function OrderEditView({
  order,
  customStatusName,
  partnerName,
  productsById,
  isProductsPending,
  activeTab,
  onTabChange,
  onExit,
}: OrderEditViewProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Başlangıç düzenleme açıldığı anki halidir; arkadan gelen yenileme formu değiştirmez
  const [original] = useState(() => getOrderEditDefaults(order));
  const schema = useMemo(() => createOrderEditSchema(original), [original]);
  const form = useForm<OrderEditForm>({
    resolver: zodResolver(schema),
    defaultValues: original,
    // Hata, alandan çıkınca veya "Kaydet"e basınca görünür; yazarken araya girmez
    mode: 'onTouched',
  });
  const { isDirty, errors } = form.formState;
  const statusId = useWatch({ control: form.control, name: 'statusId' });
  const customStatusId = useWatch({ control: form.control, name: 'customStatusId' });
  const { openPicker } = usePickerSheet();
  const { data: customStatuses } = useOrderCustomStatuses();
  const updateOrder = useUpdateOrder();
  const isSaving = updateOrder.isPending;
  const tabsWithErrors = getTabsWithErrors(errors);
  // Liste gelmeden kayıtlı ad gösterilir; pasif bir özel durum seçiliyse de adı kaybolmaz
  const selectedCustomStatusName =
    customStatusId === null
      ? undefined
      : (customStatuses?.find((status) => status.id === customStatusId)?.name ??
        (customStatusId === original.customStatusId ? customStatusName : undefined));

  // 13, 14 ve 15 listede görünür ama seçilemez; durum değişikliği stoğa dokunmaz
  const openStatusPicker = () => {
    openPicker({
      title: t('orders.statusTitle'),
      note: t('orders.editMode.statusStockNote'),
      items: ORDER_EDIT_STATUSES.map((id) => {
        const locked = LOCKED_ORDER_STATUSES.includes(id);

        return {
          value: id,
          label: t(`orders.status.${getOrderStatusDisplay(id).key}`),
          content: <OrderStatusBadge statusId={id} colors={colors} />,
          disabled: locked,
          badge: locked ? t('orders.editMode.statusLocked') : undefined,
        };
      }),
      value: statusId,
      onSelect: (next) => {
        if (typeof next === 'number') {
          form.setValue('statusId', next, { shouldDirty: true });
        }
      },
    });
  };

  // "Özel durum yok" API'de 0 ile özel durumu kaldırır
  const openCustomStatusPicker = () => {
    openPicker({
      title: t('orders.customStatusTitle'),
      items: [
        { value: NO_CUSTOM_STATUS, label: t('orders.editMode.noCustomStatus') },
        ...(customStatuses ?? [])
          .filter((status) => status.status === ACTIVE_CUSTOM_STATUS || status.id === customStatusId)
          .map((status) => ({ value: status.id, label: status.name })),
      ],
      value: customStatusId ?? NO_CUSTOM_STATUS,
      onSelect: (next) => {
        if (typeof next === 'number') {
          form.setValue('customStatusId', next === NO_CUSTOM_STATUS ? null : next, {
            shouldDirty: true,
          });
        }
      },
    });
  };

  const confirmDiscard = (onDiscard: () => void) => {
    Alert.alert(t('orders.editMode.discardTitle'), t('orders.editMode.discardMessage'), [
      { text: t('orders.editMode.keepEditing'), style: 'cancel' },
      { text: t('orders.editMode.discard'), style: 'destructive', onPress: onDiscard },
    ]);
  };

  // Moddan çıkınca başlık okuma haline döner: geri oku, sayfa adı ve kalem (rota tanımındakiyle aynı)
  useEffect(
    () => () =>
      navigation.setOptions({
        title: t('orders.detailTitle'),
        headerBackVisible: true,
        headerLeft: undefined,
        headerRight: () => <OrderEditHeaderButton />,
      }),
    [navigation, t],
  );

  // Geri tuşu, iOS kaydırma hareketi ve geri butonu: kaydedilmemiş değişiklik varsa sorulur
  usePreventRemove(isDirty && !isSaving, ({ data }) => {
    confirmDiscard(() => navigation.dispatch(data.action));
  });

  const cancel = () => {
    if (isDirty) {
      confirmDiscard(onExit);
      return;
    }
    onExit();
  };

  // Sunucu bir alanı reddettiyse alan işaretlenir ve bölümüne geçilir; diğer hatalar pencerede
  const showSaveError = (error: unknown) => {
    const field = getApiErrorField(error);

    if (field) {
      form.setError(field, { message: 'orders.editMode.errors.rejected' });
      const tab = getTabOfField(field);

      if (tab) {
        onTabChange(tab);
      }
    }

    const detail = getErrorDetail(error);

    Alert.alert(
      t(field ? 'orders.editMode.rejected' : getErrorMessageKey(error)),
      detail ? t('orders.create.errorCode', { code: detail }) : undefined,
    );
  };

  const save = form.handleSubmit(
    (values) => {
      const update = buildOrderUpdatePayload(values, original);

      if (!update) {
        onExit();
        return;
      }
      updateOrder.mutate({ id: order.id, update }, { onSuccess: onExit, onError: showSaveError });
    },
    // Hatalı alan başka bölümdeyse oraya geçilir; bölüm başlıklarında da nokta görünür
    (invalid) => {
      const tabs = getTabsWithErrors(invalid);

      if (tabs.length > 0 && !tabs.includes(activeTab)) {
        onTabChange(tabs[0]);
      }
      Alert.alert(t('orders.editMode.invalid'));
    },
  );

  return (
    <FormProvider {...form}>
      <Stack.Screen
        options={{
          title: t('orders.editTitle'),
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('orders.editMode.cancel')}
              hitSlop={HEADER_BUTTON_HIT_SLOP}
              disabled={isSaving}
              onPress={cancel}
            >
              <X size={ICON_SIZE.lg} color={isSaving ? colors.iconDisabled : colors.icon} />
            </Pressable>
          ),
          headerRight: () =>
            isSaving ? (
              <ActivityIndicator color={colors.orange} />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('orders.editMode.save')}
                hitSlop={HEADER_BUTTON_HIT_SLOP}
                onPress={() => void save()}
              >
                <Check size={ICON_SIZE.lg} color={colors.orange} />
              </Pressable>
            ),
        }}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        // iOS'ta klavye açılınca odaktaki alan görünür kalır
        automaticallyAdjustKeyboardInsets
        // 1. çocuk bölüm seçimi; kaydırınca üstte yapışık kalır
        stickyHeaderIndices={[1]}
      >
        <View style={styles.summaryCard}>
          <OrderDetailHeader
            order={order}
            customStatusName={selectedCustomStatusName}
            statusId={statusId}
            onStatusPress={openStatusPicker}
            onCustomStatusPress={openCustomStatusPicker}
          />
        </View>

        <View style={styles.tabBar}>
          <SegmentedControl
            options={ORDER_DETAIL_TABS.map((tab) => ({
              value: tab,
              label: t(`orders.detail.tabs.${tab}`),
              marked: tabsWithErrors.includes(tab),
            }))}
            value={activeTab}
            onChange={onTabChange}
            markedHint={t('orders.editMode.tabHasErrors')}
          />
        </View>

        {activeTab === 'order' ? (
          <OrderEditOrderTab
            order={order}
            productsById={productsById}
            isProductsPending={isProductsPending}
            partnerName={partnerName}
          />
        ) : null}
        {activeTab === 'customer' ? <OrderEditCustomerTab order={order} /> : null}
        {activeTab === 'cargo' ? <OrderEditCargoTab order={order} /> : null}
      </ScrollView>
    </FormProvider>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      gap: SPACING.xl,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.md,
    },
    summaryCard: {
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    // Yapışık kalınca alttan kayan kartları örtsün diye zemin rengi ve dikey boşluk taşır
    tabBar: {
      paddingVertical: SPACING.sm,
      backgroundColor: colors.background,
    },
  });
}
