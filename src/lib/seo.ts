import { business } from './business';

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

const SITE_NAME = business.name;

export function pageTitle(title: string) {
  return title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
}

export function localBusinessJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: business.name,
    image: `${siteUrl}/og-default.jpg`,
    telephone: business.phoneDisplay,
    email: business.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.line1,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.zip,
      addressCountry: 'US',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:30',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '14:00',
      },
    ],
    priceRange: '$$',
    url: siteUrl,
  };
}
