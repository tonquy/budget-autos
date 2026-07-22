import { nextStepOptions } from '../../lib/quoteSchema';
import {
  ChipSelect,
  CustomerFields,
  Field,
  Icon,
  MediaUploader,
  StepHeader,
  TextArea,
  TextInput,
  VehicleFields,
  type FieldErrors,
  type IntakeData,
  type MediaItem,
  type Update,
} from './parts';

type FormProps = {
  idBase: string;
  data: IntakeData;
  update: Update;
  errors: FieldErrors;
  media: MediaItem[];
  mediaNotice: string | null;
  addFiles: (files: FileList | null) => void;
  removeMedia: (id: string) => void;
};

function SectionLabel({ children }: { children: string }) {
  return <p class="font-display text-base font-semibold text-ink">{children}</p>;
}

export function EstimateReviewForm(props: FormProps) {
  const { idBase, data, update, errors, media, mediaNotice, addFiles, removeMedia } = props;
  return (
    <div class="space-y-6 sm:space-y-8">
      <StepHeader
        eyebrow="Estimate review"
        title="Send us your estimate."
        subtitle="Share your details and a photo of the estimate. We'll tell you if the price is fair and where you can save."
      />

      <div class="space-y-4">
        <SectionLabel>Your info</SectionLabel>
        <CustomerFields idBase={idBase} data={data} update={update} errors={errors} />
      </div>

      <div class="space-y-4">
        <SectionLabel>Your vehicle</SectionLabel>
        <p class="-mt-1 text-sm text-steel-500">All optional, but it helps us quote faster.</p>
        <VehicleFields idBase={idBase} data={data} update={update} errors={errors} />
      </div>

      <div class="space-y-3">
        <SectionLabel>Upload your estimate</SectionLabel>
        <MediaUploader
          media={media}
          mediaNotice={mediaNotice}
          addFiles={addFiles}
          removeMedia={removeMedia}
          label="Upload estimate + photos"
          hint="Snap a photo of the written estimate, plus anything that shows the problem."
        />
      </div>

      <Field
        label="What would you like us to look at?"
        htmlFor={`${idBase}-message`}
        error={errors.message?.[0]}
      >
        <TextArea
          id={`${idBase}-message`}
          value={data.message}
          onValue={(v) => update({ message: v })}
          rows={4}
          required
          minLength={10}
          placeholder="e.g. The dealer quoted for struts and an alignment. Is that fair?"
        />
      </Field>
    </div>
  );
}

export function KnownRepairForm(props: FormProps) {
  const { idBase, data, update, errors, media, mediaNotice, addFiles, removeMedia } = props;
  return (
    <div class="space-y-6 sm:space-y-8">
      <StepHeader
        eyebrow="Known repair"
        title="Tell us the repair you need."
        subtitle="Give us the details you have and we'll come back with a real price - parts and labor."
      />

      <div class="space-y-4">
        <SectionLabel>Your info</SectionLabel>
        <CustomerFields idBase={idBase} data={data} update={update} errors={errors} />
      </div>

      <div class="space-y-4">
        <SectionLabel>Your vehicle</SectionLabel>
        <p class="-mt-1 text-sm text-steel-500">All optional, but it helps us quote faster.</p>
        <VehicleFields idBase={idBase} data={data} update={update} errors={errors} />
      </div>

      <Field
        label="Describe the repair you need"
        htmlFor={`${idBase}-message`}
        error={errors.message?.[0]}
      >
        <TextArea
          id={`${idBase}-message`}
          value={data.message}
          onValue={(v) => update({ message: v })}
          rows={4}
          required
          minLength={10}
          placeholder="e.g. Front brake pads and rotors need replacing."
        />
      </Field>

      <Field label="Diagnostic trouble codes" hint="(optional)" htmlFor={`${idBase}-codes`}>
        <TextInput
          id={`${idBase}-codes`}
          value={data.diagnosticCodes}
          onValue={(v) => update({ diagnosticCodes: v })}
          type="text"
          placeholder="e.g. P0301, P0420"
        />
      </Field>

      <div class="space-y-3">
        <SectionLabel>Upload scan report or photos</SectionLabel>
        <MediaUploader
          media={media}
          mediaNotice={mediaNotice}
          addFiles={addFiles}
          removeMedia={removeMedia}
          label="Upload report + photos"
          hint="A photo of the scan report or the part helps us quote accurately."
        />
      </div>

      <Field label="What help do you need from us?" hint="(optional)" htmlFor={`${idBase}-help`}>
        <TextArea
          id={`${idBase}-help`}
          value={data.helpNeeded}
          onValue={(v) => update({ helpNeeded: v })}
          rows={3}
          placeholder="e.g. Price for parts and labor, or confirm this is really the problem."
        />
      </Field>
    </div>
  );
}

export function UnknownIntakeForm(props: FormProps) {
  const { idBase, data, update, errors, media, mediaNotice, addFiles, removeMedia } = props;
  return (
    <div class="space-y-6 sm:space-y-8">
      <StepHeader
        eyebrow="Almost done"
        title="A few details and we'll take it from here."
        subtitle="We've saved your answers. Add your info and anything that shows what's happening."
      />

      {data.assistantSummary && (
        <div class="rounded-card border border-black/10 bg-paper p-4">
          <p class="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="clipboard-check" class="size-4 text-accent" />
            What we captured
          </p>
          <p class="whitespace-pre-wrap text-sm leading-relaxed text-steel-700">{data.assistantSummary}</p>
          {data.category && (
            <p class="mt-3 text-sm text-steel-700">
              <span class="font-medium text-ink">Likely area:</span> {data.category}
            </p>
          )}
        </div>
      )}

      <div class="space-y-4">
        <SectionLabel>Your info</SectionLabel>
        <CustomerFields idBase={idBase} data={data} update={update} errors={errors} />
      </div>

      <div class="space-y-4">
        <SectionLabel>Your vehicle</SectionLabel>
        <p class="-mt-1 text-sm text-steel-500">All optional, but it helps us quote faster.</p>
        <VehicleFields idBase={idBase} data={data} update={update} errors={errors} />
      </div>

      <Field
        label="In your own words, what's going on?"
        htmlFor={`${idBase}-message`}
        error={errors.message?.[0]}
      >
        <TextArea
          id={`${idBase}-message`}
          value={data.message}
          onValue={(v) => update({ message: v })}
          rows={4}
          required
          minLength={10}
          placeholder="e.g. There's a grinding noise when I brake, and it started after a road trip."
        />
      </Field>

      <Field label="Warning lights or codes" hint="(optional)" htmlFor={`${idBase}-codes`}>
        <TextInput
          id={`${idBase}-codes`}
          value={data.diagnosticCodes}
          onValue={(v) => update({ diagnosticCodes: v })}
          type="text"
          placeholder="e.g. Check engine light, or P0301 if you have it"
        />
      </Field>

      <div class="space-y-3">
        <SectionLabel>Upload photos or videos</SectionLabel>
        <MediaUploader media={media} mediaNotice={mediaNotice} addFiles={addFiles} removeMedia={removeMedia} />
      </div>

      <div>
        <p class="mb-2 text-sm font-medium text-ink-soft">What would you like us to do?</p>
        <ChipSelect
          name={`${idBase}-nextstep`}
          options={nextStepOptions}
          value={data.nextStep}
          onChange={(v) => update({ nextStep: v })}
        />
      </div>
    </div>
  );
}
