import AffiliateEditHeaderButton from '@/features/affiliates/components/edit/AffiliateEditHeaderButton';
import OrderEditHeaderButton from '@/features/orders/components/edit/OrderEditHeaderButton';
import ProductEditHeaderButton from '@/features/products/components/edit/ProductEditHeaderButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useStoresHydrated } from '@/hooks/useStoresHydrated';
import '@/i18n';
import { queryClient } from '@/lib/queryClient';
import { navigationThemes } from '@/theme/navigationTheme';
import { RADIUS } from '@/theme/spacing';
import { FONT_FAMILY } from '@/theme/typography';
import {
  Inter_400Regular,
  Inter_400Regular_Italic,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { PanelUIProvider } from 'panelui-native/provider';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Appearance } from 'react-native';
import '../global.css';

// Fontlar ve kayıtlı tercihler yüklenene kadar splash ekranı açık kalır.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_400Regular_Italic,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const storesHydrated = useStoresHydrated();
  const { t } = useTranslation();
  const { mode, isDark, colors } = useAppTheme();
  const ready = fontsLoaded && storesHydrated;

  // Native bileşenler (sekme çubuğu, picker'lar) uygulamanın seçili temasını kullansın.
  useEffect(() => {
    Appearance.setColorScheme(mode);
  }, [mode]);

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  // Drawer'ın üstüne itilen sayfalar: sekme çubuğu gizlenir, native geri butonu gelir
  const pushedScreenOptions = {
    headerShown: true,
    headerBackButtonDisplayMode: 'minimal',
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: { fontFamily: FONT_FAMILY.semiBold },
  } as const;

  // Yüksekliği içeriğe göre ayarlanan alttan açılan sheet'ler
  const fitToContentSheetOptions = {
    presentation: 'formSheet',
    sheetAllowedDetents: 'fitToContents',
    sheetGrabberVisible: true,
    sheetCornerRadius: RADIUS.xxl,
    contentStyle: { backgroundColor: colors.surface },
  } as const;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationThemes[mode]}>
        <PanelUIProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(drawer)" />

            {/* (pages): drawer'ın üstüne itilen sayfalar */}
            <Stack.Screen
              name="(pages)/settings"
              options={{ ...pushedScreenOptions, title: t('settings.title') }}
            />
            {/* App bar, sayfadaki yeşil başlıkla tek parça görünsün diye gradyanın başlangıç tonunda */}
            <Stack.Screen
              name="(pages)/order-detail/[id]"
              options={{
                ...pushedScreenOptions,
                headerStyle: { backgroundColor: colors.orderHeaderStart },
                headerTintColor: colors.onHeader,
                title: t('orders.detailTitle'),
                headerRight: () => <OrderEditHeaderButton />,
              }}
            />
            <Stack.Screen
              name="(pages)/order-new"
              options={{ ...pushedScreenOptions, title: t('orders.newTitle') }}
            />
            <Stack.Screen
              name="(pages)/product-new"
              options={{ ...pushedScreenOptions, title: t('stock.create.title') }}
            />
            {/* App bar, sayfadaki mor başlıkla tek parça görünsün diye gradyanın başlangıç tonunda */}
            <Stack.Screen
              name="(pages)/product-detail/[id]"
              options={{
                ...pushedScreenOptions,
                headerStyle: { backgroundColor: colors.productHeaderStart },
                headerTintColor: colors.onHeader,
                title: t('stock.detail.title'),
                headerRight: () => <ProductEditHeaderButton />,
              }}
            />
            {/* Tip, marka, renk ve kategori listeleri; başlığı ekran kendisi verir */}
            <Stack.Screen name="(pages)/catalog/[kind]" options={pushedScreenOptions} />
            <Stack.Screen
              name="(pages)/affiliates"
              options={{ ...pushedScreenOptions, title: t('affiliates.title') }}
            />
            <Stack.Screen
              name="(pages)/affiliate-detail/[id]"
              options={{
                ...pushedScreenOptions,
                title: t('affiliates.detail.title'),
                headerRight: () => <AffiliateEditHeaderButton />,
              }}
            />
            <Stack.Screen
              name="(pages)/affiliate-orders/[id]"
              // Ekran açılınca başlığı ortağın butik adı yapar; o zamana kadar genel ad görünür
              options={{ ...pushedScreenOptions, title: t('affiliates.detail.title') }}
            />
            <Stack.Screen
              name="(pages)/report-detail/[id]"
              options={{ ...pushedScreenOptions, title: t('reports.title') }}
            />
            <Stack.Screen
              name="(pages)/report-customer/[phone]"
              options={{ ...pushedScreenOptions, title: t('reports.customers.history') }}
            />

            {/* (sheets): native alttan açılan sheet'ler. iOS'ta UISheetPresentationController,
                Android'de Material bottom sheet. Yükseklik içeriğe göre ayarlanır. */}
            {/* Dashboard, siparişler ve raporlar aynı dönem sheet'ini kullanır (scope parametresi) */}
            <Stack.Screen name="(sheets)/period/[scope]" options={fitToContentSheetOptions} />
            <Stack.Screen
              name="(sheets)/period-custom/[scope]"
              options={fitToContentSheetOptions}
            />
            <Stack.Screen name="(sheets)/product-catalog" options={fitToContentSheetOptions} />
            <Stack.Screen name="(sheets)/catalog-form/[kind]" options={fitToContentSheetOptions} />
            {/* Kategori formu uzun ve açıklama alanı var; içerik kadar değil sabit yükseklikte
                açılır, içi kaydırılır ve klavye alt alanları kapatmaz */}
            <Stack.Screen
              name="(sheets)/category-form"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.9] }}
            />
            {/* Marka ve tip listesi uzun olabildiği için içeriğe göre değil, sabit yükseklikte açılır */}
            <Stack.Screen
              name="(sheets)/product-filters"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.8] }}
            />
            <Stack.Screen name="(sheets)/affiliate-filters" options={fitToContentSheetOptions} />
            <Stack.Screen
              name="(sheets)/order-filters"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.8] }}
            />
            <Stack.Screen
              name="(sheets)/order-actions"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.65] }}
            />
            {/* Formlardaki seçim alanları: kısa listeler içerik kadar, aramalı uzun listeler
                neredeyse tam boy, ürün seçme tam boy açılır */}
            <Stack.Screen name="(sheets)/picker" options={fitToContentSheetOptions} />
            <Stack.Screen
              name="(sheets)/picker-search"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.9] }}
            />
            <Stack.Screen
              name="(sheets)/picker-multi"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.9] }}
            />
            <Stack.Screen
              name="(sheets)/product-picker"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [1] }}
            />

            {/* (modals): tam ekran modallar */}
            <Stack.Screen
              name="(modals)/product-images"
              options={{ presentation: 'fullScreenModal', animation: 'fade' }}
            />
            {/* Barkod okutma: ürün seçme sheet'inin üstünden de açılır; sheet üstüne sheet yerine
                tam ekran açılır, kamera da daha geniş alan kullanır */}
            <Stack.Screen
              name="(modals)/barcode-scan"
              options={{ presentation: 'fullScreenModal' }}
            />
          </Stack>
        </PanelUIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
