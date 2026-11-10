import { MAX_FONT_SCALE } from '@/theme/typography';
import type { ComponentPropsWithRef } from 'react';
import { Text as NativeText } from 'react-native';

type TextProps = ComponentPropsWithRef<typeof NativeText>;

// Uygulamadaki tüm metinler react-native Text yerine bununla yazılır: telefonun yazı boyutu
// ayarına uyar ama en fazla MAX_FONT_SCALE kat büyür.
export default function Text(props: TextProps) {
  return <NativeText maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />;
}
