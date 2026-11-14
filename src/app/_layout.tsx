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
            <Stack.Screen
              name="settings"
              options={{ ...pushedScreenOptions, title: t('settings.title') }}
            />
            <Stack.Screen
              name="order-detail/[id]"
              options={{
                ...pushedScreenOptions,
                title: t('orders.detailTitle'),
                headerRight: () => <OrderEditHeaderButton />,
              }}
            />
            <Stack.Screen
              name="order-new"
              options={{ ...pushedScreenOptions, title: t('orders.newTitle') }}
            />
            <Stack.Screen
              name="product-new"
              options={{ ...pushedScreenOptions, title: t('stock.create.title') }}
            />
            <Stack.Screen
              name="product-detail/[id]"
              options={{
                ...pushedScreenOptions,
                title: t('stock.detail.title'),
                headerRight: () => <ProductEditHeaderButton />,
              }}
            />
            {/* Tip, marka, renk ve kategori listeleri; başlığı ekran kendisi verir */}
            <Stack.Screen name="catalog/[kind]" options={pushedScreenOptions} />
            <Stack.Screen
              name="affiliates"
              options={{ ...pushedScreenOptions, title: t('affiliates.title') }}
            />
            <Stack.Screen
              name="affiliate-detail/[id]"
              options={{
                ...pushedScreenOptions,
                title: t('affiliates.detail.title'),
                headerRight: () => <AffiliateEditHeaderButton />,
              }}
            />
            <Stack.Screen
              name="report-detail/[id]"
              options={{ ...pushedScreenOptions, title: t('reports.title') }}
            />
            <Stack.Screen
              name="report-customer/[phone]"
              options={{ ...pushedScreenOptions, title: t('reports.customers.history') }}
            />
            {/* Native alttan açılan sheet'ler: iOS'ta UISheetPresentationController,
                Android'de Material bottom sheet. Yükseklik içeriğe göre ayarlanır. */}
            {/* Dashboard, siparişler ve raporlar aynı dönem sheet'ini kullanır (scope parametresi) */}
            <Stack.Screen name="period/[scope]" options={fitToContentSheetOptions} />
            <Stack.Screen name="period-custom/[scope]" options={fitToContentSheetOptions} />
            <Stack.Screen name="product-catalog" options={fitToContentSheetOptions} />
            <Stack.Screen name="catalog-form/[kind]" options={fitToContentSheetOptions} />
            {/* Kategori formu uzun ve açıklama alanı var; içerik kadar değil sabit yükseklikte
                açılır, içi kaydırılır ve klavye alt alanları kapatmaz */}
            <Stack.Screen
              name="category-form"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.9] }}
            />
            <Stack.Screen
              name="product-images"
              options={{ presentation: 'fullScreenModal', animation: 'fade' }}
            />
            {/* Barkod okutma: ürün seçme sheet'inin üstünden de açılır; sheet üstüne sheet yerine
                tam ekran açılır, kamera da daha geniş alan kullanır */}
            <Stack.Screen name="barcode-scan" options={{ presentation: 'fullScreenModal' }} />
            {/* Marka ve tip listesi uzun olabildiği için içeriğe göre değil, sabit yükseklikte açılır */}
            <Stack.Screen
              name="product-filters"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.8] }}
            />
            <Stack.Screen name="affiliate-filters" options={fitToContentSheetOptions} />
            <Stack.Screen
              name="order-filters"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.8] }}
            />
            <Stack.Screen
              name="order-actions"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.65] }}
            />
            {/* Formlardaki seçim alanları: kısa listeler içerik kadar, aramalı uzun listeler
                neredeyse tam boy, ürün seçme tam boy açılır */}
            <Stack.Screen name="picker" options={fitToContentSheetOptions} />
            <Stack.Screen
              name="picker-search"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.9] }}
            />
            <Stack.Screen
              name="picker-multi"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.9] }}
            />
            <Stack.Screen
              name="product-picker"
              options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [1] }}
            />
          </Stack>
        </PanelUIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
