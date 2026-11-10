import { useCreateOrder } from '@/features/orders/api/orders';
import StepIndicator from '@/components/ui/form/StepIndicator';
import OrderCustomerStep from '@/features/orders/components/create/OrderCustomerStep';
import OrderProductsStep from '@/features/orders/components/create/OrderProductsStep';
import OrderShippingStep from '@/features/orders/components/create/OrderShippingStep';
import Button from '@/components/ui/Button';
import {
  ORDER_CREATE_DEFAULTS,
  ORDER_CREATE_ERROR_KEYS,
  ORDER_CREATE_STEP_FIELDS,
  ORDER_CREATE_STEPS,
} from '@/features/orders/constants/create';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getErrorDetail, getErrorMessageKey, isApiError } from '@/lib/apiError';
import {
  orderCreateSchema,
  type OrderCreateForm,
  type OrderCreateFormInput,
} from '@/features/orders/schemas/orderCreate';
import type { AppColors } from '@/theme/colors';
import { SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useLayoutEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LAST_STEP_INDEX = ORDER_CREATE_STEPS.length - 1;

// Hatalı alanın bulunduğu ilk adım; alan yolunun ilk parçası adım listesinde aranır
function findFirstInvalidStep(errors: FieldErrors<OrderCreateFormInput>): number {
  const invalidKeys = Object.keys(errors);

  return ORDER_CREATE_STEPS.findIndex((step) =>
    ORDER_CREATE_STEP_FIELDS[step].some((field) => invalidKeys.includes(field.split('.')[0])),
  );
}

// Adım adım sipariş oluşturma. Tüm adımlar tek formdadır: geri dönünce girilenler kaybolmaz.
export default function OrderNewScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const createOrder = useCreateOrder();
  const form = useForm<OrderCreateFormInput, unknown, OrderCreateForm>({
    resolver: zodResolver(orderCreateSchema),
    defaultValues: ORDER_CREATE_DEFAULTS,
    // Hata, alandan çıkınca veya "Devam"a basınca görünür; yazarken araya girmez
    mode: 'onTouched',
  });

  const step = ORDER_CREATE_STEPS[stepIndex];
  const isLastStep = stepIndex === LAST_STEP_INDEX;
  const stepLabels = ORDER_CREATE_STEPS.map((key) => t(`orders.create.steps.${key}`));

  // Yeni adım çizildikten sonra, ekrana basılmadan başa dönülür; eski adım yukarı zıplamaz
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [stepIndex]);

  const goNext = async () => {
    const isValid = await form.trigger(ORDER_CREATE_STEP_FIELDS[step], { shouldFocus: true });

    if (isValid) {
      setStepIndex(stepIndex + 1);
    }
  };

  // Hata pencerede gösterilir ki gözden kaçmasın. Bilinen kodlar anlaşılır mesaja çevrilir;
  // bilinmeyende ham cevap yazılır, sorunun kaynağı doğrudan görünür.
  const showSubmitError = (error: unknown) => {
    const code = isApiError(error) && typeof error.data === 'string' ? error.data : null;
    const knownKey = code ? ORDER_CREATE_ERROR_KEYS[code] : undefined;

    if (knownKey) {
      Alert.alert(t(knownKey));
      return;
    }

    const detail = getErrorDetail(error);
    const detailText =
      detail === null
        ? undefined
        : detail === ''
          ? t('orders.create.emptyResponse')
          : t('orders.create.errorCode', { code: detail });

    Alert.alert(t(getErrorMessageKey(error)), detailText);
  };

  const submit = form.handleSubmit(
    (values) => {
      createOrder.mutate(values, {
        onSuccess: () => {
          Alert.alert(t('orders.create.success'));
          router.back();
        },
        onError: showSubmitError,
      });
    },
    // Geçersiz alan varsa gönderim sessizce durmasın: ilgili adıma geçilir, kullanıcı uyarılır
    (errors) => {
      const invalidStep = findFirstInvalidStep(errors);

      if (invalidStep >= 0) {
        setStepIndex(invalidStep);
      }
      Alert.alert(t('orders.create.invalid'));
    },
  );

  return (
    <FormProvider {...form}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <StepIndicator labels={stepLabels} current={stepIndex} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          // iOS'ta klavye açılınca odaktaki alan görünür kalır
          automaticallyAdjustKeyboardInsets
        >
          {step === 'products' ? <OrderProductsStep /> : null}
          {step === 'customer' ? <OrderCustomerStep /> : null}
          {step === 'shipping' ? <OrderShippingStep /> : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
          {stepIndex > 0 ? (
            <Button
              label={t('orders.create.back')}
              variant="secondary"
              disabled={createOrder.isPending}
              onPress={() => setStepIndex(stepIndex - 1)}
              style={styles.footerButton}
            />
          ) : null}
          <Button
            label={isLastStep ? t('orders.create.submit') : t('orders.create.next')}
            loading={createOrder.isPending}
            onPress={() => void (isLastStep ? submit() : goNext())}
            style={styles.footerButton}
          />
        </View>
      </View>
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
    header: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.md,
    },
    scroll: {
      flex: 1,
    },
    content: {
      gap: SPACING.xl,
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.xl,
    },
    footer: {
      flexDirection: 'row',
      gap: SPACING.md,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.background,
    },
    footerButton: {
      flex: 1,
    },
  });
}
