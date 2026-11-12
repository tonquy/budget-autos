import { services, type Service } from './business';

// Marketing pages are deliberately separate from the seven configured Cal.com
// appointment types. These categories start with a service-specific quote.
export const additionalServices: Service[] = [
  {
    slug: 'tires',
    name: 'Tires & Tire Rotation',
    description: 'Replacement tires, rotation, and a closer look at uneven wear before it costs you another set.',
    longDescription: 'Tire service begins with the vehicle, the condition of the tires, and the way you drive. Discuss replacement and rotation with Budget Autos Repair in Johnson City, including whether alignment or suspension work should come first.',
    seoDescription: 'Tire replacement and rotation in Johnson City, NY. Get help with worn tires, uneven tread, fitment, and a vehicle-specific quote from Budget Autos Repair.',
    highlights: ['Replacement tire fitment', 'Tire rotation planning', 'Tread and wear concerns', 'Related alignment and suspension checks'],
    faqs: [],
    icon: 'circle-dot',
  },
  {
    slug: 'air-conditioning',
    name: 'Car Air Conditioning',
    description: 'Warm air, weak airflow, or cooling that comes and goes? Start with the cause before choosing a recharge or repair.',
    longDescription: 'Budget Autos Repair handles air-conditioning service requests in Johnson City. Share your vehicle details so we can confirm the refrigerant system, service scope, and next step for an A/C recharge or component repair.',
    seoDescription: 'Car A/C service in Johnson City, NY. Discuss weak cooling, leaks, recharge, and air-conditioning repair with Budget Autos Repair. Request a vehicle-specific quote.',
    highlights: ['Cooling and airflow concerns', 'Refrigerant and leak assessment', 'A/C recharge requests', 'Component repair or replacement planning'],
    faqs: [],
    icon: 'snowflake',
  },
  {
    slug: 'transmission',
    name: 'Transmission Repair',
    description: 'Slipping, delayed engagement, and shifting problems deserve a diagnosis before a major repair decision.',
    longDescription: 'Transmission symptoms can come from fluid loss, electronic controls, or internal wear. Budget Autos Repair helps Johnson City drivers discuss the concern, confirm vehicle-specific service availability, and compare repair or replacement options.',
    seoDescription: 'Transmission repair and replacement inquiries in Johnson City, NY. Get help with slipping, hard shifts, leaks, and repair options at Budget Autos Repair.',
    highlights: ['Shift and engagement concerns', 'Leak and warning-light assessment', 'Repair-versus-replacement discussion', 'Vehicle-specific scope and estimates'],
    faqs: [],
    icon: 'cog',
  },
  {
    slug: 'exhaust',
    name: 'Exhaust System Repair',
    description: 'Loud exhaust, rattles, or a suspected leak? Find the damaged section and understand the repair options.',
    longDescription: 'Road salt and everyday wear can affect exhaust pipes, joints, hangers, and mufflers. Budget Autos Repair accepts exhaust repair and replacement requests in Johnson City, with the repair plan based on the condition of the system.',
    seoDescription: 'Exhaust repair in Johnson City, NY. Discuss leaks, rattles, mufflers, damaged pipes, and exhaust replacement with Budget Autos Repair. Request a quote.',
    highlights: ['Exhaust noise and leak concerns', 'Pipe, joint, and hanger condition', 'Muffler and system replacement options', 'Related engine fault diagnosis'],
    faqs: [],
    icon: 'wind',
  },
  {
    slug: 'glass',
    name: 'Auto Glass, Windows & Mirrors',
    description: 'Help with damaged glass, broken mirrors, and window problems, with the right fit and scope confirmed first.',
    longDescription: 'A windshield chip, shattered side window, and failed window motor need different solutions. Send photos and vehicle details to Budget Autos Repair so we can review the damage and confirm the right glass, window, or mirror service.',
    seoDescription: 'Auto glass, window, and mirror service in Johnson City, NY. Send photos of windshield, side, rear, or sunroof damage to Budget Autos Repair for a quote.',
    highlights: ['Windshield repair and replacement inquiries', 'Side, rear, and sunroof glass', 'Side-view mirror damage', 'Glass versus window-mechanism diagnosis'],
    faqs: [],
    icon: 'app-window',
  },
  {
    slug: 'body-trim',
    name: 'Body, Trim & Water Leaks',
    description: 'Loose trim, damaged exterior parts, and water getting inside—start with photos and a clear repair plan.',
    longDescription: 'Budget Autos Repair accepts body and trim repair requests, replacement inquiries, and vehicle water-leak concerns. Share photos before your visit so we can confirm the job fits the shop and explain what needs an in-person inspection.',
    seoDescription: 'Body, trim, and vehicle water-leak repair inquiries in Johnson City, NY. Send damage photos to Budget Autos Repair to confirm scope and request a quote.',
    highlights: ['Loose or damaged body trim', 'Repair and replacement assessment', 'Interior water-leak concerns', 'Photo review before scheduling'],
    faqs: [],
    icon: 'car-front',
  },
  {
    slug: 'detailing',
    name: 'Auto Detailing',
    description: 'A cleaner cabin and a cared-for finish, with detailing, interior vacuuming, and waxing planned around your vehicle.',
    longDescription: 'Daily driving leaves dirt, grit, and road residue behind. Discuss auto detailing, interior vacuuming, and car waxing with Budget Autos Repair in Johnson City, and choose a scope that matches the condition of your vehicle.',
    seoDescription: 'Auto detailing, interior vacuuming, and car waxing in Johnson City, NY. Share your vehicle and cleaning priorities with Budget Autos Repair for a quote.',
    highlights: ['Vehicle detailing requests', 'Interior vacuuming', 'Car waxing', 'Condition-based scope and estimates'],
    faqs: [],
    icon: 'sparkles',
  },
  {
    slug: 'paintless-dent-repair',
    name: 'Hail Damage & Paintless Dent Repair',
    description: 'Door dings, small dents, and hail damage, with paintless dent removal where the paint and panel allow it.',
    longDescription: 'Paintless dent repair works the metal back into shape without sanding, filler, or repainting when the paint is intact and the dent can be reached. Send photos of door dings, small dents, or hail damage to Budget Autos Repair in Johnson City and we will tell you whether PDR is a good fit.',
    seoDescription: 'Paintless dent repair and hail damage repair in Johnson City, NY. Send photos of door dings, small dents, or hail damage to Budget Autos Repair for a free quote.',
    highlights: ['Door dings and small dents', 'Hail damage assessment', 'Paintless dent removal', 'Photo review before scheduling'],
    faqs: [],
    icon: 'cloud-hail',
  },
  {
    slug: 'car-key-replacement',
    name: 'Car Key Replacement & Programming',
    description: 'Spare keys, lost keys, key fobs, transponder keys, smart keys, and push-to-start key programming.',
    longDescription: 'Lost your only key, or want a spare before that happens? Budget Autos Repair in Johnson City handles car key replacement and programming requests, including key fobs, transponder keys, and push-to-start smart keys. Send your year, make, model, and VIN so we can confirm the right key for your vehicle.',
    seoDescription: 'Car key replacement and programming in Johnson City, NY. Spare keys, lost keys, key fobs, transponder and push-to-start smart keys. Request a free quote with your VIN.',
    highlights: ['Spare and replacement keys', 'Lost-key situations', 'Key fob and remote programming', 'Transponder and push-to-start smart keys'],
    faqs: [],
    icon: 'key-round',
  },
  {
    slug: 'windshield-replacement',
    name: 'Windshield Replacement & Auto Glass',
    description: 'Cracked or damaged windshields replaced, and auto glass installed with the right part for your vehicle.',
    longDescription: 'A crack that spreads across the windshield, or glass that is broken outright, usually means replacement. Budget Autos Repair in Johnson City handles windshield replacement and auto glass installation requests. Send a photo and your VIN so we can match the glass and any camera or sensor features before your visit.',
    seoDescription: 'Windshield replacement and auto glass installation in Johnson City, NY. Send a photo of cracked or damaged glass and your VIN to Budget Autos Repair for a free quote.',
    highlights: ['Cracked windshield replacement', 'Damaged auto glass', 'Auto glass installation', 'Camera and sensor features confirmed'],
    faqs: [],
    icon: 'windshield',
  },
];

export const landingServices: Service[] = [...services, ...additionalServices];

export function getLandingServiceBySlug(slug: string) {
  return landingServices.find((service) => service.slug === slug);
}
