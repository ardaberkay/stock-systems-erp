import Text from '@/components/ui/Text';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

// Rozetin renkleri; hepsi tema token'larından gelir
export type BadgePalette = {
  text: string;
  background: string;
  border?: string;
};

// outline: çerçeveli gri (özel durum, popüler beden, pasif ürün). neutral: gri zemin (pasif,
// yakında). onHeader: renkli detay başlığının üstünde saydam beyaz.
export type BadgeTone = 'outline' | 'neutral' | 'success' | 'error' | 'purple' | 'onHeader';

type BadgeProps = {
  label: string;
  // Adla seçilen renk; sipariş durumu gibi kendi rengi olanlar `palette` verir
  tone?: BadgeTone;
  palette?: BadgePalette;
  icon?: ComponentType<{ size?: number; color?: string }>;
  // Solda küçük renkli nokta (ör. satış ortağı aktif/pasif)
  dot?: boolean;
  // Yalnızca kısa bir sayı taşıyan rozet (ör. ürün adedi) biraz daha dar
  compact?: boolean;
  // Dikeyde biraz daha ince (ör. ürün adedi, sipariş kartındaki özel durum)
  slim?: boolean;
  // Uzun, kullanıcının yazdığı metin (ör. özel durum) yer darsa kısalır; varsayılan küçülmez
  shrink?: boolean;
};

const ICON_SIZE_IN_BADGE = ICON_SIZE.sm - SPACING.xxs;
const DOT_SIZE = SPACING.xs + SPACING.xxs;

function getTonePalette(tone: BadgeTone, colors: AppColors): BadgePalette {
  switch (tone) {
    case 'outline':
      return { text: colors.textSecondary, background: colors.background, border: colors.border };
    case 'neutral':
      return { text: colors.textSecondary, background: colors.divider };
    case 'success':
      return { text: colors.success, background: colors.successBackground };
    case 'error':
      return { text: colors.error, background: colors.errorBackground };
    case 'purple':
      return { text: colors.purple, background: colors.purpleLight };
    case 'onHeader':
      return { text: colors.onHeader, background: colors.onHeaderSurface };
  }
}

// Uygulamadaki tüm küçük etiketler (durum, adet, özel durum, aktif/pasif, yakında…) bununla
// çizilir; ölçü ve yazı her yerde aynıdır.
export default function Badge({
  label,
  tone = 'neutral',
  palette,
  icon: Icon,
  dot = false,
  compact = false,
  slim = false,
  shrink = false,
}: BadgeProps) {
  const { colors } = useAppTheme();
  const { text, background, border } = palette ?? getTonePalette(tone, colors);

  return (
    <View
      style={[
        styles.badge,
        compact && styles.compact,
        slim && styles.slim,
        shrink ? styles.shrink : styles.noShrink,
        { backgroundColor: background },
        border ? [styles.bordered, { borderColor: border }] : null,
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: text }]} /> : null}
      {Icon ? <Icon size={ICON_SIZE_IN_BADGE} color={text} /> : null}
      <Text style={[styles.label, { color: text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.sm,
  },
  compact: {
    paddingHorizontal: SPACING.xs + SPACING.xxs,
  },
  // Ölçekteki en küçük boşluğun yarısı (karar 20.11.2026: adet ve özel durum rozeti)
  slim: {
    paddingVertical: SPACING.xxs / 2,
  },
  bordered: {
    borderWidth: 1,
  },
  noShrink: {
    flexShrink: 0,
  },
  shrink: {
    flexShrink: 1,
    minWidth: 0,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: RADIUS.full,
  },
  label: {
    ...typography.caption,
    flexShrink: 1,
    fontFamily: FONT_FAMILY.semiBold,
  },
});
