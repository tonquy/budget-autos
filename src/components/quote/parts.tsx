import type { ComponentChildren, JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import imageCompression from 'browser-image-compression';
import { MAX_FILES, MAX_VIDEO_BYTES, contactPreferences, type IntakeFlow } from '../../lib/quoteSchema';

export type ContactPreference = (typeof contactPreferences)[number];

export type IntakeData = {
  flow: IntakeFlow | '';
  // Wizard-only branch aid (not submitted directly - flow encodes it).
  hasEstimate: '' | 'yes' | 'no';

  // Customer
  name: string;
  phone: string;
  email: string;
  contactPreference: ContactPreference;

  // Vehicle
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vin: string;
  mileage: string;

  // Primary description (label changes per flow).
  message: string;

  // Path extras
  estimateHelp: string[];
  knownBasis: string[];
  beginChoice: string;
  diagnosticCodes: string;
  helpNeeded: string;

  // Scripted assistant answers
  symptomStarted: string;
  symptomWhen: string[];
  warningLights: string[];
  symptoms: string[];
  drivable: string;
  alreadyDone: string;
  category: string;
  assistantSummary: string;
  nextStep: string;
};

export function emptyIntakeData(): IntakeData {
  return {
    flow: '',
    hasEstimate: '',
    name: '',
    phone: '',
    email: '',
    contactPreference: 'call',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vin: '',
    mileage: '',
    message: '',
    estimateHelp: [],
    knownBasis: [],
    beginChoice: '',
    diagnosticCodes: '',
    helpNeeded: '',
    symptomStarted: '',
    symptomWhen: [],
    warningLights: [],
    symptoms: [],
    drivable: '',
    alreadyDone: '',
    category: '',
    assistantSummary: '',
    nextStep: '',
  };
}

export type Update = (patch: Partial<IntakeData>) => void;
export type FieldErrors = Record<string, string[]>;

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

// --- Icons (inline SVG so they work inside the Preact island) ---

const ICONS: Record<string, string> = {
  'arrow-right':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7l-7 7"/>',
  'arrow-up-right':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10v10M7 17L17 7"/>',
  'chevron-left':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 18l-6-6l6-6"/>',
  check:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"/>',
  'circle-check-big':
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11l3 3L22 4"/></g>',
  camera:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/></g>',
  'image-plus':
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M16 5h6m-3-3v6m2 3.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/></g>',
  'trash-2':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  play: '<path fill="currentColor" d="M8 5.14v14l11-7z"/>',
  'loader-circle':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  phone:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233a14 14 0 0 0 6.392 6.384"/>',
  send:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zm7.318-19.539l-10.94 10.939"/>',
  'clipboard-check':
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14l2 2l4-4"/></g>',
  'scan-search':
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></g>',
  'help-circle':
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></g>',
  wrench:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/>',
  car:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></g>',
  disc:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></g>',
  'battery-charging':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m11 7l-3 5h4l-3 5m5.856-11H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.935M22 14v-4M5.14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.936"/>',
  'sliders-horizontal':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 5H3m9 14H3M14 3v4m2 10v4m5-9h-9m9 7h-5m5-14h-7m-6 5v4m0-2H3"/>',
  snowflake:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m10 20l-1.25-2.5L6 18m4-14L8.75 6.5L6 6m8 14l1.25-2.5L18 18M14 4l1.25 2.5L18 6"/><path d="m17 21l-3-6h-4m7-12l-3 6l1.5 3M2 12h6.5L10 9m10 1l-1.5 2l1.5 2"/><path d="M22 12h-6.5L14 15M4 10l1.5 2L4 14m3 7l3-6l-1.5-3M7 3l3 6h4"/></g>',
  droplet:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7"/>',
  'triangle-alert':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/>',
  cog:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M11 10.27L7 3.34m4 10.39l-4 6.93M12 22v-2m0-18v2m2 8h8m-5 8.66l-1-1.73m1-15.59l-1 1.73M2 12h2m16.66 5l-1.73-1m1.73-9l-1.73 1M3.34 17l1.73-1M3.34 7l1.73 1"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="8"/></g>',
  gauge:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></g>',
  volume:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298zM16 9a5 5 0 0 1 0 6m3.364-9.364a9 9 0 0 1 0 12.728"/>',
  power:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v10m6.4-5.4a9 9 0 1 1-12.77.04"/>',
  compass:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m16.24 7.76l-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/></g>',
};

export function Icon({ name, class: className = '' }: { name: string; class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      class={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? '' }}
    />
  );
}

export function Spinner({ class: className = '' }: { class?: string }) {
  return <Icon name="loader-circle" class={cx('animate-spin', className)} />;
}

// --- Form primitives ---

// text-base on mobile prevents iOS Safari from zooming the page on focus.
const inputClass =
  'w-full min-h-12 rounded-control border border-black/10 bg-surface px-4 py-3 text-base text-ink outline-none transition-colors focus:border-accent sm:min-h-0 sm:py-2.5 sm:text-sm';
const areaClass =
  'w-full rounded-card border border-black/10 bg-surface px-4 py-3 text-base text-ink outline-none transition-colors focus:border-accent sm:text-sm';

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ComponentChildren;
}) {
  return (
    <div>
      <label for={htmlFor} class="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
        {hint && <span class="ml-1 font-normal text-steel-500">{hint}</span>}
      </label>
      {children}
      {error && <p class="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

type TextProps = {
  id?: string;
  value: string;
  onValue: (v: string) => void;
} & Omit<JSX.IntrinsicElements['input'], 'value' | 'onInput' | 'id'>;

export function TextInput({ id, value, onValue, class: className, ...rest }: TextProps) {
  return (
    <input
      id={id}
      value={value}
      onInput={(e) => onValue((e.currentTarget as HTMLInputElement).value)}
      class={cx(inputClass, className as string)}
      {...rest}
    />
  );
}

export function TextArea({
  id,
  value,
  onValue,
  rows = 4,
  ...rest
}: {
  id?: string;
  value: string;
  onValue: (v: string) => void;
  rows?: number;
} & Omit<JSX.IntrinsicElements['textarea'], 'value' | 'onInput' | 'id' | 'rows'>) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      onInput={(e) => onValue((e.currentTarget as HTMLTextAreaElement).value)}
      class={areaClass}
      {...rest}
    />
  );
}

// Single-select options: full-width tap rows on mobile, compact chips on desktop.
export function ChipSelect({
  options,
  value,
  onChange,
  name,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div class="grid gap-2 sm:flex sm:flex-wrap">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <label
            key={opt}
            class={cx(
              'flex min-h-12 cursor-pointer touch-manipulation items-center rounded-control border px-4 py-3 text-sm font-medium transition-colors sm:inline-flex sm:min-h-0 sm:py-2.5',
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
            {opt}
          </label>
        );
      })}
    </div>
  );
}

// Multi-select options: full-width tap rows on mobile, compact chips on desktop.
export function ChipMulti({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div class="grid gap-2 sm:flex sm:flex-wrap">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(toggle(value, opt))}
            aria-pressed={active}
            class={cx(
              'inline-flex min-h-12 touch-manipulation items-center gap-1.5 rounded-control border px-4 py-3 text-left text-sm font-medium transition-colors sm:min-h-0 sm:py-2.5',
              active
                ? 'border-accent bg-accent-soft text-accent-ink'
                : 'border-black/10 text-ink-soft hover:bg-steel-100',
            )}
          >
            {active && <Icon name="check" class="size-4 shrink-0" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// Large tappable branch card used by the choice steps.
export function ChoiceCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: string;
  title: string;
  description?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      class={cx(
        'group flex w-full touch-manipulation items-center gap-3 rounded-card border p-4 text-left transition-all active:scale-[0.99] sm:gap-4 sm:p-5',
        selected
          ? 'border-accent bg-accent-soft/60 shadow-card'
          : 'border-black/10 bg-surface hover:border-accent/40 hover:bg-steel-100',
      )}
    >
      <span
        class={cx(
          'grid size-10 shrink-0 place-items-center rounded-full transition-colors sm:size-11',
          selected ? 'bg-accent text-white' : 'bg-accent-soft text-accent',
        )}
      >
        <Icon name={icon} class="size-5" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block font-display text-[15px] font-semibold leading-snug text-ink sm:text-base">{title}</span>
        {description && (
          <span class="mt-0.5 block text-sm leading-relaxed text-steel-700">{description}</span>
        )}
      </span>
      <Icon
        name="arrow-right"
        class="size-5 shrink-0 text-steel-500 transition-transform group-hover:translate-x-0.5"
      />
    </button>
  );
}

export function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div class="mb-5 sm:mb-6">
      {eyebrow && (
        <p class="text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
      )}
      <h2 class="mt-1 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
      {subtitle && <p class="mt-2 text-sm leading-relaxed text-steel-700 sm:text-base">{subtitle}</p>}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  icon = 'arrow-right',
}: {
  children: ComponentChildren;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  icon?: string | null;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      class="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-control bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-lifted transition-transform hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {children}
      {icon && <Icon name={icon} class="size-5" />}
    </button>
  );
}

// --- Reusable field groups ---

export function CustomerFields({
  idBase,
  data,
  update,
  errors,
}: {
  idBase: string;
  data: IntakeData;
  update: Update;
  errors: FieldErrors;
}) {
  return (
    <div class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor={`${idBase}-name`} error={errors.name?.[0]}>
          <TextInput
            id={`${idBase}-name`}
            value={data.name}
            onValue={(v) => update({ name: v })}
            type="text"
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Phone number" htmlFor={`${idBase}-phone`} error={errors.phone?.[0]}>
          <TextInput
            id={`${idBase}-phone`}
            value={data.phone}
            onValue={(v) => update({ phone: v })}
            type="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            required
          />
        </Field>
        <div class="sm:col-span-2">
          <Field
            label="Email"
            hint={data.contactPreference === 'email' ? '(required for email replies)' : '(optional)'}
            htmlFor={`${idBase}-email`}
            error={errors.email?.[0]}
          >
            <TextInput
              id={`${idBase}-email`}
              value={data.email}
              onValue={(v) => update({ email: v })}
              type="email"
              autoComplete="email"
            />
          </Field>
        </div>
      </div>
      <div>
        <p class="mb-2 block text-sm font-medium text-ink-soft">Preferred contact method</p>
        <ChipSelect
          name={`${idBase}-contact`}
          options={['Call me', 'Text me', 'Email me']}
          value={
            data.contactPreference === 'call'
              ? 'Call me'
              : data.contactPreference === 'text'
                ? 'Text me'
                : 'Email me'
          }
          onChange={(v) =>
            update({ contactPreference: v === 'Call me' ? 'call' : v === 'Text me' ? 'text' : 'email' })
          }
        />
      </div>
    </div>
  );
}

export function VehicleFields({
  idBase,
  data,
  update,
  errors,
}: {
  idBase: string;
  data: IntakeData;
  update: Update;
  errors: FieldErrors;
}) {
  return (
    <div class="grid gap-4 sm:grid-cols-2">
      <Field label="Year" htmlFor={`${idBase}-year`} error={errors.vehicleYear?.[0]}>
        <TextInput
          id={`${idBase}-year`}
          value={data.vehicleYear}
          onValue={(v) => update({ vehicleYear: v })}
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="2018"
        />
      </Field>
      <Field label="Make" htmlFor={`${idBase}-make`} error={errors.vehicleMake?.[0]}>
        <TextInput
          id={`${idBase}-make`}
          value={data.vehicleMake}
          onValue={(v) => update({ vehicleMake: v })}
          type="text"
          placeholder="Toyota"
        />
      </Field>
      <Field label="Model" htmlFor={`${idBase}-model`} error={errors.vehicleModel?.[0]}>
        <TextInput
          id={`${idBase}-model`}
          value={data.vehicleModel}
          onValue={(v) => update({ vehicleModel: v })}
          type="text"
          placeholder="Camry"
        />
      </Field>
      <Field label="Mileage" htmlFor={`${idBase}-mileage`} error={errors.mileage?.[0]}>
        <TextInput
          id={`${idBase}-mileage`}
          value={data.mileage}
          onValue={(v) => update({ mileage: v })}
          type="text"
          inputMode="numeric"
          placeholder="86,000"
        />
      </Field>
      <div class="sm:col-span-2">
        <Field label="VIN" hint="(optional)" htmlFor={`${idBase}-vin`} error={errors.vin?.[0]}>
          <TextInput
            id={`${idBase}-vin`}
            value={data.vin}
            onValue={(v) => update({ vin: v })}
            type="text"
            autoComplete="off"
            spellcheck={false}
            maxLength={17}
            placeholder="17-character vehicle ID (on the dash or door jamb)"
            class="uppercase"
          />
        </Field>
      </div>
    </div>
  );
}

// --- Media uploader (hook + presentational component) ---

export type MediaKind = 'image' | 'video';
export type MediaItem = {
  id: string;
  file: File;
  kind: MediaKind;
  previewUrl: string;
  status: 'compressing' | 'ready';
};

function fileKind(file: File): MediaKind | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
}

async function compressPhoto(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
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

export function useMediaUploader() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);

  async function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setMediaNotice(null);

    const remaining = MAX_FILES - media.length;
    if (remaining <= 0) {
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
      if (kind === 'video' && file.size > MAX_VIDEO_BYTES) {
        rejectedSize = true;
        continue;
      }
      accepted.push({ file, kind });
    }

    const notices: string[] = [];
    if (rejectedType) notices.push('Only photos and videos can be attached.');
    if (rejectedSize) notices.push(`Videos must be under ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))}MB.`);

    const capped = accepted.slice(0, remaining);
    if (accepted.length > remaining) notices.push(`Only the first ${MAX_FILES} files are attached.`);
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
      setMedia((prev) => prev.map((m) => (m.id === item.id ? { ...m, file: compressed, status: 'ready' } : m)));
    }
  }

  function removeMedia(id: string) {
    setMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
  }

  return { media, mediaNotice, addFiles, removeMedia };
}

export function MediaUploader({
  media,
  mediaNotice,
  addFiles,
  removeMedia,
  label = 'Add photos or videos',
  hint,
}: {
  media: MediaItem[];
  mediaNotice: string | null;
  addFiles: (files: FileList | null) => void;
  removeMedia: (id: string) => void;
  label?: string;
  hint?: string;
}) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const atLimit = media.length >= MAX_FILES;

  return (
    <div class="space-y-3">
      <div class="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={atLimit}
          class="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-control border border-ink/15 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-steel-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
        >
          <Icon name="camera" class="size-[18px]" />
          Take a photo
        </button>
        <button
          type="button"
          onClick={() => libraryInputRef.current?.click()}
          disabled={atLimit}
          class="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-control border border-ink/15 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-steel-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
        >
          <Icon name="image-plus" class="size-[18px]" />
          {label}
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
                  <Icon name="play" class="size-2.5" />
                  Video
                </span>
              )}
              {item.status === 'compressing' && (
                <div class="absolute inset-0 grid place-items-center bg-ink/50">
                  <Spinner class="size-5 text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                aria-label="Remove file"
                class="absolute right-1.5 top-1.5 grid size-8 touch-manipulation place-items-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink"
              >
                <Icon name="trash-2" class="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {mediaNotice && <p class="text-xs text-amber-700">{mediaNotice}</p>}
      <p class="text-xs text-steel-500">
        {hint ??
          `Up to ${MAX_FILES} files. Photos (JPG, PNG, WEBP, HEIC) or short videos (MP4, MOV) up to ${Math.round(
            MAX_VIDEO_BYTES / (1024 * 1024),
          )}MB each.`}
      </p>
    </div>
  );
}
