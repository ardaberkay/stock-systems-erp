import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import X from 'lucide-react-native/icons/x';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

const CLOSE_HIT_SLOP = (MIN_TOUCH_SIZE - ICON_SIZE.md) / 2;

// Form içinden açılan seçim penceresi. Rota yerine Modal: seçim doğrudan formun state'ine yazılır.
// iOS'ta sayfa kartı olarak, Android'de tam ekran açılır.
export default function SheetModal({ visible, title, onClose, children }: SheetModalProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  // iOS sayfa kartı üst çentiğin altından başlar; Android'de tam ekran olduğu için pay gerekir
  const topInset = Platform.OS === 'ios' ? 0 : insets.top;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { paddingTop: topInset, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            hitSlop={CLOSE_HIT_SLOP}
            onPress={onClose}
          >
            <X size={ICON_SIZE.md} color={colors.icon} />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    sheet: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      minHeight: MIN_TOUCH_SIZE + SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
      paddingHorizontal: SPACING.xl,
    },
    title: {
      ...typography.h3,
      flex: 1,
      color: colors.text,
    },
  });
}
