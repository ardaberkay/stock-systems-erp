import { useCreateProduct, useProducts } from '@/features/products/api/products';
import StepIndicator from '@/components/ui/form/StepIndicator';
import ProductInfoStep from '@/features/products/components/create/ProductInfoStep';
import ProductPriceStep from '@/features/products/components/create/ProductPriceStep';
import ProductVariantsStep from '@/features/products/components/create/ProductVariantsStep';
import Button from '@/components/ui/Button';
import {
  createProductDefaults,
  PRODUCT_CREATE_STEP_FIELDS,
  PRODUCT_CREATE_STEPS,
} from '@/features/products/constants/productCreate';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getErrorDetail, getErrorMessageKey } from '@/lib/apiError';
import {
  productCreateSchema,
  type ProductCreateForm,
  type ProductCreateFormInput,
} from '@/features/products/schemas/productCreate';
import type { AppColors } from '@/theme/colors';
import { SCREEN_CONTENT, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { generateModelCode } from '@/features/products/utils/productCreate';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useLayoutEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LAST_STEP_INDEX = PRODUCT_CREATE_STEPS.length - 1;
const VARIANTS_STEP_INDEX = PRODUCT_CREATE_STEPS.indexOf('variants');

// Hatalı alanın bulunduğu ilk adım; alan yolunun ilk parçası adım listesinde aranır
function findFirstInvalidStep(errors: FieldErrors<ProductCreateFormInput>): number {
  const invalidKeys = Object.keys(errors);

  return PRODUCT_CREATE_STEPS.findIndex((step) =>
    PRODUCT_CREATE_STEP_FIELDS[step].some((field) => invalidKeys.includes(field.split('.')[0])),
  );
}

// Adım adım ürün oluşturma. Tüm adımlar tek formdadır: geri dönünce girilenler kaybolmaz.
export default function ProductNewScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const { data: catalog } = useProducts();
  const createProduct = useCreateProduct();
  // Öneri ekran açılınca bir kez üretilir; katalog sonradan gelirse kod değişmez
  const [defaultValues] = useState(() =>
    createProductDefaults(
      generateModelCode(new Set((catalog ?? []).flatMap((product) => product.modelCode ?? []))),
    ),
  );
  const form = useForm<ProductCreateFormInput, unknown, ProductCreateForm>({
    resolver: zodResolver(productCreateSchema),
    defaultValues,
    // Hata, alandan çıkınca veya "Devam"a basınca görünür; yazarken araya girmez
    mode: 'onTouched',
  });

  const step = PRODUCT_CREATE_STEPS[stepIndex];
  const isLastStep = stepIndex === LAST_STEP_INDEX;
  const stepLabels = PRODUCT_CREATE_STEPS.map((key) => t(`stock.create.steps.${key}`));

  // Yeni adım çizildikten sonra, ekrana basılmadan başa dönülür; eski adım yukarı zıplamaz
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [stepIndex]);

  const goNext = async () => {
    const isValid = await form.trigger(PRODUCT_CREATE_STEP_FIELDS[step], { shouldFocus: true });

    if (isValid) {
      setStepIndex(stepIndex + 1);
    }
  };

  // Sunucu model kodu ile rengin birlikte tekrarını reddediyor; sonuç dakikalar sonra geldiği
  // için katalogdan önceden bakılır ve form kapanmadan uyarılır.
  const isDuplicate = (values: ProductCreateForm) => {
    const code = values.modelCode.toLocaleUpperCase('tr');

    return (catalog ?? []).some(
      (product) =>
        product.colorId === values.colorId &&
        (product.modelCode ?? '').trim().toLocaleUpperCase('tr') === code,
    );
  };

  // Bilinmeyen hatada ham cevap yazılır, sorunun kaynağı doğrudan görünür
  const showSubmitError = (error: unknown) => {
    const detail = getErrorDetail(error);
    const detailText =
      detail === null
        ? undefined
        : detail === ''
          ? t('stock.create.emptyResponse')
          : t('stock.create.errorCode', { code: detail });

    Alert.alert(t(getErrorMessageKey(error)), detailText);
  };

  const submit = form.handleSubmit(
    (values) => {
      if (isDuplicate(values)) {
        form.setError('modelCode', { message: 'stock.create.errors.duplicate' }, { shouldFocus: true });
        setStepIndex(VARIANTS_STEP_INDEX);
        Alert.alert(t('stock.create.errors.duplicate'));
        return;
      }

      createProduct.mutate(values, {
        onSuccess: () => {
          Alert.alert(t('stock.create.queued'));
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
      Alert.alert(t('stock.create.invalid'));
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
          <Text style={styles.requiredNote}>{t('stock.create.requiredNote')}</Text>
          {step === 'info' ? <ProductInfoStep /> : null}
          {step === 'price' ? <ProductPriceStep /> : null}
          {step === 'variants' ? <ProductVariantsStep /> : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
          {stepIndex > 0 ? (
            <Button
              label={t('stock.create.back')}
              variant="secondary"
              disabled={createProduct.isPending}
              onPress={() => setStepIndex(stepIndex - 1)}
              style={styles.footerButton}
            />
          ) : null}
          <Button
            label={isLastStep ? t('stock.create.submit') : t('stock.create.next')}
            loading={createProduct.isPending}
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
    // Not ilk bölüme yakın dursun; içerik aralığının yarısı geri alınır
    requiredNote: {
      ...typography.caption,
      marginBottom: -SPACING.sm,
      color: colors.textSecondary,
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
