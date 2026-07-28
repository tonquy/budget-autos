import type { ImageMetadata } from 'astro';
import bayImage from '../assets/images/services-bay.jpg';
import engineImage from '../assets/images/detail-engine.jpg';
import brakesImage from '../assets/images/detail-brakes.jpg';
import diagnosticsImage from '../assets/images/detail-diagnostics.jpg';
import suspensionImage from '../assets/images/detail-suspension.jpg';
import electricalImage from '../assets/images/detail-electrical.jpg';
import presaleImage from '../assets/images/detail-presale-inspection.jpg';

export const serviceImages: Record<string, ImageMetadata> = {
  diagnostics: diagnosticsImage,
  'engine-maintenance': engineImage,
  'brake-services': brakesImage,
  'suspension-alignment': suspensionImage,
  'electrical-systems': electricalImage,
  'presale-inspection': presaleImage,
  'general-repairs': bayImage,
};
