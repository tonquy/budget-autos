// Central place for every piece of shop-specific content.
// Sourced from the shop's real Google Business Profile and budgetautosrepair.com
// where available (name, address, phone, email, hours, founding year, core
// services). Warranty terms and testimonials are not published anywhere public,
// so those remain placeholders - swap them once the client confirms.

export const business = {
  name: 'Budget Auto Repair',
  shortName: 'Budget Auto',
  tagline: 'Affordable repairs for your vehicle, done right the first time.',
  foundedYear: 2004,
  phoneDisplay: '(607) 323-0236',
  phoneHref: 'tel:+16073230236',
  smsHref: 'sms:+16073230236',
  email: 'info@budgetautosrepair.com',
  address: {
    line1: '2344 Airport Rd',
    city: 'Johnson City',
    state: 'NY',
    zip: '13790',
  },
  mapsQuery: '2344 Airport Rd, Johnson City, NY 13790',
  mapsEmbedSrc:
    'https://www.google.com/maps?q=2344+Airport+Rd+Johnson+City+NY+13790&output=embed',
  hours: [
    { day: 'Monday - Friday', time: '9:00 AM - 5:00 PM' },
    { day: 'Saturday', time: 'By appointment only' },
    { day: 'Sunday', time: 'Closed' },
  ],
  // Not published publicly - placeholder until the client confirms real terms.
  warranty: 'Warranty on parts and labor - ask us for details',
  // Placeholder rating + review count for a small independent shop. Swap for the
  // shop's real Google rating and review total once confirmed.
  reviews: {
    rating: '4.8',
    count: 87,
  },
  socials: {
    facebook: 'https://www.facebook.com/',
    google: 'https://share.google/0sYU3Xlnrk6zdFhTO',
  },
} as const;

export const yearsInBusiness = new Date().getFullYear() - business.foundedYear;

export type Service = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

// Categories below match the services actually advertised on
// budgetautosrepair.com. Pricing is quote-only - never listed on the site.
export const services: Service[] = [
  {
    slug: 'diagnostics',
    name: 'Engine Diagnostics',
    description: 'Computer scan and a real explanation of what it found before anything gets touched.',
    icon: 'scan-search',
  },
  {
    slug: 'engine-maintenance',
    name: 'Engine Maintenance & Repair',
    description: 'Comprehensive diagnostics and precision repairs to keep your engine running smoothly.',
    icon: 'wrench',
  },
  {
    slug: 'brake-services',
    name: 'Brake Services',
    description: 'Inspection and replacement of brake components for maximum safety and stopping power.',
    icon: 'disc',
  },
  {
    slug: 'suspension-alignment',
    name: 'Suspension & Alignment',
    description: 'Struts, shocks, and wheel alignment to keep your ride smooth and tires wearing evenly.',
    icon: 'sliders-horizontal',
  },
  {
    slug: 'electrical-systems',
    name: 'Electrical Systems',
    description: 'Troubleshooting and repair of vehicle electrical components and wiring harnesses.',
    icon: 'battery-charging',
  },
  {
    slug: 'general-repairs',
    name: 'General Repairs',
    description: "From belts and hoses to the stuff that doesn't fit a category - if it's broken, we'll take a look.",
    icon: 'car',
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

// Placeholder - the shop's public Google reviews are about vehicle sales,
// not repair work, so no real repair-specific quotes were available to use.
// Swap these for real repair customer reviews when the client has them.
export const testimonials: Testimonial[] = [
  {
    quote:
      'Sent them a photo of the estimate I got somewhere else and they beat it by a lot. Truck was ready the next afternoon.',
    name: 'Dana Whitfield',
    role: '2016 Silverado owner',
  },
  {
    quote:
      "They actually showed me the worn brake pad instead of just telling me over the phone. Haven't gone anywhere else since.",
    name: 'Marcus Ojeda',
    role: 'Local customer',
  },
  {
    quote:
      'Uploaded a picture of the cracked hose from my driveway and had a quote back within the hour.',
    name: 'Renee Castellano',
    role: 'Honda Civic owner',
  },
  {
    quote:
      "Alignment was off after hitting a pothole and they got me in the same day. Drives straight now, no more pulling to one side.",
    name: 'Jason Kimball',
    role: 'F-150 owner',
  },
  {
    quote:
      'Battery died on a Monday morning and they had a replacement in by lunch. Straightforward, no upsell.',
    name: 'Priya Anand',
    role: 'Local customer',
  },
];
