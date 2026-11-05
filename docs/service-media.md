# Service media provenance

Updated: 2026-11-05.

## How media is used

`src/lib/serviceMedia.ts` maps each service to its hero, supporting image, descriptive alt text, and caption. Images under `src/assets/images/services/` are AI-generated service illustrations, not photographs of Budget Autos Repair, its employees, or completed customer jobs. Their visible caption is “Service illustration.” Do not describe them as evidence of shop equipment or a repair outcome.

Existing `detail-*.jpg` and `services-bay.jpg` assets have no documented source in this repository. They remain illustrative images with descriptive alt text and no invented location, employee or job claims.

## Genuine workshop media

The existing `src/assets/images/jobs/` photos and `/public/jobs/` photos and videos were already used by the site's RecentJobs component as workshop/job records. This expansion reuses that existing provenance and does not add new claims.

- Engine detail: `jobs/workshop/img-3187.webp`, showing engine assemblies on pallets.
- General repairs detail: `jobs/workshop/img-3188.webp`, showing an engine bay with the engine removed.
- Brake hero: `jobs/caliper-detail.webp`; brake detail: `jobs/workshop/img-2923.webp`.
- Brake case study: `jobs/before.webp` and `jobs/after.webp`, recording 396.9°F and 119.8°F. These describe one documented job, not universal safe brake temperatures or a guaranteed repair result.
- Engine video: `/jobs/workshop/img-3189-silent.mp4`, 8.8 seconds, 720×1280, 2,450,679 bytes. Poster: `/jobs/workshop/img-3189-poster.webp`.
- Brake video: `/jobs/workshop/img-2918-silent.mp4`, 14.6 seconds, 720×1280, 4,034,310 bytes. Poster: `/jobs/workshop/img-2918-poster.webp`.

Videos have no audio. Render with a poster, explicit controls, `playsinline`, and `preload="none"`; downloading video is a visitor action. No new videos were generated.

## New service illustrations

Created using the built-in image_gen tool. Seven separate images were generated, with one subsequent refinement of the A/C image to remove malformed thermometer numerals. All final outputs were visually inspected, including the optimized local WebP files. No third-party stock sources were used.

Higgsfield was tried first, as requested. Its cost preflight quoted 0.5 credits per medium-quality 1K image. The first batch of six requests was rejected before submission with “Requires basic plan or higher.” Zero Higgsfield jobs were created, and the seventh was not submitted. Generation therefore used built-in image_gen rather than a paid API/CLI fallback.

Final assets are 1672×941 WebP files converted with Sharp at quality 78, effort 6. Conversion changes format/compression only; the original PNG filenames are recorded below for the local generated-media archive. Astro should produce responsive variants for the actual display size.

| Service | Workspace asset | Original final PNG |
| --- | --- | --- |
| tires | `src/assets/images/services/tires.webp` | `exec-b9dbd761-6c86-4ac8-9d22-c3937195a4a0.png` |
| air-conditioning | `src/assets/images/services/air-conditioning.webp` | `exec-55c5c8a0-ac5d-440f-82f9-86fd1a28e749.png` |
| transmission | `src/assets/images/services/transmission.webp` | `exec-39e3073f-e645-4491-82c9-2c4fe1601bd1.png` |
| exhaust | `src/assets/images/services/exhaust.webp` | `exec-5110c13f-4599-455b-918d-4aa672b32662.png` |
| glass | `src/assets/images/services/glass.webp` | `exec-7da750a5-4658-4ece-8017-2bcb02580814.png` |
| body-trim | `src/assets/images/services/body-trim.webp` | `exec-9c509462-9a0d-4604-a4f1-74e758aa7349.png` |
| detailing | `src/assets/images/services/detailing.webp` | `exec-cf18fab1-559f-4160-9fb1-55542c188f44.png` |

## Prompt set

Every initial request used this prefix:

> Use case: photorealistic-natural. Asset type: one separate image for an automotive service web page.

Shared direction:

> Create one polished, believable editorial automotive service photograph for an independent repair website. Landscape 16:9 composition. Natural neutral light, charcoal and warm off-white workshop palette, subtle burnt-orange tool accent. Crisp realistic materials, quiet uncluttered background, restrained contrast and warm color grade. Professional working detail, not an advertisement or infographic. No lettering, labels, signs, logos, watermarks or brand names. No business identification. Avoid faces, wide views of invented shops, fabricated results, exploded diagrams, impossible mechanisms or extra fingers. The subject must be immediately recognizable and physically plausible.

### tires

Close three-quarter view of one unmounted passenger-car tire standing upright beside a generic wheel balancing machine in a neutral workshop. Show realistic circumferential tread grooves, sidewall with no readable text, rubber texture and an ordinary unbranded five-spoke alloy wheel partially visible behind it. No human subject. A small orange valve-cap tool rests on a nearby surface. Straightforward tire service editorial photograph.

### air-conditioning

Close view across a modern passenger car dashboard from the front passenger seat. The central black air-conditioning vent louvers are clearly visible, and a simple small analog thermometer probe is positioned in one vent for an air-temperature check. Cropped dashboard, no brand emblem or readable instrument text, no digital screens in focus. Gentle natural light through windshield. Honest simple air-conditioning diagnostic illustration, no visual cold-air effects or mist.

### transmission

Realistic close view of the underside of a passenger car on a professional lift, focusing on an intact stamped-metal automatic-transmission oil pan with evenly spaced perimeter bolts. Dry, used-metal texture, plausible compact pan shape, a short glimpse of nearby exhaust tubing and subframe. No tools touching parts, no hands, no drips or dramatic leaks, no exposed imaginary gears. A low drain pan on the floor appears softly blurred far beneath. Technical editorial photo with physically believable structure.

### exhaust

A clean new generic automotive muffler with one inlet pipe and one outlet pipe lies on a neutral charcoal workshop bench. Close-up three-quarter angle shows the oval metal muffler casing and realistically bent steel tubing, seams, and one hanger bracket. A worn used muffler sits softly blurred behind. Keep the arrangement simple, mechanically plausible, unbranded and free of text. Natural light and subtle warm workshop tones.

### glass

Close view from outside a parked generic passenger car of a single small star-shaped stone chip in a windshield, photographed at a low oblique angle. Shallow depth of field with windshield wiper at bottom of frame and dashboard softly visible behind the glass. Damage is small and localized, no spreading fantasy cracks. Reflections of a soft neutral ceiling light, no person, tools, labels or business background. Windshield repair assessment editorial photo.

### body-trim

Close-up of a black textured interior car-door trim panel resting securely on a padded gray workbench. A few ordinary white plastic retaining clips and a pair of orange plastic trim-removal tools neatly arranged beside it. Panel has a plausible handle opening and simple armrest, no wires, badges or readable branding. Practical automotive trim repair editorial photograph, believable materials and neutral softly lit workshop background.

### detailing

Close-up professional automotive detailing scene: one anatomically correct gloved hand folds a thick clean microfiber towel across a glossy dark charcoal car hood. A pale warm reflection on smooth paint shows the clean surface, with an unbranded orange spray bottle blurred in the distant background. Crop at the wrist; no face, no person identity, no badges, no text. One hand, one towel, simple physically plausible action, quiet editorial automotive photograph.

### A/C refinement

Reference: the initial generated A/C image. Final edit request:

Remove the gloved hand, forearm, and analog thermometer completely. Restore the dashboard and passenger-side area naturally behind them. Keep the same realistic central air-conditioning vents, hazard button, climate-control dials, charcoal and warm neutral colors, orange accents in the blurred background, lighting, perspective, and 16:9 framing. Simple close-up of a clean car dashboard ventilation system. No people, thermometer, added text, labels, numbers, arrows, mist or cold-air visual effects. Mechanically ordinary and believable dashboard, no brand names or logos.

Final A/C image shows only the dashboard ventilation system and climate-control dials, without a fabricated instrument reading.
