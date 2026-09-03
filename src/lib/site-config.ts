export const SITE_DEFAULTS = {
  theme_primary: "#ff3b9d",
  theme_background: "#080512",
  theme_surface: "#120e1e",
  theme_foreground: "#ffffff",
  theme_muted: "#a8a2b7",
  theme_border: "#312747",
  layout_sections: "services,trial,packages,contact",
  show_services: "true",
  show_trial: "true",
  show_packages: "true",
  show_contact: "true",
  service_grid: "3",
  package_grid: "3",
  content_width: "wide",
  spacing_density: "comfortable",
  corner_style: "soft",
  font_preset: "regional",
  button_style: "pill",
} as const;

export type SiteSettingKey = keyof typeof SITE_DEFAULTS;
export type SiteSettings = Record<string, string>;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function safeColor(value: string | undefined, fallback: string) {
  return value && HEX_COLOR.test(value) ? value : fallback;
}

export function isEnabled(settings: SiteSettings, key: SiteSettingKey) {
  return (settings[key] ?? SITE_DEFAULTS[key]) !== "false";
}

export function orderedSections(settings: SiteSettings) {
  const allowed = ["trial", "packages", "contact"] as const;
  const requested = (settings.layout_sections ?? SITE_DEFAULTS.layout_sections).split(",");
  return [...requested.filter((item): item is (typeof allowed)[number] => allowed.includes(item as (typeof allowed)[number])), ...allowed].filter(
    (item, index, all) => all.indexOf(item) === index,
  );
}