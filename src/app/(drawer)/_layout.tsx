import AppDrawerContent from '@/components/layout/AppDrawerContent';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RADIUS } from '@/theme/spacing';
import { Drawer } from 'expo-router/drawer';
import { Platform } from 'react-native';

// drawerType verilmez: platform varsayılanı iOS'ta 'slide' (ekranı iter), Android'de 'front'.
export default function DrawerLayout() {
  const { colors } = useAppTheme();

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        // iOS'ta ekran yana itildiği için köşelerin arkası boş kalır; kararan ekranın tonuyla dolar.
        // Android'de drawer ekranın üstüne biner, köşelerin arkasında ekranın kendisi görünür.
        drawerStyle:
          Platform.OS === 'ios'
            ? { backgroundColor: colors.drawerBackdrop }
            : {
                backgroundColor: colors.background,
                borderTopRightRadius: RADIUS.xl,
                borderBottomRightRadius: RADIUS.xl,
              },
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
