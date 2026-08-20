-- Migration to strip invisible separator character U+2063 from all content tables
DO $$ 
BEGIN
  -- Settings
  UPDATE public.settings SET value = replace(value, E'\u2063', '');
  
  -- Services
  UPDATE public.services SET 
    title = replace(title, E'\u2063', ''), 
    description = replace(description, E'\u2063', ''),
    title_en = replace(title_en, E'\u2063', ''),
    title_ar = replace(title_ar, E'\u2063', ''),
    title_fr = replace(title_fr, E'\u2063', ''),
    title_pt = replace(title_pt, E'\u2063', ''),
    description_en = replace(description_en, E'\u2063', ''),
    description_ar = replace(description_ar, E'\u2063', ''),
    description_fr = replace(description_fr, E'\u2063', ''),
    description_pt = replace(description_pt, E'\u2063', '');

  -- Packages
  UPDATE public.packages SET 
    name = replace(name, E'\u2063', ''), 
    duration = replace(duration, E'\u2063', ''),
    description = replace(description, E'\u2063', ''),
    badge = replace(badge, E'\u2063', ''),
    type = replace(type, E'\u2063', ''),
    name_en = replace(name_en, E'\u2063', ''),
    name_ar = replace(name_ar, E'\u2063', ''),
    name_fr = replace(name_fr, E'\u2063', ''),
    name_pt = replace(name_pt, E'\u2063', ''),
    duration_en = replace(duration_en, E'\u2063', ''),
    duration_ar = replace(duration_ar, E'\u2063', ''),
    duration_fr = replace(duration_fr, E'\u2063', ''),
    duration_pt = replace(duration_pt, E'\u2063', ''),
    badge_en = replace(badge_en, E'\u2063', ''),
    badge_ar = replace(badge_ar, E'\u2063', ''),
    badge_fr = replace(badge_fr, E'\u2063', ''),
    badge_pt = replace(badge_pt, E'\u2063', ''),
    type_en = replace(type_en, E'\u2063', ''),
    type_ar = replace(type_ar, E'\u2063', ''),
    type_fr = replace(type_fr, E'\u2063', ''),
    type_pt = replace(type_pt, E'\u2063', ''),
    description_en = replace(description_en, E'\u2063', ''),
    description_ar = replace(description_ar, E'\u2063', ''),
    description_fr = replace(description_fr, E'\u2063', ''),
    description_pt = replace(description_pt, E'\u2063', '');
END $$;