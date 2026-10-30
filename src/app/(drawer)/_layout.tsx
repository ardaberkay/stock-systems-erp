import AppDrawerContent from '@/components/layout/AppDrawerContent';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Drawer } from 'expo-router/drawer';

// drawerType verilmez: platform varsayılanı iOS'ta 'slide' (ekranı iter), Android'de 'front'.
export default function DrawerLayout() {
  const { colors } = useAppTheme();

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: colors.background },
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
