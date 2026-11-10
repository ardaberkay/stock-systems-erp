import SegmentedControl from '@/components/ui/SegmentedControl';
import { useSaveProductEdit, type ProductSaveResult } from '@/features/products/api/products';
import ProductInfoStep from '@/features/products/components/create/ProductInfoStep';
import ProductPriceStep from '@/features/products/components/create/ProductPriceStep';
import ProductDetailHeader from '@/features/products/components/detail/ProductDetailHeader';
import ProductEditHeaderButton from '@/features/products/components/edit/ProductEditHeaderButton';
import ProductEditVariantsTab from '@/features/products/components/edit/ProductEditVariantsTab';
import { PRODUCT_DETAIL_TABS, type ProductDetailTab } from '@/features/products/constants/productEdit';
import {
  createProductEditSchema,
  type ProductEditForm,
  type ProductEditFormInput,
} from '@/features/products/schemas/productEdit';
import type { Product } from '@/features/products/schemas/products';
import {
  advanceEditBaseline,
  buildProductEditPlan,
  getOriginalQuantities,
  getProductEditDefaults,
  getTabsWithErrors,
  type ProductEditPlan,
} from '@/features/products/utils/productEdit';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getErrorDetail, getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useFocusEffect, useNavigation, usePreventRemove } from 'expo-router';
import type { TFunction } from 'i18next';
import Check from 'lucide-react-native/icons/check';
import X from 'lucide-react-native/icons/x';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProductEditViewProps = {
  product: Product;
  activeTab: ProductDetailTab;
  onTabChange: (tab: ProductDetailTab) => void;
  // Düzenlemeden çıkar, sayfa okuma haline döner
  onExit: () => void;
};

// İkon 24; dokunma alanı 44'e tamamlanır
const HEADER_BUTTON_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.lg) / 2;

function confirmDiscard(t: TFunction, onDiscard: () => void) {
  Alert.alert(t('orders.editMode.discardTitle'), t('orders.editMode.discardMessage'), [
    { text: t('orders.editMode.keepEditing'), style: 'cancel' },
    { text: t('orders.editMode.discard'), style: 'destructive', onPress: onDiscard },
  ]);
}

// Ürün detayının düzenleme hali. Üç bölüm tek formu paylaşır, tek "Kaydet" hepsini gönderir.
// Bilgi ve Fiyat ürün eklemenin adımlarıdır; Varyantlar düzenlemeye özeldir.
export default function ProductEditView({
  product,
  activeTab,
  onTabChange,
  onExit,
}: ProductEditViewProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Başlangıç düzenleme açıldığı anki halidir; arkadan gelen yenileme formu değiştirmez.
  // Kayıt yarıda kalırsa uygulanan adımlar kadar ilerletilir (bkz. handleSaveResult).
  const [original, setOriginal] = useState(() => getProductEditDefaults(product));
  const originalQuantities = useMemo(() => getOriginalQuantities(original), [original]);
  const schema = useMemo(() => createProductEditSchema(originalQuantities), [originalQuantities]);
  const form = useForm<ProductEditFormInput, unknown, ProductEditForm>({
    resolver: zodResolver(schema),
    defaultValues: original,
    // Hata, alandan çıkınca veya "Kaydet"e basınca görünür; yazarken araya girmez
    mode: 'onTouched',
  });
  const { isDirty, errors } = form.formState;
  const saveProduct = useSaveProductEdit();
  const isSaving = saveProduct.isPending;
  const tabsWithErrors = getTabsWithErrors(errors);
  // Açılan bölüm sonra gizlenir ama kaldırılmaz: varyant satırları her geçişte baştan
  // çizilmesin (düzenlemede gecikme yapıyordu), açık satırlar da kapanmasın
  const [visitedTabs, setVisitedTabs] = useState<ProductDetailTab[]>([activeTab]);
  if (!visitedTabs.includes(activeTab)) {
    setVisitedTabs([...visitedTabs, activeTab]);
  }

  // Moddan çıkınca başlık okuma haline döner: geri oku, sayfa adı, kalem ve kaydırarak geri dönme
  // (rota tanımındakiyle aynı)
  useEffect(
    () => () =>
      navigation.setOptions({
        title: t('stock.detail.title'),
        headerBackVisible: true,
        headerLeft: undefined,
        headerRight: () => <ProductEditHeaderButton />,
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

  const errorCodeText = (error: unknown) => {
    const detail = getErrorDetail(error);

    return detail ? t('stock.create.errorCode', { code: detail }) : undefined;
  };

  // Hepsi kaydedildiyse düzenleme kapanır. Hata varsa form açık kalır ve hiçbir şey kaybolmaz:
  // uygulanan adımlar formun yeni başlangıcı olur, kaydedilemeyenler bekleyen değişiklik olarak
  // durur. Tekrar kaydedince yalnızca onlar gider; stok farkı ikinci kez uygulanmaz.
  const handleSaveResult = (
    { total, saved, applied, error }: ProductSaveResult,
    values: ProductEditForm,
    plan: ProductEditPlan,
  ) => {
    if (error === null) {
      onExit();
      return;
    }

    const baseline = advanceEditBaseline(original, values, applied);
    setOriginal(baseline);
    form.reset(baseline, { keepValues: true });

    // Eklenen varyantın satırı artık kayıtlı varyanttır; sonraki kayıt onu güncellemeye çalışır
    const rows = form.getValues('variants');
    applied.added.forEach(({ key, id }) => {
      const index = rows.findIndex((row) => row.key === key);

      if (index >= 0) {
        form.setValue(`variants.${index}.id`, id);
      }
    });

    // Kaydedilemeyen varyant satırları işaretlenir; kullanıcı neyin kaldığını görür
    const failedIds = new Set([
      ...plan.variantUpdates.flatMap(({ id }) => (applied.updatedIds.includes(id) ? [] : [id])),
      ...plan.stockChanges.flatMap(({ id }) => (applied.stockIds.includes(id) ? [] : [id])),
    ]);
    const addedKeys = new Set(applied.added.map(({ key }) => key));
    const failedKeys = new Set(
      plan.newVariants.flatMap(({ key }) => (addedKeys.has(key) ? [] : [key])),
    );
    let hasFailedRow = false;

    rows.forEach((row, index) => {
      if ((row.id !== null && failedIds.has(row.id)) || failedKeys.has(row.key)) {
        form.setError(`variants.${index}.name`, { message: 'stock.editMode.errors.notSaved' });
        hasFailedRow = true;
      }
    });
    if (hasFailedRow) {
      onTabChange('variants');
    }

    Alert.alert(
      t(saved > 0 ? 'stock.editMode.partialTitle' : getErrorMessageKey(error)),
      [saved > 0 ? t('stock.editMode.partialMessage', { saved, total }) : '', errorCodeText(error)]
        .filter(Boolean)
        .join('\n\n') || undefined,
    );
  };

  const save = form.handleSubmit(
    (values) => {
      const plan = buildProductEditPlan(values, original);

      if (!plan) {
        onExit();
        return;
      }
      saveProduct.mutate(
        { plan, product, values },
        {
          onSuccess: (result) => handleSaveResult(result, values, plan),
          onError: (error) => Alert.alert(t(getErrorMessageKey(error)), errorCodeText(error)),
        },
      );
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
          title: t('stock.editMode.title'),
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
              <X size={ICON_SIZE.lg} color={isSaving ? colors.iconDisabled : colors.text} />
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
          <ProductDetailHeader product={product} />
        </View>

        <View style={styles.tabBar}>
          <SegmentedControl
            options={PRODUCT_DETAIL_TABS.map((tab) => ({
              value: tab,
              label: t(`stock.detail.tabs.${tab}`),
              marked: tabsWithErrors.includes(tab),
            }))}
            value={activeTab}
            onChange={onTabChange}
            markedHint={t('orders.editMode.tabHasErrors')}
          />
        </View>

        {PRODUCT_DETAIL_TABS.filter((tab) => visitedTabs.includes(tab)).map((tab) => (
          <View key={tab} style={[styles.tabContent, tab !== activeTab && styles.hidden]}>
            {tab === 'info' ? <ProductInfoStep /> : null}
            {tab === 'price' ? <ProductPriceStep /> : null}
            {tab === 'variants' ? <ProductEditVariantsTab product={product} /> : null}
          </View>
        ))}
      </ScrollView>
    </FormProvider>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      ...SCREEN_CONTENT,
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
    // Bölümler arası boşluk, sayfanın içerik boşluğuyla aynı
    tabContent: {
      gap: SPACING.xl,
    },
    hidden: {
      display: 'none',
    },
  });
}
