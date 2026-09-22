# Spec — Walz & Köhler website v1

Turn the approved mockup (`docs/mockups/website-b3.html`) into the real site: static, bilingual, easy to edit.
The text will change later — the operators fill in placeholders and rewrite copy themselves — so the most
important property of v1 is that **every visible word lives in one content file per language, not in templates.**

If anything below contradicts the mockup, or looks wrong once you are in the code, say so in the PR instead of
following it silently. The mockup wins on look; this spec wins on structure.

## 1. Settled — do not reopen

- **Design B3**: moss on grey-green. Hero = contour lines of a loss landscape with a dotted gradient-descent path,
  fading out behind the text. **No caption on the hero.**
- **Menu bar**: solid (ground colour), sticky, hairline border once the page scrolls under it. **No glass / blur.**
- **Section order**: menu · hero · What we do · Range (fan chart) · Principle (moss block) · Selected work ·
  How we work · Who we are · Contact · footer.
- **Contact is email only.** No form.
- **English and German**, same content.
- **Tokens** (from the mockup): ground `#F3F5F0`, ink `#18200F`, muted `#58624F`, line `#D5DCCC`, tint `#E3E9DA`,
  accent `#43682B`, card `#FFFFFF`, contour `#A9B79B`. Radius: cards 14 px, principle block 18 px, buttons pill.
- **Type**: Bricolage Grotesque (display), Figtree (body), DM Mono (labels, eyebrows, captions).

## 2. Stack

- **Astro** (current stable), static output, TypeScript. No UI framework.
- **No client JavaScript needed to read the page.** A few lines of inline script for the menu-bar hairline are
  fine; everything must render and work with JS off.
- **No requests to third parties at runtime.** Self-host the three fonts (e.g. `@fontsource/*`): loading Google
  Fonts from Google's servers was ruled a GDPR violation for a German site (LG München I, 2022). No analytics,
  no cookies, no embeds.
- No CI workflows and no deploy config in v1. Hosting is decided later; the output just has to be a plain
  static `dist/` that any static host serves.

## 3. Routes

| Page | English | German |
|---|---|---|
| Home | `/` | `/de/` |
| Legal notice / Impressum | `/legal-notice/` | `/de/impressum/` |
| Privacy / Datenschutz | `/privacy/` | `/de/datenschutz/` |

- The EN · DE switch in the menu bar is a pair of **links** to the same page in the other language (not a script
  toggle), with `hreflang` alternates in `<head>` and `<html lang>` set per page.
- Menu links jump to sections on the home page (`#services`, `#work`, `#about`, `#contact`; German anchors may
  stay English). Offset for the sticky bar.

## 4. Content model — the part that matters most

- **One content file per language** (e.g. `src/content/en.yaml`, `src/content/de.yaml`) holding every visible
  string: menu, hero, services, range block and chart labels, principle, work items (tag, title, text, link),
  steps, people (name, role, bio, photo file), contact, footer, legal pages, meta title/description, alt texts.
- **Validated by a schema**: the build fails when a key is missing in either language or has the wrong shape.
  EN and DE therefore can never drift apart silently.
- **Placeholders**: a value that starts with `TODO:` renders as a visibly marked placeholder (yellow highlight,
  as in the mockup) showing the text after the prefix. `npm run todo` lists every remaining placeholder with
  file and key. Carry every ⏳ from `docs/copy-v1.2.md` over as a `TODO:` value.
- Work items are a list: adding a fifth project or removing one is an edit to the content file only.
- A short section in the README tells the operators how to edit text, add a project, swap a photo, and run it.

## 5. Drawings

- Port `lossFieldSVG` and `evaFanSVG` from the mockup's script to TypeScript and run them **at build time**,
  emitting inline SVG. Keep them deterministic (same picture on every build) and keep the look identical.
- The fan chart's labels (observed / today / forecast) and its `aria-label` come from the content files.
- Keep the mockup's phone variant of the fan chart (labels drawn larger, so they are readable at 390 px).
- The hero field on phones fades vertically, as in the mockup.

## 6. Photos

`public/photos/` (or equivalent) with one file per person named in the content file. While a file is missing,
the page shows the mockup's hatched placeholder instead, so the site builds and looks deliberate without photos.

## 7. Legal pages (German law applies — Gregor is self-employed in Freiburg)

- **Impressum** (§ 5 DDG) and **Datenschutzerklärung** (GDPR), English versions alongside.
- Write the **structure only**, with every fact as a `TODO:` placeholder: names, postal address, email, phone if
  any, VAT ID if any, who is responsible for content. **Do not invent names, addresses or legal facts.**
- Privacy skeleton: controller; hosting and server logs (host `TODO:`); contact by email; no cookies, no
  analytics, self-hosted fonts; data-subject rights (Art. 15–21 GDPR); right to complain to a supervisory
  authority. Top of both pages: a visible `TODO:` saying the text must be checked before launch.

## 8. Head, search engines, favicon

- Per page and language: `<title>`, meta description, canonical, `hreflang` alternates, basic Open Graph.
- The site URL is a config value (`TODO` until the domain exists).
- **`launched: false`** in one config place → `<meta name="robots" content="noindex">` on every page and a
  `robots.txt` that disallows all. Flipping it to `true` removes both.
- Favicon: a small SVG mark in moss (contour rings or the descent dot), no text.

## 9. Accessibility

Landmarks (`header`, `nav`, `main`, `footer`), a skip link, visible focus, alt text from the content files,
decorative SVG `aria-hidden`, smooth scrolling only under `prefers-reduced-motion: no-preference`.

## 10. Out of scope for v1

Hosting and deploy, domain, contact form, CMS, analytics, dark mode, blog, CI.

## 11. Done means — observable, with a demonstration

1. `npm ci && npm run build` succeeds from a clean clone; `dist/` holds the six pages of §3 plus `robots.txt`.
2. `npm run check` (Astro/TypeScript) passes.
3. Deleting one key from `de.yaml` makes the build fail with a message naming the key; restoring it makes the
   build pass. Show both runs in the PR (redden, then pass).
4. `npm run todo` lists the placeholders (client project, email, Impressum and privacy facts, photos if any).
5. Screenshots of `/` and `/de/` at 1440 px and 390 px wide, plus `/de/impressum/` at 390 px, look like the mockup
   at the same widths. Name any difference you chose to make. Screenshots stay **local** — list their paths in
   the PR, do not commit them.
6. With JavaScript disabled, `/` and `/de/` show all content and the language links work.
7. Zero requests to any host other than the site's own (check the network log of one page load).
