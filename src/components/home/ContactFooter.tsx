import { useTranslationStore } from "@/lib/translations/store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTranslations } from "@/lib/data.functions";
import { AdminAccess } from "@/components/layout/AdminAccess";

export function ContactSection() {
  const { currentLang, _hasHydrated } = useTranslationStore();
  const activeLang = _hasHydrated ? currentLang : 'bn';
  
  const { data: t } = useSuspenseQuery({
    queryKey: ['translations', activeLang],
    queryFn: () => getTranslations({ data: { lang: activeLang } }),
  });

  return (
    <section className="contact max-w-[900px] mx-auto my-[50px] p-[28px] text-center border border-[#3b354c] rounded-[20px] bg-[#161322]">
      <h3 className="text-xl font-bold text-white mb-2">{t['support_text']}</h3>
      <p className="text-[#aaa] mb-6">{t['contact_desc']}</p>
      <a 
        className="gradient-btn inline-flex items-center justify-center border-0 text-white bg-linear-to-r from-[#ffae30] to-[#ff3b9d] px-6 py-[13px] rounded-[28px] font-extrabold cursor-pointer shadow-[0_8px_24px_rgba(255,57,151,0.25)] hover:scale-105 transition-transform" 
        href={t['whatsapp_url']}
      >
        {t['whatsapp']}
      </a>
    </section>
  );
}

export function Footer() {
  const { currentLang, _hasHydrated } = useTranslationStore();
  const activeLang = _hasHydrated ? currentLang : 'bn';
  
  const { data: t } = useSuspenseQuery({
    queryKey: ['translations', activeLang],
    queryFn: () => getTranslations({ data: { lang: activeLang } }),
  });

  return (
    <footer className="text-center text-[#777] p-[30px] border-t border-[#312747]/30">
      <div>{t['footer']}</div>
      <AdminAccess />
    </footer>
  );
}

export function FloatingSupport() {
  const { currentLang, _hasHydrated } = useTranslationStore();
  const activeLang = _hasHydrated ? currentLang : 'bn';
  
  const { data: t } = useSuspenseQuery({
    queryKey: ['translations', activeLang],
    queryFn: () => getTranslations({ data: { lang: activeLang } }),
  });

  return (
    <div className="float-support fixed left-0 right-0 bottom-4 px-4 flex justify-center gap-2 z-30 md:left-auto md:right-4 md:px-0">
      <a 
        href={t['whatsapp_url']}
        className="bg-[#13251a] border border-[#2d8151] rounded-[18px] px-[13px] py-[9px] text-[10px] text-white flex items-center gap-1.5 hover:bg-[#1a3324] transition-colors"
      >
        <span className="text-[8px]">🟢</span> {t['support_whatsapp']}
      </a>
      <a 
        href={`mailto:${t['email']}`}
        className="bg-[#13251a] border border-[#2d8151] rounded-[18px] px-[13px] py-[9px] text-[10px] text-white flex items-center gap-1.5 hover:bg-[#1a3324] transition-colors"
      >
        <span className="text-[8px]">🔴</span> {t['support_email']}
      </a>
    </div>
  );
}
