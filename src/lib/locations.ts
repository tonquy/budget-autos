// Location landing-page data for local SEO.
// Physical shop is always Johnson City - these pages describe areas we serve.

export type LocationTier = 'core' | 'broome' | 'nearby';

export type LocationFaq = {
  question: string;
  answer: string;
};

export type Location = {
  slug: string;
  name: string;
  state: 'NY' | 'PA';
  county: string;
  tier: LocationTier;
  driveNote: string;
  landmarks: string;
  seoDescription: string;
  intro: string;
  highlights: string[];
  faqs: LocationFaq[];
  nearbySlugs: string[];
};

export const locations: Location[] = [
  {
    slug: 'johnson-city',
    name: 'Johnson City',
    state: 'NY',
    county: 'Broome County',
    tier: 'core',
    driveNote: 'Our shop is right here on Airport Rd - usually a few minutes from anywhere in the village.',
    landmarks: 'Airport Rd / Bristol Highway corridor, near the heart of the Tri-Cities',
    seoDescription: 'Auto repair for Johnson City, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Looking for auto repair in Johnson City? You\'re in the right place - Budget Auto Repair is family-owned on Airport Rd, right here in the village. Bring the car in or send a photo for a free quote. We handle diagnostics, brakes, alignments, electrical work, and general repairs with clear Mitchell 1-based estimates.',
    highlights: [
      'Serving Johnson City from our Johnson City shop',
      'Our shop is right here on Airport Rd - usually a few minutes from anywhere in the village.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Johnson City?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Johnson City and the rest of Broome County. Our shop is right here on Airport Rd - usually a few minutes from anywhere in the village.',
      },
      {
        question: 'How do I get a quote from Johnson City?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Johnson City.',
      },
      {
        question: 'What repairs do you offer for Johnson City drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['binghamton', 'endicott', 'endwell', 'vestal', 'port-dickinson'],
  },
  {
    slug: 'binghamton',
    name: 'Binghamton',
    state: 'NY',
    county: 'Broome County',
    tier: 'core',
    driveNote: 'About 10-15 minutes from downtown Binghamton via Riverside Dr or NY-17 / I-86 to Airport Rd.',
    landmarks: 'Downtown Binghamton, Court Street, and the Southside',
    seoDescription: 'Auto repair for Binghamton, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Binghamton? Budget Auto Repair serves Binghamton, NY drivers from our shop on Airport Rd in Johnson City. About 10-15 minutes from downtown Binghamton via Riverside Dr or NY-17 / I-86 to Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Binghamton from our Johnson City shop',
      'About 10-15 minutes from downtown Binghamton via Riverside Dr or NY-17 / I-86 to Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Binghamton?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Binghamton and the rest of Broome County. About 10-15 minutes from downtown Binghamton via Riverside Dr or NY-17 / I-86 to Airport Rd.',
      },
      {
        question: 'How do I get a quote from Binghamton?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Binghamton.',
      },
      {
        question: 'What repairs do you offer for Binghamton drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['johnson-city', 'endicott', 'endwell', 'vestal', 'port-dickinson'],
  },
  {
    slug: 'endicott',
    name: 'Endicott',
    state: 'NY',
    county: 'Broome County',
    tier: 'core',
    driveNote: 'About 10-15 minutes via Main St / NY-17C or I-86 toward Airport Rd in Johnson City.',
    landmarks: 'North Main Street and the historic Endicott square',
    seoDescription: 'Auto repair for Endicott, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Endicott? Budget Auto Repair serves Endicott, NY drivers from our shop on Airport Rd in Johnson City. About 10-15 minutes via Main St / NY-17C or I-86 toward Airport Rd in Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Endicott from our Johnson City shop',
      'About 10-15 minutes via Main St / NY-17C or I-86 toward Airport Rd in Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Endicott?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Endicott and the rest of Broome County. About 10-15 minutes via Main St / NY-17C or I-86 toward Airport Rd in Johnson City.',
      },
      {
        question: 'How do I get a quote from Endicott?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Endicott.',
      },
      {
        question: 'What repairs do you offer for Endicott drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['binghamton', 'endwell', 'johnson-city', 'vestal', 'port-dickinson'],
  },
  {
    slug: 'endwell',
    name: 'Endwell',
    state: 'NY',
    county: 'Broome County',
    tier: 'core',
    driveNote: 'Usually under 15 minutes via Country Club Rd or Hooper Rd into Johnson City.',
    landmarks: 'Hooper Road corridor and the Endwell / Union area',
    seoDescription: 'Auto repair for Endwell, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Endwell? Budget Auto Repair serves Endwell, NY drivers from our shop on Airport Rd in Johnson City. Usually under 15 minutes via Country Club Rd or Hooper Rd into Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Endwell from our Johnson City shop',
      'Usually under 15 minutes via Country Club Rd or Hooper Rd into Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Endwell?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Endwell and the rest of Broome County. Usually under 15 minutes via Country Club Rd or Hooper Rd into Johnson City.',
      },
      {
        question: 'How do I get a quote from Endwell?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Endwell.',
      },
      {
        question: 'What repairs do you offer for Endwell drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['endicott', 'vestal', 'binghamton', 'port-dickinson', 'johnson-city'],
  },
  {
    slug: 'vestal',
    name: 'Vestal',
    state: 'NY',
    county: 'Broome County',
    tier: 'core',
    driveNote: 'About 15-20 minutes via Vestal Parkway (NY-434) and local connectors into Johnson City.',
    landmarks: 'Vestal Parkway and the Binghamton University area',
    seoDescription: 'Auto repair for Vestal, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Vestal? Budget Auto Repair serves Vestal, NY drivers from our shop on Airport Rd in Johnson City. About 15-20 minutes via Vestal Parkway (NY-434) and local connectors into Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Vestal from our Johnson City shop',
      'About 15-20 minutes via Vestal Parkway (NY-434) and local connectors into Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Vestal?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Vestal and the rest of Broome County. About 15-20 minutes via Vestal Parkway (NY-434) and local connectors into Johnson City.',
      },
      {
        question: 'How do I get a quote from Vestal?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Vestal.',
      },
      {
        question: 'What repairs do you offer for Vestal drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['endwell', 'port-dickinson', 'endicott', 'chenango', 'binghamton'],
  },
  {
    slug: 'port-dickinson',
    name: 'Port Dickinson',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 10 minutes north of Binghamton - a short hop to our Airport Rd shop via Chenango St / I-81 connectors.',
    landmarks: 'Chenango Street corridor along the river',
    seoDescription: 'Auto repair for Port Dickinson, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Port Dickinson? Budget Auto Repair serves Port Dickinson, NY drivers from our shop on Airport Rd in Johnson City. About 10 minutes north of Binghamton - a short hop to our Airport Rd shop via Chenango St / I-81 connectors. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Port Dickinson from our Johnson City shop',
      'About 10 minutes north of Binghamton - a short hop to our Airport Rd shop via Chenango St / I-81 connectors.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Port Dickinson?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Port Dickinson and the rest of Broome County. About 10 minutes north of Binghamton - a short hop to our Airport Rd shop via Chenango St / I-81 connectors.',
      },
      {
        question: 'How do I get a quote from Port Dickinson?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Port Dickinson.',
      },
      {
        question: 'What repairs do you offer for Port Dickinson drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['vestal', 'chenango', 'endwell', 'conklin', 'endicott'],
  },
  {
    slug: 'chenango',
    name: 'Chenango',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 15-20 minutes from the Chenango Bridge / Front Street area to Airport Rd.',
    landmarks: 'Chenango Bridge and Front Street',
    seoDescription: 'Auto repair for Chenango, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Chenango? Budget Auto Repair serves Chenango, NY drivers from our shop on Airport Rd in Johnson City. About 15-20 minutes from the Chenango Bridge / Front Street area to Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Chenango from our Johnson City shop',
      'About 15-20 minutes from the Chenango Bridge / Front Street area to Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Chenango?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Chenango and the rest of Broome County. About 15-20 minutes from the Chenango Bridge / Front Street area to Airport Rd.',
      },
      {
        question: 'How do I get a quote from Chenango?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Chenango.',
      },
      {
        question: 'What repairs do you offer for Chenango drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['port-dickinson', 'conklin', 'vestal', 'kirkwood', 'endwell'],
  },
  {
    slug: 'conklin',
    name: 'Conklin',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 20-25 minutes via Conklin Rd / NY-7 north toward Johnson City.',
    landmarks: 'NY-7 corridor along the Susquehanna',
    seoDescription: 'Auto repair for Conklin, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Conklin? Budget Auto Repair serves Conklin, NY drivers from our shop on Airport Rd in Johnson City. About 20-25 minutes via Conklin Rd / NY-7 north toward Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Conklin from our Johnson City shop',
      'About 20-25 minutes via Conklin Rd / NY-7 north toward Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Conklin?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Conklin and the rest of Broome County. About 20-25 minutes via Conklin Rd / NY-7 north toward Johnson City.',
      },
      {
        question: 'How do I get a quote from Conklin?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Conklin.',
      },
      {
        question: 'What repairs do you offer for Conklin drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['chenango', 'kirkwood', 'port-dickinson', 'dickinson', 'vestal'],
  },
  {
    slug: 'kirkwood',
    name: 'Kirkwood',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 20-25 minutes via US-11 / I-81 toward Binghamton, then over to Airport Rd.',
    landmarks: 'US-11 and the Kirkwood industrial corridor',
    seoDescription: 'Auto repair for Kirkwood, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Kirkwood? Budget Auto Repair serves Kirkwood, NY drivers from our shop on Airport Rd in Johnson City. About 20-25 minutes via US-11 / I-81 toward Binghamton, then over to Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Kirkwood from our Johnson City shop',
      'About 20-25 minutes via US-11 / I-81 toward Binghamton, then over to Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Kirkwood?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Kirkwood and the rest of Broome County. About 20-25 minutes via US-11 / I-81 toward Binghamton, then over to Airport Rd.',
      },
      {
        question: 'How do I get a quote from Kirkwood?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Kirkwood.',
      },
      {
        question: 'What repairs do you offer for Kirkwood drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['conklin', 'dickinson', 'chenango', 'maine-ny', 'port-dickinson'],
  },
  {
    slug: 'dickinson',
    name: 'Dickinson',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'Usually 10-15 minutes from most Dickinson neighborhoods into Johnson City.',
    landmarks: 'Just north of Binghamton along the Front Street corridor',
    seoDescription: 'Auto repair for Dickinson, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Dickinson? Budget Auto Repair serves Dickinson, NY drivers from our shop on Airport Rd in Johnson City. Usually 10-15 minutes from most Dickinson neighborhoods into Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Dickinson from our Johnson City shop',
      'Usually 10-15 minutes from most Dickinson neighborhoods into Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Dickinson?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Dickinson and the rest of Broome County. Usually 10-15 minutes from most Dickinson neighborhoods into Johnson City.',
      },
      {
        question: 'How do I get a quote from Dickinson?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Dickinson.',
      },
      {
        question: 'What repairs do you offer for Dickinson drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['kirkwood', 'maine-ny', 'conklin', 'whitney-point', 'chenango'],
  },
  {
    slug: 'maine-ny',
    name: 'Maine',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 25-30 minutes south via NY-26 toward the Tri-Cities and Airport Rd.',
    landmarks: 'NY-26 corridor through rural Broome',
    seoDescription: 'Auto repair for Maine, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Maine? Budget Auto Repair serves Maine, NY drivers from our shop on Airport Rd in Johnson City. About 25-30 minutes south via NY-26 toward the Tri-Cities and Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Maine from our Johnson City shop',
      'About 25-30 minutes south via NY-26 toward the Tri-Cities and Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Maine?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Maine and the rest of Broome County. About 25-30 minutes south via NY-26 toward the Tri-Cities and Airport Rd.',
      },
      {
        question: 'How do I get a quote from Maine?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Maine.',
      },
      {
        question: 'What repairs do you offer for Maine drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['dickinson', 'whitney-point', 'kirkwood', 'windsor', 'conklin'],
  },
  {
    slug: 'whitney-point',
    name: 'Whitney Point',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 30-35 minutes via I-81 south to Binghamton, then west to Airport Rd.',
    landmarks: 'I-81 exit area and the village center',
    seoDescription: 'Auto repair for Whitney Point, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Whitney Point? Budget Auto Repair serves Whitney Point, NY drivers from our shop on Airport Rd in Johnson City. About 30-35 minutes via I-81 south to Binghamton, then west to Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Whitney Point from our Johnson City shop',
      'About 30-35 minutes via I-81 south to Binghamton, then west to Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Whitney Point?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Whitney Point and the rest of Broome County. About 30-35 minutes via I-81 south to Binghamton, then west to Airport Rd.',
      },
      {
        question: 'How do I get a quote from Whitney Point?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Whitney Point.',
      },
      {
        question: 'What repairs do you offer for Whitney Point drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['maine-ny', 'windsor', 'dickinson', 'deposit', 'kirkwood'],
  },
  {
    slug: 'windsor',
    name: 'Windsor',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 25-30 minutes via NY-17 / I-86 west toward Johnson City.',
    landmarks: 'NY-17 / I-86 corridor and Main Street Windsor',
    seoDescription: 'Auto repair for Windsor, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Windsor? Budget Auto Repair serves Windsor, NY drivers from our shop on Airport Rd in Johnson City. About 25-30 minutes via NY-17 / I-86 west toward Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Windsor from our Johnson City shop',
      'About 25-30 minutes via NY-17 / I-86 west toward Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Windsor?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Windsor and the rest of Broome County. About 25-30 minutes via NY-17 / I-86 west toward Johnson City.',
      },
      {
        question: 'How do I get a quote from Windsor?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Windsor.',
      },
      {
        question: 'What repairs do you offer for Windsor drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['whitney-point', 'deposit', 'maine-ny', 'lisle', 'dickinson'],
  },
  {
    slug: 'deposit',
    name: 'Deposit',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 35-45 minutes via NY-17 / I-86 west into the Tri-Cities.',
    landmarks: 'NY-17 corridor near the Broome-Delaware line',
    seoDescription: 'Auto repair for Deposit, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Deposit? Budget Auto Repair serves Deposit, NY drivers from our shop on Airport Rd in Johnson City. About 35-45 minutes via NY-17 / I-86 west into the Tri-Cities. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Deposit from our Johnson City shop',
      'About 35-45 minutes via NY-17 / I-86 west into the Tri-Cities.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Deposit?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Deposit and the rest of Broome County. About 35-45 minutes via NY-17 / I-86 west into the Tri-Cities.',
      },
      {
        question: 'How do I get a quote from Deposit?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Deposit.',
      },
      {
        question: 'What repairs do you offer for Deposit drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['windsor', 'lisle', 'whitney-point', 'colesville', 'maine-ny'],
  },
  {
    slug: 'lisle',
    name: 'Lisle',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 30-40 minutes via NY-79 / local roads toward I-81 and Johnson City.',
    landmarks: 'Village of Lisle and surrounding farm roads',
    seoDescription: 'Auto repair for Lisle, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Lisle? Budget Auto Repair serves Lisle, NY drivers from our shop on Airport Rd in Johnson City. About 30-40 minutes via NY-79 / local roads toward I-81 and Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Lisle from our Johnson City shop',
      'About 30-40 minutes via NY-79 / local roads toward I-81 and Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Lisle?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Lisle and the rest of Broome County. About 30-40 minutes via NY-79 / local roads toward I-81 and Johnson City.',
      },
      {
        question: 'How do I get a quote from Lisle?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Lisle.',
      },
      {
        question: 'What repairs do you offer for Lisle drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['deposit', 'colesville', 'windsor', 'harpursville', 'whitney-point'],
  },
  {
    slug: 'colesville',
    name: 'Colesville',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 25-35 minutes depending on where you start - typically NY-79 / local roads toward Binghamton.',
    landmarks: 'Harpursville area and Colesville town roads',
    seoDescription: 'Auto repair for Colesville, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Colesville? Budget Auto Repair serves Colesville, NY drivers from our shop on Airport Rd in Johnson City. About 25-35 minutes depending on where you start - typically NY-79 / local roads toward Binghamton. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Colesville from our Johnson City shop',
      'About 25-35 minutes depending on where you start - typically NY-79 / local roads toward Binghamton.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Colesville?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Colesville and the rest of Broome County. About 25-35 minutes depending on where you start - typically NY-79 / local roads toward Binghamton.',
      },
      {
        question: 'How do I get a quote from Colesville?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Colesville.',
      },
      {
        question: 'What repairs do you offer for Colesville drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['lisle', 'harpursville', 'deposit', 'fenton', 'windsor'],
  },
  {
    slug: 'harpursville',
    name: 'Harpursville',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 25-30 minutes west toward Binghamton and Airport Rd in Johnson City.',
    landmarks: 'Main Street Harpursville and NY-79',
    seoDescription: 'Auto repair for Harpursville, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Harpursville? Budget Auto Repair serves Harpursville, NY drivers from our shop on Airport Rd in Johnson City. About 25-30 minutes west toward Binghamton and Airport Rd in Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Harpursville from our Johnson City shop',
      'About 25-30 minutes west toward Binghamton and Airport Rd in Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Harpursville?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Harpursville and the rest of Broome County. About 25-30 minutes west toward Binghamton and Airport Rd in Johnson City.',
      },
      {
        question: 'How do I get a quote from Harpursville?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Harpursville.',
      },
      {
        question: 'What repairs do you offer for Harpursville drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['colesville', 'fenton', 'lisle', 'port-crane', 'deposit'],
  },
  {
    slug: 'fenton',
    name: 'Fenton',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 20-30 minutes via NY-369 / Port Crane roads toward Binghamton and Johnson City.',
    landmarks: 'Port Crane and the NY-369 corridor',
    seoDescription: 'Auto repair for Fenton, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Fenton? Budget Auto Repair serves Fenton, NY drivers from our shop on Airport Rd in Johnson City. About 20-30 minutes via NY-369 / Port Crane roads toward Binghamton and Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Fenton from our Johnson City shop',
      'About 20-30 minutes via NY-369 / Port Crane roads toward Binghamton and Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Fenton?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Fenton and the rest of Broome County. About 20-30 minutes via NY-369 / Port Crane roads toward Binghamton and Johnson City.',
      },
      {
        question: 'How do I get a quote from Fenton?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Fenton.',
      },
      {
        question: 'What repairs do you offer for Fenton drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['harpursville', 'port-crane', 'colesville', 'barker', 'lisle'],
  },
  {
    slug: 'port-crane',
    name: 'Port Crane',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 20-25 minutes via NY-369 toward Binghamton, then over to Airport Rd.',
    landmarks: 'NY-369 through Port Crane',
    seoDescription: 'Auto repair for Port Crane, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Port Crane? Budget Auto Repair serves Port Crane, NY drivers from our shop on Airport Rd in Johnson City. About 20-25 minutes via NY-369 toward Binghamton, then over to Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Port Crane from our Johnson City shop',
      'About 20-25 minutes via NY-369 toward Binghamton, then over to Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Port Crane?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Port Crane and the rest of Broome County. About 20-25 minutes via NY-369 toward Binghamton, then over to Airport Rd.',
      },
      {
        question: 'How do I get a quote from Port Crane?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Port Crane.',
      },
      {
        question: 'What repairs do you offer for Port Crane drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['fenton', 'barker', 'harpursville', 'nanticoke', 'colesville'],
  },
  {
    slug: 'barker',
    name: 'Barker',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 30-40 minutes via local Broome roads toward I-81 / the Tri-Cities.',
    landmarks: 'Rural northern Broome near the Whitney Point area',
    seoDescription: 'Auto repair for Barker, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Barker? Budget Auto Repair serves Barker, NY drivers from our shop on Airport Rd in Johnson City. About 30-40 minutes via local Broome roads toward I-81 / the Tri-Cities. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Barker from our Johnson City shop',
      'About 30-40 minutes via local Broome roads toward I-81 / the Tri-Cities.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Barker?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Barker and the rest of Broome County. About 30-40 minutes via local Broome roads toward I-81 / the Tri-Cities.',
      },
      {
        question: 'How do I get a quote from Barker?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Barker.',
      },
      {
        question: 'What repairs do you offer for Barker drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['port-crane', 'nanticoke', 'fenton', 'triangle', 'harpursville'],
  },
  {
    slug: 'nanticoke',
    name: 'Nanticoke',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 30-40 minutes via Maine / Nanticoke roads south toward Johnson City.',
    landmarks: 'Cherry Valley Hill Rd and surrounding hills',
    seoDescription: 'Auto repair for Nanticoke, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Nanticoke? Budget Auto Repair serves Nanticoke, NY drivers from our shop on Airport Rd in Johnson City. About 30-40 minutes via Maine / Nanticoke roads south toward Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Nanticoke from our Johnson City shop',
      'About 30-40 minutes via Maine / Nanticoke roads south toward Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Nanticoke?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Nanticoke and the rest of Broome County. About 30-40 minutes via Maine / Nanticoke roads south toward Johnson City.',
      },
      {
        question: 'How do I get a quote from Nanticoke?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Nanticoke.',
      },
      {
        question: 'What repairs do you offer for Nanticoke drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['barker', 'triangle', 'port-crane', 'sanford', 'fenton'],
  },
  {
    slug: 'triangle',
    name: 'Triangle',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 30-40 minutes via I-81 or NY-26 toward Binghamton and Airport Rd.',
    landmarks: 'Near Whitney Point along northern Broome routes',
    seoDescription: 'Auto repair for Triangle, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Triangle? Budget Auto Repair serves Triangle, NY drivers from our shop on Airport Rd in Johnson City. About 30-40 minutes via I-81 or NY-26 toward Binghamton and Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Triangle from our Johnson City shop',
      'About 30-40 minutes via I-81 or NY-26 toward Binghamton and Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Triangle?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Triangle and the rest of Broome County. About 30-40 minutes via I-81 or NY-26 toward Binghamton and Airport Rd.',
      },
      {
        question: 'How do I get a quote from Triangle?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Triangle.',
      },
      {
        question: 'What repairs do you offer for Triangle drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['nanticoke', 'sanford', 'barker', 'castle-creek', 'port-crane'],
  },
  {
    slug: 'sanford',
    name: 'Sanford',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 35-45 minutes via NY-17 / I-86 or NY-41 toward the Tri-Cities.',
    landmarks: 'Eastern Broome near Deposit',
    seoDescription: 'Auto repair for Sanford, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Sanford? Budget Auto Repair serves Sanford, NY drivers from our shop on Airport Rd in Johnson City. About 35-45 minutes via NY-17 / I-86 or NY-41 toward the Tri-Cities. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Sanford from our Johnson City shop',
      'About 35-45 minutes via NY-17 / I-86 or NY-41 toward the Tri-Cities.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Sanford?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Sanford and the rest of Broome County. About 35-45 minutes via NY-17 / I-86 or NY-41 toward the Tri-Cities.',
      },
      {
        question: 'How do I get a quote from Sanford?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Sanford.',
      },
      {
        question: 'What repairs do you offer for Sanford drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['triangle', 'castle-creek', 'nanticoke', 'hillcrest', 'barker'],
  },
  {
    slug: 'castle-creek',
    name: 'Castle Creek',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 20-25 minutes via US-11 / I-81 toward Binghamton, then to Airport Rd.',
    landmarks: 'US-11 corridor north of Binghamton',
    seoDescription: 'Auto repair for Castle Creek, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Castle Creek? Budget Auto Repair serves Castle Creek, NY drivers from our shop on Airport Rd in Johnson City. About 20-25 minutes via US-11 / I-81 toward Binghamton, then to Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Castle Creek from our Johnson City shop',
      'About 20-25 minutes via US-11 / I-81 toward Binghamton, then to Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Castle Creek?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Castle Creek and the rest of Broome County. About 20-25 minutes via US-11 / I-81 toward Binghamton, then to Airport Rd.',
      },
      {
        question: 'How do I get a quote from Castle Creek?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Castle Creek.',
      },
      {
        question: 'What repairs do you offer for Castle Creek drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['sanford', 'hillcrest', 'triangle', 'west-corners', 'nanticoke'],
  },
  {
    slug: 'hillcrest',
    name: 'Hillcrest',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'Usually 10-15 minutes into Johnson City from the Hillcrest / Upper Front Street area.',
    landmarks: 'Upper Front Street and the Hillcrest neighborhood',
    seoDescription: 'Auto repair for Hillcrest, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Hillcrest? Budget Auto Repair serves Hillcrest, NY drivers from our shop on Airport Rd in Johnson City. Usually 10-15 minutes into Johnson City from the Hillcrest / Upper Front Street area. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Hillcrest from our Johnson City shop',
      'Usually 10-15 minutes into Johnson City from the Hillcrest / Upper Front Street area.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Hillcrest?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Hillcrest and the rest of Broome County. Usually 10-15 minutes into Johnson City from the Hillcrest / Upper Front Street area.',
      },
      {
        question: 'How do I get a quote from Hillcrest?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Hillcrest.',
      },
      {
        question: 'What repairs do you offer for Hillcrest drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['castle-creek', 'west-corners', 'sanford', 'apalachin', 'triangle'],
  },
  {
    slug: 'west-corners',
    name: 'West Corners',
    state: 'NY',
    county: 'Broome County',
    tier: 'broome',
    driveNote: 'About 10-15 minutes via local Endicott / Union roads into Johnson City.',
    landmarks: 'West Corners between Endicott and Endwell',
    seoDescription: 'Auto repair for West Corners, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in West Corners? Budget Auto Repair serves West Corners, NY drivers from our shop on Airport Rd in Johnson City. About 10-15 minutes via local Endicott / Union roads into Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving West Corners from our Johnson City shop',
      'About 10-15 minutes via local Endicott / Union roads into Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in West Corners?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from West Corners and the rest of Broome County. About 10-15 minutes via local Endicott / Union roads into Johnson City.',
      },
      {
        question: 'How do I get a quote from West Corners?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from West Corners.',
      },
      {
        question: 'What repairs do you offer for West Corners drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['hillcrest', 'apalachin', 'castle-creek', 'owego', 'sanford'],
  },
  {
    slug: 'apalachin',
    name: 'Apalachin',
    state: 'NY',
    county: 'Tioga County',
    tier: 'nearby',
    driveNote: 'About 20-25 minutes via NY-17 / I-86 east into Johnson City.',
    landmarks: 'NY-17 exits and the Apalachin hamlet',
    seoDescription: 'Auto repair for Apalachin, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Apalachin? Budget Auto Repair serves Apalachin, NY drivers from our shop on Airport Rd in Johnson City. About 20-25 minutes via NY-17 / I-86 east into Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Apalachin from our Johnson City shop',
      'About 20-25 minutes via NY-17 / I-86 east into Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Apalachin?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Apalachin and the rest of Tioga County. About 20-25 minutes via NY-17 / I-86 east into Johnson City.',
      },
      {
        question: 'How do I get a quote from Apalachin?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Apalachin.',
      },
      {
        question: 'What repairs do you offer for Apalachin drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['west-corners', 'owego', 'hillcrest', 'newark-valley', 'castle-creek'],
  },
  {
    slug: 'owego',
    name: 'Owego',
    state: 'NY',
    county: 'Tioga County',
    tier: 'nearby',
    driveNote: 'About 30-35 minutes via NY-17 / I-86 east to Airport Rd.',
    landmarks: 'Downtown Owego and the NY-17 corridor',
    seoDescription: 'Auto repair for Owego, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Owego? Budget Auto Repair serves Owego, NY drivers from our shop on Airport Rd in Johnson City. About 30-35 minutes via NY-17 / I-86 east to Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Owego from our Johnson City shop',
      'About 30-35 minutes via NY-17 / I-86 east to Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Owego?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Owego and the rest of Tioga County. About 30-35 minutes via NY-17 / I-86 east to Airport Rd.',
      },
      {
        question: 'How do I get a quote from Owego?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Owego.',
      },
      {
        question: 'What repairs do you offer for Owego drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['apalachin', 'newark-valley', 'west-corners', 'candor', 'hillcrest'],
  },
  {
    slug: 'newark-valley',
    name: 'Newark Valley',
    state: 'NY',
    county: 'Tioga County',
    tier: 'nearby',
    driveNote: 'About 35-45 minutes via NY-38 / NY-96 toward Owego and NY-17 east.',
    landmarks: 'NY-38 through Newark Valley',
    seoDescription: 'Auto repair for Newark Valley, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Newark Valley? Budget Auto Repair serves Newark Valley, NY drivers from our shop on Airport Rd in Johnson City. About 35-45 minutes via NY-38 / NY-96 toward Owego and NY-17 east. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Newark Valley from our Johnson City shop',
      'About 35-45 minutes via NY-38 / NY-96 toward Owego and NY-17 east.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Newark Valley?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Newark Valley and the rest of Tioga County. About 35-45 minutes via NY-38 / NY-96 toward Owego and NY-17 east.',
      },
      {
        question: 'How do I get a quote from Newark Valley?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Newark Valley.',
      },
      {
        question: 'What repairs do you offer for Newark Valley drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['owego', 'candor', 'apalachin', 'waverly', 'west-corners'],
  },
  {
    slug: 'candor',
    name: 'Candor',
    state: 'NY',
    county: 'Tioga County',
    tier: 'nearby',
    driveNote: 'About 40-50 minutes via NY-96 toward Owego, then NY-17 east to Johnson City.',
    landmarks: 'NY-96 corridor in Tioga County',
    seoDescription: 'Auto repair for Candor, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Candor? Budget Auto Repair serves Candor, NY drivers from our shop on Airport Rd in Johnson City. About 40-50 minutes via NY-96 toward Owego, then NY-17 east to Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Candor from our Johnson City shop',
      'About 40-50 minutes via NY-96 toward Owego, then NY-17 east to Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Candor?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Candor and the rest of Tioga County. About 40-50 minutes via NY-96 toward Owego, then NY-17 east to Johnson City.',
      },
      {
        question: 'How do I get a quote from Candor?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Candor.',
      },
      {
        question: 'What repairs do you offer for Candor drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['newark-valley', 'waverly', 'owego', 'greene', 'apalachin'],
  },
  {
    slug: 'waverly',
    name: 'Waverly',
    state: 'NY',
    county: 'Tioga County',
    tier: 'nearby',
    driveNote: 'About 45-55 minutes via NY-17 / I-86 east toward the Tri-Cities.',
    landmarks: 'NY-17 near the NY-PA line',
    seoDescription: 'Auto repair for Waverly, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Waverly? Budget Auto Repair serves Waverly, NY drivers from our shop on Airport Rd in Johnson City. About 45-55 minutes via NY-17 / I-86 east toward the Tri-Cities. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Waverly from our Johnson City shop',
      'About 45-55 minutes via NY-17 / I-86 east toward the Tri-Cities.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Waverly?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Waverly and the rest of Tioga County. About 45-55 minutes via NY-17 / I-86 east toward the Tri-Cities.',
      },
      {
        question: 'How do I get a quote from Waverly?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Waverly.',
      },
      {
        question: 'What repairs do you offer for Waverly drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['candor', 'greene', 'newark-valley', 'marathon', 'owego'],
  },
  {
    slug: 'greene',
    name: 'Greene',
    state: 'NY',
    county: 'Chenango County',
    tier: 'nearby',
    driveNote: 'About 35-45 minutes via NY-12 / I-81 toward Binghamton, then to Airport Rd.',
    landmarks: 'NY-12 through Greene',
    seoDescription: 'Auto repair for Greene, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Greene? Budget Auto Repair serves Greene, NY drivers from our shop on Airport Rd in Johnson City. About 35-45 minutes via NY-12 / I-81 toward Binghamton, then to Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Greene from our Johnson City shop',
      'About 35-45 minutes via NY-12 / I-81 toward Binghamton, then to Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Greene?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Greene and the rest of Chenango County. About 35-45 minutes via NY-12 / I-81 toward Binghamton, then to Airport Rd.',
      },
      {
        question: 'How do I get a quote from Greene?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Greene.',
      },
      {
        question: 'What repairs do you offer for Greene drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['waverly', 'marathon', 'candor', 'hallstead', 'newark-valley'],
  },
  {
    slug: 'marathon',
    name: 'Marathon',
    state: 'NY',
    county: 'Cortland County',
    tier: 'nearby',
    driveNote: 'About 40-50 minutes via I-81 south to Binghamton, then west to Johnson City.',
    landmarks: 'I-81 corridor through Marathon',
    seoDescription: 'Auto repair for Marathon, NY drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Marathon? Budget Auto Repair serves Marathon, NY drivers from our shop on Airport Rd in Johnson City. About 40-50 minutes via I-81 south to Binghamton, then west to Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Marathon from our Johnson City shop',
      'About 40-50 minutes via I-81 south to Binghamton, then west to Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Marathon?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Marathon and the rest of Cortland County. About 40-50 minutes via I-81 south to Binghamton, then west to Johnson City.',
      },
      {
        question: 'How do I get a quote from Marathon?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Marathon.',
      },
      {
        question: 'What repairs do you offer for Marathon drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['greene', 'hallstead', 'waverly', 'great-bend', 'candor'],
  },
  {
    slug: 'hallstead',
    name: 'Hallstead',
    state: 'PA',
    county: 'Susquehanna County',
    tier: 'nearby',
    driveNote: 'About 30-40 minutes via I-81 north into Binghamton, then over to Airport Rd.',
    landmarks: 'I-81 just south of the NY line',
    seoDescription: 'Auto repair for Hallstead, PA drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Hallstead? Budget Auto Repair serves Hallstead, PA drivers from our shop on Airport Rd in Johnson City. About 30-40 minutes via I-81 north into Binghamton, then over to Airport Rd. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Hallstead from our Johnson City shop',
      'About 30-40 minutes via I-81 north into Binghamton, then over to Airport Rd.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Hallstead?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Hallstead and the rest of Susquehanna County. About 30-40 minutes via I-81 north into Binghamton, then over to Airport Rd.',
      },
      {
        question: 'How do I get a quote from Hallstead?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Hallstead.',
      },
      {
        question: 'What repairs do you offer for Hallstead drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['marathon', 'great-bend', 'greene', 'susquehanna-pa', 'waverly'],
  },
  {
    slug: 'great-bend',
    name: 'Great Bend',
    state: 'PA',
    county: 'Susquehanna County',
    tier: 'nearby',
    driveNote: 'About 25-35 minutes via US-11 / I-81 into Binghamton and Johnson City.',
    landmarks: 'US-11 near Great Bend',
    seoDescription: 'Auto repair for Great Bend, PA drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Great Bend? Budget Auto Repair serves Great Bend, PA drivers from our shop on Airport Rd in Johnson City. About 25-35 minutes via US-11 / I-81 into Binghamton and Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Great Bend from our Johnson City shop',
      'About 25-35 minutes via US-11 / I-81 into Binghamton and Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Great Bend?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Great Bend and the rest of Susquehanna County. About 25-35 minutes via US-11 / I-81 into Binghamton and Johnson City.',
      },
      {
        question: 'How do I get a quote from Great Bend?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Great Bend.',
      },
      {
        question: 'What repairs do you offer for Great Bend drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['hallstead', 'susquehanna-pa', 'marathon', 'greene', 'waverly'],
  },
  {
    slug: 'susquehanna-pa',
    name: 'Susquehanna',
    state: 'PA',
    county: 'Susquehanna County',
    tier: 'nearby',
    driveNote: 'About 35-45 minutes via PA routes to I-81 north, then to Airport Rd in Johnson City.',
    landmarks: 'Borough of Susquehanna along the river',
    seoDescription: 'Auto repair for Susquehanna, PA drivers. Family-owned Budget Auto Repair on Airport Rd in Johnson City - free photo quote, brakes, diagnostics, and more.',
    intro: 'Need auto repair in Susquehanna? Budget Auto Repair serves Susquehanna, PA drivers from our shop on Airport Rd in Johnson City. About 35-45 minutes via PA routes to I-81 north, then to Airport Rd in Johnson City. Send a photo of the issue or another shop\'s estimate and we\'ll reply with a real number - usually within the hour during shop hours.',
    highlights: [
      'Serving Susquehanna from our Johnson City shop',
      'About 35-45 minutes via PA routes to I-81 north, then to Airport Rd in Johnson City.',
      'Free photo quotes - no account required',
      'Brakes, diagnostics, alignments, electrical & more',
    ],
    faqs: [
      {
        question: 'Do you have a shop in Susquehanna?',
        answer: 'Our shop is at 2344 Airport Rd in Johnson City, NY. We regularly serve customers from Susquehanna and the rest of Susquehanna County. About 35-45 minutes via PA routes to I-81 north, then to Airport Rd in Johnson City.',
      },
      {
        question: 'How do I get a quote from Susquehanna?',
        answer: 'Text us at (607) 323-0236, call the shop, or use the Request Service Online form - send your name, vehicle and what\'s going on, plus a photo of the problem or another shop\'s estimate. We\'ll come back to you with the next step before you drive over from Susquehanna.',
      },
      {
        question: 'What repairs do you offer for Susquehanna drivers?',
        answer: 'Engine diagnostics, maintenance and repair, brakes, suspension and alignment, electrical systems, presale inspections, and general repairs. If you\'re not sure what it is, send a photo anyway.',
      },
    ],
    nearbySlugs: ['great-bend', 'hallstead', 'marathon', 'greene', 'waverly'],
  },
];

export function getLocationBySlug(slug: string) {
  return locations.find((location) => location.slug === slug);
}

export function locationsByTier() {
  return {
    core: locations.filter((l) => l.tier === 'core'),
    broome: locations.filter((l) => l.tier === 'broome'),
    nearby: locations.filter((l) => l.tier === 'nearby'),
  };
}

export function featuredLocations(limit = 5) {
  return locations.filter((l) => l.tier === 'core').slice(0, limit);
}
