export type PageKind = "home" | "legalNotice" | "privacy";

export const ROUTES: Record<PageKind, string> = {
  home: "/",
  legalNotice: "/legal-notice/",
  privacy: "/privacy/",
};
