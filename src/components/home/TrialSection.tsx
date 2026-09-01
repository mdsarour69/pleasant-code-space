import { useTranslationStore } from "@/lib/translations/store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTranslations } from "@/lib/data.functions";

export function TrialSection() {
  const { currentLang, _hasHydrated } = useTranslationStore();
  const activeLang = _hasHydrated ? currentLang : 'bn';
  
  const { data: t } = useSuspenseQuery({
    queryKey: ['translations', activeLang],
    queryFn: () => getTranslations({ data: { lang: activeLang } }),
  });

  const currency = t['currency_symbol'] || '৳';

  return (
    <section id="trial" className="trial-wrap flex justify-center p-[26px_20px_40px]">
      <div className="trial-card w-full max-w-[470px] p-[22px] border border-[#b83c5f] rounded-[28px] bg-linear-to-br from-[#3b211f] to-[#261724] shadow-[0_0_50px_rgba(255,89,47,0.14)]">
        <div className="video-row flex items-center gap-3 p-[10px_14px] border border-[#753b24] rounded-[18px] bg-[#32170e]">
          <span className="play bg-[#ff9d25] rounded-full p-[8px_10px] text-white">▶</span>
          <div className="flex-1">
            <b className="block text-xs text-white">{t['video_title']}</b>
            <small className="block text-[9px] text-[#aaa]">{t['video_desc']}</small>
          </div>
          <span className="text-white">✦</span>
        </div>
        
        <span className="trial-label inline-block mt-[25px] text-[#ff3e91] text-[10px] tracking-[2px] uppercase">
          {t['trial_label']}
        </span>
        <h3 className="text-[27px] m-[8px_0] font-bold text-white">{t['trial_title']}</h3>
        <p className="text-[#a9a2ae] text-[11px] mb-4">{t['trial_desc']}</p>
        
        <div className="trial-cols grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-3.5 border border-[#8e542d] rounded-[16px] bg-[#160e0d]">
            <b className="block text-[13px] text-white">{t['trial_30_text']}</b>
            <small className="block text-[9px] text-[#aaa]">{t['trial_access']}</small>
            <em className="block not-italic text-[#ff4a9b] mt-[5px] font-bold">{currency} {t['trial_30_price']}</em>
          </div>
          <div className="p-3.5 border border-[#8e542d] rounded-[16px] bg-[#160e0d]">
            <b className="block text-[13px] text-white">{t['trial_10_text']}</b>
            <small className="block text-[9px] text-[#aaa]">{t['trial_start']}</small>
            <em className="block not-italic text-[#ff4a9b] mt-[5px] font-bold">{currency} {t['trial_10_price']}</em>
          </div>
        </div>
        
        <a 
          href={t['extension_url']}
          target="_blank"
          rel="noopener noreferrer"
          className="dark-btn w-full mt-2.5 rounded-[18px] p-[11px] border border-[#60494d] bg-[#1b1521] text-white cursor-pointer font-bold hover:bg-[#251d2e] transition-colors text-center inline-block"
        >
          ⇩ {t['download_extension']}
        </a>
        <a 
          href={t['trial_url']}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-btn wide w-full mt-2.5 inline-flex items-center justify-center border-0 text-white bg-linear-to-r from-[#ffae30] to-[#ff3b9d] p-[13px] rounded-[28px] font-extrabold cursor-pointer shadow-[0_8px_24px_rgba(255,57,151,0.25)] hover:scale-[1.02] transition-transform"
        >
          {t['trial_buy']} →
        </a>
        <button className="green-btn wide w-full mt-2.5 rounded-[18px] p-[11px] border border-[#188b49] bg-[#0b2517] text-white cursor-pointer font-bold hover:bg-[#0f3621] transition-colors">
          ◷ {t['trial_free']}
        </button>
        
        <small className="muted block text-center text-[#777] text-[8px] mt-2.5 uppercase tracking-wider">
          {t['no_renew']}
        </small>
      </div>
    </section>
  );
}
