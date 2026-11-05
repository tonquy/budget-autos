import type { ServiceDetail } from './servicePageTypes';

export const additionalServiceDetails: Record<string, ServiceDetail> = {
  tires: {
    heading: 'Give your tires a fair chance to last.',
    intro: [
      'Tires do more than soften the ride. Their condition affects how your vehicle steers, brakes, and handles wet roads. If the tread looks uneven, the car vibrates at speed, or a tire repeatedly loses pressure, replacing rubber without understanding the cause can leave the same problem waiting for the new set.',
      'Budget Autos Repair in Johnson City offers tire replacement and rotation inquiries alongside suspension and alignment service. Tell us your vehicle, tire size, and what you are noticing. We can discuss fitment, inspect the concern, and explain which work should happen together so the estimate makes sense.',
    ],
    signs: [
      { title: 'One edge wears faster', text: 'Inside or outside shoulder wear deserves a closer look at inflation, alignment, and suspension condition. A rotation does not correct the underlying cause of uneven wear.' },
      { title: 'Vibration at road speed', text: 'Note the speed where it starts and whether you feel it in the steering wheel or seat. Tire condition is one possibility; wheel, brake, and suspension concerns can feel similar.' },
      { title: 'Recurring pressure loss', text: 'A warning that returns after inflation needs attention. Share which tire is affected and how quickly it loses pressure rather than repeatedly topping it up and forgetting it.' },
      { title: 'Worn, cracked, or damaged rubber', text: 'Tread condition and visible damage matter as well as mileage. A bulge, exposed cord, or rapidly deflating tire calls for stopping use and arranging help.' },
    ],
    included: [
      { title: 'Replacement selection', text: 'The correct tire depends on the vehicle’s specified size, load requirements, and driving needs. Send the tire sidewall and driver-door placard photos so we can confirm the details before quoting.' },
      { title: 'Rotation planning', text: 'Rotation moves tires between positions when the vehicle and tire setup allow it. Directional tires, different front and rear sizes, and existing damage can change the available pattern.' },
      { title: 'Wear assessment', text: 'Tell us about recent pothole impacts, suspension repairs, and past alignments. Those details help connect the wear pattern to the next inspection rather than treating every worn tire as an isolated problem.' },
      { title: 'Related repair coordination', text: 'If suspension movement or alignment is contributing to wear, it should be considered with tire replacement. We explain the order of work and which recommendations address the cause.' },
    ],
    process: [
      { title: 'Confirm the fit', text: 'Share the year, make, model, tire size, and whether you need a rotation, one damaged tire reviewed, or a replacement set.' },
      { title: 'Review the condition', text: 'An in-person check can clarify tread wear, visible damage, and any related steering or suspension symptoms before the scope is finalized.' },
      { title: 'Approve the plan', text: 'Review the tire options, related work, availability, and estimate. Confirm the appointment and expected completion time with the shop.' },
    ],
    decisions: {
      heading: 'Rotation, replacement, or an alignment?',
      paragraphs: [
        'These services solve different problems. Rotation helps distribute wear on serviceable tires. Replacement addresses tires that are worn out, damaged, or unsuitable. Alignment adjusts wheel angles; it cannot restore tread that has already worn away or repair a damaged tire.',
        'Replacing just one tire also depends on the condition of the others and the vehicle’s requirements, particularly when matching tires on an all-wheel-drive vehicle. Bring the full picture rather than choosing a quantity from tread depth alone. We can discuss the appropriate next step for your setup.',
      ],
    },
    cost: {
      text: 'Tire pricing starts with confirmed fitment and the number of tires needed. A photo can help prepare an estimate, while unusual wear may require an inspection before the complete job is known.',
      factors: ['Tire size, specification, and selected replacement', 'Number of tires and condition of the remaining set', 'Wheel or pressure-sensor concerns discovered during inspection', 'Any alignment or suspension work needed alongside replacement'],
    },
    preparation: ['Photograph the tire size and the vehicle’s tire-information placard.', 'Bring the wheel-lock key if the wheels use locking lug nuts.', 'Tell us about pressure warnings, impacts, vibrations, and your recent tire-service history.'],
    faqs: [
      { question: 'How often should I rotate my tires?', answer: 'Use the schedule in your vehicle owner’s manual and the tire manufacturer’s guidance. The appropriate interval and pattern depend on the setup; tell us when the last rotation was done and we can discuss the next visit.' },
      { question: 'Will new tires fix the car pulling to one side?', answer: 'They may help if a tire is the cause, but a pull can also involve brakes, alignment, or suspension. Explain when it happens so the cause can be investigated before assuming a new set will solve it.' },
      { question: 'Can I replace only one tire?', answer: 'Sometimes, but the other tires, tread differences, and vehicle requirements matter. Send the tire information first. We will discuss the right scope after fitment and condition are confirmed.' },
      { question: 'What pressure should I use?', answer: 'Follow the vehicle manufacturer’s recommended cold tire pressure on the tire-information placard or in the owner’s manual. The number molded on the tire sidewall is not a substitute for the vehicle recommendation.' },
    ],
    related: ['suspension-alignment', 'brake-services', 'general-repairs'],
    articles: [{ title: 'What uneven inside tire wear can tell you', href: '/blog/uneven-inside-tire-wear/' }, { title: 'Why a car shakes while driving', href: '/blog/car-shaking-while-driving/' }],
  },
  'air-conditioning': {
    heading: 'Cool air starts with finding the problem.',
    intro: [
      'An A/C system that blows warm air does not automatically need a compressor. Weak airflow, a refrigerant leak, an electrical fault, or a control problem can lead to similar complaints. The useful first step is to describe what changed and confirm which part of the system needs attention.',
      'Budget Autos Repair accepts car air-conditioning repair, recharge, and replacement requests in Johnson City. Share your vehicle details before scheduling so we can confirm service availability for its refrigerant system. We will discuss the concern and the inspection needed before recommending a recharge or component work.',
    ],
    signs: [
      { title: 'Air blows, but it stays warm', text: 'Tell us whether the system stopped cooling suddenly or gradually. Good airflow with poor cooling points the investigation in a different direction from a fan that barely moves air.' },
      { title: 'Cooling changes while driving', text: 'Note whether it cools on the highway but warms at idle, or works only when the car is first started. The pattern helps describe an intermittent concern.' },
      { title: 'Weak or uneven airflow', text: 'A cabin filter, blower, or air-distribution problem may be involved. Mention whether all vents behave the same way and whether changing the fan setting makes a difference.' },
      { title: 'Noise or odor when A/C starts', text: 'Describe where the sound or smell seems to come from. A video recorded safely while parked can help document the symptom, but it cannot replace a physical inspection.' },
    ],
    included: [
      { title: 'Cooling and airflow assessment', text: 'The concern is separated into airflow, temperature, and control behavior. That helps keep a weak fan from being mistaken for a refrigerant problem.' },
      { title: 'Leak and recharge discussion', text: 'Refrigerant loss needs a repair discussion, not an assumption that repeated top-ups are routine maintenance. The available inspection and recharge approach is confirmed for the vehicle.' },
      { title: 'Component repair planning', text: 'A/C repairs may involve a leaking line, condenser, compressor, or another component. The specific failed part and the associated work should be identified in the estimate.' },
      { title: 'Replacement and installation scope', text: 'For a major component replacement or an installation inquiry, send the vehicle and requested work first. System compatibility and job scope need confirmation before parts or appointment time are committed.' },
    ],
    process: [
      { title: 'Describe the cooling pattern', text: 'Send the vehicle details, when the problem began, and whether the airflow itself has changed. Mention previous A/C work and any products added to the system.' },
      { title: 'Confirm the system and cause', text: 'The refrigerant type and service requirements are checked before agreeing on the inspection. Findings guide whether recharge, leak repair, or other work is appropriate.' },
      { title: 'Choose the repair', text: 'Review the proposed work, expected result, parts availability, and estimate. Ask what remains uncertain if an intermittent issue cannot be reproduced.' },
    ],
    decisions: {
      heading: 'A recharge is not the same as a leak repair.',
      paragraphs: [
        'A recharge addresses the amount of refrigerant in the system. It does not by itself repair a leaking component. If cooling improved after a previous recharge and then faded again, tell us how long that improvement lasted; that history matters when deciding the next step.',
        'Different vehicles use different refrigerants and service procedures. Avoid treating a recharge can as a universal solution, and tell the shop if refrigerant or stop-leak products have already been added. Confirm the proposed procedure and whether the estimate includes any necessary repair.',
      ],
    },
    cost: {
      text: 'The price depends on the vehicle’s system and the cause of the complaint. A recharge request can become a different job if inspection finds a leak or a failed control component, so the scope should be agreed before work proceeds.',
      factors: ['Refrigerant type and vehicle-specific service procedure', 'Time needed to locate an intermittent or hidden leak', 'Parts required and access to the affected component', 'Related electrical, blower, or airflow repairs'],
    },
    preparation: ['Send the year, make, model, and a description of when cooling changes.', 'Mention previous recharge attempts, A/C repairs, and any added products.', 'Confirm vehicle and refrigerant support before arranging drop-off.'],
    faqs: [
      { question: 'Should I book a recharge if the air is warm?', answer: 'Start by describing the symptom. Warm air can have several causes, and low refrigerant is only one possibility. We can discuss the inspection needed and confirm whether recharge service fits your vehicle.' },
      { question: 'Why does the A/C work while moving but not at a stop?', answer: 'That pattern is useful diagnostic information. Airflow through the system, operating conditions, and control faults can affect cooling. An inspection is needed rather than choosing a part from the symptom alone.' },
      { question: 'Can you work on my vehicle’s refrigerant system?', answer: 'Send the vehicle year, make, and model before booking. Refrigerant and equipment requirements vary, so the shop needs to confirm the exact service it can provide.' },
      { question: 'Is clear water under the car an A/C leak?', answer: 'Water from condensation can be normal when the A/C is running. Fluid color, location, smell, and any warning lights help distinguish that from a different leak. Send a photo if you are unsure.' },
    ],
    related: ['electrical-systems', 'engine-maintenance', 'general-repairs'],
    articles: [{ title: 'Car leaking fluid: what to check', href: '/blog/car-leaking-fluid-safe-to-drive/' }, { title: 'How to request a useful repair quote', href: '/blog/how-to-get-a-car-repair-quote-online-binghamton-ny/' }],
  },
  transmission: {
    heading: 'Understand the shift problem before the big decision.',
    intro: [
      'A hard shift, delayed engagement, or engine speed rising without the expected acceleration can be worrying. Those symptoms deserve investigation, but they do not tell the whole story. Fluid loss, controls, mounts, engine performance, and internal transmission wear can produce different problems that feel similar from the driver’s seat.',
      'Budget Autos Repair accepts transmission repair and replacement inquiries in Johnson City. Start with your vehicle details and a description of what happens. We will confirm the scope available for that transmission and discuss how to reach a diagnosis before you commit to a major repair.',
    ],
    signs: [
      { title: 'Delayed engagement', text: 'Tell us if the vehicle hesitates after selecting drive or reverse, and whether the delay is worse cold or warm. Avoid repeatedly forcing the car to move while it is struggling to engage.' },
      { title: 'Slipping or unusual shifts', text: 'Engine speed rising without a matching increase in road speed, abrupt shifts, or repeated hunting between gears all deserve a clear description and an inspection.' },
      { title: 'A warning light or message', text: 'Photograph the exact message when safely parked. A transmission-related code is a clue to investigate; it is not, by itself, a complete diagnosis or a replacement order.' },
      { title: 'Fluid underneath the vehicle', text: 'Note where the fluid appears and how quickly it accumulates. Color alone cannot reliably identify every fluid, so the source needs confirmation.' },
    ],
    caution: { title: 'If the vehicle will not engage or loses drive', text: 'Stop using it and call to discuss safe transport. Continuing to force a slipping or leaking transmission can make the problem worse and leave you stranded.' },
    included: [
      { title: 'Symptom review', text: 'Cold versus warm behavior, the gear or speed involved, towing history, and previous repairs help define the concern before work is quoted.' },
      { title: 'Diagnostic direction', text: 'Warning codes, leaks, and related drivability concerns help separate a transmission problem from an engine or electrical issue. The required diagnostic scope is agreed for the vehicle.' },
      { title: 'Repair options', text: 'A confirmed external or control-related issue may call for a different repair than internal damage. Ask which finding supports the proposed work and whether further inspection is necessary.' },
      { title: 'Replacement planning', text: 'Where replacement is being considered, the unit specification, availability, installation requirements, and any additional programming or specialist work must be confirmed before approval.' },
    ],
    process: [
      { title: 'Share the full history', text: 'Send the vehicle, mileage, exact symptom, warning messages, and known fluid-service or repair history. Confirm whether it is currently safe and able to move.' },
      { title: 'Establish the scope', text: 'The shop confirms support for the vehicle and the inspection needed. A major repair estimate should follow evidence about the fault rather than the symptom alone.' },
      { title: 'Compare the choices', text: 'Review the repair options, expected timing, and overall vehicle condition. Confirm all included work and applicable parts terms before choosing a replacement.' },
    ],
    decisions: {
      heading: 'Repair or replace? Start with the evidence.',
      paragraphs: [
        'A transmission replacement is a significant decision. The right comparison includes the diagnosed fault, the mileage and condition of the rest of the vehicle, the available repair options, and how long you intend to keep the car. A cheaper initial quote is not useful if important associated work is missing.',
        'Fluid service is also distinct from repairing an existing mechanical failure. Do not assume a fluid change will cure slipping or a warning message. Describe the concern before requesting a particular procedure so the recommendation fits both the transmission and its current condition.',
      ],
    },
    cost: {
      text: 'Transmission estimates vary substantially by vehicle and diagnosis. The shop needs to confirm the transmission type and required work before giving a meaningful repair or replacement price.',
      factors: ['Transmission type and confirmed fault', 'Inspection time and access to the affected parts', 'Replacement unit or component availability', 'Associated fluids, installation procedures, and any programming needs'],
    },
    preparation: ['Send the VIN if available to help identify the correct transmission.', 'Bring prior repair invoices and any fluid-service records.', 'Describe cold and warm behavior, warning messages, and whether the car can be driven safely.'],
    faqs: [
      { question: 'Does slipping mean I need a new transmission?', answer: 'Not automatically. The cause and extent of the problem need to be established first. Share when it happens and any warning lights so the shop can discuss the appropriate diagnostic step.' },
      { question: 'Do you repair every transmission type?', answer: 'Service scope varies with the vehicle and transmission. Send the year, make, model, and VIN if available before booking; we will confirm what work can be taken on.' },
      { question: 'Will a fluid change fix rough shifting?', answer: 'There is no universal answer. Fluid condition, level, controls, and mechanical wear can all matter. A service procedure should follow the vehicle requirements and a review of the symptom rather than replace diagnosis.' },
      { question: 'How long does transmission work take?', answer: 'Timing depends on diagnosis, parts or unit availability, and the required installation steps. Confirm the schedule with the estimate, and ask whether alternate transportation will be needed.' },
    ],
    related: ['diagnostics', 'electrical-systems', 'general-repairs'],
    articles: [{ title: 'Is your car worth repairing?', href: '/blog/is-my-car-worth-fixing/' }, { title: 'Planning transportation during repairs', href: '/blog/rental-car-during-repairs/' }],
  },
  exhaust: {
    heading: 'Find the source of the noise—and the leak.',
    intro: [
      'An exhaust that suddenly sounds louder may have a damaged pipe, loose joint, failing muffler, or another issue underneath the car. A metallic rattle may instead come from a shield or hanger. Knowing where the noise comes from is more useful than replacing the largest component first.',
      'Budget Autos Repair helps Johnson City drivers with exhaust repair and replacement requests. Road salt, corrosion, impacts, and worn mounting points can affect more than one section, so an inspection helps establish whether a localized repair is sensible or more of the system needs attention.',
    ],
    signs: [
      { title: 'A new roar or ticking sound', text: 'Mention whether the noise is strongest at startup, acceleration, or idle. A short recording made while safely parked can help describe it before the vehicle is inspected.' },
      { title: 'Rattling underneath', text: 'Heat shields, hangers, and exhaust sections can rattle for different reasons. Tell us if bumps or a certain engine speed trigger the sound.' },
      { title: 'Visible rust or a hanging section', text: 'A sagging pipe or broken mounting point needs attention before it drags or detaches. Avoid crawling beneath a vehicle supported only by a jack to take photos.' },
      { title: 'A check-engine light', text: 'An emissions-related code can involve sensors, leaks, engine operation, or an exhaust component. Reading the code is the start of the investigation, not proof of which part to replace.' },
    ],
    caution: { title: 'Exhaust fumes inside the cabin', text: 'Stop driving, turn the engine off in a safe outdoor location, and get out of the vehicle. Call to arrange inspection or transport. Do not treat open windows as a repair for a suspected exhaust leak.' },
    included: [
      { title: 'Leak and noise assessment', text: 'The source of the sound or suspected leak is identified before the repair scope is set. Share any recent impacts, engine work, or change in exhaust volume.' },
      { title: 'Pipes, joints, and mounts', text: 'Condition around the damaged area matters. Corroded neighboring sections, stressed hangers, and worn joints can change whether a small repair will be practical.' },
      { title: 'Muffler and section replacement', text: 'The estimate can address the affected component or a larger section when appropriate. Vehicle fitment and available parts need confirmation before the work is scheduled.' },
      { title: 'Related engine diagnostics', text: 'If a warning light or engine-running problem accompanies the exhaust concern, diagnosis may be needed alongside the physical repair. Replacing an exhaust part should not leave the cause of its failure unresolved.' },
    ],
    process: [
      { title: 'Describe what changed', text: 'Send vehicle details, the location of the noise, and whether there are fumes, warning lights, or visible damage. Call first if a section is hanging or the vehicle is unsafe to drive.' },
      { title: 'Inspect the system', text: 'The damaged area and surrounding condition are reviewed so the proposed job accounts for corrosion, mounting points, and related concerns.' },
      { title: 'Approve the repair scope', text: 'Compare the recommended section repair or replacement, parts availability, and estimate. Ask which components are included and what may require further diagnosis.' },
    ],
    decisions: {
      heading: 'A small leak does not always mean a small repair.',
      paragraphs: [
        'When the surrounding metal is sound, a localized repair may be worth discussing. When several sections are heavily corroded, fixing one point may leave another weak area nearby. The useful question is whether the proposed repair is supported by the condition of the system, not simply whether the hole looks small.',
        'A catalytic-converter code also needs context. Exhaust leaks, sensor behavior, and engine performance may need checking before a component is condemned. Share any recent misfires or engine repairs so the diagnosis considers why the warning appeared.',
      ],
    },
    cost: {
      text: 'Exhaust pricing depends on which section is damaged and how the surrounding parts come apart. Photos can help begin the conversation, but an underside inspection is often needed for an accurate scope.',
      factors: ['Location and extent of the damaged section', 'Corrosion and the condition of fasteners or mounting points', 'Vehicle-specific replacement parts', 'Additional diagnosis for warning lights or engine-running concerns'],
    },
    preparation: ['Describe when the noise occurs and whether it began after an impact.', 'Share warning-light photos and any recent engine or exhaust repair history.', 'Call before driving if fumes enter the cabin or a component is hanging loose.'],
    faqs: [
      { question: 'Can you repair only the damaged exhaust section?', answer: 'That depends on its location and the condition of the adjacent material. An inspection helps determine whether a localized repair is practical or a larger replacement section makes more sense.' },
      { question: 'Does a rattling exhaust mean the muffler is bad?', answer: 'Not necessarily. A shield, hanger, joint, or internal component can produce a rattle. Describe the sound and when it happens so the source can be checked.' },
      { question: 'Can I keep driving with an exhaust leak?', answer: 'A leak can create noise and fume concerns, and a loose section may detach. If fumes enter the cabin or a part is dragging, stop driving and call. Other suspected leaks should be assessed promptly rather than ignored.' },
      { question: 'Will replacing a sensor clear the check-engine light?', answer: 'Only if that sensor is actually the cause. A code can also reflect a wiring issue, leak, or another system problem. Diagnosis should support the replacement recommendation.' },
    ],
    related: ['diagnostics', 'engine-maintenance', 'general-repairs'],
    articles: [{ title: 'Common reasons for a check-engine light', href: '/blog/common-causes-of-the-check-engine-light-binghamton-ny/' }, { title: 'A car misfire and whether to keep driving', href: '/blog/car-misfiring-can-i-drive/' }],
  },
  glass: {
    heading: 'Clear visibility. The correct glass. A complete plan.',
    intro: [
      'Glass damage is not one single job. A small windshield chip, shattered door glass, cracked sunroof, and a window that will not move each need a different assessment. The location of the damage, the vehicle’s features, and the condition of the surrounding mechanism all affect the next step.',
      'Budget Autos Repair accepts auto glass, window, and side-view mirror service requests in Johnson City. Send photos and the vehicle details before scheduling. We will confirm the work available for your vehicle and identify any specialist requirements before you commit to a repair or replacement.',
    ],
    signs: [
      { title: 'Chipped or cracked windshield', text: 'Photograph the damage from inside and outside while parked. Its location, extent, and relation to the driver’s view matter when assessing whether repair is an option.' },
      { title: 'Broken side, rear, or roof glass', text: 'Mention the exact opening and whether the glass is shattered, missing, or still in place. Heated rear glass, tint, and roof options can affect the correct replacement.' },
      { title: 'A window that sticks or drops', text: 'The glass may be intact while the regulator, motor, switch, or track needs attention. Tell us whether you hear the motor and whether the window sits crooked.' },
      { title: 'Damaged side-view mirror', text: 'Send a photo of the mirror glass and housing. Heating, power folding, cameras, and other features matter when identifying the appropriate part.' },
    ],
    included: [
      { title: 'Windshield assessment', text: 'Repair versus replacement is assessed from the damage and vehicle requirements. A photo starts the discussion, but it may not show every crack, edge issue, or visibility concern.' },
      { title: 'Side, rear, and sunroof glass', text: 'Replacement inquiries include confirming the glass position and factory equipment. Broken glass and a failed roof mechanism are different scopes and should be discussed separately.' },
      { title: 'Window-operation diagnosis', text: 'When glass will not move, the concern may be mechanical or electrical. Confirming the cause avoids ordering glass when the fault is in the mechanism that moves it.' },
      { title: 'Mirror and feature matching', text: 'The correct mirror needs to match the vehicle’s fitted functions. Photos, VIN, and a description of which features still work help identify the repair or replacement request.' },
    ],
    process: [
      { title: 'Send clear photos', text: 'Include the whole affected window or mirror, a close-up of the damage, and the year, make, and model. Add the VIN if available for part identification.' },
      { title: 'Confirm the requirements', text: 'The shop reviews fitment, the work it can provide, and any additional sensor, camera, or calibration requirements before scheduling.' },
      { title: 'Agree on the complete job', text: 'Confirm the glass or part, installation scope, expected timing, and any aftercare or safe-drive-away instructions that apply to the finished work.' },
    ],
    decisions: {
      heading: 'Modern glass can be part of a larger system.',
      paragraphs: [
        'Some vehicles have driver-assistance cameras mounted near the windshield. Replacement may require calibration according to the manufacturer’s procedure. Ask how that requirement will be handled and whether it is included in the estimate; do not assume a glass-only quote covers every step.',
        'Water inside the car does not always prove the windshield is leaking, and a stuck window does not always mean the glass needs replacement. Seals, drains, wiring, and mechanisms may need inspection. Describe the symptom before choosing a part so the repair addresses the right cause.',
      ],
    },
    cost: {
      text: 'A useful estimate requires the exact glass or mirror specification and the complete installation scope. Send photos first, and confirm any additional vehicle-specific requirements before comparing prices.',
      factors: ['Glass location, damage, and repairability', 'Heated glass, tint, cameras, and other fitted features', 'Condition of the frame, seals, or moving mechanism', 'Any required calibration or specialist service'],
    },
    preparation: ['Photograph the whole damaged area and any camera or sensor near it.', 'Send the VIN and list features such as heated glass or power-folding mirrors.', 'Avoid driving with obstructed visibility, loose glass, or an unsecured mirror; call to discuss transport.'],
    faqs: [
      { question: 'Can a windshield chip be repaired?', answer: 'Some damage may be repairable, but size, location, condition, and vehicle requirements matter. Send photos for an initial review and expect the final recommendation to depend on inspection.' },
      { question: 'Do you handle side windows and sunroof glass too?', answer: 'Those are among the service requests we accept. Send the vehicle details and photos so we can confirm parts, the precise scope, and whether any specialist work is needed before booking.' },
      { question: 'Does windshield replacement include camera calibration?', answer: 'Requirements vary by vehicle. Confirm whether calibration is needed and how it will be arranged as part of the estimate. Do not assume it is included in a glass-only price.' },
      { question: 'My window will not close. Do I need new glass?', answer: 'Not necessarily. If the glass is intact, the motor, regulator, switch, wiring, or track may be responsible. Describe what happens when you operate the switch so the appropriate system can be checked.' },
    ],
    related: ['electrical-systems', 'body-trim', 'general-repairs'],
    articles: [{ title: 'What photos help an online repair quote?', href: '/blog/how-to-get-a-car-repair-quote-online-binghamton-ny/' }, { title: 'Repairs to consider before selling a car', href: '/blog/repair-before-selling-or-trading/' }],
  },
  'body-trim': {
    heading: 'Sort out the loose parts—and where water gets in.',
    intro: [
      'A loose splash shield, damaged molding, broken trim attachment, or damp carpet can be frustrating without fitting neatly into an engine or brake category. Photos help establish what is affected, but the visible damage may not show the condition of the mounting points or the source of a water leak.',
      'Budget Autos Repair accepts body and trim repair, replacement, and vehicle water-leak inquiries in Johnson City. Send the details before bringing the vehicle in so we can confirm the job fits the shop. Collision damage, structural work, refinishing, and specialist repairs need their scope confirmed separately.',
    ],
    signs: [
      { title: 'Loose exterior trim', text: 'A panel edge, molding, or shield that moves or rattles may have damaged clips, fasteners, or mounting points. Tell us whether it began after an impact or previous work.' },
      { title: 'Broken or missing pieces', text: 'Photos of the whole area and the remaining attachment points are more useful than a close-up alone. Keep any detached pieces if it is safe to do so.' },
      { title: 'Wet carpet or headliner', text: 'Note where moisture first appears and whether it follows rain, a car wash, or A/C use. Water can travel before it becomes visible, so the wet spot is not always the entry point.' },
      { title: 'Wind noise or poor fit', text: 'A changed gap, damaged seal, or loose trim can cause noise, but the exact source needs inspection. Mention any recent glass, door, or body work.' },
    ],
    included: [
      { title: 'Body and trim assessment', text: 'The damaged part, its attachments, and the surrounding area are reviewed to decide whether repair or replacement is practical. Photos allow an initial scope conversation.' },
      { title: 'Replacement planning', text: 'Part availability, vehicle trim level, color, and finish requirements can affect the job. Confirm what is included rather than assuming a replacement part arrives ready to match the vehicle.' },
      { title: 'Water-entry investigation', text: 'A leak concern starts with when and where water appears. Seals, drains, glass, body openings, and other possible sources need to be considered based on the symptom.' },
      { title: 'Related repair coordination', text: 'A damaged window mechanism, electrical fault, or glass concern may overlap with trim work. The estimate should distinguish the repairs needed to address each part of the complaint.' },
    ],
    process: [
      { title: 'Show the whole area', text: 'Send a wide photo, close-ups, and the vehicle details. Explain what happened, which part is loose or damaged, and whether the concern affects safe driving.' },
      { title: 'Confirm fit and source', text: 'The shop confirms whether it can take on the job. An in-person inspection may be needed to assess hidden attachments or reproduce water entry.' },
      { title: 'Agree on repair and finish', text: 'Review the proposed parts, attachment repairs, and any finish or specialist requirements. For leaks, discuss how the suspected source will be checked before closing the job.' },
    ],
    decisions: {
      heading: 'Fix the source before covering up the symptom.',
      paragraphs: [
        'Replacing a stained interior panel before tracing water entry can leave the same problem waiting for the next rainstorm. Similarly, attaching loose trim without checking broken mounting points may not resolve why it came loose. The repair plan should address the cause as well as the visible result.',
        'Not all body damage is cosmetic. A displaced panel near a tire, loose component, damaged latch, or sharp exposed edge can change whether the vehicle should be driven. Call and send photos before making the trip if anything is unsecured or interferes with normal operation.',
      ],
    },
    cost: {
      text: 'Body and trim estimates depend on damage that may be hidden until inspection. Water leaks can also require time to reproduce. Agree on the initial diagnostic scope and what would require a revised estimate.',
      factors: ['Repairability of the part and its mounting points', 'Replacement availability and vehicle trim specification', 'Color, finish, and any specialist work required', 'Time needed to locate and verify a water-entry source'],
    },
    preparation: ['Send wide and close-up photos, plus any safely recovered pieces.', 'For leaks, record weather, parking angle, and the first place you notice moisture.', 'Mention previous collision, glass, door, roof, or trim repairs in the affected area.'],
    faqs: [
      { question: 'Do you handle major collision or paint work?', answer: 'Those jobs require a specific scope discussion. Send photos and vehicle details first so we can confirm what the shop can take on and whether specialist work is needed.' },
      { question: 'Can a loose trim piece be reattached?', answer: 'Sometimes, if the part and mounting points are usable. Broken tabs, damaged clips, or missing material may call for replacement. An inspection helps establish what will hold properly.' },
      { question: 'Is water on the floor always a windshield leak?', answer: 'No. Water can enter or collect for several reasons and travel away from the source. Tell us when it happens and where it first appears so the investigation starts with useful evidence.' },
      { question: 'Can you quote damage from photos?', answer: 'Photos can help confirm the service scope and identify likely parts. Hidden damage, attachment condition, and leak diagnosis may still require an in-person inspection before a complete estimate is possible.' },
    ],
    related: ['glass', 'electrical-systems', 'general-repairs'],
    articles: [{ title: 'How to get a repair quote online', href: '/blog/how-to-get-a-car-repair-quote-online-binghamton-ny/' }, { title: 'Repair before selling or trading?', href: '/blog/repair-before-selling-or-trading/' }],
  },
  detailing: {
    heading: 'A cleaner car, with the work clearly defined.',
    intro: [
      'A daily driver collects grit, crumbs, road film, and the marks of regular use. A useful detailing plan starts with the condition of the vehicle and what you want improved: a vacuumed cabin, a refreshed exterior, or waxing as part of ongoing finish care.',
      'Budget Autos Repair accepts auto detailing, interior vacuuming, and car-waxing requests in Johnson City. Share a few photos and your priorities so the scope can be confirmed before scheduling. Clear expectations are especially useful when stains, pet hair, worn materials, or existing paint damage are involved.',
    ],
    signs: [
      { title: 'Grit and debris in the cabin', text: 'Floors, mats, seat seams, and cargo areas collect dirt differently. Mention the areas that need attention and whether the vehicle carries pets, children, or work equipment.' },
      { title: 'Road film on the exterior', text: 'Everyday buildup can leave the finish looking dull. Describe the condition and any sensitive areas, loose trim, or existing paint damage before the cleaning scope is agreed.' },
      { title: 'Preparing to sell or hand over a car', text: 'A cleaner vehicle is easier to present and inspect. Detailing can improve cleanliness, but it should not hide damage or replace mechanical repairs that a buyer needs to know about.' },
      { title: 'You want regular finish care', text: 'Waxing is a surface-care choice, not a repair for failed paint. Tell us about existing coatings or recent refinishing so the appropriate work can be discussed.' },
    ],
    included: [
      { title: 'Condition and priority review', text: 'Photos help set expectations for the cabin, exterior, and cargo space. Point out your main concern rather than assuming every detailing appointment includes the same package.' },
      { title: 'Interior vacuuming', text: 'The agreed scope can include accessible cabin and cargo areas. Loose belongings and clutter should be removed first so the work can focus on the vehicle’s surfaces.' },
      { title: 'Exterior detailing inquiry', text: 'Discuss the exterior areas you want cleaned and the present condition of the finish. Specialty correction, coating, or restoration work must be confirmed separately.' },
      { title: 'Car waxing', text: 'Waxing can be discussed as part of caring for a suitable, prepared finish. Confirm the preparation and application included in the estimate; wax does not fill in deep damage or restore peeling paint.' },
    ],
    process: [
      { title: 'Share your priorities', text: 'Send the vehicle size, photos of its current condition, and the areas you want addressed. Mention pet hair, spills, or sensitive materials before scheduling.' },
      { title: 'Choose a clear scope', text: 'Confirm what the appointment includes, what improvement is realistic, and which concerns need different treatment or repair.' },
      { title: 'Prepare for drop-off', text: 'Remove personal items and confirm the time needed. At pickup, review the agreed work and ask about any surface-care guidance that applies.' },
    ],
    decisions: {
      heading: 'Cleaning, finish care, and repair are different jobs.',
      paragraphs: [
        'Vacuuming removes accessible loose debris; it is not the same as deep stain treatment or odor remediation. Waxing is also different from polishing, paint correction, or refinishing. Describing the result you want helps prevent a mismatch between the service requested and the work needed.',
        'If the cabin keeps getting wet or a smell returns after cleaning, investigate the cause before paying to clean the same area again. A water leak or damaged interior material may need repair. Send photos of worn, torn, or peeling surfaces so expectations can be set before the appointment.',
      ],
    },
    cost: {
      text: 'Detailing is quoted from vehicle size, condition, and the agreed work. Two vehicles of the same model can need very different amounts of time, so current photos are more useful than choosing a price from the name alone.',
      factors: ['Vehicle size and the areas included', 'Amount of debris, pet hair, or surface buildup', 'Condition and type of interior and exterior materials', 'Chosen cleaning, preparation, and waxing scope'],
    },
    preparation: ['Remove valuables, personal belongings, and loose items from areas to be cleaned.', 'Point out existing damage, delicate materials, and any recently refinished surfaces.', 'Send photos of problem areas and confirm whether extra treatment is available before drop-off.'],
    faqs: [
      { question: 'What is included in a detailing appointment?', answer: 'The scope is confirmed for your vehicle. Tell us whether you want interior vacuuming, exterior attention, waxing, or a combination, and ask for the included areas to be listed in the estimate.' },
      { question: 'Will waxing remove scratches?', answer: 'Waxing is finish care rather than a repair for scratches, chips, or failing paint. Send photos if those are your main concern so we can clarify whether the requested service is appropriate.' },
      { question: 'Can you remove every stain or odor?', answer: 'No result should be assumed before the material and cause are assessed. Some marks reflect permanent damage, and recurring moisture or odors may need repair. Ask which treatment and expected improvement are included.' },
      { question: 'Should I clean out the car first?', answer: 'Yes. Remove personal belongings, valuables, and loose items from the areas being cleaned. This lets the appointment focus on the vehicle and makes the agreed scope easier to complete.' },
      { question: 'How long will the vehicle need to stay?', answer: 'Timing depends on its size, condition, and the work agreed. Confirm drop-off and pickup expectations when the scope is quoted, especially if you need the car back at a particular time.' },
    ],
    related: ['body-trim', 'presale-inspection', 'general-repairs'],
    articles: [{ title: 'Preparing a car for sale or trade', href: '/blog/repair-before-selling-or-trading/' }, { title: 'What to check before buying a used car', href: '/blog/what-to-check-before-buying-a-used-car-binghamton-ny/' }],
  },
};
