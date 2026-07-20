import { useEffect, useId, useRef, useState } from 'preact/hooks';
import imageCompression from 'browser-image-compression';
import { MAX_PHOTOS, contactPreferences } from '../../lib/quoteSchema';
import { services } from '../../lib/business';

type ContactPreference = (typeof contactPreferences)[number];

type PhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'compressing' | 'ready' | 'error';
};

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
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

const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '';
const TURNSTILE_SCRIPT_ID = 'turnstile-script';

const contactLabels: Record<ContactPreference, string> = {
  call: 'Call me',
  text: 'Text me',
  email: 'Email me',
};

async function compressPhoto(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }
  try {
    return await imageCompression(file, {
      maxSizeMB: 1.2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    });
  } catch (err) {
    console.warn('Photo compression failed, using original file', err);
    return file;
  }
}

export default function QuoteForm() {
  const formId = useId();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [contactPreference, setContactPreference] = useState<ContactPreference>('call');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const turnstileTokenRef = useRef<string>('');
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    function renderWidget() {
      if (window.turnstile && turnstileContainerRef.current) {
        window.turnstile.render(turnstileContainerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
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

  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList).slice(0, MAX_PHOTOS - photos.length);
    if (incoming.length === 0) return;

    const pending: PhotoItem[] = incoming.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'compressing',
    }));

    setPhotos((prev) => [...prev, ...pending]);

    for (const item of pending) {
      const compressed = await compressPhoto(item.file);
      setPhotos((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, file: compressed, status: 'ready' } : p)),
      );
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    formData.set('contactPreference', contactPreference);
    formData.set('turnstileToken', turnstileTokenRef.current);
    formData.delete('photos');
    photos.forEach((p) => formData.append('photos', p.file, p.file.name));

    if (TURNSTILE_SITE_KEY && !turnstileTokenRef.current) {
      setErrorMessage('Please complete the verification above before submitting.');
      return;
    }

    setSubmitState('submitting');

    try {
      const response = await fetch('/api/quote', { method: 'POST', body: formData });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        fieldErrors?: Record<string, string[]>;
      };

      if (!response.ok || !result.ok) {
        setSubmitState('error');
        setErrorMessage(result.error ?? 'Something went wrong. Please try again or call us.');
        setFieldErrors(result.fieldErrors ?? {});
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
      <div class="rounded-card border border-black/5 bg-surface p-8 text-center shadow-card sm:p-12">
        <div class="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M21.801 10A10 10 0 1 1 17 3.335" />
              <path d="m9 11l3 3L22 4" />
            </g>
          </svg>
        </div>
        <h2 class="mt-5 font-display text-2xl font-bold text-ink">Request sent.</h2>
        <p class="mt-2 text-steel-700">
          Thanks - we&rsquo;ve got your request and photos. We&rsquo;ll be in touch soon, usually within the hour during shop hours.
        </p>
      </div>
    );
  }

  return (
    <form class="space-y-8" onSubmit={handleSubmit}>
      {/* Honeypot field - hidden from real users, bots tend to fill every input. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        class="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <fieldset class="space-y-4">
        <legend class="font-display text-lg font-semibold text-ink">Your info</legend>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-name`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              Full name
            </label>
            <input
              id={`${formId}-name`}
              name="name"
              type="text"
              required
              autoComplete="name"
              class="w-full rounded-control border border-black/10 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
            {fieldErrors.name && <p class="mt-1 text-xs text-red-600">{fieldErrors.name[0]}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-phone`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              Phone number
            </label>
            <input
              id={`${formId}-phone`}
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="(423) 555-0148"
              class="w-full rounded-control border border-black/10 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
            {fieldErrors.phone && <p class="mt-1 text-xs text-red-600">{fieldErrors.phone[0]}</p>}
          </div>
          <div class="sm:col-span-2">
            <label htmlFor={`${formId}-email`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              Email <span class="text-steel-500">(optional)</span>
            </label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              autoComplete="email"
              class="w-full rounded-control border border-black/10 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
            {fieldErrors.email && <p class="mt-1 text-xs text-red-600">{fieldErrors.email[0]}</p>}
          </div>
        </div>

        <div>
          <p class="mb-2 block text-sm font-medium text-ink-soft">How should we reach you back?</p>
          <div class="flex flex-wrap gap-2">
            {contactPreferences.map((pref) => (
              <label
                key={pref}
                class={`cursor-pointer rounded-control border px-4 py-2 text-sm font-medium transition-colors ${
                  contactPreference === pref
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-black/10 text-ink-soft hover:bg-steel-100'
                }`}
              >
                <input
                  type="radio"
                  name="contactPreferenceDisplay"
                  value={pref}
                  checked={contactPreference === pref}
                  onChange={() => setContactPreference(pref)}
                  class="sr-only"
                />
                {contactLabels[pref]}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset class="space-y-4">
        <legend class="font-display text-lg font-semibold text-ink">Your vehicle & the issue</legend>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-vehicle`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              Vehicle <span class="text-steel-500">(optional)</span>
            </label>
            <input
              id={`${formId}-vehicle`}
              name="vehicle"
              type="text"
              placeholder="e.g. 2018 Toyota Camry"
              class="w-full rounded-control border border-black/10 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-serviceType`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              What do you need? <span class="text-steel-500">(optional)</span>
            </label>
            <select
              id={`${formId}-serviceType`}
              name="serviceType"
              class="w-full rounded-control border border-black/10 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">Not sure / something else</option>
              {services.map((s) => (
                <option key={s.slug} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor={`${formId}-message`} class="mb-1.5 block text-sm font-medium text-ink-soft">
            Tell us what&rsquo;s going on
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            required
            rows={4}
            placeholder="e.g. There's a grinding noise when I brake, especially at low speed."
            class="w-full rounded-control border border-black/10 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
          {fieldErrors.message && <p class="mt-1 text-xs text-red-600">{fieldErrors.message[0]}</p>}
        </div>
      </fieldset>

      <fieldset class="space-y-3">
        <legend class="font-display text-lg font-semibold text-ink">
          Photos <span class="text-sm font-normal text-steel-500">(optional, but it helps a lot)</span>
        </legend>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={photos.length >= MAX_PHOTOS}
            class="inline-flex items-center gap-2 rounded-control border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-steel-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
                <circle cx="12" cy="13" r="3" />
              </g>
            </svg>
            Take a photo
          </button>
          <button
            type="button"
            onClick={() => libraryInputRef.current?.click()}
            disabled={photos.length >= MAX_PHOTOS}
            class="inline-flex items-center gap-2 rounded-control border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-steel-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M16 5h6m-3-3v6m2 3.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
                <path d="m21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                <circle cx="9" cy="9" r="2" />
              </g>
            </svg>
            Choose from library
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          onChange={(e) => addFiles((e.target as HTMLInputElement).files)}
        />
        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          onChange={(e) => addFiles((e.target as HTMLInputElement).files)}
        />

        {photos.length > 0 && (
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} class="group relative aspect-square overflow-hidden rounded-card border border-black/10">
                <img src={photo.previewUrl} alt="" class="h-full w-full object-cover" />
                {photo.status === 'compressing' && (
                  <div class="absolute inset-0 grid place-items-center bg-ink/50">
                    <svg viewBox="0 0 24 24" width="20" height="20" class="animate-spin text-white" aria-hidden="true">
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 12a9 9 0 1 1-6.219-8.56"
                      />
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  aria-label="Remove photo"
                  class="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18 6L6 18M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <p class="text-xs text-steel-500">Up to {MAX_PHOTOS} photos. JPG, PNG, WEBP, or HEIC.</p>
      </fieldset>

      {TURNSTILE_SITE_KEY && <div ref={turnstileContainerRef} />}

      {errorMessage && (
        <p class="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={submitState === 'submitting'}
        class="inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-lifted transition-transform hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {submitState === 'submitting' ? (
          <>
            <svg viewBox="0 0 24 24" width="18" height="18" class="animate-spin" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 1 1-6.219-8.56"
              />
            </svg>
            Sending...
          </>
        ) : (
          'Send my quote request'
        )}
      </button>
    </form>
  );
}
