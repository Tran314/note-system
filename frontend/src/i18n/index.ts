import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import zh from './zh.json';

// 获取存储的语言设置
const savedLanguage = localStorage.getItem('nebula-language') || 'zh';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: savedLanguage,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
  });

// 语言切换函数
export const changeLanguage = (lang: 'en' | 'zh') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('nebula-language', lang);
};

// 获取当前语言
export const getCurrentLanguage = (): 'en' | 'zh' => {
  return (i18n.language as 'en' | 'zh') || 'zh';
};

export default i18n;