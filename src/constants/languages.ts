export const SUPPORTED_LANGUAGES = ['tr', 'en'] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'tr';

// Para, sayı ve tarih biçimlendirmede kullanılan Intl locale'leri
export const LANGUAGE_LOCALES: Record<AppLanguage, string> = {
  tr: 'tr-TR',
  en: 'en-US',
};

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return SUPPORTED_LANGUAGES.some((language) => language === value);
}
