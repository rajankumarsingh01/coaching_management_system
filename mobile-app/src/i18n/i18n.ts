import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

const initI18n = async () => {
  const storedLang = await SecureStore.getItemAsync('appLanguage');

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: storedLang || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
};

export const changeLanguage = async (lang: 'en' | 'hi') => {
  await i18n.changeLanguage(lang);
  await SecureStore.setItemAsync('appLanguage', lang);
};

export { initI18n };
export default i18n;