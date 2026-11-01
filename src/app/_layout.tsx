import { useAppTheme } from '@/hooks/useAppTheme';
import { useStoresHydrated } from '@/hooks/useStoresHydrated';
import '@/i18n';
import { queryClient } from '@/lib/queryClient';
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
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { PanelUIProvider } from 'panelui-native';
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
            options={{ ...pushedScreenOptions, title: t('orders.detailTitle') }}
          />
          <Stack.Screen
            name="order-edit/[id]"
            options={{ ...pushedScreenOptions, title: t('orders.editTitle') }}
          />
          <Stack.Screen
            name="order-new"
            options={{ ...pushedScreenOptions, title: t('orders.newTitle') }}
          />
          {/* Native alttan açılan sheet'ler: iOS'ta UISheetPresentationController,
              Android'de Material bottom sheet. Yükseklik içeriğe göre ayarlanır. */}
          <Stack.Screen name="period-select" options={fitToContentSheetOptions} />
          <Stack.Screen name="period-custom" options={fitToContentSheetOptions} />
          <Stack.Screen name="order-period" options={fitToContentSheetOptions} />
          <Stack.Screen name="order-period-custom" options={fitToContentSheetOptions} />
          <Stack.Screen name="product-catalog" options={fitToContentSheetOptions} />
          <Stack.Screen
            name="product-images"
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
          {/* Marka ve tip listesi uzun olabildiği için içeriğe göre değil, sabit yükseklikte açılır */}
          <Stack.Screen
            name="product-filters"
            options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.8] }}
          />
          <Stack.Screen
            name="order-filters"
            options={{ ...fitToContentSheetOptions, sheetAllowedDetents: [0.8] }}
          />
        </Stack>
      </PanelUIProvider>
    </QueryClientProvider>
  );
}
