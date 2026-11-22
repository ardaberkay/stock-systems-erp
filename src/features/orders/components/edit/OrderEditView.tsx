import { useUpdateOrder } from '@/features/orders/api/orders';
import OrderEditHeaderButton from '@/features/orders/components/edit/OrderEditHeaderButton';
import OrderEditCargoTab from '@/features/orders/components/edit/OrderEditCargoTab';
import OrderEditCustomerTab from '@/features/orders/components/edit/OrderEditCustomerTab';
import OrderEditOrderTab from '@/features/orders/components/edit/OrderEditOrderTab';
import { ORDER_DETAIL_TABS, type OrderDetailTab } from '@/features/orders/constants/detail';
import { useAppBarIconColors } from '@/hooks/useAppBarIconColors';
import { useKeptScroll } from '@/hooks/useKeptScroll';
import { getErrorDetail, getErrorMessageKey } from '@/lib/apiError';
import { createOrderEditSchema, type OrderEditForm } from '@/features/orders/schemas/orderEdit';
import type { Order } from '@/features/orders/schemas/orders';
import type { Product } from '@/features/products/schemas/products';
import { ICON_SIZE, MIN_TOUCH_SIZE, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import {
  buildOrderUpdatePayload,
  getApiErrorField,
  getOrderEditDefaults,
  getTabOfField,
  getTabsWithErrors,
} from '@/features/orders/utils/orderEdit';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useFocusEffect, useNavigation, usePreventRemove } from 'expo-router';
import type { TFunction } from 'i18next';
import Check from 'lucide-react-native/icons/check';
import X from 'lucide-react-native/icons/x';
import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { haptics } from '@/lib/haptics';
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
  // Okuma haliyle paylaşılan kaydırma oranı; mod değişince sayfa başa dönmez
  scrollRatio: RefObject<number>;
  // Sekmeler ekranda; hatalı bölümlerin noktası oraya iletilir
  onErrorTabsChange: (tabs: OrderDetailTab[]) => void;
};

// İkon 24; dokunma alanı 44'e tamamlanır
const HEADER_BUTTON_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.lg) / 2;

function confirmDiscard(t: TFunction, onDiscard: () => void) {
  haptics.warning();
  Alert.alert(t('orders.editMode.discardTitle'), t('orders.editMode.discardMessage'), [
    { text: t('orders.editMode.keepEditing'), style: 'cancel' },
    { text: t('orders.editMode.discard'), style: 'destructive', onPress: onDiscard },
  ]);
}

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
  scrollRatio,
  onErrorTabsChange,
}: OrderEditViewProps) {
  const { t } = useTranslation();
  const keptScroll = useKeptScroll(scrollRatio);
  const appBarIcon = useAppBarIconColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
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
  const updateOrder = useUpdateOrder();
  const isSaving = updateOrder.isPending;
  const tabsWithErrors = getTabsWithErrors(errors);
  // Her çizimde iletilir; ekran liste aynıysa state'i değiştirmez, döngü olmaz
  useEffect(() => {
    onErrorTabsChange(tabsWithErrors);
  });
  // Açılan bölüm sonra gizlenir ama kaldırılmaz: geri dönünce alanlar baştan çizilmesin
  const [visitedTabs, setVisitedTabs] = useState<OrderDetailTab[]>([activeTab]);
  if (!visitedTabs.includes(activeTab)) {
    setVisitedTabs([...visitedTabs, activeTab]);
  }

  // Moddan çıkınca başlık okuma haline döner: geri oku, sayfa adı, kalem ve kaydırarak geri dönme
  // (rota tanımındakiyle aynı)
  useEffect(
    () => () =>
      navigation.setOptions({
        title: t('orders.detailTitle'),
        headerBackVisible: true,
        headerLeft: undefined,
        headerRight: () => <OrderEditHeaderButton />,
        gestureEnabled: true,
      }),
    [navigation, t],
  );

  // Düzenlemede sayfadan çıkan yollar kapalı (aşağıda); bu yalnızca başka bir yoldan kapanırsa
  // (ör. bildirimden başka sayfaya gidiş) kaydedilmemiş değişikliği sorar
  usePreventRemove(isDirty && !isSaving, ({ data }) => {
    confirmDiscard(t, () => navigation.dispatch(data.action));
  });

  // Effect bağımlılığı olduğu için sabit tutulur
  const cancel = useCallback(() => {
    if (isDirty) {
      confirmDiscard(t, onExit);
      return;
    }
    onExit();
  }, [isDirty, onExit, t]);

  // Android geri hareketi sayfadan çıkmaz, X gibi düzenlemeden çıkar. Odakta değilken (picker
  // sheet'i açıkken) devreye girmez; geri hareketi önce sheet'i kapatır.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!isSaving) {
          cancel();
        }
        return true;
      });

      return () => subscription.remove();
    }, [cancel, isSaving]),
  );

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
      haptics.warning();
      Alert.alert(t('orders.editMode.invalid'));
    },
  );

  return (
    <FormProvider {...form}>
      <Stack.Screen
        options={{
          title: t('orders.editTitle'),
          headerBackVisible: false,
          // iOS'ta kaydırarak geri dönülmez; native kaydırma bitince JS durduramıyor, uyarı döngüye giriyordu
          gestureEnabled: false,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('orders.editMode.cancel')}
              hitSlop={HEADER_BUTTON_HIT_SLOP}
              disabled={isSaving}
              onPress={cancel}
            >
              {/* Geri okuyla aynı renk (bkz. useAppBarIconColors) */}
              <X size={ICON_SIZE.lg} color={isSaving ? appBarIcon.iconDisabled : appBarIcon.icon} />
            </Pressable>
          ),
          headerRight: () =>
            isSaving ? (
              <ActivityIndicator color={appBarIcon.icon} />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('orders.editMode.save')}
                hitSlop={HEADER_BUTTON_HIT_SLOP}
                onPress={() => void save()}
              >
                <Check size={ICON_SIZE.lg} color={appBarIcon.icon} />
              </Pressable>
            ),
        }}
      />
      {/* Yeşil başlık ve sekmeler ekranda kalır (bkz. OrderDetailScreen); burada yalnızca içerik */}
      <ScrollView
        {...keptScroll}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        // iOS'ta klavye açılınca odaktaki alan görünür kalır
        automaticallyAdjustKeyboardInsets
      >
        {ORDER_DETAIL_TABS.filter((tab) => visitedTabs.includes(tab)).map((tab) => (
          <View key={tab} style={[styles.tabContent, tab !== activeTab && styles.hidden]}>
            {tab === 'order' ? (
              <OrderEditOrderTab
                order={order}
                productsById={productsById}
                isProductsPending={isProductsPending}
                partnerName={partnerName}
                customStatusName={customStatusName}
              />
            ) : null}
            {tab === 'customer' ? <OrderEditCustomerTab order={order} /> : null}
            {tab === 'cargo' ? <OrderEditCargoTab order={order} /> : null}
          </View>
        ))}
      </ScrollView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  // Yan boşluk ürün detayı gibi SPACING.md (AGENTS.md'deki istisna)
  content: {
    ...SCREEN_CONTENT,
    gap: SPACING.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
  },
  // Bölümler arası boşluk, sayfanın içerik boşluğuyla aynı
  tabContent: {
    gap: SPACING.xl,
  },
  hidden: {
    display: 'none',
  },
});
