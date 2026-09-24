# Walz & Köhler — website

One-page website for **Walz & Köhler**, Dr. Eva-Maria Walz and Gregor Köhler: AI and data-science projects,
forecasting and computer vision. English only — the German side was dropped on 2026-09-23.

Built with [Astro](https://astro.build), static output, no client framework. The build spec is
`docs/SPEC.md`; the design it was built from is `docs/mockups/website-b3.html`; the accepted copy
it was built from is `docs/copy-v1.2.md`.

Not launched: until launch the site tells search engines not to index it (`launched: false` in
`src/config/site.mjs`).

## Run locally

```
npm ci
npm run dev       # dev server, http://localhost:4321
npm run build     # static build to dist/
npm run preview   # serve dist/ locally
npm run check     # Astro/TypeScript check
npm run todo      # list every remaining TODO: placeholder, with file + key
```

## How to edit text

Every visible string lives in **one file**: `src/content/en.yaml`, validated against the schema
in `src/content.config.ts`. If you rename or delete a key the schema still expects, `npm run build`
fails and names it. Edit the value in place; no other file needs to change.

A value that starts with `TODO:` renders on the page as a highlighted placeholder showing the
text after the prefix (e.g. `TODO: hosting provider and server location`). Replace the whole
value, including the `TODO:` prefix, once the real text is known. Run `npm run todo` to see
every placeholder left, with the file and the exact key to edit.

## How to add or remove a project

Selected work is the `work.items` list in `en.yaml`. Copy one entry (`eyebrow`, `title`, `text`,
`link`, `linkLabel`, `pending`) and fill it in for the new project. Set `link: null` and
`pending: true` for a project without a public source yet (it renders with a dashed border and no
source link). To remove a project, delete its entry.

## How to swap a photo

Drop the photo file into `public/photos/`, named exactly as the `photo` value for that person in
the content file (e.g. `eva-walz.jpg`). While the file is missing, the page shows the mockup's
hatched placeholder instead — nothing else needs to change. The `photoAlt` value in the content
file is the image's alt text once the photo is in place.

## Legal pages

`src/content/{en,de}.yaml`'s `legalNotice` and `privacy` sections hold the Impressum and privacy
policy as a structure with every fact (name, address, VAT ID, hosting provider, …) marked
`TODO:`. Fill them in — do not invent names, addresses or other legal facts. Both pages carry a
visible "verify before launch" notice until that `TODO:` is removed too.

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to
`main`, and on demand via *Actions → Deploy to GitHub Pages → Run workflow*. It runs
`npm ci && npm run build` on Node 22 and uploads `dist/` as the Pages artifact — Pages' built-in
Jekyll pipeline is never used, so nothing in the repo needs to be Jekyll-shaped.

One setting has to be made by hand, once, in the repo: **Settings → Pages → Source: "GitHub
Actions"**. Two things to know before that works:

- Pages from a **private** repo needs a paid plan (Pro/Team). A public repo gets it for free.
- The custom domain lives in `public/CNAME` (currently `walz-koehler.com`), which Astro copies into
  `dist/`. Changing the domain means changing that file **and** `SITE_URL` in
  `src/config/site.mjs`. `public/.nojekyll` is there so a later switch to a branch-based Pages
  source cannot swallow the `_astro/` directory.

DNS for the apex domain (the four A and four AAAA records GitHub publishes, plus `www` as a CNAME
to `<owner>.github.io`) is set at the registrar, not here.

**The site stays `noindex` until `LAUNCHED` in `src/config/site.mjs` is set to `true`** — that flag
alone flips `robots.txt` from `Disallow: /` and removes the "verify before launch" notices. Do not
flip it while the legal pages still contain `TODO:` values (`npm run todo` lists them).
