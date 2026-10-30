import {
  DEFAULT_LANGUAGE,
  isAppLanguage,
  SUPPORTED_LANGUAGES,
  type AppLanguage,
} from '@/constants/languages';
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import tr from './locales/tr.json';

// İlk açılışta cihaz dili desteklenen dillerden biriyse onu, değilse varsayılanı kullanır.
export function getDeviceLanguage(): AppLanguage {
  const languageCode = getLocales()[0]?.languageCode;
  return isAppLanguage(languageCode) ? languageCode : DEFAULT_LANGUAGE;
}

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: getDeviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
