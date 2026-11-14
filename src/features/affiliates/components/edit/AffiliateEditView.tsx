import SegmentedControl from '@/components/ui/SegmentedControl';
import { getAffiliateChanges, getAffiliateEditDefaults } from '@/features/affiliates/affiliateEdit';
import { useUpdateAffiliate } from '@/features/affiliates/api/affiliates';
import AffiliateProfileHeader from '@/features/affiliates/components/AffiliateProfileHeader';
import AffiliateEditBillingTab from '@/features/affiliates/components/edit/AffiliateEditBillingTab';
import AffiliateEditGeneralTab from '@/features/affiliates/components/edit/AffiliateEditGeneralTab';
import AffiliateEditHeaderButton from '@/features/affiliates/components/edit/AffiliateEditHeaderButton';
import {
  createAffiliateEditSchema,
  type AffiliateEditForm,
} from '@/features/affiliates/schemas/affiliateEdit';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getErrorDetail, getErrorMessageKey } from '@/lib/apiError';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SCREEN_CONTENT, SPACING } from '@/theme/spacing';
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

type AffiliateEditViewProps = {
  affiliate: Affiliate;
  // Düzenlemeden çıkar, sayfa okuma haline döner
  onExit: () => void;
};

// Siparişler düzenlenmez; düzenlemede yalnızca bilgi ve ödeme bölümleri var
const EDIT_TABS = ['general', 'billing'] as const;
type EditTab = (typeof EDIT_TABS)[number];

// İkon 24; dokunma alanı 44'e tamamlanır
const HEADER_BUTTON_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.lg) / 2;

function confirmDiscard(t: TFunction, onDiscard: () => void) {
  Alert.alert(t('orders.editMode.discardTitle'), t('orders.editMode.discardMessage'), [
    { text: t('orders.editMode.keepEditing'), style: 'cancel' },
    { text: t('orders.editMode.discard'), style: 'destructive', onPress: onDiscard },
  ]);
}

// Satış ortağı detayının düzenleme hali; "Kaydet" yalnızca değişen alanları gönderir.
export default function AffiliateEditView({ affiliate, onExit }: AffiliateEditViewProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<EditTab>('general');
  // Başlangıç düzenleme açıldığı anki halidir; arkadan gelen yenileme formu değiştirmez
  const [original] = useState(() => getAffiliateEditDefaults(affiliate));
  const schema = useMemo(() => createAffiliateEditSchema(original), [original]);
  const form = useForm<AffiliateEditForm>({
    resolver: zodResolver(schema),
    defaultValues: original,
    // Hata, alandan çıkınca veya "Kaydet"e basınca görünür; yazarken araya girmez
    mode: 'onTouched',
  });
  const { isDirty } = form.formState;
  const updateAffiliate = useUpdateAffiliate();
  const isSaving = updateAffiliate.isPending;

  // Moddan çıkınca başlık okuma haline döner (rota tanımındakiyle aynı)
  useEffect(
    () => () =>
      navigation.setOptions({
        title: t('affiliates.detail.title'),
        headerBackVisible: true,
        headerLeft: undefined,
        headerRight: () => <AffiliateEditHeaderButton />,
        gestureEnabled: true,
      }),
    [navigation, t],
  );

  // Düzenlemede sayfadan çıkan yollar kapalı; başka bir yoldan kapanırsa değişikliği sorar
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

  // Android geri hareketi sayfadan çıkmaz, X gibi düzenlemeden çıkar
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

  const save = form.handleSubmit(
    (values) => {
      const changes = getAffiliateChanges(original, values);

      if (!changes) {
        onExit();
        return;
      }
      updateAffiliate.mutate(
        { id: affiliate.id, changes },
        {
          onSuccess: onExit,
          onError: (error) => {
            const detail = getErrorDetail(error);
            Alert.alert(
              t(getErrorMessageKey(error)),
              detail ? t('affiliates.edit.errorCode', { code: detail }) : undefined,
            );
          },
        },
      );
    },
    // Tüm düzenlenebilir alanlar Bilgi bölümünde
    () => {
      setActiveTab('general');
      Alert.alert(t('orders.editMode.invalid'));
    },
  );

  return (
    <FormProvider {...form}>
      <Stack.Screen
        options={{
          title: t('affiliates.edit.title'),
          headerBackVisible: false,
          // iOS'ta kaydırarak geri dönülmez; native kaydırma bitince JS durduramıyor
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
        <AffiliateProfileHeader affiliate={affiliate} colors={colors} />

        <View style={styles.tabBar}>
          <SegmentedControl
            options={EDIT_TABS.map((tab) => ({
              value: tab,
              label: t(`affiliates.detail.tabs.${tab}`),
            }))}
            value={activeTab}
            onChange={setActiveTab}
          />
        </View>

        {/* Bölümler gizlenir ama kaldırılmaz; yazılan değerler ve klavye odağı korunur */}
        <View style={[styles.tabContent, activeTab !== 'general' && styles.hidden]}>
          <AffiliateEditGeneralTab affiliate={affiliate} />
        </View>
        <View style={[styles.tabContent, activeTab !== 'billing' && styles.hidden]}>
          <AffiliateEditBillingTab />
        </View>
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
    // Yapışık kalınca alttan kayan kartları örtsün diye zemin rengi taşır
    tabBar: {
      paddingVertical: SPACING.sm,
      backgroundColor: colors.background,
    },
    tabContent: {
      gap: SPACING.xl,
    },
    hidden: {
      display: 'none',
    },
  });
}
