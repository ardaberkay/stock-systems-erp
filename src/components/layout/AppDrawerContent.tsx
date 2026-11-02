import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { router } from 'expo-router';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import LogOut from 'lucide-react-native/icons/log-out';
import Settings from 'lucide-react-native/icons/settings';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function AppDrawerContent(props: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const openSettings = () => {
    props.navigation.closeDrawer();
    router.push('/settings');
  };

  const confirmLogout = () => {
    Alert.alert(t('auth.logoutConfirmTitle'), t('auth.logoutConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        // Oturum yapısı (authStore + secure-store) henüz yok; eklenince burada
        // token silinip giriş ekranına yönlendirilecek.
        onPress: () => props.navigation.closeDrawer(),
      },
    ]);
  };

  return (
    <View style={styles.panel}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.content}>
        <View style={styles.menu}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('drawer.settings')}
            onPress={openSettings}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Settings size={ICON_SIZE.md} color={colors.icon} />
            <Text style={styles.itemLabel}>{t('drawer.settings')}</Text>
            <ChevronRight size={ICON_SIZE.md} color={colors.icon} />
          </Pressable>
        </View>

        {/* Çıkış butonu menünün en altında durur */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('auth.logout')}
          onPress={confirmLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
        >
          <LogOut size={ICON_SIZE.md} color={colors.error} />
          <Text style={styles.logoutLabel}>{t('auth.logout')}</Text>
        </Pressable>
      </DrawerContentScrollView>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    // Köşelerin arkasını drawer'ın zemini doldurur (bkz. src/app/(drawer)/_layout.tsx)
    panel: {
      flex: 1,
      overflow: 'hidden',
      borderTopRightRadius: RADIUS.xl,
      borderBottomRightRadius: RADIUS.xl,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xl,
    },
    menu: {
      gap: SPACING.xs,
    },
    item: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
    },
    itemPressed: {
      backgroundColor: colors.chipInactive,
    },
    itemLabel: {
      ...typography.body,
      flex: 1,
      color: colors.text,
    },
    logoutButton: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: colors.errorBackground,
    },
    logoutButtonPressed: {
      opacity: 0.7,
    },
    logoutLabel: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.error,
    },
  });
}
