import { useTranslationStore } from "@/lib/translations/store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTranslations, getServices } from "@/lib/data.functions";

export function Hero() {
  const { currentLang, _hasHydrated } = useTranslationStore();
  const activeLang = _hasHydrated ? currentLang : 'bn';
  
  const { data: t } = useSuspenseQuery({
    queryKey: ['translations', activeLang],
    queryFn: () => getTranslations({ data: { lang: activeLang } }),
  });

  const { data: services } = useSuspenseQuery({
    queryKey: ['services', activeLang],
    queryFn: () => getServices({ data: { lang: activeLang } }),
  });

  return (
    <section className="hero max-w-[1100px] mx-auto text-center pt-[72px] pb-6 px-5 sm:pt-[38px]">
      <div className="kicker text-[13px] text-[#c9bfd4] mb-3">
        — &nbsp; {t['hero_kicker']} &nbsp; —
      </div>
      <h1 className="text-[clamp(28px,5vw,54px)] m-0 mb-7 bg-linear-to-r from-[#ffae30] via-[#ff55b7] to-[#51a4ff] bg-clip-text text-transparent font-bold">
        {t['hero_title']}
      </h1>
      
      <div id="services" className="service-grid grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left">
        {services.map((s) => (
          <article 
            key={s.id} 
            className={`service relative h-[182px] border border-[#70317b] rounded-[22px] overflow-hidden bg-[#171323] shadow-[0_16px_40px_rgba(255,25,170,0.13)] group`}
          >
            <div className={`absolute inset-0 h-[120px] opacity-95 transition-opacity ${
              s.gradient === 'purple' ? 'bg-linear-to-br from-[#a54fff] to-[#e51b9a]' :
              s.gradient === 'blue' ? 'bg-linear-to-br from-[#0aa7ed] to-[#5a43ef]' :
              'bg-linear-to-br from-[#ff665d] to-[#ef168f]'
            }`} />
            
            <div className="service-icon absolute top-[30px] left-0 right-0 text-center text-[46px] drop-shadow-[0_0_20px_white]">
              {s.icon}
            </div>
            
            <div className="service-body absolute bottom-0 left-0 right-0 p-[10px_16px]">
              <h3 className="m-0 text-sm font-bold text-white">{s.title}</h3>
              <p className="m-[4px_0] text-[#aaa] text-[9px] line-clamp-2">{s.description}</p>
            </div>
            
            <span className="dot absolute right-3.5 bottom-5 rounded-full bg-[#ff3e91] p-[4px_7px] text-[10px] text-white">
              ✓
            </span>
          </article>
        ))}
      </div>
      
      <div className="auth-badge inline-block mt-9 mb-3 mx-auto border border-[#44364f] bg-[#181526] p-[6px_14px] rounded-[20px] text-[10px] tracking-[2px] text-[#aaa] uppercase">
        ● {t['authorized']}
      </div>
      <h2 className="text-[clamp(28px,5vw,44px)] m-[8px_0] font-bold text-white">
        {t['main_title']}
      </h2>
      <p className="lead text-[#a8a2b7] text-sm max-w-[700px] mx-auto mb-5">
        {t['main_desc']}
      </p>
      
      <a 
        className="gradient-btn inline-flex items-center justify-center border-0 text-white bg-linear-to-r from-[#ffae30] to-[#ff3b9d] px-6 py-[13px] rounded-[28px] font-extrabold cursor-pointer shadow-[0_8px_24px_rgba(255,57,151,0.25)] hover:scale-105 transition-transform" 
        href="#packages"
      >
        {t['cta_text']} →
      </a>
    </section>
  );
}
