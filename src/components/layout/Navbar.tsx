import { useTranslationStore, Language } from "@/lib/translations/store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTranslations } from "@/lib/data.functions";
import { useEffect } from "react";

const languages = [
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' }
];

export function Navbar() {
  const { currentLang, setLanguage } = useTranslationStore();
  
  const { data: t } = useSuspenseQuery({
    queryKey: ['translations', currentLang],
    queryFn: () => getTranslations({ lang: currentLang }),
  });

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  }, [currentLang]);

  return (
    <header className="nav sticky top-0 z-20 flex items-center gap-7 px-5 py-3 border-b border-[#312747] bg-[rgba(12,9,30,0.86)] backdrop-blur-[14px]">
      <div className="brand flex items-center gap-2.5 min-w-[190px]">
        <span className="brand-mark font-black text-2xl">IF</span>
        <div>
          <b className="block">{t['brand']}</b>
          <small className="block text-[8px] tracking-[2px] text-[#9992aa]">{t['brand_sub']}</small>
        </div>
      </div>
      
      <nav className="hidden md:flex gap-[22px] text-[13px] text-[#bcb5cb] flex-1">
        <a href="#services">{t['nav_services']}</a>
        <a href="#packages">{t['nav_packages']}</a>
        <a href="#trial">{t['nav_trial']}</a>
      </nav>
      
      <div className="nav-actions flex items-center gap-2 ml-auto">
        <a className="pill hidden sm:block px-3 py-2 border border-[#284b76] rounded-[18px] bg-[#11193a] text-[11px]" href="#packages">
          ◷ {t['nav_offer']}
        </a>
        <a className="pill hidden md:block px-3 py-2 border border-[#284b76] rounded-[18px] bg-[#11193a] text-[11px]" href="#trial">
          ⇩ {t['nav_download']}
        </a>
        <a className="pill px-3 py-2 border border-[#284b76] rounded-[18px] bg-[#11193a] text-[11px]" href={t['whatsapp_url']}>
          ☏ {t['nav_help']}
        </a>
        
        <label className="language-select flex items-center gap-1.5 px-2 py-1.5 border border-[#3a3150] rounded-[18px] bg-[#111022] text-white">
          <span className="text-xs">🌐</span>
          <select 
            className="bg-transparent border-0 outline-none text-[10px] cursor-pointer"
            value={currentLang}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[#171525] text-white">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
