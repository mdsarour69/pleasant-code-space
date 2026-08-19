import { useTranslationStore } from "@/lib/translations/store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTranslations, getPackages } from "@/lib/data.functions";
import { useState } from "react";
import { OrderModal } from "./OrderModal";

export function PricingSection() {
  const { currentLang } = useTranslationStore();
  const [selectedPackage, setSelectedPackage] = useState<{ id: string; name: string } | null>(null);
  
  const { data: t } = useSuspenseQuery({
    queryKey: ['translations', currentLang],
    queryFn: () => getTranslations({ data: { lang: currentLang } }),
  });

  const { data: packages } = useSuspenseQuery({
    queryKey: ['packages', currentLang],
    queryFn: () => getPackages({ data: { lang: currentLang } }),
  });

  const handleOpenOrder = (id: string, name: string) => {
    setSelectedPackage({ id, name });
  };

  return (
    <>
      <section id="packages" className="pricing text-center max-w-[1100px] mx-auto p-5">
        <div className="kicker text-[13px] text-[#c9bfd4] mb-3">
          — &nbsp; {t['pricing_kicker']} &nbsp; —
        </div>
        <h2 className="text-[clamp(28px,5vw,44px)] m-[8px_0] font-bold text-white">
          {t['pricing_title']}
        </h2>
        <p className="text-[#a8a2b7] text-sm max-w-[700px] mx-auto mb-7">
          {t['pricing_desc']}
        </p>
        
        <div className="package-grid grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left mt-7">
          {packages.map((p) => {
            const save = p.old_price && p.old_price > 0 
              ? Math.max(0, Math.round((1 - p.price / p.old_price) * 100)) 
              : 0;

            return (
              <article 
                key={p.id} 
                className="package p-[18px] border border-[#3b354c] border-t-2 border-t-[#d32692] rounded-[18px] bg-linear-to-br from-[#1c1a29] to-[#12101d] shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
              >
                <div className="pkg-top flex justify-between">
                  <span className="text-[8px] bg-[#0d4c65] px-2 py-1 rounded-[8px] text-white uppercase font-bold">
                    {p.type}
                  </span>
                  <b className="text-[8px] bg-[#6a4910] px-2 py-1 rounded-[8px] text-[#ffd16c] uppercase font-bold">
                    {p.badge}
                  </b>
                </div>
                
                <h3 className="m-[16px_0_4px] text-lg font-bold text-white">{p.name}</h3>
                <small className="text-[#aaa] text-[9px] block">◉ {p.duration}</small>
                
                <div className="price text-[28px] font-black m-[20px_0_8px] text-white">
                  ৳ {p.price} {p.old_price && <del className="text-xs text-[#777] ml-2 font-normal">৳{p.old_price}</del>}
                </div>
                
                <div className="save inline-block text-[9px] text-[#ff59a3] bg-[#39142b] border border-[#5c2247] rounded-[8px] px-2 py-1 font-bold">
                  {t['save']} {save}%
                </div>
                
                <button className="dark-btn w-full mt-5 rounded-[18px] p-[11px] border border-[#60494d] bg-[#1b1521] text-white cursor-pointer font-bold hover:bg-[#251d2e] transition-colors">
                  {t['package_details']}
                </button>
                <button 
                  className="gradient-btn wide w-full mt-2.5 inline-flex items-center justify-center border-0 text-white bg-linear-to-r from-[#ffae30] to-[#ff3b9d] p-[13px] rounded-[28px] font-extrabold cursor-pointer shadow-[0_8px_24px_rgba(255,57,151,0.25)] hover:scale-[1.02] transition-transform"
                  onClick={() => handleOpenOrder(p.id, p.name)}
                >
                  {t['buy_now']}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {selectedPackage && (
        <OrderModal 
          packageId={selectedPackage.id}
          packageName={selectedPackage.name}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </>
  );
}
