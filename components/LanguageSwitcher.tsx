import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { language, setLanguage, canSwitchLanguage } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'zh', label: '中文' },
    { code: 'en', label: 'English' },
  ];

  const currentLanguage = languages.find(l => l.code === language);

  const handleLanguageChange = (lang: Language) => {
    if (canSwitchLanguage) {
      setLanguage(lang);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => canSwitchLanguage && setIsOpen(!isOpen)}
        disabled={!canSwitchLanguage}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
          canSwitchLanguage
            ? 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'
            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
        }`}
        title={canSwitchLanguage ? t('language.switch') : t('language.switchDisabled')}
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{currentLanguage?.label}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && canSwitchLanguage && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* 下拉菜单 */}
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  language === lang.code
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
