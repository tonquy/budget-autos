import type { ImageMetadata } from 'astro';
import bayImage from '../assets/images/services-bay.jpg';
import engineImage from '../assets/images/detail-engine.jpg';
import diagnosticsImage from '../assets/images/detail-diagnostics.jpg';
import suspensionImage from '../assets/images/detail-suspension.jpg';
import electricalImage from '../assets/images/detail-electrical.jpg';
import presaleImage from '../assets/images/detail-presale-inspection.jpg';
import caliperPhoto from '../assets/images/jobs/caliper-detail.webp';
import exposedBrakePhoto from '../assets/images/jobs/workshop/img-2923.webp';
import enginesPhoto from '../assets/images/jobs/workshop/img-3187.webp';
import engineBayPhoto from '../assets/images/jobs/workshop/img-3188.webp';
import brakeBeforePhoto from '../assets/images/jobs/before.webp';
import brakeAfterPhoto from '../assets/images/jobs/after.webp';
import tiresImage from '../assets/images/services/tires.webp';
import airConditioningImage from '../assets/images/services/air-conditioning.webp';
import transmissionImage from '../assets/images/services/transmission.webp';
import exhaustImage from '../assets/images/services/exhaust.webp';
import glassImage from '../assets/images/services/glass.webp';
import bodyTrimImage from '../assets/images/services/body-trim.webp';
import detailingImage from '../assets/images/services/detailing.webp';

export interface ServiceMedia {
  hero: ImageMetadata;
  heroAlt: string;
  detail: ImageMetadata;
  detailAlt: string;
  caption: string;
  video?: { src: string; poster: string; caption: string };
  caseStudy?: {
    title: string;
    text: string;
    images: { src: ImageMetadata; alt: string; caption: string }[];
  };
}

// Illustrative media is described by subject. Only documented workshop assets
// are identified as actual shop work in captions and case studies.
export const serviceMedia: Record<string, ServiceMedia> = {
  diagnostics: {
    hero: diagnosticsImage,
    heroAlt: 'A diagnostic scan tool beside an open engine bay.',
    detail: diagnosticsImage,
    detailAlt: 'Handheld automotive scan tool with an engine bay in the background.',
    caption: 'Service illustration.',
  },
  'engine-maintenance': {
    hero: engineImage,
    heroAlt: 'Hands using a wrench on a vehicle engine.',
    detail: enginesPhoto,
    detailAlt: 'Engine assemblies resting on pallets in the workshop.',
    caption: 'Engine assemblies photographed in our workshop.',
    video: {
      src: '/jobs/workshop/img-3189-silent.mp4',
      poster: '/jobs/workshop/img-3189-poster.webp',
      caption: 'Engine bay walkthrough from our workshop. No audio.',
    },
  },
  'brake-services': {
    hero: caliperPhoto,
    heroAlt: 'Close-up of a brake caliper and pads during a brake inspection.',
    detail: exposedBrakePhoto,
    detailAlt: 'Brake caliper and rotor exposed with the wheel removed.',
    caption: 'A brake assembly photographed during work in our shop.',
    video: {
      src: '/jobs/workshop/img-2918-silent.mp4',
      poster: '/jobs/workshop/img-2918-poster.webp',
      caption: 'Brake assembly close-up from our workshop. No audio.',
    },
    caseStudy: {
      title: 'A closer look at brake drag',
      text: 'A customer reported shaking and possible brake overheating. Inspection found uneven brake temperatures and seized calipers causing drag. These before-and-after photographs record readings from that specific job; temperatures depend on driving and test conditions.',
      images: [
        {
          src: brakeBeforePhoto,
          alt: 'Thermal camera aimed at a wheel reads 396.9 degrees Fahrenheit before repair.',
          caption: 'Before: 396.9°F recorded at the wheel.',
        },
        {
          src: brakeAfterPhoto,
          alt: 'Thermal camera aimed at a wheel reads 119.8 degrees Fahrenheit after repair.',
          caption: 'After: 119.8°F recorded at the wheel.',
        },
      ],
    },
  },
  'suspension-alignment': {
    hero: suspensionImage,
    heroAlt: 'A suspension spring and strut beside an exposed brake rotor.',
    detail: suspensionImage,
    detailAlt: 'Close-up of a vehicle suspension spring, strut and brake rotor.',
    caption: 'Service illustration.',
  },
  'electrical-systems': {
    hero: electricalImage,
    heroAlt: 'Electrical test probes positioned near wiring in an engine bay.',
    detail: electricalImage,
    detailAlt: 'Red and black electrical test leads used near vehicle wiring.',
    caption: 'Service illustration.',
  },
  'presale-inspection': {
    hero: presaleImage,
    heroAlt: 'An inspection clipboard and phone resting on a vehicle hood.',
    detail: presaleImage,
    detailAlt: 'A vehicle inspection checklist on a clipboard beside a phone.',
    caption: 'Service illustration.',
  },
  'general-repairs': {
    hero: bayImage,
    heroAlt: 'A vehicle raised on a lift in an automotive workshop.',
    detail: engineBayPhoto,
    detailAlt: 'Engine bay with the engine removed and the transmission visible.',
    caption: 'An open engine bay photographed in our workshop.',
  },
  tires: {
    hero: tiresImage,
    heroAlt: 'A passenger-car tire beside a wheel balancing machine.',
    detail: tiresImage,
    detailAlt: 'Tire tread, an alloy wheel and wheel balancing equipment.',
    caption: 'Service illustration.',
  },
  'air-conditioning': {
    hero: airConditioningImage,
    heroAlt: 'A vehicle dashboard with central air-conditioning vents and climate controls.',
    detail: airConditioningImage,
    detailAlt: 'Close-up of dashboard ventilation louvers and temperature-control dials.',
    caption: 'Service illustration.',
  },
  transmission: {
    hero: transmissionImage,
    heroAlt: 'An automatic-transmission oil pan viewed from underneath a raised vehicle.',
    detail: transmissionImage,
    detailAlt: 'Transmission pan and surrounding underbody components.',
    caption: 'Service illustration.',
  },
  exhaust: {
    hero: exhaustImage,
    heroAlt: 'An automotive muffler and attached exhaust pipes on a workbench.',
    detail: exhaustImage,
    detailAlt: 'A replacement muffler with inlet and outlet pipes and a mounting hanger.',
    caption: 'Service illustration.',
  },
  glass: {
    hero: glassImage,
    heroAlt: 'A small stone chip in a vehicle windshield above the wiper.',
    detail: glassImage,
    detailAlt: 'Close view of a localized windshield chip with the dashboard behind the glass.',
    caption: 'Service illustration.',
  },
  'body-trim': {
    hero: bodyTrimImage,
    heroAlt: 'A removed interior door panel with plastic trim clips and removal tools.',
    detail: bodyTrimImage,
    detailAlt: 'Door trim panel resting on a padded bench beside retaining clips.',
    caption: 'Service illustration.',
  },
  detailing: {
    hero: detailingImage,
    heroAlt: 'A gloved hand wiping a dark vehicle hood with a microfiber towel.',
    detail: detailingImage,
    detailAlt: 'A folded microfiber towel being used on glossy vehicle paint.',
    caption: 'Service illustration.',
  },
};
