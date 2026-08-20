-- Update existing settings with values from the reference config.php where they match
UPDATE public.settings SET value = 'ITFair' WHERE key IN ('bn.brand', 'en.brand', 'ar.brand', 'fr.brand', 'pt.brand');
UPDATE public.settings SET value = 'AUTHORIZED BD' WHERE key IN ('bn.brand_sub', 'en.brand_sub', 'fr.brand_sub', 'pt.brand_sub');
UPDATE public.settings SET value = 'معتمد في بنغلاديش' WHERE key = 'ar.brand_sub';

-- Add order status to orders table if not exists (already checked earlier, it exists)
-- Just ensuring some default sort orders are set for new packages/services
UPDATE public.packages SET sort_order = 1 WHERE name = '৩ দিনের প্যাকেজ';
UPDATE public.packages SET sort_order = 2 WHERE name = '১৫ দিনের প্যাকেজ';
UPDATE public.packages SET sort_order = 3 WHERE name = '৭ দিনের প্যাকেজ';
UPDATE public.packages SET sort_order = 4 WHERE name = 'মাসিক প্যাকেজ';