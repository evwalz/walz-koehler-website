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
