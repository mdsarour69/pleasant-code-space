
-- 1. Final sweep for \u2063 characters in all text columns
UPDATE public.settings SET value = REPLACE(value, E'\u2063', '');
UPDATE public.services SET 
  title = REPLACE(title, E'\u2063', ''),
  description = REPLACE(description, E'\u2063', ''),
  title_en = REPLACE(title_en, E'\u2063', ''),
  description_en = REPLACE(description_en, E'\u2063', ''),
  title_ar = REPLACE(title_ar, E'\u2063', ''),
  description_ar = REPLACE(description_ar, E'\u2063', ''),
  title_fr = REPLACE(title_fr, E'\u2063', ''),
  description_fr = REPLACE(description_fr, E'\u2063', ''),
  title_pt = REPLACE(title_pt, E'\u2063', ''),
  description_pt = REPLACE(description_pt, E'\u2063', '');

UPDATE public.packages SET 
  name = REPLACE(name, E'\u2063', ''),
  duration = REPLACE(duration, E'\u2063', ''),
  badge = REPLACE(badge, E'\u2063', ''),
  type = REPLACE(type, E'\u2063', ''),
  description = REPLACE(description, E'\u2063', ''),
  name_en = REPLACE(name_en, E'\u2063', ''),
  duration_en = REPLACE(duration_en, E'\u2063', ''),
  badge_en = REPLACE(badge_en, E'\u2063', ''),
  type_en = REPLACE(type_en, E'\u2063', ''),
  description_en = REPLACE(description_en, E'\u2063', ''),
  name_ar = REPLACE(name_ar, E'\u2063', ''),
  duration_ar = REPLACE(duration_ar, E'\u2063', ''),
  badge_ar = REPLACE(badge_ar, E'\u2063', ''),
  type_ar = REPLACE(type_ar, E'\u2063', ''),
  description_ar = REPLACE(description_ar, E'\u2063', ''),
  name_fr = REPLACE(name_fr, E'\u2063', ''),
  duration_fr = REPLACE(duration_fr, E'\u2063', ''),
  badge_fr = REPLACE(badge_fr, E'\u2063', ''),
  type_fr = REPLACE(type_fr, E'\u2063', ''),
  description_fr = REPLACE(description_fr, E'\u2063', ''),
  name_pt = REPLACE(name_pt, E'\u2063', ''),
  duration_pt = REPLACE(duration_pt, E'\u2063', ''),
  badge_pt = REPLACE(badge_pt, E'\u2063', ''),
  type_pt = REPLACE(type_pt, E'\u2063', ''),
  description_pt = REPLACE(description_pt, E'\u2063', '');

-- 2. Revoke execute on SECURITY DEFINER functions from PUBLIC/anon to satisfy linter
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;

-- 3. Update the specific branding text to be clean
UPDATE public.settings SET value = 'AUTHORIZED BD' WHERE key = 'bn.subtitle';
UPDATE public.settings SET value = 'ITFair' WHERE key = 'bn.brand_name';
