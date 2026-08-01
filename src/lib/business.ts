// Central place for every piece of shop-specific content.
// Sourced from the shop's real Google Business Profile and budgetautosrepair.com
// where available (name, address, phone, email, hours, founding year, core
// services). Warranty terms remain placeholders until the client confirms.
// On-site testimonial quotes were removed — link to Google reviews instead.

export const business = {
  name: 'Budget Auto Repair',
  shortName: 'Budget Auto',
  tagline: 'Affordable repairs for your vehicle, done right the first time.',
  foundedYear: 2004,
  // Kept for internal/ops use only — do not render shop phone on the public site.
  // Direct visitors to chat or the quote form instead.
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
  // Industry-standard labor guide the shop uses for quoting.
  laborGuide:
    'All estimates and work are quoted based on Mitchell 1 Labor Structure.',
  // Placeholder until the client confirms real Google rating + count.
  // Do not publish AggregateRating schema from these values.
  reviews: {
    rating: '4.8',
    count: 87,
  },
  socials: {
    facebook: 'https://www.facebook.com/budgetautosny',
    google: 'https://share.google/0sYU3Xlnrk6zdFhTO',
  },
} as const;

export const yearsInBusiness = new Date().getFullYear() - business.foundedYear;

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type Service = {
  slug: string;
  name: string;
  description: string;
  /** Longer copy for /services/[slug] landing pages. */
  longDescription: string;
  /** Meta description for the service landing page. */
  seoDescription: string;
  highlights: string[];
  faqs: ServiceFaq[];
  icon: string;
};

// Categories below match the services actually advertised on
// budgetautosrepair.com. Pricing is quote-only - never listed on the site.
export const services: Service[] = [
  {
    slug: 'diagnostics',
    name: 'Engine Diagnostics',
    description: 'Computer scan and a real explanation of what it found before anything gets touched.',
    longDescription:
      'Check-engine light on? Rough idle, misfire, or a code reader that just spit out a number you don’t understand? We plug in, pull the codes, and — more important — explain what they mean for your car before recommending repairs. No scare tactics, no “replace everything” laundry lists.',
    seoDescription:
      'Engine diagnostics in Johnson City, NY. Computer scan, clear explanation, and a free quote before any work starts at Budget Auto Repair.',
    highlights: [
      'OBD-II computer scan and live data checks',
      'Plain-English explanation of findings',
      'Quote before any parts are ordered',
      'Same-day turnaround on most diagnostic appointments',
    ],
    faqs: [
      {
        question: 'Do you charge for a diagnostic scan?',
        answer:
          'Ask when you book — diagnostic fees vary by vehicle and concern. If you send a photo or code through our quote form, we can often tell you what to expect before you bring the car in.',
      },
      {
        question: 'Can you diagnose intermittent problems?',
        answer:
          'Yes. Intermittent issues take more time and sometimes a road test or return visit. We’ll tell you honestly if we need more drive time to catch it.',
      },
    ],
    icon: 'scan-search',
  },
  {
    slug: 'engine-maintenance',
    name: 'Engine Maintenance & Repair',
    description: 'Comprehensive diagnostics and precision repairs to keep your engine running smoothly.',
    longDescription:
      'From oil leaks and timing issues to overheating and worn mounts, we handle engine maintenance and repair for daily drivers in the Johnson City and Broome County area. Work is quoted against Mitchell 1 labor times so you know the estimate is grounded in a standard guide — not a guess.',
    seoDescription:
      'Engine maintenance and repair in Johnson City, NY. Leaks, overheating, mounts, and more — free photo quote from Budget Auto Repair.',
    highlights: [
      'Maintenance and repair, not just oil changes',
      'Mitchell 1 labor guide for transparent quoting',
      'Parts and labor warranty — ask us for current terms',
      'Photo quotes so you can start from your driveway',
    ],
    faqs: [
      {
        question: 'Do you work on all makes and models?',
        answer:
          'We service most domestic and import vehicles. If something is outside our lane, we’ll say so up front instead of taking a deposit and figuring it out later.',
      },
      {
        question: 'How fast can engine work get done?',
        answer:
          'Simple jobs often finish same day. Bigger repairs depend on parts availability — we’ll give you a realistic timeline with the quote.',
      },
    ],
    icon: 'wrench',
  },
  {
    slug: 'brake-services',
    name: 'Brake Services',
    description: 'Inspection and replacement of brake components for maximum safety and stopping power.',
    longDescription:
      'Squeal, grind, soft pedal, or a brake warning light? We inspect pads, rotors, calipers, hardware, and fluid, then show you what’s worn before recommending a job. Safety work gets priority scheduling when we can fit you in.',
    seoDescription:
      'Brake repair and inspection in Johnson City, NY. Pads, rotors, calipers, and fluid — get a free quote from Budget Auto Repair.',
    highlights: [
      'Full brake system inspection',
      'Pads, rotors, calipers, and hardware',
      'Brake fluid condition checks',
      'We show you the worn parts when we can',
    ],
    faqs: [
      {
        question: 'How do I know if I need brakes?',
        answer:
          'Common signs: squealing, grinding, longer stopping distance, vibration when braking, or a dashboard brake light. Send a photo or short video through our quote form if you’re unsure.',
      },
      {
        question: 'Do you replace brakes on one axle only?',
        answer:
          'We recommend what’s actually needed. If only the fronts are worn, we won’t push a full four-corner job without a reason.',
      },
    ],
    icon: 'disc',
  },
  {
    slug: 'suspension-alignment',
    name: 'Suspension & Alignment',
    description: 'Struts, shocks, and wheel alignment to keep your ride smooth and tires wearing evenly.',
    longDescription:
      'Pothole bounce, pulling to one side, or tires wearing unevenly? We inspect struts, shocks, bushings, and ball joints, then align when the suspension is sound so the alignment actually holds.',
    seoDescription:
      'Suspension repair and wheel alignment in Johnson City, NY. Struts, shocks, and pull fixes at Budget Auto Repair.',
    highlights: [
      'Struts, shocks, and related hardware',
      'Wheel alignment after suspension work when needed',
      'Uneven tire wear diagnosis',
      'Same-day help on many alignment-only visits',
    ],
    faqs: [
      {
        question: 'Will an alignment fix a pull by itself?',
        answer:
          'Sometimes. If a worn tire, seized brake, or bad suspension part is causing the pull, alignment alone won’t stick. We check those first.',
      },
      {
        question: 'Do I need an appointment for alignment?',
        answer:
          'Yes — alignments need the rack. Request a quote or chat with us online and we’ll get you on the schedule.',
      },
    ],
    icon: 'sliders-horizontal',
  },
  {
    slug: 'electrical-systems',
    name: 'Electrical Systems',
    description: 'Troubleshooting and repair of vehicle electrical components and wiring harnesses.',
    longDescription:
      'Dead batteries, charging issues, parasitic drains, lighting, and wiring faults — electrical problems rarely fix themselves. We test the system properly instead of throwing parts at a “maybe.”',
    seoDescription:
      'Auto electrical repair in Johnson City, NY. Batteries, alternators, wiring, and lighting diagnostics at Budget Auto Repair.',
    highlights: [
      'Battery and charging system testing',
      'Alternator and starter diagnosis',
      'Lighting and accessory circuit repairs',
      'Parasitic drain tracing when needed',
    ],
    faqs: [
      {
        question: 'My car won’t start — is that electrical?',
        answer:
          'Often yes: battery, starter, or connections. Sometimes it’s fuel or security-related. Describe what happens (clicks, nothing, slow crank) in the quote form and we’ll point you the right way.',
      },
      {
        question: 'Can you replace a battery the same day?',
        answer:
          'Usually, if the correct battery is in stock or available locally. We’ll confirm fitment before ordering.',
      },
    ],
    icon: 'battery-charging',
  },
  {
    slug: 'presale-inspection',
    name: 'Presale Inspection',
    description:
      'Buying or selling? We walk the whole vehicle, document it with photos, and pull the Carfax so you know the real story before money changes hands.',
    longDescription:
      'Thinking about buying a used car in the Tri-Cities area, or selling one and want fewer surprises at the closing table? We inspect the vehicle, document findings with photos, and can pull Carfax history so negotiations start from facts — not hopes.',
    seoDescription:
      'Presale vehicle inspections in Johnson City, NY. Photo documentation and Carfax-ready checks from Budget Auto Repair.',
    highlights: [
      'Full walk-around mechanical inspection',
      'Photo documentation of findings',
      'Carfax history pull available',
      'Clear summary you can share with a buyer or seller',
    ],
    faqs: [
      {
        question: 'Should I get an inspection before buying privately?',
        answer:
          'Yes. A few hundred dollars of inspection is cheap insurance against a multi-thousand-dollar surprise. Bring the car (or have the seller bring it) before money changes hands.',
      },
      {
        question: 'Do you inspect cars for out-of-town buyers?',
        answer:
          'Often. Send the vehicle details through chat or the quote form and we’ll tell you what we can check and how we report back.',
      },
    ],
    icon: 'clipboard-check',
  },
  {
    slug: 'general-repairs',
    name: 'General Repairs',
    description: "From belts and hoses to the stuff that doesn't fit a category - if it's broken, we'll take a look.",
    longDescription:
      'Not every repair fits a neat category. Belts, hoses, exhaust leaks, sensors, door hardware, cooling system jobs — if it’s broken and safe for us to work on, we’ll take a look and quote it straight.',
    seoDescription:
      'General auto repair in Johnson City, NY. Belts, hoses, exhaust, sensors, and more — free quote from Budget Auto Repair.',
    highlights: [
      'Belts, hoses, and cooling system work',
      'Exhaust and sensor repairs',
      'Honest “we can / can’t” answers up front',
      'Photo-based quotes for driveway issues',
    ],
    faqs: [
      {
        question: 'What if I don’t know what the part is called?',
        answer:
          'Send a photo. You don’t need the right name — we care about what’s leaking, rattling, or broken.',
      },
      {
        question: 'Do you guarantee every repair?',
        answer: `${business.warranty}. Ask us for the exact coverage that applies to your job.`,
      },
    ],
    icon: 'car',
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
