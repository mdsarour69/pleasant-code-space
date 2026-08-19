import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'bn' | 'en' | 'ar' | 'fr' | 'pt';

interface TranslationState {
  currentLang: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set) => ({
      currentLang: 'bn',
      dir: 'ltr',
      _hasHydrated: false,
      setLanguage: (lang) => set({ 
        currentLang: lang,
        dir: lang === 'ar' ? 'rtl' : 'ltr'
      }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'itfair-lang-store',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

