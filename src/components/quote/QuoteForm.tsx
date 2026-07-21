import { useEffect, useId, useRef, useState } from 'preact/hooks';
import imageCompression from 'browser-image-compression';
import { MAX_FILES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, contactPreferences } from '../../lib/quoteSchema';
import { business, services } from '../../lib/business';

type ContactPreference = (typeof contactPreferences)[number];

type MediaKind = 'image' | 'video';

type MediaItem = {
  id: string;
  file: File;
  kind: MediaKind;
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

function fileKind(file: File): MediaKind | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
}

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
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);
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
      media.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setMediaNotice(null);

    const remainingSlots = MAX_FILES - media.length;
    if (remainingSlots <= 0) {
      setMediaNotice(`You can attach up to ${MAX_FILES} files.`);
      return;
    }

    const accepted: { file: File; kind: MediaKind }[] = [];
    let rejectedType = false;
    let rejectedSize = false;

    for (const file of Array.from(fileList)) {
      const kind = fileKind(file);
      if (!kind) {
        rejectedType = true;
        continue;
      }
      const cap = kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      // Images get compressed below, so only guard clearly oversized originals here.
      if (kind === 'video' && file.size > cap) {
        rejectedSize = true;
        continue;
      }
      accepted.push({ file, kind });
    }

    const notices: string[] = [];
    if (rejectedType) notices.push('Only photos and videos can be attached.');
    if (rejectedSize) notices.push(`Videos must be under ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))}MB.`);

    const capped = accepted.slice(0, remainingSlots);
    if (accepted.length > remainingSlots) {
      notices.push(`Only the first ${MAX_FILES} files are attached.`);
    }
    if (notices.length > 0) setMediaNotice(notices.join(' '));
    if (capped.length === 0) return;

    const pending: MediaItem[] = capped.map(({ file, kind }) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      kind,
      previewUrl: URL.createObjectURL(file),
      status: kind === 'image' ? 'compressing' : 'ready',
    }));

    setMedia((prev) => [...prev, ...pending]);

    for (const item of pending) {
      if (item.kind !== 'image') continue;
      const compressed = await compressPhoto(item.file);
      setMedia((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, file: compressed, status: 'ready' } : m)),
      );
    }
  }

  function removeMedia(id: string) {
    setMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((m) => m.id !== id);
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
    formData.delete('media');
    media.forEach((m) => formData.append('media', m.file, m.file.name));

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
          Thanks - we&rsquo;ve got your request and files. We&rsquo;ll be in touch soon, usually within the hour during shop hours.
        </p>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-control border border-black/10 bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-accent';

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
            <input id={`${formId}-name`} name="name" type="text" required autoComplete="name" class={inputClass} />
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
              placeholder={business.phoneDisplay}
              class={inputClass}
            />
            {fieldErrors.phone && <p class="mt-1 text-xs text-red-600">{fieldErrors.phone[0]}</p>}
          </div>
          <div class="sm:col-span-2">
            <label htmlFor={`${formId}-email`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              Email{' '}
              <span class="text-steel-500">
                {contactPreference === 'email' ? '(required for email replies)' : '(optional)'}
              </span>
            </label>
            <input id={`${formId}-email`} name="email" type="email" autoComplete="email" class={inputClass} />
            {fieldErrors.email && <p class="mt-1 text-xs text-red-600">{fieldErrors.email[0]}</p>}
          </div>
        </div>

        <div>
          <p class="mb-2 block text-sm font-medium text-ink-soft">Preferred contact method</p>
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
        <legend class="font-display text-lg font-semibold text-ink">Your vehicle</legend>
        <p class="-mt-1 text-sm text-steel-500">
          Share whatever you know - all of this is optional, but it helps us quote faster.
        </p>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-year`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              Year
            </label>
            <input
              id={`${formId}-year`}
              name="vehicleYear"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="2018"
              class={inputClass}
            />
            {fieldErrors.vehicleYear && <p class="mt-1 text-xs text-red-600">{fieldErrors.vehicleYear[0]}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-make`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              Make
            </label>
            <input id={`${formId}-make`} name="vehicleMake" type="text" placeholder="Toyota" class={inputClass} />
            {fieldErrors.vehicleMake && <p class="mt-1 text-xs text-red-600">{fieldErrors.vehicleMake[0]}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-model`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              Model
            </label>
            <input id={`${formId}-model`} name="vehicleModel" type="text" placeholder="Camry" class={inputClass} />
            {fieldErrors.vehicleModel && <p class="mt-1 text-xs text-red-600">{fieldErrors.vehicleModel[0]}</p>}
          </div>
          <div>
            <label htmlFor={`${formId}-mileage`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              Mileage
            </label>
            <input
              id={`${formId}-mileage`}
              name="mileage"
              type="text"
              inputMode="numeric"
              placeholder="86,000"
              class={inputClass}
            />
            {fieldErrors.mileage && <p class="mt-1 text-xs text-red-600">{fieldErrors.mileage[0]}</p>}
          </div>
          <div class="sm:col-span-2">
            <label htmlFor={`${formId}-vin`} class="mb-1.5 block text-sm font-medium text-ink-soft">
              VIN
            </label>
            <input
              id={`${formId}-vin`}
              name="vin"
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellcheck={false}
              maxLength={17}
              placeholder="17-character vehicle ID (on the dash or door jamb)"
              class={`${inputClass} uppercase`}
            />
            {fieldErrors.vin && <p class="mt-1 text-xs text-red-600">{fieldErrors.vin[0]}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset class="space-y-4">
        <legend class="font-display text-lg font-semibold text-ink">The issue</legend>
        <div>
          <label htmlFor={`${formId}-serviceType`} class="mb-1.5 block text-sm font-medium text-ink-soft">
            What do you need? <span class="text-steel-500">(optional)</span>
          </label>
          <select id={`${formId}-serviceType`} name="serviceType" class={inputClass}>
            <option value="">Not sure / something else</option>
            {services.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
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
            class={inputClass}
          />
          {fieldErrors.message && <p class="mt-1 text-xs text-red-600">{fieldErrors.message[0]}</p>}
        </div>
      </fieldset>

      <fieldset class="space-y-3">
        <legend class="font-display text-lg font-semibold text-ink">
          Photos &amp; videos <span class="text-sm font-normal text-steel-500">(optional, but it helps a lot)</span>
        </legend>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={media.length >= MAX_FILES}
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
            disabled={media.length >= MAX_FILES}
            class="inline-flex items-center gap-2 rounded-control border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-steel-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M16 5h6m-3-3v6m2 3.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
                <path d="m21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                <circle cx="9" cy="9" r="2" />
              </g>
            </svg>
            Add photos or videos
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
          accept="image/*,video/*"
          multiple
          class="hidden"
          onChange={(e) => addFiles((e.target as HTMLInputElement).files)}
        />

        {media.length > 0 && (
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {media.map((item) => (
              <div key={item.id} class="group relative aspect-square overflow-hidden rounded-card border border-black/10">
                {item.kind === 'video' ? (
                  <video src={item.previewUrl} class="h-full w-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img src={item.previewUrl} alt="" class="h-full w-full object-cover" />
                )}
                {item.kind === 'video' && (
                  <span class="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true">
                      <path fill="currentColor" d="M8 5.14v14l11-7z" />
                    </svg>
                    Video
                  </span>
                )}
                {item.status === 'compressing' && (
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
                  onClick={() => removeMedia(item.id)}
                  aria-label="Remove file"
                  class="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink"
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
        {mediaNotice && <p class="text-xs text-amber-700">{mediaNotice}</p>}
        <p class="text-xs text-steel-500">
          Up to {MAX_FILES} files. Photos (JPG, PNG, WEBP, HEIC) or short videos (MP4, MOV) up to{' '}
          {Math.round(MAX_VIDEO_BYTES / (1024 * 1024))}MB each.
        </p>
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
