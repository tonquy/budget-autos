import { business, type Service } from './business';
import { locations } from './locations';
import { serviceGroups, groupHref } from './serviceCatalog';

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

/**
 * Page routes are canonical with a trailing slash (that is what the sitemap
 * lists, what <link rel=canonical> emits, and what the Worker 301s to). Files
 * and API routes are left alone.
 */
export function canonicalPath(path: string) {
  if (path === '/' || path.endsWith('/') || path.startsWith('/api/') || /\.[^/]+$/.test(path)) {
    return path;
  }
  return `${path}/`;
}

/** Prefer 1200×630 social share assets; current og-default is 1536×1024. */
export const OG_IMAGE = {
  path: '/og-default.jpg',
  width: 1536,
  height: 1024,
} as const;

/**
 * Photo of the NYS DMV "Registered Motor Vehicle Repair Shop" sign posted at
 * the shop. Listed in the AutoRepair schema `image` array and rendered on the
 * homepage so Google has a real photo of the licensed facility, matching the
 * same photo on the Google Business Profile.
 */
export const REGISTRATION_IMAGE = {
  path: '/registered-sign.jpg',
  width: 1600,
  height: 1200,
} as const;

export function registrationImageCaption() {
  return `${business.registration.label} No. ${business.registration.number} - ${business.name}, ${business.address.line1}, ${business.address.city}, ${business.address.state}`;
}

export function pageTitle(title: string) {
  return title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
}

/** Hours shown on the site (business.hours) - Mon-Fri 9-5. Sat is by appointment only (omitted from fixed schema hours). */
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

/**
 * The GBP service list as a schema.org OfferCatalog, one sub-catalog per
 * display group. Mirrors the names on the Google Business Profile exactly so
 * the site and the listing describe the same business.
 */
export function serviceCatalogJsonLd(siteUrl: string) {
  return {
    '@type': 'OfferCatalog',
    name: `${business.name} services`,
    itemListElement: serviceGroups.map((group) => ({
      '@type': 'OfferCatalog',
      name: group.name,
      url: `${siteUrl}${groupHref(group)}`,
      itemListElement: group.items.map((name) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name,
          serviceType: name,
          areaServed: { '@type': 'City', name: business.address.city },
        },
      })),
    })),
  };
}

type LocalBusinessOptions = {
  /** Attach the full GBP service list. Only the pages that list services on-page set this - it is ~6 KB of JSON-LD. */
  withServiceCatalog?: boolean;
};

export function localBusinessJsonLd(siteUrl: string, options: LocalBusinessOptions = {}) {
  // `sameAs` asserts "these profiles are this same business", so it lists only
  // this shop's own profiles. The Facebook page belongs to the dealership next
  // door (same address, same family, different entity); claiming it here would
  // push Google toward merging the two listings.
  const sameAs = [business.socials.google].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': `${siteUrl}/#business`,
    name: business.name,
    image: [
      `${siteUrl}${OG_IMAGE.path}`,
      {
        '@type': 'ImageObject',
        url: `${siteUrl}${REGISTRATION_IMAGE.path}`,
        contentUrl: `${siteUrl}${REGISTRATION_IMAGE.path}`,
        width: REGISTRATION_IMAGE.width,
        height: REGISTRATION_IMAGE.height,
        caption: registrationImageCaption(),
      },
    ],
    // NYS DMV repair shop registration - the state licence every paid repair
    // shop in New York must hold. Both the credential and the identifier are
    // stated so the entity reads as a regulated repair facility.
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'NYS DMV Repair Shop Registration',
      value: business.registration.number,
    },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      name: business.registration.label,
      identifier: business.registration.number,
      recognizedBy: {
        '@type': 'GovernmentOrganization',
        name: business.registration.issuer,
      },
    },
    email: business.email,
    telephone: business.smsNumber,
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
    ...(options.withServiceCatalog ? { hasOfferCatalog: serviceCatalogJsonLd(siteUrl) } : {}),
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
      item: new URL(canonicalPath(item.path), siteUrl).toString(),
    })),
  };
}

export function articleJsonLd(
  siteUrl: string,
  opts: {
    title: string;
    description: string;
    path: string;
    datePublished: Date;
    dateModified?: Date;
  },
) {
  const pageUrl = new URL(canonicalPath(opts.path), siteUrl).toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datePublished.toISOString(),
    dateModified: (opts.dateModified ?? opts.datePublished).toISOString(),
    author: {
      '@type': 'Organization',
      name: business.name,
      url: siteUrl,
    },
    publisher: {
      '@type': 'AutoRepair',
      '@id': `${siteUrl}/#business`,
      name: business.name,
    },
    mainEntityOfPage: pageUrl,
    url: pageUrl,
    image: `${siteUrl}${OG_IMAGE.path}`,
  };
}

export function howToJsonLd(
  siteUrl: string,
  opts: {
    name: string;
    description: string;
    path: string;
    steps: { name: string; text: string }[];
  },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    url: new URL(canonicalPath(opts.path), siteUrl).toString(),
    step: opts.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
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
    url: `${siteUrl}/services/${service.slug}/`,
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
    answer: `${business.name} is at ${business.address.line1}, ${business.address.city}, ${business.address.state} ${business.address.zip}. We're open Monday-Friday 9:00 AM-5:00 PM, and Saturdays by appointment.`,
  },
  {
    question: 'How do I reach the shop about a repair?',
    answer: `Three ways: book an appointment online, text us at ${business.phoneDisplay}, or call the same number. Texting is usually fastest - send your name, your vehicle, what it's doing, and a photo if you have one. We reply with the next step, usually within the hour during shop hours.`,
  },
  {
    question: `What auto repairs do you handle in ${business.address.city}?`,
    answer:
      'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If it isn’t listed, text us a photo anyway - we’ll tell you if we can help.',
  },
];
