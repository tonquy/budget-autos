// The full service list from the shop's Google Business Profile, kept here so
// the website says exactly what the listing says. Google cross-checks the two,
// so the names are copied verbatim (including the near-duplicates the GBP
// service picker produces, e.g. "Brakes" / "Auto brake repair") rather than
// tidied up. Only the names are mirrored; the GBP descriptions are not.
//
// Each category links to its own service guide. Booking event types remain
// separate: a service page does not imply a configured calendar event.

import type { Service } from './business';
import { landingServices } from './serviceDefinitions';

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
    serviceSlug: 'tires',
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
    serviceSlug: 'air-conditioning',
    items: ['Air conditioning', 'A/C installation & repair', 'Auto A/C recharge', 'Auto A/C replacement'],
  },
  {
    key: 'transmission',
    name: 'Transmission',
    icon: 'cog',
    serviceSlug: 'transmission',
    items: ['Transmission', 'Transmission repair', 'Transmission replacement'],
  },
  {
    key: 'exhaust',
    name: 'Exhaust',
    icon: 'wind',
    serviceSlug: 'exhaust',
    items: ['Exhaust', 'Auto exhaust system repair', 'Auto exhaust system replacement'],
  },
  {
    key: 'glass',
    name: 'Glass, windows & mirrors',
    icon: 'app-window',
    serviceSlug: 'glass',
    items: [
      'Auto glass repair',
      'Auto rear window replacement',
      'Auto side window replacement',
      'Auto sunroof glass replacement',
      'Side view mirror repair',
    ],
  },
  {
    key: 'windshield',
    name: 'Windshield & auto glass',
    icon: 'windshield',
    serviceSlug: 'windshield-replacement',
    items: ['Auto windshield replacement', 'Auto windshield repair', 'Auto glass replacement'],
  },
  // Added Nov 2026 at the owner's request. Not on the GBP yet: add these service
  // names to the profile, then copy whatever the GBP picker produces back here.
  {
    key: 'dent-repair',
    name: 'Hail damage & dent repair',
    icon: 'cloud-hail',
    serviceSlug: 'paintless-dent-repair',
    items: ['Paintless dent repair', 'Hail damage repair', 'Door ding removal'],
  },
  {
    key: 'body-trim',
    name: 'Body & trim',
    icon: 'car-front',
    serviceSlug: 'body-trim',
    items: ['Body & Trim', 'Auto body & trim repair', 'Auto body & trim replacement', 'Auto water leak repair'],
  },
  {
    key: 'detailing',
    name: 'Detailing',
    icon: 'sparkles',
    serviceSlug: 'detailing',
    items: ['Auto detailing', 'Auto interior vacuuming', 'Car waxing'],
  },
  // Added Nov 2026 at the owner's request; not on the GBP yet (see dent-repair).
  {
    key: 'car-keys',
    name: 'Car keys & programming',
    icon: 'key-round',
    serviceSlug: 'car-key-replacement',
    items: ['Car key replacement', 'Key fob programming', 'Transponder key programming', 'Smart key & push-to-start programming'],
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
  if (group.serviceSlug && !landingServices.some((service) => service.slug === group.serviceSlug)) {
    throw new Error(`serviceCatalog: unknown service slug "${group.serviceSlug}" in group "${group.key}"`);
  }
}
