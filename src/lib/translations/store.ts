import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'bn' | 'en' | 'ar' | 'fr' | 'pt';

interface TranslationState {
  currentLang: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set) => ({
      currentLang: 'bn',
      dir: 'ltr',
      setLanguage: (lang) => set({ 
        currentLang: lang,
        dir: lang === 'ar' ? 'rtl' : 'ltr'
      }),
    }),
    {
      name: 'itfair-lang-store',
    }
  )
);
