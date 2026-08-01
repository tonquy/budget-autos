import { business, type Service } from './business';
import { locations } from './locations';

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

const SITE_NAME = business.name;

/** Prefer 1200×630 social share assets; current og-default is 1536×1024. */
export const OG_IMAGE = {
  path: '/og-default.jpg',
  width: 1536,
  height: 1024,
} as const;

export function pageTitle(title: string) {
  return title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
}

/** Hours shown on the site (business.hours) — Mon–Fri 9–5. Sat is by appointment only (omitted from fixed schema hours). */
function openingHoursFromBusiness() {
  return [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  ];
}

export function localBusinessJsonLd(siteUrl: string) {
  const sameAs = [business.socials.facebook, business.socials.google].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': `${siteUrl}/#business`,
    name: business.name,
    image: `${siteUrl}${OG_IMAGE.path}`,
    email: business.email,
    url: siteUrl,
    foundingDate: String(business.foundedYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.line1,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.zip,
      addressCountry: 'US',
    },
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Broome County',
      },
      ...locations.map((place) => ({
        '@type': 'City' as const,
        name: place.name,
        containedInPlace: {
          '@type': 'State' as const,
          name: place.state === 'PA' ? 'Pennsylvania' : 'New York',
        },
      })),
    ],
    openingHoursSpecification: openingHoursFromBusiness(),
    sameAs,
  };
}

export function breadcrumbJsonLd(
  siteUrl: string,
  items: { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).toString(),
    })),
  };
}

export function faqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function serviceJsonLd(siteUrl: string, service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.seoDescription ?? service.description,
    url: `${siteUrl}/services/${service.slug}`,
    provider: {
      '@type': 'AutoRepair',
      '@id': `${siteUrl}/#business`,
      name: business.name,
    },
    areaServed: {
      '@type': 'City',
      name: business.address.city,
    },
  };
}

export const homeFaqs: FaqItem[] = [
  {
    question: `Where is ${business.name} located?`,
    answer: `${business.name} is at ${business.address.line1}, ${business.address.city}, ${business.address.state} ${business.address.zip}. We're open Monday–Friday 9:00 AM–5:00 PM, and Saturdays by appointment.`,
  },
  {
    question: 'How do I get a free repair quote?',
    answer:
      'Use the Free Quote form or the chat on this site — send a photo of the issue or another shop’s estimate, plus your name and vehicle. We typically reply within the hour during shop hours with a real number, not a vague range.',
  },
  {
    question: `What auto repairs do you handle in ${business.address.city}?`,
    answer:
      'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If it isn’t listed, send a photo anyway — we’ll tell you if we can help.',
  },
];
