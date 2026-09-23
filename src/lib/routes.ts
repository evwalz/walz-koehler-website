export type Lang = "en" | "de";
export type PageKind = "home" | "legalNotice" | "privacy";

export const ROUTES: Record<Lang, Record<PageKind, string>> = {
  en: { home: "/", legalNotice: "/legal-notice/", privacy: "/privacy/" },
  de: { home: "/de/", legalNotice: "/de/impressum/", privacy: "/de/datenschutz/" },
};

export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "de" : "en";
}
