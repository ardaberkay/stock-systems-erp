import TextField from '@/components/forms/TextField';
import { useLocale } from '@/hooks/useLocale';
import { formatMoneyInput, parseMoneyInput } from '@/utils/formatter';

type MoneyFieldProps = {
  label: string;
  // Ham değer: "1500.5" (nokta kuruş ayırıcısı, binlik yok)
  value: string;
  onChangeText: (raw: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
};

// Tutar alanı: yazarken binlik ayırıcı eklenir ("1500" → "1.500"). Form ham değeri tutar,
// gönderimde sayıya çevrilir (bkz. parseMoney).
export default function MoneyField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  hint,
  placeholder,
  required,
}: MoneyFieldProps) {
  const locale = useLocale();

  // "1500," yazıp bırakınca sondaki ayırıcı atılır; yarım tutar hata vermesin
  const handleBlur = () => {
    if (value.endsWith('.')) {
      onChangeText(value.slice(0, -1));
    }
    onBlur?.();
  };

  return (
    <TextField
      label={label}
      value={formatMoneyInput(value, locale)}
      onChangeText={(text) => onChangeText(parseMoneyInput(text, value, locale))}
      onBlur={handleBlur}
      keyboardType="decimal-pad"
      error={error}
      hint={hint}
      placeholder={placeholder}
      required={required}
    />
  );
}
