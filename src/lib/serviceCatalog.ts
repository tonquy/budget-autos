// The full service list from the shop's Google Business Profile, kept here so
// the website says exactly what the listing says. Google cross-checks the two,
// so the names are copied verbatim (including the near-duplicates the GBP
// service picker produces, e.g. "Brakes" / "Auto brake repair") rather than
// tidied up. Only the names are mirrored; the GBP descriptions are not.
//
// Items are grouped for display. Groups that map onto one of the seven
// service landing pages carry that page's slug so the group heading can link
// there; the rest link to the general quote form.

import { services, type Service } from './business';

export type ServiceGroup = {
  /** Stable key, also used for anchor links on /services/. */
  key: string;
  name: string;
  icon: string;
  /** Matching /services/[slug] landing page, when one exists. */
  serviceSlug?: Service['slug'];
  /** Service names exactly as they appear on the Google Business Profile. */
  items: string[];
};

export const GBP_PRIMARY_CATEGORY = 'Auto repair shop';

export const serviceGroups: ServiceGroup[] = [
  {
    key: 'diagnostics',
    name: 'Diagnostics',
    icon: 'scan-search',
    serviceSlug: 'diagnostics',
    items: ['Auto engine diagnostic'],
  },
  {
    key: 'engine-maintenance',
    name: 'Engine & routine maintenance',
    icon: 'wrench',
    serviceSlug: 'engine-maintenance',
    items: [
      'Engine repair',
      'Oil change',
      'Auto maintenance',
      'Air & cabin filter replacement',
      'Wiper blade installation',
    ],
  },
  {
    key: 'brakes',
    name: 'Brakes',
    icon: 'disc',
    serviceSlug: 'brake-services',
    items: ['Brakes', 'Auto brake repair', 'Auto brake replacement'],
  },
  {
    key: 'steering-suspension',
    name: 'Steering, suspension & alignment',
    icon: 'sliders-horizontal',
    serviceSlug: 'suspension-alignment',
    items: ['Steering & suspension repair', 'Steering & suspension replacement', 'Wheel alignment'],
  },
  {
    key: 'tires',
    name: 'Tires',
    icon: 'circle-dot',
    items: ['Tires', 'Auto tire replacement', 'Tire rotations'],
  },
  {
    key: 'electrical-battery',
    name: 'Electrical & battery',
    icon: 'battery-charging',
    serviceSlug: 'electrical-systems',
    items: [
      'Electrical',
      'Electrical repair',
      'Battery',
      'Auto battery maintenance',
      'Auto battery replacement',
      'Auto power window repair',
    ],
  },
  {
    key: 'air-conditioning',
    name: 'Air conditioning',
    icon: 'snowflake',
    items: ['Air conditioning', 'A/C installation & repair', 'Auto A/C recharge', 'Auto A/C replacement'],
  },
  {
    key: 'transmission',
    name: 'Transmission',
    icon: 'cog',
    items: ['Transmission', 'Transmission repair', 'Transmission replacement'],
  },
  {
    key: 'exhaust',
    name: 'Exhaust',
    icon: 'wind',
    items: ['Exhaust', 'Auto exhaust system repair', 'Auto exhaust system replacement'],
  },
  {
    key: 'glass',
    name: 'Glass, windows & mirrors',
    icon: 'app-window',
    items: [
      'Auto glass repair',
      'Auto glass replacement',
      'Auto windshield repair',
      'Auto windshield replacement',
      'Auto rear window replacement',
      'Auto side window replacement',
      'Auto sunroof glass replacement',
      'Side view mirror repair',
    ],
  },
  {
    key: 'body-trim',
    name: 'Body & trim',
    icon: 'car-front',
    items: ['Body & Trim', 'Auto body & trim repair', 'Auto body & trim replacement', 'Auto water leak repair'],
  },
  {
    key: 'detailing',
    name: 'Detailing',
    icon: 'sparkles',
    items: ['Auto detailing', 'Auto interior vacuuming', 'Car waxing'],
  },
  {
    key: 'inspections',
    name: 'Inspections',
    icon: 'clipboard-check',
    serviceSlug: 'presale-inspection',
    items: ['Vehicle Inspection', 'Auto emissions testing'],
  },
  {
    key: 'general-repairs',
    name: 'General repairs',
    icon: 'car',
    serviceSlug: 'general-repairs',
    items: ['General repairs & maintenance'],
  },
];

/** Every GBP service name, flattened, in display order. */
export const allCatalogServices = serviceGroups.flatMap((group) => group.items);

/** The GBP services that sit under a given /services/[slug] landing page. */
export function catalogGroupForService(slug: string) {
  return serviceGroups.find((group) => group.serviceSlug === slug);
}

/** Where a group heading should send the visitor. */
export function groupHref(group: ServiceGroup) {
  return group.serviceSlug ? `/services/${group.serviceSlug}/` : '/quote/';
}

// Every serviceSlug must point at a real landing page - fail the build if not.
for (const group of serviceGroups) {
  if (group.serviceSlug && !services.some((service) => service.slug === group.serviceSlug)) {
    throw new Error(`serviceCatalog: unknown service slug "${group.serviceSlug}" in group "${group.key}"`);
  }
}
