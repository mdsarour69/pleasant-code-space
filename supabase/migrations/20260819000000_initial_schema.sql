-- Settings for translations
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT SELECT ON public.settings TO anon;
GRANT ALL ON public.settings TO service_role;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to settings"
ON public.settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated full access to settings"
ON public.settings FOR ALL
TO authenticated
USING (true);

-- Services
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    gradient TEXT DEFAULT 'pink',
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add multilingual columns
ALTER TABLE public.services ADD COLUMN title_en TEXT DEFAULT '';
ALTER TABLE public.services ADD COLUMN title_ar TEXT DEFAULT '';
ALTER TABLE public.services ADD COLUMN title_fr TEXT DEFAULT '';
ALTER TABLE public.services ADD COLUMN title_pt TEXT DEFAULT '';
ALTER TABLE public.services ADD COLUMN description_en TEXT DEFAULT '';
ALTER TABLE public.services ADD COLUMN description_ar TEXT DEFAULT '';
ALTER TABLE public.services ADD COLUMN description_fr TEXT DEFAULT '';
ALTER TABLE public.services ADD COLUMN description_pt TEXT DEFAULT '';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT ON public.services TO anon;
GRANT ALL ON public.services TO service_role;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to services"
ON public.services FOR SELECT
TO anon, authenticated
USING (active = true);

CREATE POLICY "Allow authenticated full access to services"
ON public.services FOR ALL
TO authenticated
USING (true);

-- Packages
CREATE TABLE public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    duration TEXT,
    price INTEGER NOT NULL,
    old_price INTEGER DEFAULT 0,
    badge TEXT DEFAULT 'POPULAR',
    type TEXT DEFAULT 'EXTENSION',
    description TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add multilingual columns
ALTER TABLE public.packages ADD COLUMN name_en TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN name_ar TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN name_fr TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN name_pt TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN duration_en TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN duration_ar TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN duration_fr TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN duration_pt TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN badge_en TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN badge_ar TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN badge_fr TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN badge_pt TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN type_en TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN type_ar TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN type_fr TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN type_pt TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN description_en TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN description_ar TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN description_fr TEXT DEFAULT '';
ALTER TABLE public.packages ADD COLUMN description_pt TEXT DEFAULT '';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT SELECT ON public.packages TO anon;
GRANT ALL ON public.packages TO service_role;

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to packages"
ON public.packages FOR SELECT
TO anon, authenticated
USING (active = true);

CREATE POLICY "Allow authenticated full access to packages"
ON public.packages FOR ALL
TO authenticated
USING (true);

-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES public.packages(id),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    note TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous to insert orders"
ON public.orders FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to orders"
ON public.orders FOR ALL
TO authenticated
USING (true);

-- Seed Data (Translations)
-- Bengali (Default)
INSERT INTO public.settings (key, value) VALUES
('bn.brand', 'ITFair'), ('bn.brand_sub', 'AUTHORIZED BD'), ('bn.hero_kicker', 'আমাদের সেবাসমূহ'),
('bn.hero_title', 'অনুগ্রহ করে আপনার কাঙ্ক্ষিত সেবা বেছে নিন'), ('bn.main_title', 'AI দিয়ে ওয়েবসাইট ও অ্যাপ মিনিটের মধ্যে বানান'),
('bn.main_desc', 'Lovable Pro Plan — কোডিং ছাড়াই AI দিয়ে ওয়েবসাইট, অ্যাপ ও SaaS বানান।'), ('bn.cta_text', 'প্যাকেজ দেখুন'),
('bn.trial_label', 'TRIAL PACKAGE'), ('bn.trial_title', 'ট্রায়াল প্যাকেজ'), ('bn.trial_desc', 'ভিডিও দেখে ডেমো করুন, তারপর ট্রায়াল নিন'),
('bn.trial_30_text', '১ ঘণ্টা'), ('bn.trial_30_price', '৯০'), ('bn.trial_10_text', '১০ মিনিট'), ('bn.trial_10_price', '৫০'),
('bn.trial_buy', '১ ঘণ্টা ট্রায়াল কিনুন — ১৯০'), ('bn.trial_free', '১০ মিনিট ফ্রি ট্রায়াল নিন (৬০)'), ('bn.pricing_kicker', 'PRICING'),
('bn.pricing_title', 'আপনার জন্য সেরা প্যাকেজ'), ('bn.pricing_desc', 'সকল প্যাকেজ Lovable Pro আনলিমিটেড অ্যাক্সেস'),
('bn.support_text', 'আমাদের সাথে যোগাযোগ করুন'), ('bn.whatsapp', 'WhatsApp এ যোগাযোগ'), ('bn.footer', '© 2026 ITFair. All rights reserved.'),
('bn.nav_services', 'সার্ভিস'), ('bn.nav_packages', 'প্যাকেজ'), ('bn.nav_trial', 'ফ্রি ট্রায়াল'), ('bn.nav_offer', 'অফার দেখুন'),
('bn.nav_download', 'ডাউনলোড'), ('bn.nav_help', 'হেল্পলাইন'), ('bn.video_title', 'আমার সেবার ভিডিওটি দেখুন'),
('bn.video_desc', 'ভিডিও দেখে শিখুন — কীভাবে সব কিছু সহজে করবেন'), ('bn.authorized', 'AUTHORIZED · BANGLADESH'),
('bn.trial_access', 'প্যাকেজ কিনলে সাথে সাথে অ্যাক্সেস'), ('bn.trial_start', 'শুরু ও ফিচার ট্রায়াল'),
('bn.download_extension', 'এক্সটেনশন ডাউনলোড করুন'), ('bn.no_renew', 'অটোমেটিক রিনিউ নেই · সম্পূর্ণ নিরাপদ'),
('bn.trust_payment', 'নিরাপদ পেমেন্ট'), ('bn.trust_support', '২৪/৭ সাপোর্ট'), ('bn.trust_delivery', 'দ্রুতগতির ডেলিভারি'),
('bn.trust_guarantee', '১০০% গ্যারান্টি'), ('bn.package_details', 'বিস্তারিত দেখুন'), ('bn.buy_now', 'BUY NOW'),
('bn.contact_desc', 'WhatsApp এ আমাদের সাথে যোগাযোগ করুন — আমরা দ্রুত উত্তর দেব।'), ('bn.support_email', 'Anydesk Support'),
('bn.support_whatsapp', 'ITFair Support'), ('bn.order_title', 'অর্ডার করুন'), ('bn.your_name', 'আপনার নাম'),
('bn.phone', 'মোবাইল নম্বর'), ('bn.note', 'নোট (ঐচ্ছিক)'), ('bn.submit_order', 'অর্ডার সাবমিট'),
('bn.close', 'বন্ধ করুন'), ('bn.save', 'SAVE'), ('bn.days', 'দিন'), ('bn.hours', 'ঘণ্টা'), ('bn.minutes', 'মিনিট');

-- English
INSERT INTO public.settings (key, value) VALUES
('en.brand', 'ITFair'), ('en.brand_sub', 'AUTHORIZED BD'), ('en.hero_kicker', 'OUR SERVICES'),
('en.hero_title', 'Choose the service you need'), ('en.main_title', 'Build websites and apps in minutes with AI'),
('en.main_desc', 'Lovable Pro Plan — build websites, apps and SaaS with AI without coding.'), ('en.cta_text', 'View Packages'),
('en.trial_label', 'TRIAL PACKAGE'), ('en.trial_title', 'Trial Package'), ('en.trial_desc', 'Watch the demo video, then start your trial'),
('en.trial_30_text', '1 hour'), ('en.trial_30_price', '90'), ('en.trial_10_text', '10 minutes'), ('en.trial_10_price', '50'),
('en.trial_buy', 'Buy 1 hour trial — 190'), ('en.trial_free', 'Get 10 minutes free trial (60)'), ('en.pricing_kicker', 'PRICING'),
('en.pricing_title', 'The best package for you'), ('en.pricing_desc', 'All packages include unlimited Lovable Pro access'),
('en.support_text', 'Contact us'), ('en.whatsapp', 'Contact on WhatsApp'), ('en.footer', '© 2026 ITFair. All rights reserved.'),
('en.nav_services', 'Services'), ('en.nav_packages', 'Packages'), ('en.nav_trial', 'Free Trial'), ('en.nav_offer', 'View Offers'),
('en.nav_download', 'Download'), ('en.nav_help', 'Help Line'), ('en.video_title', 'Watch our service video'),
('en.video_desc', 'Watch the video to learn how everything works'), ('en.authorized', 'AUTHORIZED · BANGLADESH'),
('en.trial_access', 'Instant access after purchase'), ('en.trial_start', 'Starter feature trial'),
('en.download_extension', 'Download Extension'), ('en.no_renew', 'No automatic renewal · Fully secure'),
('en.trust_payment', 'Secure Payment'), ('en.trust_support', '24/7 Support'), ('en.trust_delivery', 'Fast Delivery'),
('en.trust_guarantee', '100% Guarantee'), ('en.package_details', 'View Details'), ('en.buy_now', 'BUY NOW'),
('en.contact_desc', 'Contact us on WhatsApp — we will reply quickly.'), ('en.support_email', 'Anydesk Support'),
('en.support_whatsapp', 'ITFair Support'), ('en.order_title', 'Place Order'), ('en.your_name', 'Your Name'),
('en.phone', 'Mobile Number'), ('en.note', 'Note (optional)'), ('en.submit_order', 'Submit Order'),
('en.close', 'Close'), ('en.save', 'SAVE'), ('en.days', 'days'), ('en.hours', 'hours'), ('en.minutes', 'minutes');

-- Legacy/Common Settings
INSERT INTO public.settings (key, value) VALUES
('whatsapp_url', 'https://wa.me/8801700000000'),
('email', 'support@example.com');

-- Seed Services
INSERT INTO public.services (icon, title, description, gradient, sort_order, title_en, description_en) VALUES
('💗', 'লাভেবল ক্রেডিট', 'AI ওয়েবসাইট ও অ্যাপ বিল্ডার', 'pink', 1, 'Loveable Credits', 'AI website & app builder'),
('✦', 'জেনারেটিভ সার্ভিসসমূহ', 'ChatGPT · Gemini · NetflixVPN · YouTube', 'purple', 2, 'Generative Services', 'ChatGPT · Gemini · NetflixVPN · YouTube'),
('🎧', 'কল সেন্টার সাপোর্ট', 'IPBX ও রিয়েল-টাইম সাপোর্ট', 'blue', 3, 'Call Center Support', 'IPBX and real-time support');

-- Seed Packages
INSERT INTO public.packages (name, duration, price, old_price, badge, type, description, sort_order, name_en, duration_en, description_en) VALUES
('৩ দিনের প্যাকেজ', '৩ দিন', 99, 199, 'POPULAR', 'EXTENSION', 'দ্রুত শুরু করার জন্য বেসিক প্যাকেজ', 1, '3 Day Package', '3 days', 'Basic package for a quick start'),
('১৫ দিনের প্যাকেজ', '১৫ দিন', 1099, 1500, 'POPULAR', 'EXTENSION', 'মাঝারি মেয়াদের ফুল অ্যাক্সেস', 2, '15 Day Package', '15 days', 'Medium term full access'),
('৭ দিনের প্যাকেজ', '৭ দিন', 599, 700, 'POPULAR', 'EXTENSION', 'সাশ্রয়ী সাপ্তাহিক প্যাকেজ', 3, '7 Day Package', '7 days', 'Affordable weekly package'),
('মাসিক প্যাকেজ', '৩০ দিন', 1999, 4000, 'POPULAR', 'EXTENSION', 'দীর্ঘমেয়াদি আনলিমিটেড অ্যাক্সেস', 4, 'Monthly Package', '30 days', 'Long term unlimited access');
