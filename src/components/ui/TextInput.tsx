import { MAX_FONT_SCALE } from '@/theme/typography';
import type { ComponentPropsWithRef } from 'react';
import { TextInput as NativeTextInput } from 'react-native';

type TextInputProps = ComponentPropsWithRef<typeof NativeTextInput>;

// Uygulamadaki tüm giriş alanları react-native TextInput yerine bununla yazılır: telefonun
// yazı boyutu ayarına uyar ama en fazla MAX_FONT_SCALE kat büyür.
export default function TextInput(props: TextInputProps) {
  return <NativeTextInput maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />;
}
