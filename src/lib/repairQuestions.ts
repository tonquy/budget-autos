/** Reader-facing questions, shared by the homepage and repair-help index. */
export const repairQuestionGroups = [
  {
    id: 'estimates', title: 'Understand a repair estimate',
    description: 'Get clarity before you approve the work.',
    questions: [
      { question: 'Do I really need everything on my repair estimate?', href: '/second-opinion/#necessary-repairs' },
      { question: 'Can I get a second opinion on my car repair estimate?', href: '/second-opinion/' },
      { question: 'Is my repair estimate too high?', href: '/second-opinion/#compare-estimates' },
      { question: 'Which car repairs need to be done now, and which can wait?', href: '/second-opinion/#repair-priorities' },
    ],
  },
  {
    id: 'engine', title: 'Warning lights, starting & engine trouble',
    description: 'Understand the symptom and when to stop driving.',
    questions: [
      { question: 'My check-engine light came on — can I still drive?', href: '/blog/common-causes-of-the-check-engine-light-binghamton-ny/' },
      { question: 'Why is my check-engine light on when the car runs fine?', href: '/blog/common-causes-of-the-check-engine-light-binghamton-ny/#why-is-the-light-on-when-the-car-runs-fine' },
      { question: 'Why did my check-engine light come back after a repair?', href: '/blog/common-causes-of-the-check-engine-light-binghamton-ny/#why-did-the-check-engine-light-come-back-after-a-repair' },
      { question: 'My car is misfiring — can I still drive it?', href: '/blog/car-misfiring-can-i-drive/' },
      { question: 'Why won’t my car start even though the battery is good?', href: '/blog/car-wont-start-battery-good/' },
      { question: 'Why is my car overheating?', href: '/blog/car-overheating/' },
      { question: 'Why is my car leaking fluid, and is it safe to drive?', href: '/blog/car-leaking-fluid-safe-to-drive/' },
    ],
  },
  {
    id: 'handling', title: 'Brakes, shaking & tire wear',
    description: 'Find out what an inspection needs to check.',
    questions: [
      { question: 'Why is my car shaking or vibrating while driving?', href: '/blog/car-shaking-while-driving/' },
      { question: 'Why are my brakes squeaking or grinding?', href: '/blog/signs-your-brakes-need-replacement-binghamton-ny/' },
      { question: 'Why does my steering wheel shake when I brake?', href: '/blog/signs-your-brakes-need-replacement-binghamton-ny/#why-does-my-steering-wheel-shake-when-i-brake' },
      { question: 'Why is my car pulling even after an alignment?', href: '/blog/wheel-alignment-versus-suspension-repair-binghamton-ny/' },
      { question: 'Why are my tires wearing unevenly or only on the inside?', href: '/blog/uneven-inside-tire-wear/' },
    ],
  },
  {
    id: 'decisions', title: 'Repair, replace, sell or trade',
    description: 'Use the vehicle’s condition to make an informed decision.',
    questions: [
      { question: 'Is my car worth fixing, or should I replace it?', href: '/blog/is-my-car-worth-fixing/' },
      { question: 'Should I repair my car before I sell or trade it?', href: '/blog/repair-before-selling-or-trading/' },
      { question: 'What is my car worth if it needs repairs?', href: '/blog/repair-before-selling-or-trading/#what-is-my-car-worth-if-it-needs-repairs' },
    ],
  },
  {
    id: 'transport', title: 'Transportation during repairs',
    description: 'Plan your drop-off and check rental availability.',
    questions: [
      { question: 'Can I get a rental car while my vehicle is being repaired?', href: '/blog/rental-car-during-repairs/' },
    ],
  },
] as const;
