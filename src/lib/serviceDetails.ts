import { landingServices } from './serviceDefinitions';
import { coreServiceDetails } from './serviceDetailsCore';
import { additionalServiceDetails } from './serviceDetailsAdditional';
import { specialtyServiceDetails } from './serviceDetailsSpecialty';
import type { ServiceDetail } from './servicePageTypes';

export const serviceDetails: Record<string, ServiceDetail> = {
  ...coreServiceDetails,
  ...additionalServiceDetails,
  ...specialtyServiceDetails,
};

// A catalog link must never silently become an empty marketing page.
for (const service of landingServices) {
  const detail = serviceDetails[service.slug];
  if (!detail || !detail.intro.length || !detail.included.length || !detail.faqs.length) {
    throw new Error(`Missing service page content: ${service.slug}`);
  }
  for (const slug of detail.related) {
    if (!landingServices.some((item) => item.slug === slug)) {
      throw new Error(`Unknown related service ${slug} on ${service.slug}`);
    }
  }
}
