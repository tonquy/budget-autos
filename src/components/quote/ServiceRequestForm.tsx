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

const TURNSTILE_SITE_KEY =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || '0x4AAAAAAD7eom-KB1HZ1Qex';
const TURNSTILE_SCRIPT_ID = 'turnstile-script';

type SubmitState = 'idle' | 'submitting' | 'error';

/**
 * Single-screen quote intake. Same details the booking flow asks for at the
 * end, plus photos, posted to /api/quote so the shop still gets the email.
 */
export default function ServiceRequestForm() {
  const idBase = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [message, setMessage] = useState('');

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { media, mediaNotice, addFiles, removeMedia } = useMediaUploader();

  const turnstileTokenRef = useRef<string>('');
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetRef = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

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

    const notes = message.trim() || 'Quote request from the website.';

    const fd = new FormData();
    const scalars: Record<string, string> = {
      flow: 'unknown-intake',
      name,
      phone,
      email,
      contactPreference: email ? 'email' : 'text',
      vehicleYear,
      message: notes,
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

  return (
    <form onSubmit={handleSubmit}>
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
          <h1 class="font-display text-2xl font-bold text-ink sm:text-3xl">Get a quote</h1>
          <p class="mt-2 text-sm leading-relaxed text-steel-700 sm:text-base">
            Name, how to reach you, and a photo if you have one. We&rsquo;ll get back to you with a
            number.
          </p>
        </div>

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

        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor={`${idBase}-email`} error={fieldErrors.email?.[0]}>
            <TextInput
              id={`${idBase}-email`}
              value={email}
              onValue={setEmail}
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field
            label="Year"
            hint="(optional)"
            htmlFor={`${idBase}-year`}
            error={fieldErrors.vehicleYear?.[0]}
          >
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
        </div>

        <Field
          label="Anything we should know?"
          hint="(optional)"
          htmlFor={`${idBase}-message`}
          error={fieldErrors.message?.[0]}
        >
          <TextArea
            id={`${idBase}-message`}
            value={message}
            onValue={setMessage}
            rows={3}
            placeholder="e.g. Grinding noise from the front when I brake, started this week."
          />
        </Field>

        <div>
          <p class="mb-2 block text-sm font-medium text-ink-soft">
            Add photos or video{' '}
            <span class="font-normal text-steel-500">(optional, but it helps us quote faster)</span>
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
