import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { business } from '../../lib/business';
import type { IntakeFlow } from '../../lib/quoteSchema';
import {
  ChoiceCard,
  Field,
  Icon,
  MediaUploader,
  PrimaryButton,
  Spinner,
  TextArea,
  TextInput,
  useMediaUploader,
  type FieldErrors,
} from './parts';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

// Turnstile site keys are public by design (they are rendered into the page for
// every visitor), so it is safe to ship the production key as a fallback. This
// keeps the widget working even when the build-time PUBLIC_TURNSTILE_SITE_KEY
// env var is missing in CI (e.g. Cloudflare Workers Builds).
const TURNSTILE_SITE_KEY =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || '0x4AAAAAAD7eom-KB1HZ1Qex';
const TURNSTILE_SCRIPT_ID = 'turnstile-script';

// The owner's three choices, in his words. Each maps onto an existing intake
// flow so the API, owner email and R2 storage keep working unchanged.
const REQUEST_KINDS: {
  flow: IntakeFlow;
  title: string;
  icon: string;
  descriptionLabel: string;
  placeholder: string;
}[] = [
  {
    flow: 'known-repair',
    title: 'I know what needs repair',
    icon: 'wrench',
    descriptionLabel: 'What needs to be done?',
    placeholder: 'e.g. Front brake pads and rotors need replacing.',
  },
  {
    flow: 'unknown-intake',
    title: "I'm not sure what's wrong",
    icon: 'help-circle',
    descriptionLabel: 'What is the vehicle doing?',
    placeholder: 'e.g. Grinding noise when I brake, and the check engine light came on this week.',
  },
  {
    flow: 'estimate-review',
    title: 'I already have an estimate',
    icon: 'clipboard-check',
    descriptionLabel: 'What would you like us to look at?',
    placeholder: 'e.g. The dealer quoted struts and an alignment. Is that fair?',
  },
];

type Step = 'choose' | 'details';
type SubmitState = 'idle' | 'submitting' | 'error';

export default function ServiceRequestForm() {
  const idBase = useId();
  const [step, setStep] = useState<Step>('choose');
  const [flow, setFlow] = useState<IntakeFlow | ''>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [message, setMessage] = useState('');

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { media, mediaNotice, addFiles, removeMedia } = useMediaUploader();

  const turnstileTokenRef = useRef<string>('');
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetRef = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const selected = REQUEST_KINDS.find((k) => k.flow === flow);

  function chooseKind(kind: IntakeFlow) {
    setFlow(kind);
    setStep('details');
    // Step two always starts at the top, not wherever step one was scrolled to.
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function backToChoices() {
    setStep('choose');
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  // The Turnstile container only exists on step two, so render it there.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    if (step !== 'details') {
      turnstileWidgetRef.current = null;
      return;
    }

    function renderWidget() {
      if (turnstileWidgetRef.current) return;
      if (window.turnstile && turnstileContainerRef.current) {
        turnstileWidgetRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: 'turnstile-spin-v2',
          callback: (token) => {
            turnstileTokenRef.current = token;
          },
          'expired-callback': () => {
            turnstileTokenRef.current = '';
          },
          theme: 'light',
        });
      }
    }

    if (document.getElementById(TURNSTILE_SCRIPT_ID)) {
      renderWidget();
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.head.appendChild(script);
  }, [step]);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!flow) {
      setStep('choose');
      return;
    }
    if (TURNSTILE_SITE_KEY && !turnstileTokenRef.current) {
      setErrorMessage('Please complete the verification above before submitting.');
      return;
    }

    const fd = new FormData();
    const scalars: Record<string, string> = {
      flow,
      name,
      phone,
      // The shop follows up by text, so that is the default and only preference
      // this short form collects.
      contactPreference: 'text',
      vehicleYear,
      vehicleMake,
      vehicleModel,
      vin,
      mileage,
      message,
    };
    for (const [key, value] of Object.entries(scalars)) {
      if (value) fd.set(key, value);
    }

    media.forEach((m) => fd.append('media', m.file, m.file.name));
    fd.set('turnstileToken', turnstileTokenRef.current);
    if (honeypotRef.current?.value) fd.set('company', honeypotRef.current.value);

    setSubmitState('submitting');
    try {
      const response = await fetch('/api/quote', { method: 'POST', body: fd });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!response.ok || !result.ok) {
        setSubmitState('error');
        setErrorMessage(result.error ?? 'Something went wrong. Please try again, or just text us.');
        setFieldErrors(result.fieldErrors ?? {});
        if (TURNSTILE_SITE_KEY && turnstileWidgetRef.current) {
          window.turnstile?.reset(turnstileWidgetRef.current);
          turnstileTokenRef.current = '';
        }
        return;
      }

      try {
        sessionStorage.setItem('budgetauto-quote-submitted', '1');
      } catch {
        /* private mode - thank-you PageView still fires; Lead may be skipped */
      }
      window.location.assign('/thank-you');
    } catch {
      setSubmitState('error');
      setErrorMessage('Something went wrong sending your request. Please try again, or just text us.');
    }
  }

  // --- Step one: the three questions, and nothing else on the screen. ---

  if (step === 'choose') {
    return (
      <div class="flex flex-1 flex-col justify-center">
        <p class="text-sm font-medium text-steel-500">Step 1 of 2</p>
        <h1 class="mt-1.5 font-display text-2xl font-bold text-ink sm:text-3xl">
          Which sounds like you?
        </h1>
        <p class="mt-2 text-sm leading-relaxed text-steel-700 sm:text-base">
          Pick one. We'll ask for your details next.
        </p>

        <div class="mt-6 grid gap-3">
          {REQUEST_KINDS.map((kind) => (
            <ChoiceCard
              key={kind.flow}
              icon={kind.icon}
              title={kind.title}
              onClick={() => chooseKind(kind.flow)}
            />
          ))}
        </div>
      </div>
    );
  }

  // --- Step two: everything else, in one pass. ---

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot - hidden from real users. */}
      <input
        ref={honeypotRef}
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        class="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div class="space-y-5">
        <div>
          {/* Back and the step label share one row so the header block stays
              short - this step is the only one that scrolls. */}
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={backToChoices}
              class="-ml-2 inline-flex min-h-9 touch-manipulation items-center gap-1 rounded-control px-2 text-sm font-medium text-steel-700 transition-colors hover:text-ink"
            >
              <Icon name="chevron-left" class="size-4" />
              Back
            </button>
            <span class="text-sm font-medium text-steel-500">Step 2 of 2</span>
          </div>

          <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 class="font-display text-2xl font-bold text-ink sm:text-3xl">Your details</h1>
            {selected && (
              <span class="inline-flex items-center gap-1.5 rounded-control bg-accent-soft px-3 py-1 text-sm font-medium text-accent-ink">
                <Icon name={selected.icon} class="size-3.5 shrink-0" />
                {selected.title}
              </span>
            )}
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor={`${idBase}-name`} error={fieldErrors.name?.[0]}>
            <TextInput
              id={`${idBase}-name`}
              value={name}
              onValue={setName}
              type="text"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Mobile number" htmlFor={`${idBase}-phone`} error={fieldErrors.phone?.[0]}>
            <TextInput
              id={`${idBase}-phone`}
              value={phone}
              onValue={setPhone}
              type="tel"
              autoComplete="tel"
              placeholder="(607) 555-0123"
              required
            />
          </Field>
        </div>

        {/* Vehicle fields stay side by side even on mobile. They hold short
            values, and stacking five of them doubles the length of the step. */}
        <div>
          <p class="mb-3 font-display text-base font-semibold text-ink">Your vehicle</p>
          <div class="grid grid-cols-3 gap-3">
            <Field label="Year" htmlFor={`${idBase}-year`} error={fieldErrors.vehicleYear?.[0]}>
              <TextInput
                id={`${idBase}-year`}
                value={vehicleYear}
                onValue={setVehicleYear}
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="2018"
              />
            </Field>
            <Field label="Make" htmlFor={`${idBase}-make`} error={fieldErrors.vehicleMake?.[0]}>
              <TextInput
                id={`${idBase}-make`}
                value={vehicleMake}
                onValue={setVehicleMake}
                type="text"
                placeholder="Toyota"
              />
            </Field>
            <Field label="Model" htmlFor={`${idBase}-model`} error={fieldErrors.vehicleModel?.[0]}>
              <TextInput
                id={`${idBase}-model`}
                value={vehicleModel}
                onValue={setVehicleModel}
                type="text"
                placeholder="Camry"
              />
            </Field>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <Field label="Mileage" htmlFor={`${idBase}-mileage`} error={fieldErrors.mileage?.[0]}>
              <TextInput
                id={`${idBase}-mileage`}
                value={mileage}
                onValue={setMileage}
                type="text"
                inputMode="numeric"
                placeholder="86,000"
              />
            </Field>
            <Field
              label="VIN"
              hint="(optional)"
              htmlFor={`${idBase}-vin`}
              error={fieldErrors.vin?.[0]}
            >
              <TextInput
                id={`${idBase}-vin`}
                value={vin}
                onValue={setVin}
                type="text"
                autoComplete="off"
                spellcheck={false}
                maxLength={17}
                placeholder="Dash or door jamb"
                class="uppercase"
              />
            </Field>
          </div>
        </div>

        <Field
          label={selected?.descriptionLabel ?? 'What is going on with the vehicle?'}
          htmlFor={`${idBase}-message`}
          error={fieldErrors.message?.[0]}
        >
          <TextArea
            id={`${idBase}-message`}
            value={message}
            onValue={setMessage}
            rows={3}
            required
            minLength={10}
            placeholder={selected?.placeholder ?? 'A couple of sentences is plenty.'}
          />
        </Field>

        <div>
          <p class="font-display text-base font-semibold text-ink">Add photos or video</p>
          <p class="mb-3 mt-1 text-sm text-steel-500">
            Optional. A photo of the VIN, the problem, or another shop's estimate all help.
          </p>
          <MediaUploader
            media={media}
            mediaNotice={mediaNotice}
            addFiles={addFiles}
            removeMedia={removeMedia}
          />
        </div>

        <div class="space-y-4">
          {TURNSTILE_SITE_KEY && <div ref={turnstileContainerRef} />}
          {errorMessage && (
            <p class="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}
          <PrimaryButton type="submit" disabled={submitState === 'submitting'} icon={null}>
            {submitState === 'submitting' ? (
              <>
                <Spinner class="size-[18px]" />
                Sending...
              </>
            ) : (
              <>
                <Icon name="send" class="size-[18px]" />
                Send my request
              </>
            )}
          </PrimaryButton>
          <p class="text-xs leading-relaxed text-steel-500">
            We review it and get back to you with the next step, usually by text.{' '}
            {business.laborGuide}
          </p>
        </div>
      </div>
    </form>
  );
}
