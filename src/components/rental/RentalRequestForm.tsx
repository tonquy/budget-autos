import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { business } from '../../lib/business';
import {
  compressPhoto,
  Field,
  Icon,
  PrimaryButton,
  Spinner,
  TextInput,
  cx,
  type FieldErrors,
} from '../quote/parts';

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

// Same public site key as the quote form - Turnstile keys are safe to ship.
const TURNSTILE_SITE_KEY =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || '0x4AAAAAAD7eom-KB1HZ1Qex';
const TURNSTILE_SCRIPT_ID = 'turnstile-script';

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

// Yes/No pair styled like ChipSelect, kept local since it binds to 'yes' | 'no'
// rather than arbitrary option strings.
function YesNoSelect({
  name,
  value,
  onChange,
}: {
  name: string;
  value: 'yes' | 'no' | '';
  onChange: (v: 'yes' | 'no') => void;
}) {
  return (
    <div class="grid grid-cols-2 gap-2">
      {(['yes', 'no'] as const).map((opt) => {
        const active = value === opt;
        return (
          <label
            key={opt}
            class={cx(
              'flex min-h-12 cursor-pointer touch-manipulation items-center justify-center rounded-control border px-4 py-3 text-sm font-medium transition-colors',
              active
                ? 'border-accent bg-accent-soft text-accent-ink'
                : 'border-black/10 text-ink-soft hover:bg-steel-100',
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={active}
              onChange={() => onChange(opt)}
              class="sr-only"
            />
            {opt === 'yes' ? 'Yes' : 'No'}
          </label>
        );
      })}
    </div>
  );
}

type UploadSlot = {
  file: File | null;
  previewUrl: string | null;
  compressing: boolean;
};

const emptySlot: UploadSlot = { file: null, previewUrl: null, compressing: false };

// One required-photo tile: take a photo or pick from the library, with a
// live preview. Mirrors MediaUploader's camera/library button pair, but for
// exactly one required file instead of a multi-file gallery.
function SinglePhotoUpload({
  icon,
  label,
  hint,
  slot,
  onSelect,
  onRemove,
  error,
}: {
  icon: string;
  label: string;
  hint: string;
  slot: UploadSlot;
  onSelect: (file: File) => void;
  onRemove: () => void;
  error?: string;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onSelect(file);
  }

  return (
    <div>
      <p class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-soft">
        <Icon name={icon} class="size-4 shrink-0 text-accent" />
        {label}
      </p>
      {slot.previewUrl ? (
        <div class="relative w-32 overflow-hidden rounded-card border border-black/10">
          <img src={slot.previewUrl} alt="" class="aspect-[4/3] w-full object-cover" />
          {slot.compressing && (
            <div class="absolute inset-0 grid place-items-center bg-ink/50">
              <Spinner class="size-5 text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove photo"
            class="absolute right-1 top-1 grid size-7 touch-manipulation place-items-center rounded-full bg-ink/70 text-white hover:bg-ink"
          >
            <Icon name="trash-2" class="size-3.5" />
          </button>
        </div>
      ) : (
        <div class="flex flex-row gap-2.5">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            class="btn btn-secondary flex-1 sm:flex-none"
          >
            <Icon name="camera" class="size-4" />
            Take a photo
          </button>
          <button
            type="button"
            onClick={() => libraryRef.current?.click()}
            class="btn btn-secondary flex-1 sm:flex-none"
          >
            <Icon name="image-plus" class="size-4" />
            Upload
          </button>
        </div>
      )}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        onChange={(e) => handleFiles((e.target as HTMLInputElement).files)}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        class="hidden"
        onChange={(e) => handleFiles((e.target as HTMLInputElement).files)}
      />
      <p class="mt-1.5 text-xs text-steel-500">{hint}</p>
      {error && <p class="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

type SubmitState = 'idle' | 'submitting' | 'error';

export default function RentalRequestForm() {
  const idBase = useId();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [hasLicense, setHasLicense] = useState<'yes' | 'no' | ''>('');
  const [hasInsurance, setHasInsurance] = useState<'yes' | 'no' | ''>('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');

  const [license, setLicense] = useState<UploadSlot>(emptySlot);
  const [insuranceCard, setInsuranceCard] = useState<UploadSlot>(emptySlot);

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
          action: 'rental-request',
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

  async function selectPhoto(file: File, set: (slot: UploadSlot) => void, prev: UploadSlot) {
    if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    set({ file, previewUrl, compressing: true });
    const compressed = await compressPhoto(file);
    set({ file: compressed, previewUrl, compressing: false });
  }

  function removePhoto(set: (slot: UploadSlot) => void, prev: UploadSlot) {
    if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
    set(emptySlot);
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setErrorMessage(null);

    const errors: FieldErrors = {};
    if (!hasLicense) errors.hasLicense = ['Let us know if you have a valid driver’s license.'];
    if (!hasInsurance) errors.hasInsurance = ['Let us know if you have active New York auto insurance.'];
    if (!license.file) errors.license = ['Upload a photo of your driver’s license.'];
    if (!insuranceCard.file) errors.insuranceCard = ['Upload a photo of your current insurance card.'];
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fill in the highlighted fields.');
      return;
    }
    setFieldErrors({});

    if (TURNSTILE_SITE_KEY && !turnstileTokenRef.current) {
      setErrorMessage('Please complete the verification above before submitting.');
      return;
    }

    const fd = new FormData();
    const scalars: Record<string, string> = {
      name,
      phone,
      email,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      pickupDate,
      returnDate,
      hasLicense,
      hasInsurance,
      insuranceCompany,
      policyNumber,
    };
    for (const [key, value] of Object.entries(scalars)) {
      if (value) fd.set(key, value);
    }
    if (license.file) fd.set('license', license.file, license.file.name);
    if (insuranceCard.file) fd.set('insuranceCard', insuranceCard.file, insuranceCard.file.name);
    fd.set('turnstileToken', turnstileTokenRef.current);
    if (honeypotRef.current?.value) fd.set('company', honeypotRef.current.value);

    setSubmitState('submitting');
    try {
      const response = await fetch('/api/rental', { method: 'POST', body: fd });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!response.ok || !result.ok) {
        setSubmitState('error');
        setErrorMessage(result.error ?? 'Something went wrong. Please try again, or just call us.');
        setFieldErrors(result.fieldErrors ?? {});
        if (TURNSTILE_SITE_KEY && turnstileWidgetRef.current) {
          window.turnstile?.reset(turnstileWidgetRef.current);
          turnstileTokenRef.current = '';
        }
        return;
      }

      try {
        sessionStorage.setItem('budgetauto-rental-submitted', '1');
      } catch {
        /* private mode - thank-you PageView still fires; Lead may be skipped */
      }
      window.location.assign('/thank-you');
    } catch {
      setSubmitState('error');
      setErrorMessage('Something went wrong sending your request. Please try again, or just call us.');
    }
  }

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

      <div class="space-y-6">
        <div>
          <h1 class="font-display text-2xl font-bold text-ink sm:text-3xl">Request a rental</h1>
          <p class="mt-2 text-sm leading-relaxed text-steel-700 sm:text-base">
            For customers leaving a vehicle with us for repair. $35/day, up to 100 miles included per day.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor={`${idBase}-name`} error={fieldErrors.name?.[0]}>
            <TextInput
              id={`${idBase}-name`}
              value={name}
              onValue={setName}
              type="text"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Cell phone" htmlFor={`${idBase}-phone`} error={fieldErrors.phone?.[0]}>
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
          <div class="sm:col-span-2">
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
          </div>
        </div>

        <div>
          <p class="mb-3 font-display text-base font-semibold text-ink">Vehicle being repaired</p>
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
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Rental pickup date" htmlFor={`${idBase}-pickup`} error={fieldErrors.pickupDate?.[0]}>
            <TextInput
              id={`${idBase}-pickup`}
              value={pickupDate}
              onValue={(v) => {
                setPickupDate(v);
                if (returnDate && returnDate < v) setReturnDate(v);
              }}
              type="date"
              min={todayIso()}
              required
            />
          </Field>
          <Field label="Expected return date" htmlFor={`${idBase}-return`} error={fieldErrors.returnDate?.[0]}>
            <TextInput
              id={`${idBase}-return`}
              value={returnDate}
              onValue={setReturnDate}
              type="date"
              min={pickupDate || todayIso()}
              required
            />
          </Field>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium text-ink-soft">Valid driver’s license?</p>
          <YesNoSelect name={`${idBase}-license`} value={hasLicense} onChange={setHasLicense} />
          {fieldErrors.hasLicense?.[0] && (
            <p class="mt-1 text-xs text-red-600">{fieldErrors.hasLicense[0]}</p>
          )}
        </div>

        <div>
          <p class="mb-2 text-sm font-medium text-ink-soft">Active New York auto insurance?</p>
          <YesNoSelect name={`${idBase}-insurance`} value={hasInsurance} onChange={setHasInsurance} />
          {fieldErrors.hasInsurance?.[0] && (
            <p class="mt-1 text-xs text-red-600">{fieldErrors.hasInsurance[0]}</p>
          )}
        </div>

        {hasInsurance === 'yes' && (
          <div class="grid gap-4 sm:grid-cols-2">
            <Field
              label="Insurance company"
              htmlFor={`${idBase}-insurer`}
              error={fieldErrors.insuranceCompany?.[0]}
            >
              <TextInput
                id={`${idBase}-insurer`}
                value={insuranceCompany}
                onValue={setInsuranceCompany}
                type="text"
                required
              />
            </Field>
            <Field label="Policy number" htmlFor={`${idBase}-policy`} error={fieldErrors.policyNumber?.[0]}>
              <TextInput
                id={`${idBase}-policy`}
                value={policyNumber}
                onValue={setPolicyNumber}
                type="text"
                required
              />
            </Field>
          </div>
        )}

        <div class="grid gap-5 sm:grid-cols-2">
          <SinglePhotoUpload
            icon="badge-check"
            label="Driver’s license photo"
            hint="A clear photo of the front of your license."
            slot={license}
            onSelect={(file) => selectPhoto(file, setLicense, license)}
            onRemove={() => removePhoto(setLicense, license)}
            error={fieldErrors.license?.[0]}
          />
          <SinglePhotoUpload
            icon="shield-check"
            label="Insurance card photo"
            hint="A clear photo of your current insurance card."
            slot={insuranceCard}
            onSelect={(file) => selectPhoto(file, setInsuranceCard, insuranceCard)}
            onRemove={() => removePhoto(setInsuranceCard, insuranceCard)}
            error={fieldErrors.insuranceCard?.[0]}
          />
        </div>

        <div class="space-y-4">
          {TURNSTILE_SITE_KEY && <div ref={turnstileContainerRef} />}

          <p class="text-xs leading-relaxed text-steel-500">
            Submitting this request does not guarantee a rental vehicle. Rental is subject to insurance
            verification, customer eligibility, and vehicle availability. We will contact you to confirm.
          </p>

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
                Send rental request
              </>
            )}
          </PrimaryButton>
          <p class="text-xs leading-relaxed text-steel-500">
            Rather talk it through? Call {business.phoneDisplay}.
          </p>
        </div>
      </div>
    </form>
  );
}
