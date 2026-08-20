import type { ImageMetadata } from 'astro';
import quotePhoto from '../assets/images/quote-photo-upload.jpg';
import quoteHero from '../assets/images/hero-quote.jpg';
import bayImage from '../assets/images/services-bay.jpg';
import homeHero from '../assets/images/hero-home.jpg';
import brakesImage from '../assets/images/detail-brakes.jpg';
import diagnosticsImage from '../assets/images/detail-diagnostics.jpg';
import suspensionImage from '../assets/images/detail-suspension.jpg';
import presaleImage from '../assets/images/detail-presale-inspection.jpg';
import locationsHero from '../assets/images/hero-locations.jpg';

export const blogHeroImages = {
  'quote-photo': quotePhoto,
  quote: quoteHero,
  bay: bayImage,
  home: homeHero,
  brakes: brakesImage,
  diagnostics: diagnosticsImage,
  suspension: suspensionImage,
  presale: presaleImage,
  locations: locationsHero,
} as const satisfies Record<string, ImageMetadata>;

export type BlogHeroKey = keyof typeof blogHeroImages;

export function formatBlogDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(date);
}
