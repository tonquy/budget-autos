import { useEffect, useId, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { business } from '../../lib/business';
import {
  emptyIntakeData,
  Icon,
  PrimaryButton,
  Spinner,
  useMediaUploader,
  type FieldErrors,
  type IntakeData,
} from './parts';
import {
  AssistantQuestionStep,
  assistantQuestions,
  BeginStep,
  buildAssistantSummary,
  CategoryStep,
  EstimateHelpStep,
  EstimateQStep,
  KnownBasisStep,
  StartStep,
  suggestCategory,
} from './steps';
import { EstimateReviewForm, KnownRepairForm, UnknownIntakeForm } from './forms';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          // Analytics attribution for the Turnstile Spin integration. Explicit-render
          // equivalent of data-action="turnstile-spin-v2" on a cf-turnstile div.
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
// env var is missing in CI (e.g. Cloudflare Workers Builds, where local .env is
// not available). Using `|| fallback` also handles the "defined but empty" case.
const TURNSTILE_SITE_KEY =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || '0x4AAAAAAD7eom-KB1HZ1Qex';
const TURNSTILE_SCRIPT_ID = 'turnstile-script';

type Step =
  | 'start'
  | 'estimate-q'
  | 'estimate-help'
  | 'known-basis'
  | 'begin'
  | 'assistant'
  | 'category'
  | 'form-estimate'
  | 'form-known'
  | 'form-unknown';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const FORM_STEPS: Step[] = ['form-estimate', 'form-known', 'form-unknown'];
const isFormStep = (step: Step) => FORM_STEPS.includes(step);

const PROGRESS: Record<Step, number> = {
  start: 8,
  'estimate-q': 28,
  begin: 22,
  'estimate-help': 52,
  'known-basis': 52,
  assistant: 40,
  category: 70,
  'form-estimate': 88,
  'form-known': 88,
  'form-unknown': 88,
};

function assistantProgress(index: number) {
  const total = assistantQuestions.length;
  // Spread the assistant questions across 40% → 68% of the bar.
  return 40 + Math.round(((index + 1) / total) * 28);
}

function Reveal({ stepKey, children }: { stepKey: string; children: ComponentChildren }) {
  // CSS keyframes (not opacity-0 initial state) so the first paint is never blank
  // if hydration is slow, and every step still gets a short enter motion.
  return (
    <div key={stepKey} class="wizard-step-enter">
      {children}
    </div>
  );
}

export default function IntakeWizard() {
  const idBase = useId();
  const [data, setData] = useState<IntakeData>(emptyIntakeData);
  const [step, setStep] = useState<Step>('start');
  const [history, setHistory] = useState<Step[]>([]);
  // Which assistant question is on screen (the assistant is one step shown one
  // question at a time).
  const [assistantIndex, setAssistantIndex] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { media, mediaNotice, addFiles, removeMedia } = useMediaUploader();

  const turnstileTokenRef = useRef<string>('');
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetRef = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  function update(patch: Partial<IntakeData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function go(next: Step) {
    setHistory((h) => [...h, step]);
    setStep(next);
  }

  function back() {
    setErrorMessage(null);
    // Inside the assistant, Back steps through questions before leaving the step.
    if (step === 'assistant' && assistantIndex > 0) {
      setAssistantIndex((i) => i - 1);
      return;
    }
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setStep(prev);
      return h.slice(0, -1);
    });
  }

  function advanceAssistant() {
    if (assistantIndex < assistantQuestions.length - 1) {
      setAssistantIndex((i) => i + 1);
      return;
    }
    finishAssistant();
  }

  // Keep the current step in view when advancing (especially on mobile after a long list).
  useEffect(() => {
    document.getElementById('intake-wizard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step, assistantIndex]);

  // Render Turnstile once we land on a form step (its container mounts there).
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    if (!isFormStep(step)) {
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

    if (TURNSTILE_SITE_KEY && !turnstileTokenRef.current) {
      setErrorMessage('Please complete the verification above before submitting.');
      return;
    }

    const fd = new FormData();
    const scalars: Record<string, string> = {
      flow: data.flow,
      name: data.name,
      phone: data.phone,
      email: data.email,
      contactPreference: data.contactPreference,
      vehicleYear: data.vehicleYear,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vin: data.vin,
      mileage: data.mileage,
      message: data.message,
      beginChoice: data.beginChoice,
      diagnosticCodes: data.diagnosticCodes,
      helpNeeded: data.helpNeeded,
      symptomStarted: data.symptomStarted,
      drivable: data.drivable,
      alreadyDone: data.alreadyDone,
      category: data.category,
      assistantSummary: data.assistantSummary,
      nextStep: data.nextStep,
    };
    for (const [key, value] of Object.entries(scalars)) {
      if (value) fd.set(key, value);
    }

    const arrays: [string, string[]][] = [
      ['estimateHelp', data.estimateHelp],
      ['knownBasis', data.knownBasis],
      ['symptomWhen', data.symptomWhen],
      ['warningLights', data.warningLights],
      ['symptoms', data.symptoms],
    ];
    for (const [key, values] of arrays) {
      values.forEach((v) => fd.append(key, v));
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
      try {
        sessionStorage.setItem('budgetauto-quote-submitted', '1');
      } catch {
        /* private mode — thank-you PageView still fires; Lead may be skipped */
      }
      window.location.assign('/thank-you');
    } catch {
      setSubmitState('error');
      setErrorMessage('Something went wrong sending your request. Please try again or call us.');
    }
  }

  // --- Navigation wiring for the branch choices ---

  function chooseStart(kind: 'known' | 'unknown') {
    if (kind === 'known') {
      go('estimate-q');
    } else {
      update({ flow: 'unknown-intake' });
      go('begin');
    }
  }

  function chooseEstimate(answer: 'yes' | 'no') {
    if (answer === 'yes') {
      update({ hasEstimate: 'yes', flow: 'estimate-review' });
      go('estimate-help');
    } else {
      update({ hasEstimate: 'no', flow: 'known-repair' });
      go('known-basis');
    }
  }

  function chooseBegin(choice: string) {
    update({ beginChoice: choice });
    setAssistantIndex(0);
    go('assistant');
  }

  function finishAssistant() {
    // Functional update so an auto-advance after a single-select chip still
    // includes the value that was just picked (avoids a stale closure).
    setData((current) => {
      const summary = buildAssistantSummary(current);
      const suggested = suggestCategory(current);
      return {
        ...current,
        assistantSummary: summary,
        category: current.category || suggested,
      };
    });
    go('category');
  }

  if (submitState === 'success') {
    return (
      <div class="py-6 text-center sm:py-10">
        <div class="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
          <Icon name="circle-check-big" class="size-7" />
        </div>
        <h2 class="mt-5 font-display text-2xl font-bold text-ink">Request sent.</h2>
        <p class="mx-auto mt-2 max-w-md text-steel-700">Sending you to the confirmation page&hellip;</p>
      </div>
    );
  }

  const suggested = suggestCategory(data);
  const onForm = isFormStep(step);
  const progressPct =
    step === 'assistant' ? assistantProgress(assistantIndex) : PROGRESS[step];
  const canGoBack = history.length > 0 || (step === 'assistant' && assistantIndex > 0);
  const revealKey = step === 'assistant' ? `assistant-${assistantIndex}` : step;
  const currentQuestion = assistantQuestions[assistantIndex];

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

      {/* Chrome: progress + back */}
      <div class="mb-6">
        <div class="mb-3 h-1 w-full overflow-hidden rounded-control bg-steel-100">
          <div
            class="h-full rounded-control bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {canGoBack ? (
          <button
            type="button"
            onClick={back}
            class="inline-flex min-h-10 touch-manipulation items-center gap-1 -ml-2 rounded-control px-2 text-sm font-medium text-steel-700 transition-colors hover:text-ink"
          >
            <Icon name="chevron-left" class="size-4" />
            Back
          </button>
        ) : (
          <span class="text-sm text-steel-500">A few quick steps</span>
        )}
      </div>

      <Reveal stepKey={revealKey}>
        {step === 'start' && <StartStep onPick={chooseStart} />}
        {step === 'estimate-q' && <EstimateQStep onPick={chooseEstimate} />}
        {step === 'estimate-help' && (
          <EstimateHelpStep data={data} update={update} onNext={() => go('form-estimate')} />
        )}
        {step === 'known-basis' && (
          <KnownBasisStep data={data} update={update} onNext={() => go('form-known')} />
        )}
        {step === 'begin' && <BeginStep onPick={chooseBegin} />}
        {step === 'assistant' && currentQuestion && (
          <AssistantQuestionStep
            question={currentQuestion}
            index={assistantIndex}
            total={assistantQuestions.length}
            data={data}
            update={update}
            onNext={advanceAssistant}
          />
        )}
        {step === 'category' && (
          <CategoryStep data={data} update={update} suggested={suggested} onNext={() => go('form-unknown')} />
        )}

        {step === 'form-estimate' && (
          <EstimateReviewForm
            idBase={idBase}
            data={data}
            update={update}
            errors={fieldErrors}
            media={media}
            mediaNotice={mediaNotice}
            addFiles={addFiles}
            removeMedia={removeMedia}
          />
        )}
        {step === 'form-known' && (
          <KnownRepairForm
            idBase={idBase}
            data={data}
            update={update}
            errors={fieldErrors}
            media={media}
            mediaNotice={mediaNotice}
            addFiles={addFiles}
            removeMedia={removeMedia}
          />
        )}
        {step === 'form-unknown' && (
          <UnknownIntakeForm
            idBase={idBase}
            data={data}
            update={update}
            errors={fieldErrors}
            media={media}
            mediaNotice={mediaNotice}
            addFiles={addFiles}
            removeMedia={removeMedia}
          />
        )}
      </Reveal>

      {onForm && (
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
      )}
    </form>
  );
}
