import FieldLabel from '@/components/ui/form/FieldLabel';
import { SPACING } from '@/theme/spacing';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

// stacked: etiket üstte, alan altında (varsayılan). inline: etiket solda, alan sağda; detayın
// okuma halindeki satırlarla aynı düzen, mod değişince alanlar yerinden oynamaz. Kutu içindeki
// metin sola yaslıdır (yazma ve kaydırma doğal çalışır); yalnızca tutarlar sağa yaslı.
export type FieldLayout = 'stacked' | 'inline';

type FormFieldLayoutProps = {
  label: string;
  required?: boolean;
  layout?: FieldLayout;
  // Alanın altındaki hata veya ipucu; yan yana düzende de satırın altında tam genişlikte
  message?: ReactNode;
  children: ReactNode;
};

// Form alanlarının etiket + alan + mesaj yerleşimi (TextField, PickerField)
export default function FormFieldLayout({
  label,
  required = false,
  layout = 'stacked',
  message,
  children,
}: FormFieldLayoutProps) {
  return (
    <View style={styles.field}>
      {layout === 'inline' ? (
        // Oran her satırda aynı (etiket 1, alan 2 pay): alanlar alt alta aynı hizadan başlar.
        // Etiketler kısa (en uzunu "Piyasa fiyatı"); büyük yazıda kendi payında alt satıra iner.
        <View style={styles.inlineRow}>
          <View style={styles.inlineLabel}>
            <FieldLabel label={label} required={required} />
          </View>
          <View style={styles.inlineControl}>{children}</View>
        </View>
      ) : (
        <>
          <FieldLabel label={label} required={required} />
          {children}
        </>
      )}
      {message}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: SPACING.xs,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  inlineLabel: {
    flex: 1,
    minWidth: 0,
  },
  inlineControl: {
    flex: 2,
    minWidth: 0,
  },
});
