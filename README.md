# Walz & Köhler — website

One-page site for **Walz & Köhler**: AI and data-science projects, forecasting and computer vision.
English at `/`, German at `/de/`. Built with [Astro](https://astro.build), static output, no client
framework. Every visible string lives in `src/content/en.yaml` and `src/content/de.yaml`.

## Run locally

```
npm ci
npm run dev       # dev server, http://localhost:4321
npm run build     # static build to dist/
npm run preview   # serve dist/ locally
npm run check     # Astro/TypeScript check
npm run todo      # list every remaining TODO: placeholder, with file + key
```

## Deploy

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to
`main`, and on demand under *Actions → Deploy to GitHub Pages*. It needs **Settings → Pages →
Source: "GitHub Actions"** set once by hand. The domain lives in `public/CNAME` and in `SITE_URL`
(`src/config/site.mjs`) — change both together; DNS is set at the registrar.

The site is `noindex` until `LAUNCHED` in `src/config/site.mjs` is `true`. Don't flip it while
`npm run todo` still lists placeholders.
