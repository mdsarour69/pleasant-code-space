import { useTranslationStore } from "@/lib/translations/store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTranslations, submitOrder } from "@/lib/data.functions";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

interface OrderModalProps {
  packageId: string;
  packageName: string;
  onClose: () => void;
}

export function OrderModal({ packageId, packageName, onClose }: OrderModalProps) {
  const { currentLang, _hasHydrated } = useTranslationStore();
  const activeLang = _hasHydrated ? currentLang : 'bn';
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: t } = useSuspenseQuery({
    queryKey: ['translations', activeLang],
    queryFn: () => getTranslations({ data: { lang: activeLang } }),
  });

  const orderFn = useServerFn(submitOrder);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await orderFn({
        data: {
          package_id: packageId,
          customer_name: name,
          phone: phone,
          note: note || undefined
        }
      });
      toast.success(t['submit_order'] + " successful!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-5 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="modal-box relative w-full max-w-[420px] p-[26px] border border-[#703b67] rounded-[24px] bg-[#171323] shadow-2xl">
        <button className="x absolute right-4 top-2.5 bg-none border-0 text-white text-[25px] cursor-pointer" onClick={onClose}>×</button>
        <h3 className="text-xl font-bold text-white mb-1">{t['order_title']}</h3>
        <p className="text-[#ff4a9b] text-sm mb-5 font-semibold">{packageName}</p>
        
        <form onSubmit={handleSubmit}>
          <input 
            className="w-full my-[7px] p-3 rounded-[12px] border border-[#3e354f] bg-[#0e0c17] text-white focus:border-[#ff3b9d] outline-none transition-colors"
            placeholder={t['your_name']}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            className="w-full my-[7px] p-3 rounded-[12px] border border-[#3e354f] bg-[#0e0c17] text-white focus:border-[#ff3b9d] outline-none transition-colors"
            placeholder={t['phone']}
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <textarea 
            className="w-full my-[7px] p-3 rounded-[12px] border border-[#3e354f] bg-[#0e0c17] text-white min-h-[90px] focus:border-[#ff3b9d] outline-none transition-colors"
            placeholder={t['note']}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isSubmitting}
            className="gradient-btn wide w-full mt-2.5 inline-flex items-center justify-center border-0 text-white bg-linear-to-r from-[#ffae30] to-[#ff3b9d] p-[13px] rounded-[28px] font-extrabold cursor-pointer shadow-[0_8px_24px_rgba(255,57,151,0.25)] hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "..." : t['submit_order']}
          </button>
        </form>
      </div>
    </div>
  );
}
