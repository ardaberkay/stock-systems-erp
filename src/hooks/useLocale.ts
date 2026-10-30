import { LANGUAGE_LOCALES } from '@/constants/languages';
import { useLanguageStore } from '@/stores/languageStore';

// formatter fonksiyonlarına verilecek Intl locale'i ('tr-TR' / 'en-US')
export function useLocale(): string {
  const language = useLanguageStore((state) => state.language);

  return LANGUAGE_LOCALES[language];
}
