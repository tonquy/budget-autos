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

// Homepage FAQ, phrased the way people type these questions into Google
// ("People also ask" style). Every answer uses only facts the shop has
// confirmed elsewhere on the site - no prices, guarantees or policies invented.
// Also emitted as FAQPage schema on the homepage.
export const homeFaqs: FaqItem[] = [
  {
    question: `Where is ${business.name} and what are your hours?`,
    answer: `We're at ${business.address.line1}, ${business.address.city}, ${business.address.state} ${business.address.zip}. Open Monday-Friday 9:00 AM-5:00 PM, Saturdays by appointment only, and closed Sunday.`,
  },
  {
    question: 'Can I get a repair quote before bringing my car in?',
    answer: `Yes, and it's free. Use the instant quote form or text ${business.phoneDisplay} with your vehicle, what it's doing, and a photo if you have one. You get a quote before any work starts, and estimates are based on the Mitchell 1 labor guide so the numbers come from an industry standard, not a guess.`,
  },
  {
    question: 'How much does a check engine light diagnostic cost?',
    answer: `It depends on the vehicle and the problem, so ask when you book. If you text us the code or a photo of the dash, we can often tell you what to expect before you come in. After the scan, we explain what we found in plain English before recommending any repair.`,
  },
  {
    question: 'Do I need an appointment?',
    answer: `Booking ahead is the best way to make sure a bay is ready for you. You can book online in a minute, text us, or call ${business.phoneDisplay}. Saturday visits are by appointment only.`,
  },
  {
    question: 'Is it worth getting a second opinion on a car repair estimate?',
    answer: 'Often, yes, especially on a big bill. Send us the estimate from another shop and we\'ll help you understand what was recommended, compare the scope, and talk through what actually needs attention first.',
  },
  {
    question: 'Will you do any work without asking me first?',
    answer: 'No. We explain the repair options and give you a quote first, and nothing gets ordered or repaired until you approve it.',
  },
  {
    question: 'What makes and models do you work on?',
    answer: `Most domestic and import cars, trucks and SUVs. We handle engine diagnostics, engine repair and maintenance, brakes, suspension and alignment, electrical problems, and presale inspections. If something is outside what we do, we'll tell you up front.`,
  },
  {
    question: 'Can I get a rental car while my car is being repaired?',
    answer: 'Yes. You can request a rental vehicle for $35 a day while your car is in the shop. Fill out the short rental form or ask when you drop off.',
  },
  {
    question: 'Is Budget Autos Repair a licensed repair shop?',
    answer: `Yes. We're a ${business.registration.label} (registration #${business.registration.number}), family-owned and repairing cars in ${business.address.city} since ${business.foundedYear}.`,
  },
  {
    question: 'Do you offer a warranty on repairs?',
    answer: 'Ask us for the written parts and labor terms for your specific repair before you approve the work. Coverage can depend on the part and the job.',
  },
];
