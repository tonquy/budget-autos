import {
  beginOptions,
  drivableOptions,
  estimateHelpOptions,
  knownBasisOptions,
  problemCategories,
  symptomOptions,
  symptomStartOptions,
  symptomWhenOptions,
  warningLightOptions,
} from '../../lib/quoteSchema';
import {
  ChipMulti,
  ChipSelect,
  ChoiceCard,
  Icon,
  PrimaryButton,
  StepHeader,
  TextArea,
  type IntakeData,
  type Update,
} from './parts';

const beginIcons: Record<string, string> = {
  'Describe my vehicle problem': 'help-circle',
  'I have warning lights or codes': 'triangle-alert',
  'My vehicle is making a noise': 'volume',
  'My vehicle will not start': 'power',
  'My vehicle is leaking fluid': 'droplet',
  'My vehicle is driving differently': 'compass',
  'I am not sure where to begin': 'scan-search',
};

// Scripted routing: a best-guess category from the entry choice + answers.
// The shop confirms either way, so this only needs to be sensible.
export function suggestCategory(data: IntakeData): string {
  const lights = data.warningLights;
  const symptoms = data.symptoms;
  const when = data.symptomWhen;

  if (data.drivable === 'No, it will not drive' || data.beginChoice === 'My vehicle will not start') {
    return 'Starting or battery concern';
  }
  if (lights.includes('Battery / charging')) return 'Starting or battery concern';
  if (symptoms.includes('Smoke or steam')) return 'Leak, smoke or overheating concern';
  if (symptoms.includes('Fluid leak') || data.beginChoice === 'My vehicle is leaking fluid') {
    return 'Leak, smoke or overheating concern';
  }
  if (when.includes('While braking') || lights.includes('ABS') || lights.includes('Brake')) {
    return 'Brake concern';
  }
  if (when.includes('Over bumps') || data.beginChoice === 'My vehicle is driving differently') {
    return 'Steering or suspension concern';
  }
  if (lights.includes('Check engine') || data.beginChoice === 'I have warning lights or codes') {
    return 'Engine or warning-light concern';
  }
  return 'Unknown - physical diagnosis required';
}

export function buildAssistantSummary(data: IntakeData): string {
  const lines: string[] = [];
  if (data.beginChoice) lines.push(`Started with: ${data.beginChoice}`);
  if (data.symptomStarted) lines.push(`When it started: ${data.symptomStarted}`);
  if (data.symptomWhen.length) lines.push(`Happens: ${data.symptomWhen.join(', ')}`);
  if (data.warningLights.length) lines.push(`Warning lights: ${data.warningLights.join(', ')}`);
  if (data.symptoms.length) lines.push(`Noticed: ${data.symptoms.join(', ')}`);
  if (data.drivable) lines.push(`Drivable: ${data.drivable}`);
  if (data.alreadyDone.trim()) lines.push(`Already done: ${data.alreadyDone.trim()}`);
  return lines.join('\n');
}

export type AssistantQuestion = {
  field: keyof IntakeData;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'text';
  options?: readonly string[];
  placeholder?: string;
};

// The scripted assistant, presented one question per screen so nobody gets a
// wall of inputs. Order matters - it also feeds the category suggestion.
export const assistantQuestions: AssistantQuestion[] = [
  { field: 'symptomStarted', title: 'When did it start?', type: 'single', options: symptomStartOptions },
  {
    field: 'symptomWhen',
    title: 'When does it happen?',
    subtitle: 'Pick anything that fits.',
    type: 'multi',
    options: symptomWhenOptions,
  },
  {
    field: 'warningLights',
    title: 'Any warning lights on?',
    subtitle: 'Select any that are lit.',
    type: 'multi',
    options: warningLightOptions,
  },
  {
    field: 'symptoms',
    title: 'Noticing any of these?',
    subtitle: 'Anything you\u2019ve seen, heard, or smelled.',
    type: 'multi',
    options: symptomOptions,
  },
  { field: 'drivable', title: 'Is the vehicle drivable?', type: 'single', options: drivableOptions },
  {
    field: 'alreadyDone',
    title: 'Anything already repaired or tested?',
    subtitle: 'Optional - skip if not.',
    type: 'text',
    placeholder: 'e.g. Replaced the battery last week, still won\u2019t start.',
  },
];

export function StartStep({ onPick }: { onPick: (v: 'known' | 'unknown') => void }) {
  return (
    <div>
      <StepHeader title="Where should we start?" />
      <div class="space-y-3">
        <ChoiceCard
          icon="clipboard-check"
          title="I know what needs to be fixed"
          onClick={() => onPick('known')}
        />
        <ChoiceCard
          icon="help-circle"
          title="I'm not sure what's wrong"
          onClick={() => onPick('unknown')}
        />
      </div>
    </div>
  );
}

export function EstimateQStep({ onPick }: { onPick: (v: 'yes' | 'no') => void }) {
  return (
    <div>
      <StepHeader title="Do you already have a written estimate?" />
      <div class="space-y-3">
        <ChoiceCard
          icon="clipboard-check"
          title="Yes - I have an estimate"
          onClick={() => onPick('yes')}
        />
        <ChoiceCard
          icon="wrench"
          title="No - I don't have one"
          onClick={() => onPick('no')}
        />
      </div>
    </div>
  );
}

export function EstimateHelpStep({
  data,
  update,
  onNext,
}: {
  data: IntakeData;
  update: Update;
  onNext: () => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Estimate review"
        title="What help are you looking for?"
        subtitle="Pick anything that applies - it helps us focus on what matters to you."
      />
      <ChipMulti options={estimateHelpOptions} value={data.estimateHelp} onChange={(v) => update({ estimateHelp: v })} />
      <div class="mt-6">
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

export function KnownBasisStep({
  data,
  update,
  onNext,
}: {
  data: IntakeData;
  update: Update;
  onNext: () => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Known repair"
        title="How do you know what repair is needed?"
        subtitle="Pick anything that applies so we know what you're working from."
      />
      <ChipMulti options={knownBasisOptions} value={data.knownBasis} onChange={(v) => update({ knownBasis: v })} />
      <div class="mt-6">
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

export function BeginStep({ onPick }: { onPick: (choice: string) => void }) {
  return (
    <div>
      <StepHeader
        eyebrow="Let's figure it out"
        title="How would you like to begin?"
        subtitle="Pick whatever's closest to what you're noticing."
      />
      <div class="space-y-3">
        {beginOptions.map((opt) => (
          <ChoiceCard key={opt} icon={beginIcons[opt] ?? 'help-circle'} title={opt} onClick={() => onPick(opt)} />
        ))}
      </div>
    </div>
  );
}

export function AssistantQuestionStep({
  question,
  index,
  total,
  data,
  update,
  onNext,
}: {
  question: AssistantQuestion;
  index: number;
  total: number;
  data: IntakeData;
  update: Update;
  onNext: () => void;
}) {
  const setField = (value: string | string[]) => update({ [question.field]: value } as Partial<IntakeData>);
  const current = data[question.field];
  const hasAnswer =
    question.type === 'multi'
      ? Array.isArray(current) && current.length > 0
      : typeof current === 'string' && current.trim().length > 0;
  const continueLabel = hasAnswer ? 'Continue' : 'Skip';

  return (
    <div>
      <StepHeader eyebrow={`Narrowing it down · ${index + 1} of ${total}`} title={question.title} subtitle={question.subtitle} />

      {question.type === 'single' && (
        <ChipSelect
          name={question.field}
          options={question.options ?? []}
          value={(data[question.field] as string) ?? ''}
          onChange={(v) => {
            setField(v);
            // Single-answer questions advance on their own so it feels like a
            // quick back-and-forth instead of a form to fill out.
            window.setTimeout(onNext, 180);
          }}
        />
      )}

      {question.type === 'multi' && (
        <ChipMulti
          options={question.options ?? []}
          value={(data[question.field] as string[]) ?? []}
          onChange={(v) => setField(v)}
        />
      )}

      {question.type === 'text' && (
        <TextArea
          value={(data[question.field] as string) ?? ''}
          onValue={(v) => setField(v)}
          rows={3}
          placeholder={question.placeholder}
        />
      )}

      {question.type !== 'single' && (
        <div class="mt-8">
          <PrimaryButton onClick={onNext}>{continueLabel}</PrimaryButton>
        </div>
      )}
    </div>
  );
}

export function CategoryStep({
  data,
  update,
  suggested,
  onNext,
}: {
  data: IntakeData;
  update: Update;
  suggested: string;
  onNext: () => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Best guess"
        title="This looks like a place to start."
        subtitle="Based on what you told us. Change it if it doesn't sound right - our tech confirms either way."
      />
      <div class="mb-5 flex items-center gap-3 rounded-card border border-accent/30 bg-accent-soft/50 p-4">
        <span class="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-white">
          <Icon name="scan-search" class="size-5" />
        </span>
        <p class="font-display text-base font-semibold text-ink">{suggested}</p>
      </div>
      <p class="mb-2 text-sm font-medium text-ink-soft">Adjust if needed:</p>
      <ChipSelect
        name="category"
        options={problemCategories}
        value={data.category || suggested}
        onChange={(v) => update({ category: v })}
      />
      <div class="mt-6">
        <PrimaryButton onClick={onNext}>Continue to details</PrimaryButton>
      </div>
    </div>
  );
}
