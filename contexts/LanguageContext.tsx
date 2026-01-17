import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { saveLanguagePreference } from '../i18n';

export type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  lockedLanguage: Language | null; // 生成报告时锁定的语言
  lockLanguage: () => void; // 锁定当前语言
  unlockLanguage: () => void; // 解锁语言
  canSwitchLanguage: boolean; // 是否可以切换语言
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>((i18n.language as Language) || 'zh');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lockedLanguage, setLockedLanguage] = useState<Language | null>(null);

  // 同步 i18n 语言状态
  useEffect(() => {
    const currentLang = i18n.language?.startsWith('zh') ? 'zh' : (i18n.language === 'en' ? 'en' : 'zh');
    setLanguageState(currentLang as Language);
  }, [i18n.language]);

  const setLanguage = useCallback((lang: Language) => {
    // 如果正在生成报告，不允许切换语言
    if (isGenerating || lockedLanguage) {
      console.warn('Cannot switch language while generating report');
      return;
    }

    setLanguageState(lang);
    i18n.changeLanguage(lang);
    saveLanguagePreference(lang);
  }, [i18n, isGenerating, lockedLanguage]);

  const lockLanguage = useCallback(() => {
    setLockedLanguage(language);
    setIsGenerating(true);
  }, [language]);

  const unlockLanguage = useCallback(() => {
    setLockedLanguage(null);
    setIsGenerating(false);
  }, []);

  const canSwitchLanguage = !isGenerating && !lockedLanguage;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isGenerating,
        setIsGenerating,
        lockedLanguage,
        lockLanguage,
        unlockLanguage,
        canSwitchLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
