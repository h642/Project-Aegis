import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../i18n/i18n';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'button';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangCode = i18n.language || 'en';
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode || l.code === currentLangCode.split('-')[0]) ||
    SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('aegis_language', code);
    setIsOpen(false);
  };

  if (variant === 'full') {
    return (
      <div id="aegis-language-selector-full" className={`space-y-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">
                {t('settings.language')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t('settings.languageSubtitle')}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
            {currentLang.flag} {currentLang.nativeName}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLang.code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{lang.flag}</span>
                  <div className="text-left truncate">
                    <div className="font-bold text-xs leading-none">{lang.nativeName}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {lang.name}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 text-center font-mono pt-1">
          💡 {t('settings.rememberNote')}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        id="aegis-language-toggle-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
      >
        <Globe className="h-4 w-4 text-indigo-500" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline-block font-semibold">{currentLang.nativeName}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 ltr:right-0 rtl:left-0 rtl:right-auto mt-2 w-64 max-h-80 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 space-y-1 scrollbar-thin">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>{t('settings.selectLanguage')}</span>
              <Sparkles className="h-3 w-3 text-indigo-500" />
            </div>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left rtl:text-right">
                      <div className="font-bold">{lang.nativeName}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {lang.name}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
