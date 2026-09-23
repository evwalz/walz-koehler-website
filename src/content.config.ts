import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pageMeta = z.object({
  title: z.string(),
  description: z.string(),
});

const workItem = z.object({
  eyebrow: z.string(),
  title: z.string(),
  text: z.string(),
  link: z.string().url().nullable(),
  linkLabel: z.string(),
  pending: z.boolean(),
});

const person = z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  photo: z.string(),
  photoAlt: z.string(),
});

const fact = z.object({
  label: z.string(),
  value: z.string(),
});

const legalSection = z.object({
  heading: z.string(),
  intro: z.string().optional(),
  body: z.string(),
});

const siteSchema = z.object({
  meta: z.object({
    home: pageMeta,
    legalNotice: pageMeta,
    privacy: pageMeta,
  }),
  skipLink: z.string(),
  nav: z.object({
    brand: z.string(),
    ariaLabel: z.string(),
    links: z.object({
      work: z.string(),
      about: z.string(),
      contact: z.string(),
    }),
  }),
  hero: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    lede: z.string(),
    ctaPrimary: z.string(),
  }),
  services: z.object({
    heading: z.string(),
    lead: z.string(),
    items: z.array(z.object({ title: z.string(), text: z.string() })).length(3),
  }),
  range: z.object({
    heading: z.string(),
    body: z.string(),
    labels: z.object({
      observed: z.string(),
      today: z.string(),
      forecast: z.string(),
    }),
    ariaLabel: z.string(),
  }),
  work: z.object({
    heading: z.string(),
    items: z.array(workItem).min(4).max(6),
  }),
  about: z.object({
    heading: z.string(),
    photoPlaceholder: z.string(),
    people: z.array(person).length(2),
  }),
  contact: z.object({
    heading: z.string(),
    email: z.string(),
    cta: z.string(),
  }),
  footer: z.object({
    copyright: z.string(),
    legalNoticeLabel: z.string(),
    privacyLabel: z.string(),
    invoicingNote: z.string(),
  }),
  legalNotice: z.object({
    heading: z.string(),
    checkNotice: z.string(),
    ddgIntro: z.string(),
    facts: z.array(fact).length(4),
    responsibleIntro: z.string(),
    responsibleValue: z.string(),
  }),
  privacy: z.object({
    heading: z.string(),
    checkNotice: z.string(),
    sections: z.array(legalSection).min(1),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content" }),
  schema: siteSchema,
});

export const collections = { site };
