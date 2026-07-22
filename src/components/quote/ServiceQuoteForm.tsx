import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { business } from '../../lib/business';
import {
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

// Public by design (rendered into the page), with a production fallback so the
// widget still works when the build-time env var is missing in CI. Mirrors the
// full wizard's handling.
const TURNSTILE_SITE_KEY =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || '0x4AAAAAAD7eom-KB1HZ1Qex';
const TURNSTILE_SCRIPT_ID = 'turnstile-script';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

type Props = {
  /** The service the visitor clicked, e.g. "Brake Services". Shown in the UI
   * and sent to the shop as the quote category so no wizard questions are needed. */
  serviceName: string;
};

/**
 * Slim, single-screen intake for visitors who already told us what they need by
 * clicking a specific service. We only ask for their name, a way to reach them,
 * their vehicle, and what's wrong - then post to the same /api/quote endpoint
 * the full wizard uses (flow: "known-repair", category prefilled).
 */
export default function ServiceQuoteForm({ serviceName }: Props) {
  const idBase = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [message, setMessage] = useState('');

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { media, mediaNotice, addFiles, removeMedia } = useMediaUploader();

  const turnstileTokenRef = useRef<string>('');
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetRef = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Render Turnstile once on mount (this form is a single step).
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

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
  }, []);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (TURNSTILE_SITE_KEY && !turnstileTokenRef.current) {
      setErrorMessage('Please complete the verification above before submitting.');
      return;
    }

    const fd = new FormData();
    const scalars: Record<string, string> = {
      flow: 'known-repair',
      name,
      phone,
      contactPreference: 'call',
      vehicleYear,
      vehicleMake,
      vehicleModel,
      message,
      // Prefilled from the service the visitor clicked - this is why we can skip
      // the wizard's diagnostic questions.
      category: serviceName,
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
        setErrorMessage(result.error ?? 'Something went wrong. Please try again or call us.');
        setFieldErrors(result.fieldErrors ?? {});
        if (TURNSTILE_SITE_KEY && turnstileWidgetRef.current) {
          window.turnstile?.reset(turnstileWidgetRef.current);
          turnstileTokenRef.current = '';
        }
        return;
      }

      setSubmitState('success');
    } catch {
      setSubmitState('error');
      setErrorMessage('Something went wrong sending your request. Please try again or call us.');
    }
  }

  if (submitState === 'success') {
    return (
      <div class="py-6 text-center sm:py-10">
        <div class="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
          <Icon name="circle-check-big" class="size-7" />
        </div>
        <h2 class="mt-5 font-display text-2xl font-bold text-ink">Request sent.</h2>
        <p class="mx-auto mt-2 max-w-md text-steel-700">
          Thanks - we&rsquo;ve got your {serviceName.toLowerCase()} request. We&rsquo;ll be in touch soon, usually
          within the hour during shop hours.
        </p>
        <p class="mx-auto mt-6 max-w-md text-xs leading-relaxed text-steel-500">{business.laborGuide}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} novalidate={false}>
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
        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor={`${idBase}-name`} error={fieldErrors.name?.[0]}>
            <TextInput
              id={`${idBase}-name`}
              value={name}
              onValue={setName}
              type="text"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Phone number" htmlFor={`${idBase}-phone`} error={fieldErrors.phone?.[0]}>
            <TextInput
              id={`${idBase}-phone`}
              value={phone}
              onValue={setPhone}
              type="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              required
            />
          </Field>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <Field label="Year" hint="(optional)" htmlFor={`${idBase}-year`} error={fieldErrors.vehicleYear?.[0]}>
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

        <Field
          label="What's going on with your vehicle?"
          hint="(a sentence or two is plenty)"
          htmlFor={`${idBase}-message`}
          error={fieldErrors.message?.[0]}
        >
          <TextArea
            id={`${idBase}-message`}
            value={message}
            onValue={setMessage}
            rows={4}
            placeholder="e.g. Grinding noise from the front when I brake, started this week."
            required
          />
        </Field>

        <div>
          <p class="mb-2 block text-sm font-medium text-ink-soft">
            Add a photo <span class="font-normal text-steel-500">(optional, but it helps us quote faster)</span>
          </p>
          <MediaUploader
            media={media}
            mediaNotice={mediaNotice}
            addFiles={addFiles}
            removeMedia={removeMedia}
          />
        </div>
      </div>

      <div class="mt-8 space-y-4">
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
        <p class="text-xs leading-relaxed text-steel-500">{business.laborGuide}</p>
      </div>
    </form>
  );
}
