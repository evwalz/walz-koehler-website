// @ts-check
import { defineConfig } from "astro/config";
import { SITE_URL } from "./src/config/site.mjs";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  // German moved to the root and English to /en/. These catch the URLs the site
  // served before that switch; Astro emits them as static redirect pages.
  redirects: {
    "/de/": "/",
    "/de/impressum/": "/impressum/",
    "/de/datenschutz/": "/datenschutz/",
    "/legal-notice/": "/en/legal-notice/",
    "/privacy/": "/en/privacy/",
  },
});
