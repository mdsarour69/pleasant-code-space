import { supabase } from "@/integrations/supabase/client";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const sanitize = (val: string | null | undefined) => {
  if (typeof val !== 'string') return val || "";
  return val.replace(/\u2063/g, '');
};

export const getTranslations = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ lang: z.string() }).parse(data))
  .handler(async ({ data: { lang } }) => {
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .or(`key.like.${lang}.%,key.like.bn.%,key.not.like.%.%`);

    if (error) throw error;

    // Create a map of translations, with the requested language overriding Bengali defaults
    const translations: Record<string, string> = {};
    
    // First pass: add all Bengali defaults (without the "bn." prefix)
    data.filter(item => item.key.startsWith('bn.'))
      .forEach(item => {
        const key = item.key.substring(3);
        translations[key] = sanitize(item.value);
      });

    // Second pass: override with requested language (without the prefix)
    data.filter(item => item.key.startsWith(`${lang}.`))
      .forEach(item => {
        const key = item.key.substring(lang.length + 1);
        translations[key] = sanitize(item.value);
      });

    // Add legacy keys directly
    data.filter(item => !item.key.includes('.'))
      .forEach(item => {
        translations[item.key] = sanitize(item.value);
      });

    return translations;
  });

export const getServices = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ lang: z.string() }).parse(data))
  .handler(async ({ data: { lang } }) => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("sort_order");

    if (error) throw error;

    return data.map(service => ({
      ...service,
      title: sanitize(lang === 'bn' ? service.title : (service[`title_${lang}` as keyof typeof service] || service.title) as string),
      description: sanitize(lang === 'bn' ? service.description : (service[`description_${lang}` as keyof typeof service] || service.description) as string),
    }));
  });

export const getPackages = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ lang: z.string() }).parse(data))
  .handler(async ({ data: { lang } }) => {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("active", true)
      .order("sort_order");

    if (error) throw error;

    return data.map(pkg => ({
      ...pkg,
      name: sanitize(lang === 'bn' ? pkg.name : (pkg[`name_${lang}` as keyof typeof pkg] || pkg.name) as string),
      duration: sanitize(lang === 'bn' ? pkg.duration : (pkg[`duration_${lang}` as keyof typeof pkg] || pkg.duration) as string),
      description: sanitize(lang === 'bn' ? pkg.description : (pkg[`description_${lang}` as keyof typeof pkg] || pkg.description) as string),
      badge: sanitize(lang === 'bn' ? pkg.badge : (pkg[`badge_${lang}` as keyof typeof pkg] || pkg.badge) as string),
      type: sanitize(lang === 'bn' ? pkg.type : (pkg[`type_${lang}` as keyof typeof pkg] || pkg.type) as string),
      button: sanitize(pkg.button || "BUY NOW"),
    }));
  });

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    package_id: z.string(),
    customer_name: z.string(),
    phone: z.string(),
    note: z.string().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("orders")
      .insert([{
        ...data,
        note: data.note ?? null
      }]);

    if (error) throw error;
    return { success: true };
  });
