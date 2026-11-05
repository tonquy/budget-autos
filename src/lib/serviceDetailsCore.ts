import type { ServiceDetail } from './servicePageTypes';

export const coreServiceDetails: Record<string, ServiceDetail> = {
  diagnostics: {
    heading: 'Find the cause behind the warning light',
    intro: [
      'A check-engine light tells you that the vehicle has detected a problem. It does not, by itself, identify the part that needs replacing. A fault involving fuel delivery, ignition, an air leak, a sensor signal, or wiring can produce similar symptoms. Engine diagnostics connects the warning, the way the car drives, and the test results before a repair is recommended.',
      'Bring your vehicle to Budget Autos Repair in Johnson City with a description of what changed and when it happens. A hesitation on a cold morning, a rough idle after refueling, and a loss of power climbing a hill are different clues. Even a short note about the conditions can make an intermittent problem easier to investigate.',
    ],
    signs: [
      { title: 'Check-engine light', text: 'A steady warning light needs diagnosis even if the vehicle seems to drive normally. Note whether it stays on, comes and goes, or appeared after recent work.' },
      { title: 'Rough running or hesitation', text: 'Shaking at idle, stumbling under acceleration, or an occasional stall can involve more than one system. Describe the speed, temperature, and engine load when it happens.' },
      { title: 'Hard starting', text: 'Long cranking, an engine that starts and then stops, or a problem that appears only when warm helps narrow the testing required.' },
      { title: 'A change in performance', text: 'Reduced power or an unexplained fuel-economy change can be useful evidence when considered alongside maintenance history and diagnostic data.' },
    ],
    caution: { title: 'A flashing light needs prompt attention', text: 'A flashing check-engine light, especially with shaking or a major loss of power, can indicate an active misfire. Pull over safely, switch off the engine, and call for guidance before continuing.' },
    included: [
      { title: 'Symptom and history review', text: 'The starting point is your description, recent repairs, and relevant service history. A repeatable symptom is particularly valuable when a fault is not present all the time.' },
      { title: 'Codes and operating data', text: 'Stored codes, pending codes, and available operating data provide direction. They are evidence to interpret rather than a parts list to order.' },
      { title: 'Targeted system testing', text: 'Depending on the findings, the next checks may involve ignition, air and fuel delivery, electrical connections, or mechanical engine condition. The scope depends on the vehicle and concern.' },
      { title: 'Findings and repair options', text: 'The goal is to connect a proposed repair to the evidence. If a concern needs additional testing, that is a separate decision from authorizing replacement parts.' },
    ],
    process: [
      { title: 'Describe the pattern', text: 'Share when the problem began, how often it occurs, and whether the warning appeared before or after the symptom. Photos of dashboard messages can help.' },
      { title: 'Narrow the cause', text: 'Inspection and relevant tests separate possible causes. Intermittent faults may require the same conditions that originally triggered the problem.' },
      { title: 'Choose the next step', text: 'Review the findings and estimate before repair work. After an approved repair, verification focuses on the original concern and any remaining faults.' },
    ],
    decisions: {
      heading: 'A code scan and a diagnosis answer different questions',
      paragraphs: [
        'A scan can show which fault the vehicle recorded. Diagnosis asks why it happened. For example, a sensor-related code can involve the sensor, its wiring, or a condition elsewhere that changes its reading. Replacing the named component without testing can leave the original problem unresolved.',
        'An intermittent issue also may not be resolved by clearing a warning light. Keep any codes or previous repair paperwork, and avoid clearing codes before the appointment when possible. That information can help establish whether a fault is new, recurring, or connected to another repair.',
      ],
    },
    cost: {
      text: 'Diagnostic time depends on how readily the concern can be reproduced and which tests are needed. A repair estimate follows the findings; a warning light alone is not enough to price the repair accurately.',
      factors: ['Vehicle year, engine, and access to the affected components.', 'Whether the problem is constant or appears only under specific conditions.', 'The number of systems or previous repairs involved.', 'Any additional testing needed before a repair decision.'],
    },
    preparation: ['Bring previous codes, estimates, and recent repair records.', 'Note whether the issue happens cold, warm, at idle, or while accelerating.', 'Tell the shop about aftermarket equipment, a recent battery disconnect, or codes that were cleared.'],
    faqs: [
      { question: 'Can you diagnose a car with no warning light?', answer: 'Yes, a drivability concern can exist without a stored code. The symptom history and the ability to reproduce it become especially useful in deciding what to test.' },
      { question: 'Does a code tell me which part to buy?', answer: 'Usually it identifies a detected condition or circuit, not a confirmed failed part. Testing helps distinguish a component fault from wiring, mechanical, or related system problems.' },
      { question: 'Should I clear the codes before coming in?', answer: 'Leave them available when possible. Clearing codes can remove useful diagnostic information and reset readiness monitors without fixing the cause.' },
      { question: 'Can I book if the problem only happens sometimes?', answer: 'Yes. Describe the pattern when arranging the visit. A video recorded safely by a passenger or while parked, together with dates and conditions, may help explain what the technician needs to reproduce.' },
    ],
    related: ['engine-maintenance', 'electrical-systems', 'exhaust'],
    articles: [
      { title: 'My check-engine light is on — can I still drive?', href: '/blog/common-causes-of-the-check-engine-light-binghamton-ny/' },
      { title: 'My car is misfiring — can I still drive?', href: '/blog/car-misfiring-can-i-drive/' },
    ],
  },
  'engine-maintenance': {
    heading: 'Maintenance and engine repairs with a clear starting point',
    intro: [
      'Regular maintenance and an engine repair solve different needs. An oil change, filter replacement, or scheduled spark-plug service follows the requirements of your vehicle. A leak, overheating problem, or loss of power needs inspection first. Identifying which kind of visit you need helps keep the work focused.',
      'Budget Autos Repair serves drivers in Johnson City with engine maintenance and repair requests. Bring the mileage, service history, and any changes you have noticed. For a vehicle that is new to you, the first useful step is comparing what has already been done with the manufacturer\'s schedule, rather than assuming every maintenance item is overdue.',
    ],
    signs: [
      { title: 'Scheduled maintenance is due', text: 'Mileage, elapsed time, driving conditions, and the vehicle\'s maintenance display can all affect service timing. The owner\'s manual is the reference for the correct interval and specifications.' },
      { title: 'Fluid levels keep dropping', text: 'Repeatedly adding oil or coolant calls for investigation. The source could be an external leak, consumption, or another fault; topping up alone does not explain it.' },
      { title: 'Temperature changes', text: 'A rising gauge, an overheating message, or coolant residue should be reported. Include whether it happens in traffic, at highway speed, or after parking.' },
      { title: 'New noise or rough running', text: 'An unusual rattle, a rough idle, or a loss of power deserves diagnosis before choosing a repair. Note whether it changes with engine speed or temperature.' },
    ],
    caution: { title: 'Do not keep driving an overheating engine', text: 'If the temperature warning appears, steam develops, or an oil-pressure warning stays on while the engine runs, pull over safely and switch it off. Do not open a hot cooling-system cap; call for assistance.' },
    included: [
      { title: 'Oil and filter maintenance', text: 'Oil specification, capacity, and filter fitment are vehicle-specific. Report existing leaks or unusual oil use when requesting an oil change so they can be considered separately.' },
      { title: 'Filters and scheduled items', text: 'Air filters, spark plugs, belts, and other maintenance items are assessed against the vehicle\'s requirements and condition. Not every item needs replacement at the same visit.' },
      { title: 'Cooling and leak concerns', text: 'Inspection can help distinguish a hose, seal, radiator, water-pump, or other cooling-system concern. The repair scope depends on locating the cause of the loss or overheating.' },
      { title: 'Engine repair assessment', text: 'Rough running, mechanical noise, or recurring faults may need diagnostic or mechanical testing before parts are selected. Major engine work needs a vehicle-specific discussion and estimate.' },
    ],
    process: [
      { title: 'Establish the service history', text: 'Review mileage, prior work, symptoms, and the manufacturer\'s maintenance guidance to separate routine service from a current fault.' },
      { title: 'Inspect the concern', text: 'Check the relevant components and decide whether diagnosis is needed. A leak repair, for example, starts with confirming where the fluid is coming from.' },
      { title: 'Agree on the work', text: 'Review the recommended service or repair and any related findings. After approved work, verification addresses the reason for the original visit.' },
    ],
    decisions: {
      heading: 'Choose maintenance by the vehicle, repairs by the findings',
      paragraphs: [
        'There is no single oil-change or tune-up interval that fits every car. Engine design, required fluids, use, and service history matter. If records are missing, a baseline maintenance discussion can identify what is known and which items need inspection or documentation.',
        'For a larger repair, consider the engine\'s condition alongside the rest of the vehicle. An isolated external leak is a different decision from repeated overheating or internal wear. Ask which findings are confirmed, what remains uncertain, and whether additional testing would change the recommendation.',
      ],
    },
    cost: {
      text: 'A useful estimate identifies the maintenance items or diagnosed repair, the required parts and fluids, and the labor involved. The vehicle identification number can help confirm the correct engine and parts.',
      factors: ['Required oil, coolant, filters, and other vehicle-specific parts.', 'Access to the failed part and any components that must be removed.', 'Diagnostic testing needed to establish the source of a symptom.', 'Related damage or additional work revealed during inspection.'],
    },
    preparation: ['Share your current mileage and maintenance records.', 'List any fluids you have been adding and approximately how often.', 'Mention recent overheating, warning messages, and previous engine or cooling-system repairs.'],
    faqs: [
      { question: 'How often should I change my oil?', answer: 'Follow the schedule and oil specification for your vehicle, including any applicable severe-use guidance. Mileage, time, and the maintenance monitor may all be relevant; there is no universal interval.' },
      { question: 'Does a tune-up fix a rough idle?', answer: 'Only if a maintenance item is actually causing it. Ignition, air leaks, fuel delivery, electrical faults, and mechanical problems can produce similar symptoms, so diagnosis may be needed first.' },
      { question: 'Is a small oil leak worth checking?', answer: 'Yes. Finding its source helps establish the repair options and whether the level is being affected. Tell the shop if the leak is growing or oil is reaching hot components.' },
      { question: 'Can you quote a major engine repair online?', answer: 'Vehicle details and a description are a useful start, but a reliable repair estimate may require inspection and testing. Ask about the diagnostic step before making a decision on major work.' },
    ],
    related: ['diagnostics', 'general-repairs', 'electrical-systems'],
    articles: [
      { title: 'Why is my car overheating?', href: '/blog/car-overheating/' },
      { title: 'My car is leaking fluid — is it safe to drive?', href: '/blog/car-leaking-fluid-safe-to-drive/' },
    ],
  },
  'brake-services': {
    heading: 'Understand what your brakes need before replacing parts',
    intro: [
      'Brake noise, a vibration through the pedal, and a vehicle that pulls when stopping do not always have the same cause. Pads and rotors are only part of the system. Calipers, slides, hoses, fluid leaks, and other components can affect how evenly the brakes apply and release.',
      'A brake visit at Budget Autos Repair in Johnson City starts with the concern you have noticed. Tell us whether it happens at low speed, after the car warms up, or only during firmer stops. Inspection helps separate normal wear from a sticking component or another issue that new pads alone would not address.',
    ],
    signs: [
      { title: 'Squeaking or grinding', text: 'Noise can come from wear, debris, surface conditions, or a component problem. Persistent grinding or a sudden change deserves prompt inspection, especially if stopping performance changes.' },
      { title: 'Shaking while braking', text: 'A pedal pulse or steering-wheel vibration during braking may involve the friction surfaces or another wheel-end component. Note whether the same vibration happens when you are not braking.' },
      { title: 'Pulling or uneven braking', text: 'A pull during braking can reflect uneven brake operation, but tires and steering or suspension condition can also influence vehicle behavior. The circumstances matter.' },
      { title: 'Heat, drag, or an unusual smell', text: 'A wheel that seems unusually hot, a burning smell, or a vehicle that does not roll freely may indicate dragging brakes. Avoid touching hot components.' },
    ],
    caution: { title: 'A change in stopping ability is urgent', text: 'If the pedal sinks, the brakes struggle to stop the car, or you see a suspected brake-fluid leak, stop driving and arrange assistance. A red brake warning with changed braking behavior should not be ignored.' },
    included: [
      { title: 'Pads, rotors, and wear pattern', text: 'Inspection considers remaining friction material and the condition of the braking surfaces. Uneven wear can be a clue to a problem beyond the pads themselves.' },
      { title: 'Calipers and moving hardware', text: 'Brake operation depends on components applying and releasing correctly. Binding slides, damaged hardware, or a caliper concern can affect wear and create excess heat.' },
      { title: 'Hydraulic system concerns', text: 'Leaks, damaged hoses or lines, and pedal complaints need attention as part of the overall assessment. The required checks depend on the symptom and vehicle.' },
      { title: 'Warning lights and parking brakes', text: 'ABS or parking-brake warnings may need separate electrical diagnosis. Electronic parking brakes also have vehicle-specific service procedures that affect the repair.' },
    ],
    process: [
      { title: 'Identify when it happens', text: 'Describe the sound, pedal feel, speed, and whether the concern changes as the brakes warm up. Mention any recent wheel or brake work.' },
      { title: 'Inspect the complete concern', text: 'Assess wear and relevant components rather than assuming every brake complaint needs the same parts. A dragging brake calls for a different repair from routine pad wear.' },
      { title: 'Review the repair and verification', text: 'The estimate should explain the affected axle, recommended parts, and associated work. Approved repairs are checked against the original stopping or noise concern.' },
    ],
    decisions: {
      heading: 'Pads, rotors, or a caliper: the findings decide',
      paragraphs: [
        'Pads are wear items, but the condition and measurements of the rotor matter too. Scoring, heat damage, thickness, and the vehicle\'s specifications influence whether a rotor can remain in service. Replacing only the pads is not automatically the right solution for every vehicle.',
        'A caliper does not need replacement simply because the pads are worn. On the other hand, putting new friction parts on a brake that is still binding can repeat the original problem. Ask what caused the wear and whether the recommendation addresses that cause as well as the worn parts.',
      ],
    },
    cost: {
      text: 'Brake estimates vary with the vehicle, the axle involved, and whether the work is routine wear replacement or a more involved hydraulic or electronic repair.',
      factors: ['Front, rear, or both axles and the size and design of the brakes.', 'Pad, rotor, caliper, hose, or hardware condition.', 'Electronic parking-brake procedures or warning-light diagnosis.', 'Corrosion or other damage affecting removal and installation.'],
    },
    preparation: ['Explain whether the concern appears during braking, while coasting, or both.', 'Bring records of recent brake repairs and identify which axle was serviced.', 'Call before driving in if stopping performance has changed or a leak is suspected.'],
    faqs: [
      { question: 'Do squeaky brakes always need new pads?', answer: 'No. Noise alone does not establish remaining pad life or its cause. An inspection can distinguish wear from surface conditions, debris, hardware, or another brake concern.' },
      { question: 'Why replace brakes on both sides of an axle?', answer: 'Friction components are generally serviced as an axle set to keep braking characteristics consistent. The exact parts recommendation still depends on inspection and the vehicle\'s requirements.' },
      { question: 'Can an ABS light mean the pads are worn out?', answer: 'An ABS warning can involve sensors, wiring, or other system components and does not directly identify pad condition. It may require diagnostic testing in addition to a mechanical inspection.' },
      { question: 'Why did one set of pads wear faster?', answer: 'Uneven use, a binding caliper or slide, and other operating conditions can affect wear. Identifying the cause helps avoid repeating it after replacement.' },
    ],
    related: ['suspension-alignment', 'tires', 'electrical-systems'],
    articles: [
      { title: 'Why are my brakes squeaking, grinding, or shaking?', href: '/blog/signs-your-brakes-need-replacement-binghamton-ny/' },
      { title: 'Why is my car shaking or vibrating while driving?', href: '/blog/car-shaking-while-driving/' },
    ],
  },
  'suspension-alignment': {
    heading: 'A steadier drive starts with finding what has changed',
    intro: [
      'Pulling, clunking, bouncing, and uneven tire wear can have different causes. Wheel alignment adjusts the angles of the wheels to the vehicle\'s specifications. Suspension and steering repairs address worn or damaged components that may prevent those angles from staying correct.',
      'At Budget Autos Repair in Johnson City, describe how the vehicle feels and whether the change followed a pothole, curb impact, tire replacement, or recent repair. Checking the condition of the tires and relevant steering and suspension parts helps determine whether you need an alignment, a repair, or a different service such as wheel balancing.',
    ],
    signs: [
      { title: 'Pulling or an off-center steering wheel', text: 'A consistent drift or a steering wheel that is no longer straight can warrant an inspection. Tire pressure, tire condition, road slope, and alignment can all influence what you feel.' },
      { title: 'Uneven tire wear', text: 'One edge wearing faster or a changing tread pattern is useful evidence. An alignment may help prevent further abnormal wear, but it cannot restore tread already lost.' },
      { title: 'Clunks and loose steering', text: 'Noise over bumps or a new loose feeling can involve joints, bushings, mounts, or other components. Locating the source is more useful than replacing parts based on the sound alone.' },
      { title: 'Excessive bounce or vibration', text: 'A bouncing ride and a speed-related vibration are different clues. Shocks or struts, wheel balance, tire damage, and other conditions require different checks.' },
    ],
    caution: { title: 'Stop if control of the vehicle changes suddenly', text: 'Severe looseness, a sudden strong pull, a visibly damaged tire, or difficulty controlling the steering needs prompt attention. Pull over safely and arrange assistance rather than trying to drive through it.' },
    included: [
      { title: 'Tire and wear-pattern review', text: 'Pressure, tread condition, and the location of unusual wear provide context before alignment decisions. A damaged or badly worn tire may need attention separately.' },
      { title: 'Steering component inspection', text: 'Relevant joints, tie rods, and other steering components are assessed for the concern reported. Loose or damaged parts can prevent a stable alignment.' },
      { title: 'Suspension condition', text: 'Bushings, control arms, shocks, struts, and related parts can influence ride and wheel position. The inspection follows the symptoms and the vehicle\'s suspension design.' },
      { title: 'Alignment assessment', text: 'Wheel-angle measurements are compared with applicable specifications. The available adjustments depend on the vehicle; parts or additional work may be needed if an angle cannot be corrected normally.' },
    ],
    process: [
      { title: 'Describe the road behavior', text: 'Share the speeds and road conditions that reveal the issue. Note impacts, tire changes, or repairs that happened before the handling changed.' },
      { title: 'Check before adjusting', text: 'Assess tire condition and relevant mechanical parts. Correcting looseness or damage first helps avoid paying for an alignment that cannot hold.' },
      { title: 'Repair and set the angles', text: 'Review any needed repair and whether alignment is part of the work. After approved service, verification addresses the handling or wear concern that brought you in.' },
    ],
    decisions: {
      heading: 'Alignment, balancing, and suspension repair are separate jobs',
      paragraphs: [
        'Alignment concerns wheel angles. Balancing addresses uneven weight distribution in a wheel-and-tire assembly. Suspension repair restores the condition of supporting or locating parts. A vibration that rises with road speed should not automatically be treated as an alignment problem.',
        'An adjustment also cannot compensate for every worn component or bent part. If a car still pulls after an alignment, tire condition, brake drag, mechanical wear, and the measurements all deserve consideration. Explain the original symptom rather than requesting repeated adjustments without an inspection.',
      ],
    },
    cost: {
      text: 'The estimate depends on whether the vehicle needs an adjustment alone or mechanical repairs first. The suspension design determines which angles can be adjusted and how that work is performed.',
      factors: ['Vehicle design and the adjustments available.', 'Condition of steering and suspension parts.', 'Corroded or seized adjustment hardware.', 'Tire concerns or related repairs that need separate attention.'],
    },
    preparation: ['Note which direction the car pulls and whether braking changes it.', 'Mention pothole or curb impacts and recent tire or suspension work.', 'Bring any previous alignment report and describe how the vehicle felt afterward.'],
    faqs: [
      { question: 'Will an alignment fix a vibration?', answer: 'Not necessarily. Tire or wheel balance, damage, brake concerns, and worn components can cause vibration. The speed and conditions under which it happens help determine the appropriate inspection.' },
      { question: 'Should I align the car before replacing worn tires?', answer: 'Discuss both together. Severely worn or damaged tires need attention, and the cause of uneven wear should be addressed so replacement tires do not develop the same pattern.' },
      { question: 'Do new struts or steering parts require alignment?', answer: 'Some repairs change the position of the wheels and require an alignment check or adjustment. The need depends on the parts replaced and the vehicle\'s service procedure.' },
      { question: 'Why does the steering wheel look crooked?', answer: 'An alignment issue is one possibility, particularly after an impact or repair. Tire and mechanical conditions should also be considered before deciding what needs adjustment.' },
    ],
    related: ['tires', 'brake-services', 'general-repairs'],
    articles: [
      { title: 'Why is my car pulling even after an alignment?', href: '/blog/wheel-alignment-versus-suspension-repair-binghamton-ny/' },
      { title: 'Why are my tires wearing unevenly or only on the inside?', href: '/blog/uneven-inside-tire-wear/' },
    ],
  },
  'electrical-systems': {
    heading: 'Trace the electrical problem before replacing the battery',
    intro: [
      'A car that will not start does not always need a battery. Starting depends on the battery, connections, cables, starter, control circuits, and other vehicle systems working together. A battery that keeps going flat may also have a charging problem or an electrical draw that remains after the car is parked.',
      'Budget Autos Repair in Johnson City handles electrical-system concerns beginning with the behavior you can describe. A click with no cranking, slow cranking, and normal cranking without starting are different symptoms. The same careful distinction helps with intermittent lighting, power-window, and accessory problems.',
    ],
    signs: [
      { title: 'Slow cranking or clicking', text: 'Weak battery performance, poor connections, cable resistance, or a starter concern can produce similar results. Note whether a jump-start changed the behavior.' },
      { title: 'Repeatedly discharged battery', text: 'A battery that loses charge after sitting needs a review of its condition, charging performance, and possible electrical draw. Replacing it may not resolve the underlying cause.' },
      { title: 'Charging warning or dim lights', text: 'A battery-shaped dashboard light can indicate a charging-system concern. Mention whether it appears at idle, while driving, or alongside other electrical changes.' },
      { title: 'Intermittent accessories', text: 'Windows, lights, locks, and other electrical equipment can be affected by switches, wiring, grounds, connectors, or control circuits. Describe exactly which functions still work.' },
    ],
    caution: { title: 'Smoke or a burning electrical smell needs immediate attention', text: 'Stop safely and switch the vehicle off if wiring appears to smoke or an electrical burning smell develops. Do not keep operating a failing circuit or repeatedly replace a fuse that blows.' },
    included: [
      { title: 'Battery and connection assessment', text: 'Battery condition and the connections supplying the vehicle are a useful starting point. The correct battery specification depends on the vehicle and its equipment.' },
      { title: 'Starting and charging checks', text: 'Testing helps separate battery, cable, starter, and charging concerns. An engine that cranks normally but does not start may need engine diagnostics instead.' },
      { title: 'Circuit and wiring diagnosis', text: 'Fuses, power supply, grounds, switches, and connectors are checked as the concern requires. A failed accessory does not automatically mean its motor or control unit needs replacement.' },
      { title: 'Battery drain investigation', text: 'An intermittent draw can take additional diagnostic time. Vehicle sleep behavior, recently installed accessories, and how long the car sits are relevant to reproducing the issue.' },
    ],
    process: [
      { title: 'Record the exact behavior', text: 'Describe the sound when starting, the equipment affected, and whether the problem depends on temperature or time parked. Previous jump-starts and battery replacements are useful history.' },
      { title: 'Test the affected system', text: 'Follow the electrical supply and control path to distinguish a component fault from a connection, wiring, or charging problem.' },
      { title: 'Address the cause', text: 'Review the findings and proposed repair. Verification checks the original concern; intermittent problems may need additional observation under the conditions that triggered them.' },
    ],
    decisions: {
      heading: 'A new battery is only the answer when the battery is the problem',
      paragraphs: [
        'A successful jump-start is a clue, but it does not establish why the battery was low. Short trips, an aging battery, a charging fault, and an electrical draw can have different remedies. Battery selection also matters: vehicles with stop-start systems may require a particular battery type and a vehicle-specific replacement procedure.',
        'Electrical work benefits from a complete history. An aftermarket radio, remote starter, dash camera, or recently disturbed connector may be relevant without necessarily being the cause. Let the shop know what changed before the fault began, including work performed elsewhere.',
      ],
    },
    cost: {
      text: 'A straightforward component replacement and an intermittent wiring fault involve different amounts of work. The estimate depends on the diagnostic findings, access, and any vehicle-specific setup required.',
      factors: ['Battery type, size, location, and replacement procedure.', 'Time needed to reproduce an intermittent fault or battery draw.', 'Access to wiring, connectors, motors, or the starter.', 'Any programming or specialist procedures needed for the vehicle; availability must be confirmed.'],
    },
    preparation: ['Describe whether the engine cranks, clicks, or does nothing.', 'List aftermarket electrical equipment and recent battery or wiring work.', 'Note how long the vehicle sits before the fault appears and whether a jump-start helps.'],
    faqs: [
      { question: 'Can a battery test good and the car still fail to start?', answer: 'Yes. Cable connections, the starter, control circuits, and non-electrical engine concerns can prevent starting. The exact behavior helps determine the next tests.' },
      { question: 'Does the battery light mean I need a battery?', answer: 'It can indicate a charging-system problem rather than battery wear. Arrange an assessment, especially if it stays on while driving or other electrical functions begin to fail.' },
      { question: 'Why does my new battery keep going flat?', answer: 'Possible causes include charging problems, an electrical draw, usage patterns, or a connection issue. The battery and the vehicle need to be considered together.' },
      { question: 'Can you help with a power window that stopped working?', answer: 'Request an electrical assessment and identify which window is affected. The switch, wiring, motor, regulator, or other components may need inspection before the correct repair can be quoted.' },
    ],
    related: ['diagnostics', 'glass', 'engine-maintenance'],
    articles: [
      { title: 'Why won’t my car start even though the battery is good?', href: '/blog/car-wont-start-battery-good/' },
      { title: 'How to get a car repair quote online', href: '/blog/how-to-get-a-car-repair-quote-online-binghamton-ny/' },
    ],
  },
  'presale-inspection': {
    heading: 'Know more about the car before buying or selling',
    intro: [
      'A used car can look clean and still have mechanical needs that affect your budget. A presale or pre-purchase inspection gives you another source of information about its current condition before you agree on a sale. It can also help a seller decide which known issues to address and which to disclose.',
      'Arrange a mechanical inspection with Budget Autos Repair in Johnson City before committing to a purchase whenever possible. Share the vehicle details, mileage, asking price, and any concerns from the test drive. The inspection is a snapshot of accessible conditions at the time of the visit, not a guarantee of future reliability or a substitute for reviewing ownership and history records.',
    ],
    signs: [
      { title: 'You are considering a used vehicle', text: 'An independent mechanical assessment is useful even when the seller is confident in the car. It can identify questions to resolve before money changes hands.' },
      { title: 'Service records are incomplete', text: 'Missing records make it harder to establish what maintenance has been done. Bring whatever is available so confirmed history can be separated from assumptions.' },
      { title: 'The test drive raised questions', text: 'Warning lights, unusual noises, a vibration, or a fluid smell deserve a closer look. Tell the shop exactly what you noticed rather than relying on the seller\'s explanation alone.' },
      { title: 'You are preparing to sell or trade', text: 'Understanding the car\'s condition helps you compare repair choices with your plans. A repair is not automatically worthwhile just because it could increase the asking price.' },
    ],
    included: [
      { title: 'Visible mechanical condition', text: 'The agreed inspection can cover accessible engine-area components, signs of fluid leakage, and other visible concerns. Disassembly and specialized testing are separate considerations.' },
      { title: 'Brakes, tires, and undercarriage', text: 'Wear and visible condition help identify immediate concerns and upcoming expenses. Corrosion or damage should be considered in the context of the vehicle\'s age and intended use.' },
      { title: 'Controls and warning indicators', text: 'Dashboard warnings and the operation of agreed vehicle functions provide useful context. Confirm the scope beforehand if you need a particular system assessed.' },
      { title: 'Findings for your decision', text: 'Discuss the observed issues, their likely significance, and whether another diagnostic step is needed. A condition finding and a confirmed repair estimate are not always the same thing.' },
    ],
    process: [
      { title: 'Coordinate access with the seller', text: 'Get permission for the inspection and arrange how the vehicle will reach the shop. Confirm timing before building the appointment into a purchase deadline.' },
      { title: 'Agree on the inspection scope', text: 'Identify your priorities, known concerns, and any systems that require particular attention. Vehicle condition and access can limit what can be evaluated.' },
      { title: 'Review before deciding', text: 'Consider the findings alongside the asking price, service history, and your repair budget. Additional testing may be appropriate before agreeing to a major purchase.' },
    ],
    decisions: {
      heading: 'A mechanical inspection adds context to the purchase',
      paragraphs: [
        'A vehicle history report and an in-person inspection answer different questions. A history report may document past events, while an inspection evaluates conditions visible or testable now. Neither establishes that every previous repair, accident, or developing fault has been identified.',
        'This service is a buyer\'s or seller\'s mechanical condition assessment. It is distinct from a New York State safety or emissions inspection and does not issue an inspection certificate. If you need a statutory inspection, confirm the appropriate licensed station and required service separately. A current inspection sticker also does not replace a purchase assessment.',
      ],
    },
    cost: {
      text: 'The inspection estimate depends on the vehicle and the scope you agree on. Ask whether a concern requires a separate diagnostic visit before assuming it is included in a general condition inspection.',
      factors: ['Vehicle type, condition, and access to the areas being inspected.', 'The systems and concerns included in the agreed scope.', 'Any separate diagnostic testing requested after initial findings.', 'Whether the seller can provide the vehicle and relevant records.'],
    },
    preparation: ['Ask the seller for permission and arrange transport before booking.', 'Bring the listing, VIN, mileage, available history, and service records.', 'List concerns from the test drive and explain your planned use of the vehicle.'],
    faqs: [
      { question: 'Can an inspection guarantee the car will be reliable?', answer: 'No. It assesses the conditions that can be evaluated during the visit. Hidden defects, intermittent problems, and future failures may not be detectable in a general inspection.' },
      { question: 'Is this the same as a New York State inspection?', answer: 'No. A mechanical purchase inspection and a state safety or emissions inspection serve different purposes. Arrange statutory inspection services with a station licensed for that work.' },
      { question: 'Should I inspect the car before paying a deposit?', answer: 'When possible, arrange the inspection before making a binding purchase decision. Discuss the timing and any conditions directly with the seller so you have time to consider the findings.' },
      { question: 'Can an inspection help if I am selling the car?', answer: 'Yes. It can help you understand observed issues and prioritize what to address. Compare repair costs with your plans and disclose known concerns accurately.' },
      { question: 'Does a clean vehicle history report replace an inspection?', answer: 'No. Records and current mechanical condition provide different information. Review both, and ask about anything that remains uncertain before buying.' },
    ],
    related: ['general-repairs', 'diagnostics', 'brake-services'],
    articles: [
      { title: 'Should I repair my car before I sell or trade it?', href: '/blog/repair-before-selling-or-trading/' },
      { title: 'What to check before buying a used car', href: '/blog/what-to-check-before-buying-a-used-car-binghamton-ny/' },
    ],
  },
  'general-repairs': {
    heading: 'Start with the problem you noticed',
    intro: [
      'You do not need to know the name of a failed part before asking for help. A new leak, a noise over bumps, an unfamiliar smell, or a car that simply feels different is enough to start the conversation. General repair visits connect what you are experiencing with the inspection or specialist service the vehicle actually needs.',
      'Budget Autos Repair in Johnson City can help you plan the next step around your vehicle\'s condition and how you use it. Tell us what is happening, what has already been repaired, and which concerns matter most. An initial request provides context; the repair recommendation depends on inspection and, where necessary, diagnostic testing.',
    ],
    signs: [
      { title: 'A new leak or fluid spot', text: 'Note where the spot appears and whether it returns after parking. Color and location are clues, but they do not reliably identify the source without inspection.' },
      { title: 'An unfamiliar noise', text: 'A sound that changes with speed, bumps, braking, or engine load can point toward different systems. Describe when it happens and where it seems to come from.' },
      { title: 'Several small issues at once', text: 'An older vehicle may have unrelated concerns. A prioritized list helps distinguish the main complaint from maintenance or convenience items you would also like reviewed.' },
      { title: 'A repair decision you are unsure about', text: 'A previous estimate, a recurring problem, or a change in how you use the vehicle may justify a fresh assessment before committing to more work.' },
    ],
    caution: { title: 'Call before driving with an urgent symptom', text: 'Loss of braking or steering control, overheating, smoke, a strong fuel smell, or an oil-pressure warning calls for stopping safely and arranging assistance. Describe the symptom when you contact the shop.' },
    included: [
      { title: 'Concern-based inspection', text: 'The inspection begins with your main complaint. Its scope may involve a visible check, a mechanical assessment, or a recommendation for more focused diagnosis.' },
      { title: 'Leak and noise assessment', text: 'Finding the origin matters before selecting parts. A fluid spot beneath the vehicle can travel from its source, and a sound can be transmitted through nearby components.' },
      { title: 'Maintenance and repair priorities', text: 'Discuss observed concerns in terms of safety, reliability, and routine upkeep. The timing of each item depends on its condition and the way you use the vehicle.' },
      { title: 'A vehicle-specific estimate', text: 'An estimate should identify the proposed work and relevant assumptions. If access, diagnosis, or disassembly is needed first, clarify that step before approving a larger repair.' },
    ],
    process: [
      { title: 'Share the symptoms and history', text: 'Provide the year, make, model, mileage, and a short description of the concern. Mention repairs already attempted and whether the symptom changed afterward.' },
      { title: 'Inspect and establish priorities', text: 'Use the findings to determine which work addresses the complaint and which additional items need consideration. Further testing may be needed before a repair can be priced.' },
      { title: 'Approve a practical plan', text: 'Review the scope, estimate, and parts availability. If you are considering work in stages, discuss which items can reasonably wait and which depend on each other.' },
    ],
    decisions: {
      heading: 'Repair decisions work better with the whole vehicle in view',
      paragraphs: [
        'One repair estimate does not tell the entire story of whether a car is worth keeping. Consider its overall condition, maintenance history, recurring problems, and what you need it to do. A reliable daily commute and occasional local use can lead to different priorities, even for the same vehicle.',
        'Staging repairs can be helpful when the work allows it, but some jobs share labor or depend on earlier repairs. Ask what the current estimate resolves, what it leaves unresolved, and whether delaying another item would affect safety or the completed work. Keep the final plan tied to observed findings rather than a long list of possible replacements.',
      ],
    },
    cost: {
      text: 'A description or photograph can help direct the visit, but it may not support an accurate repair price on its own. The estimate becomes more useful once the cause, parts, and labor are established.',
      factors: ['The confirmed cause and whether more diagnosis is needed.', 'Parts required for the specific vehicle and their availability.', 'Access, corrosion, and the labor involved in the repair.', 'Related repairs that share labor or affect the original concern.'],
    },
    preparation: ['Send vehicle details and a short list of concerns in priority order.', 'Bring previous estimates, invoices, and relevant maintenance records.', 'Note the conditions that reproduce the issue; take photos only when safely parked.'],
    faqs: [
      { question: 'What should I book if I do not know what is wrong?', answer: 'Choose general repairs or contact the shop with your symptoms. You do not need to diagnose the vehicle yourself; the description helps identify the right starting point.' },
      { question: 'Can you diagnose a leak from a photo?', answer: 'A photo can show the amount and approximate location, but fluids can spread away from their source. Inspection may be needed to identify the system and determine the repair.' },
      { question: 'Can I have more than one issue checked?', answer: 'List each concern when arranging the visit and identify the main priority. Multiple unrelated symptoms may require additional inspection time or separate diagnostic work.' },
      { question: 'Can repairs be done in stages?', answer: 'Sometimes. The answer depends on safety, the condition of the parts, and whether one repair depends on another. Discuss a sequence after the findings are available.' },
      { question: 'Should I bring an estimate from another shop?', answer: 'Yes. It provides useful context, especially alongside inspection notes or test results. A new assessment may still be needed to confirm the vehicle\'s current condition.' },
    ],
    related: ['diagnostics', 'engine-maintenance', 'presale-inspection'],
    articles: [
      { title: 'My car is leaking fluid — is it safe to drive?', href: '/blog/car-leaking-fluid-safe-to-drive/' },
      { title: 'Is my car worth fixing, or should I replace it?', href: '/blog/is-my-car-worth-fixing/' },
    ],
  },
};
