import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';
import { business } from '../../lib/business';
import {
  Field,
  Icon,
  PrimaryButton,
  Spinner,
  TextArea,
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

// Public by design (rendered into the page), with a production fallback so the
// widget still works when the build-time env var is missing in CI. Mirrors the
// quote forms' handling.
const TURNSTILE_SITE_KEY =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || '0x4AAAAAAD7eom-KB1HZ1Qex';
const TURNSTILE_SCRIPT_ID = 'turnstile-script';

type ServiceOption = {
  slug: string;
  name: string;
  icon: string;
  durationMinutes: number;
};

type Props = {
  services: ServiceOption[];
  /** Preselected from ?service= on the page, so a visitor arriving from a
   *  service page starts on the calendar instead of the picker. */
  initialService?: string;
  /** IANA zone every time is rendered in - the shop's, never the visitor's. */
  timeZone: string;
  /** Human-readable version of the above, e.g. "Eastern time". */
  timeZoneLabel: string;
};

type SlotsResponse = {
  ok: boolean;
  error?: string;
  source?: 'cal.com' | 'local';
  /** Today at the shop, which is not necessarily today on the visitor's device. */
  today?: string;
  earliestDate?: string;
  latestDate?: string;
  leadDays?: number;
  days?: { date: string; slots: string[] }[];
};

type Step = 'service' | 'when' | 'details';
type SubmitState = 'idle' | 'submitting' | 'error';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// --- Date helpers -------------------------------------------------------------
// These operate on 'YYYY-MM-DD' strings rather than Date objects. The server has
// already resolved every date in the shop's timezone; parsing them back into
// local Date objects here would re-introduce the offset bug on any visitor whose
// phone is set to another timezone.

function partsOf(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return { year: year!, month: month!, day: day! };
}

function monthKeyOf(key: string) {
  return key.slice(0, 7);
}

function addMonths(monthKey: string, delta: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

function daysInMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year!, month!, 0)).getUTCDate();
}

/** Weekday index (0 = Sunday) of the 1st of the month. */
function firstWeekdayOf(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, 1)).getUTCDay();
}

function monthLabel(monthKey: string) {
  const { year, month } = partsOf(`${monthKey}-01`);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function longDateLabel(key: string) {
  const { year, month, day } = partsOf(key);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Formats an ISO instant as a time label in the shop's timezone. */
function timeLabel(iso: string, timeZone: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  });
}

export default function BookingFlow({ services, initialService, timeZone, timeZoneLabel }: Props) {
  const idBase = useId();

  const [step, setStep] = useState<Step>(initialService ? 'when' : 'service');
  const [serviceSlug, setServiceSlug] = useState(initialService ?? '');

  const [slots, setSlots] = useState<SlotsResponse | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [month, setMonth] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const turnstileTokenRef = useRef<string>('');
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetRef = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  /*
   * BaseLayout prefills every [data-sms-link] on page load, which is before this
   * island mounts, so the deep link is built here instead. Starts as a bare
   * sms: link so it still opens a blank message to the right number if this
   * never runs.
   */
  const [smsHref, setSmsHref] = useState(`sms:${business.smsNumber}`);
  useEffect(() => {
    const isIos =
      /iP(hone|ad|od)|Macintosh.*Version.*Safari/.test(navigator.userAgent) && 'ontouchend' in document;
    const separator = isIos ? '&' : '?';
    setSmsHref(`sms:${business.smsNumber}${separator}body=${encodeURIComponent(business.smsBody)}`);
  }, []);

  const service = services.find((option) => option.slug === serviceSlug);

  /** date -> open slots, for the month grid and the time list. */
  const slotsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const day of slots?.days ?? []) map.set(day.date, day.slots);
    return map;
  }, [slots]);

  // Load availability whenever the chosen service changes.
  useEffect(() => {
    if (!serviceSlug) return;

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedDate('');
    setSelectedSlot('');

    fetch(`/api/slots?service=${encodeURIComponent(serviceSlug)}`)
      .then((response) => response.json() as Promise<SlotsResponse>)
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setSlotsError(result.error ?? 'We could not load the calendar.');
          return;
        }
        setSlots(result);
        // Open on the month holding the first date they can actually book.
        const first = result.days?.[0]?.date ?? result.earliestDate;
        if (first) setMonth(monthKeyOf(first));
      })
      .catch(() => {
        if (!cancelled) setSlotsError('We could not load the calendar. Please call us instead.');
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceSlug]);

  // Render Turnstile once the details step is on screen.
  useEffect(() => {
    if (step !== 'details' || !TURNSTILE_SITE_KEY) return;

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

  function chooseService(slug: string) {
    setServiceSlug(slug);
    setStep('when');
  }

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
      serviceSlug,
      slotStart: selectedSlot,
      name,
      phone,
      email,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      mileage,
      notes,
    };
    for (const [key, value] of Object.entries(scalars)) {
      if (value) fd.set(key, value);
    }
    fd.set('turnstileToken', turnstileTokenRef.current);
    if (honeypotRef.current?.value) fd.set('company', honeypotRef.current.value);

    setSubmitState('submitting');
    try {
      const response = await fetch('/api/booking', { method: 'POST', body: fd });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
        slotTaken?: boolean;
      };

      if (!response.ok || !result.ok) {
        setSubmitState('error');
        setErrorMessage(result.error ?? 'Something went wrong. Please try again or call us.');
        setFieldErrors(result.fieldErrors ?? {});

        if (TURNSTILE_SITE_KEY && turnstileWidgetRef.current) {
          window.turnstile?.reset(turnstileWidgetRef.current);
          turnstileTokenRef.current = '';
        }

        // Someone else took the slot mid-form. Send them back to the calendar
        // with fresh availability rather than leaving them on a dead time.
        if (result.slotTaken) {
          setSelectedSlot('');
          setStep('when');
          fetch(`/api/slots?service=${encodeURIComponent(serviceSlug)}`)
            .then((r) => r.json() as Promise<SlotsResponse>)
            .then((fresh) => {
              if (fresh.ok) setSlots(fresh);
            })
            .catch(() => {
              /* the message above already tells them to pick another time */
            });
        }
        return;
      }

      try {
        sessionStorage.setItem('budgetauto-booking-submitted', '1');
      } catch {
        /* private mode - thank-you PageView still fires; Lead may be skipped */
      }
      window.location.assign('/thank-you?booked=1');
    } catch {
      setSubmitState('error');
      setErrorMessage('Something went wrong booking your appointment. Please try again or call us.');
    }
  }

  // --- Rendering pieces -------------------------------------------------------

  const urgentNote = (
    <p class="mt-4 rounded-card border border-black/5 bg-paper px-4 py-3 text-sm leading-relaxed text-steel-700">
      <span class="font-semibold text-ink">
        Online booking starts {slots?.earliestDate ? longDateLabel(slots.earliestDate) : 'in a few days'}.
      </span>{' '}
      Need it sooner?{' '}
      <a
        href={business.phoneHref}
        data-contact-action="call"
        data-contact-location="booking-calendar"
        class="font-semibold text-accent hover:text-accent-dark"
      >
        Call {business.phoneDisplay}
      </a>{' '}
      or{' '}
      <a
        href={smsHref}
        data-contact-action="text"
        data-contact-location="booking-calendar"
        class="font-semibold text-accent hover:text-accent-dark"
      >
        text us
      </a>
      . We keep room for urgent and safety work.
    </p>
  );

  function renderCalendar() {
    if (!month) return null;

    const total = daysInMonth(month);
    const leading = firstWeekdayOf(month);
    const earliest = slots?.earliestDate ?? '';
    const latest = slots?.latestDate ?? '';
    const today = slots?.today ?? '';

    const cells: (string | null)[] = [];
    for (let i = 0; i < leading; i += 1) cells.push(null);
    for (let day = 1; day <= total; day += 1) {
      cells.push(`${month}-${String(day).padStart(2, '0')}`);
    }

    const prevMonth = addMonths(month, -1);
    const nextMonth = addMonths(month, 1);
    const canGoBack = earliest ? prevMonth >= monthKeyOf(earliest) : false;
    const canGoForward = latest ? nextMonth <= monthKeyOf(latest) : false;

    return (
      <div class="rounded-card border border-black/10 bg-surface p-4 sm:p-5">
        <div class="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => canGoBack && setMonth(prevMonth)}
            disabled={!canGoBack}
            aria-label="Previous month"
            class="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-steel-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="chevron-left" class="size-5" />
          </button>
          <p class="font-display text-base font-semibold text-ink">{monthLabel(month)}</p>
          <button
            type="button"
            onClick={() => canGoForward && setMonth(nextMonth)}
            disabled={!canGoForward}
            aria-label="Next month"
            class="grid size-10 rotate-180 place-items-center rounded-full text-ink-soft transition-colors hover:bg-steel-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="chevron-left" class="size-5" />
          </button>
        </div>

        <div class="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((label, index) => (
            <div
              key={`${label}-${index}`}
              aria-hidden="true"
              class="pb-1 text-xs font-semibold uppercase tracking-wider text-steel-500"
            >
              {label}
            </div>
          ))}

          {cells.map((key, index) => {
            if (!key) return <div key={`pad-${index}`} />;

            const open = (slotsByDate.get(key) ?? []).length > 0;
            const selected = key === selectedDate;
            // A date that has already been and gone is not "fully booked", it is
            // just past. Striking those through made the current month look like
            // the shop had been slammed for three straight weeks.
            const past = today !== '' && key < today;
            const { day } = partsOf(key);

            return (
              <button
                key={key}
                type="button"
                disabled={!open}
                onClick={() => {
                  setSelectedDate(key);
                  setSelectedSlot('');
                }}
                aria-label={`${longDateLabel(key)}${open ? '' : past ? ' - past' : ' - fully booked'}`}
                aria-pressed={selected}
                class={cx(
                  'relative grid aspect-square touch-manipulation place-items-center rounded-card text-sm font-medium transition-colors',
                  selected && 'bg-accent text-white',
                  !selected && open && 'text-ink hover:bg-accent-soft',
                  !open && 'cursor-not-allowed text-steel-300',
                  // Upcoming days that are full get struck through, so the
                  // customer reads "they're busy" rather than "the calendar is
                  // broken". Past days are simply dimmed.
                  !open && !past && 'line-through decoration-steel-300',
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        <p class="mt-4 flex items-center gap-2 text-xs text-steel-500">
          <span class="inline-block size-3 rounded-full bg-accent" aria-hidden="true" />
          Available
          <span class="ml-3 inline-block size-3 rounded-full bg-steel-200" aria-hidden="true" />
          Fully booked
        </p>
      </div>
    );
  }

  function renderTimes() {
    const times = slotsByDate.get(selectedDate) ?? [];
    if (!selectedDate) {
      return (
        <p class="rounded-card border border-dashed border-black/10 px-4 py-8 text-center text-sm text-steel-500">
          Pick a date to see available times.
        </p>
      );
    }

    return (
      <div>
        <p class="mb-3 text-sm font-medium text-ink-soft">
          {longDateLabel(selectedDate)}
          <span class="ml-1 font-normal text-steel-500">({timeZoneLabel})</span>
        </p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {times.map((iso) => {
            const active = iso === selectedSlot;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedSlot(iso)}
                aria-pressed={active}
                class={cx(
                  'min-h-12 touch-manipulation rounded-control border px-3 text-sm font-medium transition-colors sm:min-h-11',
                  active
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-black/10 text-ink-soft hover:bg-steel-100',
                )}
              >
                {timeLabel(iso, timeZone)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Steps ------------------------------------------------------------------

  if (step === 'service') {
    return (
      <div>
        <div class="mb-5 sm:mb-6">
          <p class="text-xs font-semibold uppercase tracking-wider text-accent">Step 1 of 3</p>
          <h2 class="mt-1 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            What does your vehicle need?
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-steel-700 sm:text-base">
            Pick the closest match. If you&rsquo;re not sure, choose General Repairs and tell us what&rsquo;s
            going on.
          </p>
        </div>

        <div class="grid gap-2.5 sm:grid-cols-2">
          {services.map((option) => (
            <button
              key={option.slug}
              type="button"
              onClick={() => chooseService(option.slug)}
              class="group flex w-full touch-manipulation items-center gap-3 rounded-card border border-black/10 bg-surface p-4 text-left transition-all hover:border-accent/40 hover:bg-steel-100 active:scale-[0.99]"
            >
              <span class="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <Icon name={option.icon} class="size-5" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-display text-[15px] font-semibold leading-snug text-ink">
                  {option.name}
                </span>
                <span class="mt-0.5 block text-xs text-steel-500">
                  About {option.durationMinutes} minutes
                </span>
              </span>
              <Icon
                name="arrow-right"
                class="size-5 shrink-0 text-steel-500 transition-transform group-hover:translate-x-0.5"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'when') {
    return (
      <div>
        <div class="mb-5 sm:mb-6">
          <p class="text-xs font-semibold uppercase tracking-wider text-accent">Step 2 of 3</p>
          <h2 class="mt-1 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Pick a day and time
          </h2>
          {service && (
            <p class="mt-2 text-sm leading-relaxed text-steel-700 sm:text-base">
              {service.name} &middot; about {service.durationMinutes} minutes
            </p>
          )}
        </div>

        {slotsLoading && (
          <div class="flex items-center gap-2 rounded-card border border-black/10 px-4 py-8 text-sm text-steel-600">
            <Spinner class="size-4" />
            Loading the calendar...
          </div>
        )}

        {slotsError && (
          <p class="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {slotsError}
          </p>
        )}

        {!slotsLoading && !slotsError && (
          <div class="space-y-5">
            {renderCalendar()}
            {renderTimes()}
            {urgentNote}
          </div>
        )}

        <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setStep('service')}
            class="btn btn-secondary w-full sm:w-auto"
          >
            <Icon name="chevron-left" class="size-4" />
            Change service
          </button>
          <PrimaryButton onClick={() => setStep('details')} disabled={!selectedSlot}>
            Continue
          </PrimaryButton>
        </div>
      </div>
    );
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

      <div class="mb-5 sm:mb-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-accent">Step 3 of 3</p>
        <h2 class="mt-1 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Your details
        </h2>
      </div>

      {/* Confirmation summary, so nobody submits without seeing what they picked. */}
      <div class="mb-6 rounded-card bg-ink p-4 text-white sm:p-5">
        <p class="text-xs font-semibold uppercase tracking-wider text-accent">Your appointment</p>
        <p class="mt-2 font-display text-lg font-semibold">
          {selectedDate && longDateLabel(selectedDate)}
        </p>
        <p class="font-display text-lg font-semibold">
          {selectedSlot && timeLabel(selectedSlot, timeZone)}
        </p>
        <p class="mt-2 text-sm text-steel-300">
          {service?.name}
          {service ? ` \u00b7 about ${service.durationMinutes} minutes` : ''}
        </p>
      </div>

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

        <Field
          label="Email"
          hint="(we send your confirmation here)"
          htmlFor={`${idBase}-email`}
          error={fieldErrors.email?.[0]}
        >
          <TextInput
            id={`${idBase}-email`}
            value={email}
            onValue={setEmail}
            type="email"
            autoComplete="email"
            required
          />
        </Field>

        <div class="grid gap-4 sm:grid-cols-4">
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
        </div>

        <Field
          label="Anything we should know?"
          hint="(optional)"
          htmlFor={`${idBase}-notes`}
          error={fieldErrors.notes?.[0]}
        >
          <TextArea
            id={`${idBase}-notes`}
            value={notes}
            onValue={setNotes}
            rows={3}
            placeholder="e.g. Grinding noise from the front when I brake, started this week."
          />
        </Field>
      </div>

      <div class="mt-7 space-y-4">
        {TURNSTILE_SITE_KEY && <div ref={turnstileContainerRef} />}
        {errorMessage && (
          <p class="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setStep('when')}
            class="btn btn-secondary w-full sm:w-auto"
          >
            <Icon name="chevron-left" class="size-4" />
            Change time
          </button>
          <PrimaryButton type="submit" disabled={submitState === 'submitting'} icon={null}>
            {submitState === 'submitting' ? (
              <>
                <Spinner class="size-[18px]" />
                Booking...
              </>
            ) : (
              <>
                <Icon name="circle-check-big" class="size-[18px]" />
                Confirm appointment
              </>
            )}
          </PrimaryButton>
        </div>

        <p class="text-xs leading-relaxed text-steel-500">{business.laborGuide}</p>
      </div>
    </form>
  );
}
