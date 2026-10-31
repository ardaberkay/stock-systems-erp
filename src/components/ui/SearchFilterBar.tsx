import SearchBar from '@/components/ui/SearchBar';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type SearchFilterBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  filterLabel: string;
  isFilterActive: boolean;
  onFilterPress: () => void;
};

// Arama kutusu ve filtre butonu; aranan şey ekrana göre değişir, görünüm aynı kalır.
export default function SearchFilterBar({
  value,
  onChangeText,
  placeholder,
  filterLabel,
  isFilterActive,
  onFilterPress,
}: SearchFilterBarProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <SearchBar value={value} onChangeText={onChangeText} placeholder={placeholder} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={filterLabel}
        accessibilityState={{ selected: isFilterActive }}
        onPress={onFilterPress}
        style={[styles.filterButton, isFilterActive && styles.filterButtonActive]}
      >
        <SlidersHorizontal
          size={ICON_SIZE.md}
          color={isFilterActive ? colors.orange : colors.text}
        />
      </Pressable>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    filterButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    // Bildirim noktası gibi okunmasın diye aktif filtre butonun kendisinde gösterilir
    filterButtonActive: {
      borderColor: colors.orange,
      backgroundColor: colors.orangeLight,
    },
  });
}
