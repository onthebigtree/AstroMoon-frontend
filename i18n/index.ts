import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';

// 获取保存的语言偏好
const getSavedLanguage = (): string => {
  const saved = localStorage.getItem('astromoon-language');
  if (saved && ['en', 'zh'].includes(saved)) {
    return saved;
  }
  // 默认中文，除非浏览器语言明确是英文
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) {
    return 'en';
  }
  return 'zh';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

// 保存语言偏好
export const saveLanguagePreference = (lang: string) => {
  localStorage.setItem('astromoon-language', lang);
};
