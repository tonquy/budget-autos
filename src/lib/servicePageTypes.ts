import type { ServiceFaq } from './business';

export type ServicePoint = { title: string; text: string };

/** Substantive, visible content for a service landing page, separate from booking events. */
export type ServiceDetail = {
  heading: string;
  intro: string[];
  signs: ServicePoint[];
  caution?: ServicePoint;
  included: ServicePoint[];
  process: ServicePoint[];
  decisions: { heading: string; paragraphs: string[] };
  cost: { text: string; factors: string[] };
  preparation: string[];
  faqs: ServiceFaq[];
  related: string[];
  articles: { title: string; href: string }[];
};
