export type Lang = "en" | "de";
export type PageKind = "home" | "legalNotice" | "privacy";

// German is the default language and lives at the root; English sits under /en/.
export const ROUTES: Record<Lang, Record<PageKind, string>> = {
  de: { home: "/", legalNotice: "/impressum/", privacy: "/datenschutz/" },
  en: { home: "/en/", legalNotice: "/en/legal-notice/", privacy: "/en/privacy/" },
};

export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "de" : "en";
}
