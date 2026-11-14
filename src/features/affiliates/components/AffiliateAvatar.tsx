import Text from '@/components/ui/Text';
import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, typography } from '@/theme/typography';
import User from 'lucide-react-native/icons/user';
import { StyleSheet, View } from 'react-native';

type AffiliateAvatarProps = {
  id: number;
  initials: string;
  isPassive: boolean;
  size: number;
  // Detay sayfasındaki büyük avatar daha büyük harf kullanır
  large?: boolean;
  colors: AppColors;
};

// Her ortak id'sine göre hep aynı renkte görünür; liste yenilense de renk değişmez.
function getPalette(colors: AppColors, id: number) {
  const palette = [
    { background: colors.orangeLight, text: colors.orange },
    { background: colors.purpleLight, text: colors.purple },
    { background: colors.greenLight, text: colors.green },
    { background: colors.blueLight, text: colors.blue },
    { background: colors.cyanLight, text: colors.cyan },
    { background: colors.pinkLight, text: colors.pink },
    { background: colors.yellowLight, text: colors.yellow },
    { background: colors.brownLight, text: colors.brown },
  ];
  return palette[Math.abs(id) % palette.length];
}

export default function AffiliateAvatar({
  id,
  initials,
  isPassive,
  size,
  large = false,
  colors,
}: AffiliateAvatarProps) {
  // Pasif ortak gri görünür; renk aktifliği de bir bakışta anlatır
  const palette = isPassive
    ? { background: colors.divider, text: colors.textSecondary }
    : getPalette(colors, id);

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.background },
      ]}
    >
      {initials ? (
        <Text
          style={[large ? styles.largeText : styles.text, { color: palette.text }]}
          numberOfLines={1}
        >
          {initials}
        </Text>
      ) : (
        <User size={size / 2} color={palette.text} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    ...typography.label,
    fontFamily: FONT_FAMILY.semiBold,
  },
  largeText: {
    ...typography.h2,
  },
});
