import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['engine', 'handling', 'decisions', 'transport']).optional(),
    service: z.enum(['diagnostics', 'engine-maintenance', 'brake-services', 'suspension-alignment', 'electrical-systems', 'presale-inspection', 'general-repairs']).optional(),
    cta: z.object({
      label: z.string(),
      href: z.string().regex(/^\/(?!\/)/),
    }).optional(),
    updatedDate: z.coerce.date().optional(),
    hero: z.enum([
      'quote-photo',
      'quote',
      'bay',
      'home',
      'brakes',
      'diagnostics',
      'suspension',
      'presale',
      'locations',
    ]),
    heroAlt: z.string(),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    ),
  }),
});

export const collections = { blog };
