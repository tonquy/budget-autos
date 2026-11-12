import type { ServiceDetail } from './servicePageTypes';

// Dent repair, car keys, and windshield replacement. Like the other additional
// services, these start with a service-specific quote rather than a booking event.
export const specialtyServiceDetails: Record<string, ServiceDetail> = {
  'paintless-dent-repair': {
    heading: 'Smooth out the dent and keep the factory paint.',
    intro: [
      'Paintless dent repair (PDR) uses specialized rods and pulling tools to work a dent back out from behind the panel or from the surface. When it suits the damage, there is no sanding, filler, or repainting, so the original finish stays in place and the repair is often quicker than conventional bodywork.',
      'Budget Autos Repair in Johnson City accepts requests for door dings, small dents, and hail damage. Send clear photos of the damage and your vehicle details. We will look at the size, depth, and location of each dent and tell you honestly whether PDR is a good fit or whether the panel needs a different repair.',
    ],
    signs: [
      { title: 'A door ding from a parking lot', text: 'Small, shallow dings on doors and fenders are often the most straightforward candidates for paintless removal, especially when the paint around them is unbroken.' },
      { title: 'Hail damage after a storm', text: 'Hail usually leaves many small dents across the hood, roof, and trunk lid. Photograph each panel in daylight from a low angle so the dents show up clearly.' },
      { title: 'A small dent with no paint damage', text: 'If the paint is not cracked, chipped, or flaking, PDR may be able to restore the panel without refinishing. Run a fingertip over the area and tell us whether the paint feels rough.' },
      { title: 'A dent you want fixed before selling', text: 'Clearing up dings and dents can make a vehicle easier to present for sale or trade-in. Tell us your timeline so the estimate can account for it.' },
    ],
    caution: { title: 'When PDR is not the right repair', text: 'Cracked or chipped paint, very sharp creases, damage on a panel edge, and areas that were previously filled or repainted often need conventional body repair instead. We will say so up front rather than attempt a repair that will not hold.' },
    included: [
      { title: 'Photo review', text: 'Your photos help us judge the number, size, and depth of dents before you visit, and whether the damage looks suitable for paintless removal at all.' },
      { title: 'Access and panel assessment', text: 'PDR depends on reaching the back of the dent or pulling it from the surface. Bracing, panel material, and trim that needs removing all affect the plan.' },
      { title: 'Paintless dent removal', text: 'The metal is massaged back to shape gradually, checked under reflected light as the work progresses, until the panel reads smooth again.' },
      { title: 'Hail damage estimating', text: 'Hail estimates are usually built panel by panel. If you are filing an insurance claim, ask your insurer how they want estimates handled and we will help with the documentation we can provide.' },
    ],
    process: [
      { title: 'Send photos', text: 'Use the quote form to share the year, make, model, and several photos of each damaged panel, both close-up and from a few feet back.' },
      { title: 'Confirm the approach', text: 'We review the damage and explain whether PDR, conventional body repair, or a mix of both suits each area, along with an estimate and expected timing.' },
      { title: 'Repair and review', text: 'Drop the car off at the agreed time. When it is ready, look over the panels in good light with us before you take it home.' },
    ],
    decisions: {
      heading: 'Paintless repair or conventional bodywork?',
      paragraphs: [
        'PDR keeps the original paint, which can matter for appearance, resale, and avoiding color-matching. It works best on shallow, rounded dents where the paint is intact and the back of the panel can be reached.',
        'Larger, creased, or paint-damaged dents may need filling and refinishing, and some jobs combine both methods. Photos give us a good starting point, but the final call sometimes needs an in-person look at the panel.',
      ],
    },
    cost: {
      text: 'Dent repair pricing depends on how many dents there are, how large and deep they are, and where they sit on the vehicle. Clear photos usually let us give a useful estimate before you visit.',
      factors: ['Number, size, and depth of the dents', 'Panel location, bracing, and access from behind', 'Aluminum or steel panel material', 'Trim, lights, or headliner that needs removing for access'],
    },
    preparation: ['Photograph each panel in daylight from a low angle so the dents are visible.', 'Wash the vehicle if you can; dirt hides small dents and paint damage.', 'For hail claims, have your claim number and any insurer paperwork ready.'],
    faqs: [
      { question: 'Will paintless dent repair damage my paint?', answer: 'When the paint is intact and the dent suits the method, PDR is designed to leave the factory finish alone. If the paint is already cracked or the area was previously repainted, we will tell you whether PDR is still appropriate.' },
      { question: 'Can every dent be fixed without paint?', answer: 'No. Sharp creases, dents on panel edges, stretched metal, and damaged paint often need conventional repair. Send photos and we will tell you which approach fits.' },
      { question: 'Do you repair hail damage?', answer: 'Yes, hail damage repair requests are welcome. Hail estimates depend on the number and size of dents on each panel, so photos of every affected panel are the best place to start.' },
      { question: 'How long does dent repair take?', answer: 'A single door ding can be a short job, while hail damage across several panels takes longer. We will give you an expected timeline with the estimate.' },
    ],
    related: ['body-trim', 'detailing', 'windshield-replacement'],
    articles: [{ title: 'What to repair before selling or trading in', href: '/blog/repair-before-selling-or-trading/' }, { title: 'How to request a useful repair quote', href: '/blog/how-to-get-a-car-repair-quote-online-binghamton-ny/' }],
  },
  'car-key-replacement': {
    heading: 'A working key, programmed for your vehicle.',
    intro: [
      'Most modern car keys do more than turn a lock. A transponder chip, remote buttons, or a push-to-start smart key has to be matched and programmed to the vehicle before the engine will start. That is why getting the right key starts with the exact vehicle and, ideally, the VIN.',
      'Budget Autos Repair in Johnson City accepts car key replacement and programming requests: spare keys, replacements for lost keys, key fobs, transponder keys, smart keys, and push-to-start key programming. Send your year, make, model, and VIN, and we will confirm what your vehicle needs and what we can provide.',
    ],
    signs: [
      { title: 'You only have one key', text: 'Adding a spare while you still have a working key is usually simpler than replacing the only one after it is lost. It is also worth doing when you buy a used car that came with a single key.' },
      { title: 'Your key is lost or stolen', text: 'Let us know whether any working keys remain. If a key was stolen, ask about removing it from the vehicle so it can no longer start the car.' },
      { title: 'The fob buttons stopped working', text: 'A weak battery, worn buttons, or a fob that has lost its programming can look similar. Tell us whether the key still starts the car and which functions have stopped.' },
      { title: 'Key not detected or the car will not start', text: 'A dash message about the key, or an engine that cranks but will not stay running, can point to a key or immobilizer problem. A battery or starting fault is also possible, so describe exactly what happens.' },
    ],
    included: [
      { title: 'Key identification', text: 'Your VIN and vehicle details help identify the correct key blade, transponder, remote, or smart key before anything is ordered.' },
      { title: 'Spare and replacement keys', text: 'A new key can be cut and programmed as a spare, or as a replacement when the original is lost or broken.' },
      { title: 'Fob and remote programming', text: 'Lock, unlock, trunk, and remote-start buttons on a key fob are programmed to work with your vehicle.' },
      { title: 'Transponder and push-to-start keys', text: 'Chip keys and proximity smart keys are programmed so the immobilizer recognizes them and the engine will start.' },
    ],
    process: [
      { title: 'Send your vehicle details', text: 'Use the quote form for the year, make, model, and VIN, and tell us how many working keys you have and which type of key you need.' },
      { title: 'Confirm the key and price', text: 'We confirm the right key for your vehicle, whether parts need to be ordered, and the estimated price and timing.' },
      { title: 'Program and test', text: 'Bring the vehicle in. The key is programmed and tested, both to start the car and to work the remote functions.' },
    ],
    decisions: {
      heading: 'Spare key now, or replacement later?',
      paragraphs: [
        'When you still have a working key, adding another is generally the most straightforward path. Once every key is lost, some vehicles need extra steps before a new key can be programmed, which can take more time.',
        'Not every inexpensive online key works with every vehicle, even when it looks identical. Before buying a key yourself, send us the details and ask whether it can be cut and programmed, so you do not pay for a part that cannot be used.',
      ],
    },
    cost: {
      text: 'Key pricing depends mainly on the vehicle and the type of key. A basic transponder key and a push-to-start smart key are very different parts, so the VIN is the quickest way to an accurate quote.',
      factors: ['Key type: bladed, transponder, flip key, fob, or smart key', 'Whether a working key is still available', 'Part availability for your make and model', 'Programming steps your vehicle requires'],
    },
    preparation: ['Send the VIN; it is on the driver-side dashboard by the windshield and on your registration.', 'Bring your registration and photo ID so ownership can be confirmed before a key is made.', 'Bring every key you still have, including ones that no longer work.'],
    faqs: [
      { question: 'Can you make a key if I lost all of mine?', answer: 'Lost-key requests are welcome. The process depends on the vehicle, so send the year, make, model, and VIN and we will confirm the steps, timing, and price for your car.' },
      { question: 'Can you program a key fob I bought online?', answer: 'Sometimes. Aftermarket and used fobs are not always compatible or programmable. Send the details of the part before you visit and we will tell you whether it is worth trying.' },
      { question: 'Do you program push-to-start smart keys?', answer: 'Yes, push-to-start key programming is one of the services we offer. Requirements vary by vehicle, so we confirm support for your specific make and model when you send the VIN.' },
      { question: 'Why do you need my VIN?', answer: 'The VIN identifies the exact vehicle and equipment, which helps match the correct key and programming procedure. Together with your registration and ID, it also confirms that the key is being made for the vehicle owner.' },
    ],
    related: ['electrical-systems', 'diagnostics', 'general-repairs'],
    articles: [{ title: 'Car won’t start but the battery is good', href: '/blog/car-wont-start-battery-good/' }, { title: 'What to check before buying a used car', href: '/blog/what-to-check-before-buying-a-used-car-binghamton-ny/' }],
  },
  'windshield-replacement': {
    heading: 'Clear, solid glass, installed for your vehicle.',
    intro: [
      'A windshield helps keep you visible and protected, and on many vehicles it also carries cameras and sensors for driver-assistance features. When a crack spreads, damage sits in the driver’s line of sight, or the glass is broken, replacement is usually the right answer.',
      'Budget Autos Repair in Johnson City handles windshield replacement, damaged auto glass, and auto glass installation requests. Send a photo of the damage along with your year, make, model, and VIN. We will match the correct glass, including heated areas, rain sensors, and camera mounts, before your appointment.',
    ],
    signs: [
      { title: 'A crack that is spreading', text: 'Temperature swings and road vibration can lengthen a crack over time. Photograph it now so we can see its length and where it starts.' },
      { title: 'Damage in the driver’s view', text: 'Chips and cracks directly in front of the driver can distort or block vision. Damage in that area is often a reason to replace rather than repair.' },
      { title: 'Broken or shattered glass', text: 'Side and rear glass can shatter after a break-in or impact. Tell us which window is affected and whether glass is still in the frame.' },
      { title: 'Leaks or wind noise after earlier glass work', text: 'Water near the windshield edges or new wind noise can point to the seal. Mention when the glass was last replaced.' },
    ],
    caution: { title: 'If visibility is blocked or the glass is loose', text: 'Do not drive with glass that obstructs your view or could come loose. Call us to discuss getting the vehicle to the shop safely.' },
    included: [
      { title: 'Glass matching', text: 'The VIN and photos help identify the correct windshield for your vehicle, including tint bands, heating, acoustic glass, rain sensors, and camera brackets.' },
      { title: 'Windshield replacement', text: 'The damaged windshield is removed, the frame is prepared, and new glass is set with fresh urethane adhesive for a secure, sealed fit.' },
      { title: 'Damaged auto glass', text: 'Side, rear, and other auto glass requests are reviewed the same way, by confirming the exact glass position and fitted features before ordering.' },
      { title: 'Camera and sensor follow-up', text: 'Vehicles with a windshield-mounted camera may need calibration after replacement. We confirm whether yours does and how it will be handled before you approve the job.' },
    ],
    process: [
      { title: 'Send a photo and VIN', text: 'Use the quote form for the vehicle details, VIN, and a photo of the damage, plus a photo of the area behind the rear-view mirror if there is a camera.' },
      { title: 'Confirm glass and timing', text: 'We confirm the correct glass, the estimate, and an appointment once the part is available.' },
      { title: 'Install and cure', text: 'The new glass is installed and sealed. We will tell you how long to wait before driving so the adhesive can set properly.' },
    ],
    decisions: {
      heading: 'Repair the chip or replace the windshield?',
      paragraphs: [
        'A small, isolated chip outside the driver’s view can sometimes be repaired. Long cracks, damage at the edge of the glass, or damage directly in front of the driver usually call for a new windshield.',
        'For windows, mirrors, sunroof glass, and window motors or regulators, see our glass, windows, and mirrors page. If you are not sure which applies, send a photo and we will point you in the right direction.',
      ],
    },
    cost: {
      text: 'The price of a windshield depends on the exact glass your vehicle uses and the features built into it. Sending the VIN and photos is the quickest way to an accurate quote.',
      factors: ['Glass type and fitted features such as heating, tint, or rain sensors', 'Whether the vehicle has a windshield-mounted camera that needs calibration', 'Part availability for your make and model', 'Trim, moldings, or rust at the frame discovered during removal'],
    },
    preparation: ['Photograph the whole windshield and a close-up of the damage.', 'Send the VIN so the correct glass and features can be matched.', 'Remove toll tags, dash cams, and valuables from around the windshield before drop-off.'],
    faqs: [
      { question: 'How long before I can drive after windshield replacement?', answer: 'The urethane adhesive needs time to set before the vehicle is driven. The wait depends on the adhesive and conditions; we will tell you the safe drive-away time when the job is done.' },
      { question: 'Does my car need camera calibration after a new windshield?', answer: 'Vehicles with a forward-facing camera mounted on the windshield often need it calibrated after replacement. We will confirm whether yours does and how it is handled as part of the quote.' },
      { question: 'Will insurance cover windshield replacement?', answer: 'That depends on your policy and coverage. Check with your insurer about glass coverage and deductibles; we can provide the estimate and details they may ask for.' },
      { question: 'Can a cracked windshield be repaired instead?', answer: 'Small chips can sometimes be repaired, but cracks that spread, sit at the edge, or block the driver’s view are usually replaced. Send a photo and we will give you an honest recommendation.' },
    ],
    related: ['glass', 'paintless-dent-repair', 'body-trim'],
    articles: [{ title: 'How to request a useful repair quote', href: '/blog/how-to-get-a-car-repair-quote-online-binghamton-ny/' }, { title: 'What to repair before selling or trading in', href: '/blog/repair-before-selling-or-trading/' }],
  },
};
