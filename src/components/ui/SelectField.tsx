import AnimatedChevron from '@/components/ui/AnimatedChevron';
import Checkbox from '@/components/ui/Checkbox';
import Collapsible from '@/components/ui/Collapsible';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import Check from 'lucide-react-native/icons/check';
import { useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type SelectOption = {
  value: string;
  label: string;
  // Satırda düz metin yerine gösterilir (ör. durum rozeti)
  content?: ReactNode;
};

type SelectFieldProps = {
  label: string;
  // Dizi verilirse çoklu seçim olur: satırlarda onay kutusu çıkar
  value: string | string[];
  options: SelectOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  // Hiçbir seçenek seçili değilken satırda görünür
  emptyLabel?: string;
};

function getSummary(selected: SelectOption[], emptyLabel: string | undefined) {
  if (selected.length === 0) {
    return emptyLabel;
  }
  return selected.length === 1 ? selected[0].label : `${selected[0].label} +${selected.length - 1}`;
}

// Uzun seçenek listelerini kapalı tutar; satıra basınca alt alta açılır.
export default function SelectField({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  emptyLabel,
}: SelectFieldProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isMultiple = Array.isArray(value);
  const selectedValues = isMultiple ? value : [value];
  const summary = getSummary(
    options.filter((option) => selectedValues.includes(option.value)),
    emptyLabel,
  );

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: isOpen }}
        accessibilityValue={{ text: summary }}
        onPress={onToggle}
        style={styles.row}
      >
        <Text style={styles.label}>{label}</Text>

        <View style={styles.value}>
          <Text style={styles.valueText} numberOfLines={1}>
            {summary}
          </Text>
          <AnimatedChevron expanded={isOpen} color={colors.icon} />
        </View>
      </Pressable>

      <Collapsible expanded={isOpen}>
        <View style={styles.options}>
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);

            return (
              <Pressable
                key={option.value}
                accessibilityRole={isMultiple ? 'checkbox' : 'radio'}
                accessibilityLabel={option.label}
                accessibilityState={{ checked: isSelected }}
                onPress={() => onSelect(option.value)}
                style={styles.option}
              >
                {isMultiple ? <Checkbox checked={isSelected} colors={colors} /> : null}

                <View style={styles.optionContent}>
                  {option.content ?? (
                    <Text
                      style={[styles.optionText, isSelected && styles.optionTextSelected]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                  )}
                </View>

                {!isMultiple && isSelected ? (
                  <Check size={ICON_SIZE.sm} color={colors.iconActive} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Collapsible>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    row: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    label: {
      ...typography.body,
      color: colors.text,
    },
    value: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      flexShrink: 1,
    },
    valueText: {
      ...typography.label,
      color: colors.textSecondary,
      fontFamily: FONT_FAMILY.medium,
      flexShrink: 1,
    },
    options: {
      paddingBottom: SPACING.sm,
    },
    option: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    optionContent: {
      flex: 1,
      alignItems: 'flex-start',
    },
    optionText: {
      ...typography.label,
      color: colors.textSecondary,
    },
    optionTextSelected: {
      color: colors.text,
      fontFamily: FONT_FAMILY.semiBold,
    },
  });
}
