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

  return (
    <QueryClientProvider client={queryClient}>
      <PanelUIProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
          {/* Drawer'ın üstüne itilir: sekme çubuğu gizlenir, native geri butonu gelir */}
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              title: t('settings.title'),
              headerBackButtonDisplayMode: 'minimal',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerTitleStyle: { fontFamily: FONT_FAMILY.semiBold },
            }}
          />
          {/* Native alttan açılan sheet'ler: iOS'ta UISheetPresentationController,
              Android'de Material bottom sheet. Yükseklik içeriğe göre ayarlanır. */}
          <Stack.Screen
            name="period-select"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: 'fitToContents',
              sheetGrabberVisible: true,
              sheetCornerRadius: RADIUS.xxl,
              contentStyle: { backgroundColor: colors.surface },
            }}
          />
          <Stack.Screen
            name="period-custom"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: 'fitToContents',
              sheetGrabberVisible: true,
              sheetCornerRadius: RADIUS.xxl,
              contentStyle: { backgroundColor: colors.surface },
            }}
          />
          <Stack.Screen
            name="product-catalog"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: 'fitToContents',
              sheetGrabberVisible: true,
              sheetCornerRadius: RADIUS.xxl,
              contentStyle: { backgroundColor: colors.surface },
            }}
          />
          <Stack.Screen
            name="product-images"
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
          {/* Marka ve tip listesi uzun olabildiği için içeriğe göre değil, sabit yükseklikte açılır */}
          <Stack.Screen
            name="product-filters"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.8],
              sheetGrabberVisible: true,
              sheetCornerRadius: RADIUS.xxl,
              contentStyle: { backgroundColor: colors.surface },
            }}
          />
        </Stack>
      </PanelUIProvider>
    </QueryClientProvider>
  );
}
