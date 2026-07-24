import { useEffect, useRef, useState } from 'preact/hooks';
import type { ChatIntake, ChatMessage } from '../../lib/chatIntake';

// Opener is display-only. It is NOT sent to the API so the model conversation
// always starts with a user turn (Gemini requires that).
const OPENER =
  "Hi! I'm the Budget Auto service advisor. Tell me what's going on with your vehicle and I'll walk you through a few quick questions to get you a fair quote.";

const SESSION_KEY = 'budgetauto-chat-opened';

type ApiResponse = {
  ok: boolean;
  reply?: string;
  intake?: ChatIntake;
  submitted?: boolean;
  overloaded?: boolean;
  error?: string;
};

function ChatIcon({ name, class: className = '' }: { name: 'chat' | 'close' | 'send' | 'minimize' | 'check'; class?: string }) {
  const paths: Record<string, string> = {
    chat: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    close:
      '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/>',
    minimize:
      '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>',
    send: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zm7.318-19.539l-10.94 10.939"/>',
    check:
      '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"/>',
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      class={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: paths[name] }}
    />
  );
}

function isCoarsePointer() {
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

function isMobileViewport() {
  try {
    return window.matchMedia('(max-width: 767px)').matches;
  } catch {
    return false;
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [intake, setIntake] = useState<ChatIntake | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-open once per browser session so visitors notice it.
  // On mobile, wait a beat longer so the first paint / action bar settle first.
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        const delay = isMobileViewport() ? 1600 : 900;
        const t = setTimeout(() => setOpen(true), delay);
        sessionStorage.setItem(SESSION_KEY, '1');
        return () => clearTimeout(t);
      }
    } catch {
      // sessionStorage can throw in private mode - just skip auto-open.
    }
  }, []);

  // Keep the latest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  // Desktop: focus the composer when opened. Mobile: skip — autofocus pops the
  // keyboard and immediately shrinks the sheet, which feels janky.
  useEffect(() => {
    if (!open) return;
    if (!isCoarsePointer()) inputRef.current?.focus();
  }, [open]);

  // Lock background scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open || !isMobileViewport()) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // When the mobile keyboard opens, keep the focused composer visible by
  // scrolling it into view inside the sheet (visualViewport shrinks with the keyboard).
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;

    function onResize() {
      if (!isMobileViewport()) return;
      // Nudge the active input into the visible area above the keyboard.
      if (document.activeElement === inputRef.current) {
        inputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, intake, alreadySubmitted: submitted }),
      });
      const data = (await res.json()) as ApiResponse;

      if (!res.ok || !data.ok || !data.reply) {
        setMessages([
          ...next,
          {
            role: 'assistant',
            content:
              data.error ??
              "Sorry, I'm having trouble right now. Please use the Free Quote button and we'll get right back to you.",
          },
        ]);
        return;
      }

      setMessages([...next, { role: 'assistant', content: data.reply }]);
      if (data.intake) setIntake(data.intake);
      if (data.submitted) setSubmitted(true);
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            "Sorry, something went wrong on my end. Please use the Free Quote button and we'll follow up quickly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const bubbles = [{ role: 'assistant' as const, content: OPENER }, ...messages];

  return (
    <>
      {/* Mobile dimmer behind the sheet — tap to dismiss. */}
      {open && (
        <button
          type="button"
          aria-label="Close chat"
          class="fixed inset-0 z-50 bg-ink/45 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        class={
          open
            ? // Open: pin to the bottom edge on mobile (sheet fills most of the screen),
              // floating card on desktop.
              'fixed inset-x-0 bottom-0 z-50 flex flex-col md:inset-auto md:bottom-5 md:left-4 md:items-start'
            : // Closed: launcher sits above the mobile Free Quote bar + home indicator.
              'fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-50 flex flex-col items-start md:bottom-5'
        }
      >
        {open && (
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Chat with Budget Auto"
            aria-modal="true"
            class={
              'flex w-full flex-col overflow-hidden border border-black/10 bg-surface shadow-lifted ' +
              // Mobile sheet: explicit dvh height (not % of an auto parent — that collapses).
              'max-md:h-[92dvh] max-md:max-h-[92dvh] max-md:rounded-t-2xl max-md:border-b-0 ' +
              // Desktop card: unchanged floating panel above the launcher.
              'md:mb-3 md:h-[min(30rem,70vh)] md:w-[min(23rem,calc(100vw-2rem))] md:rounded-card'
            }
          >
            {/* Header */}
            <div class="flex shrink-0 items-center justify-between gap-2 bg-ink px-4 py-3.5 text-white max-md:pt-[max(0.875rem,env(safe-area-inset-top))]">
              <div class="flex min-w-0 items-center gap-2.5">
                <span class="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-white sm:size-8">
                  <ChatIcon name="chat" class="size-4" />
                </span>
                <div class="min-w-0 leading-tight">
                  <p class="font-display text-sm font-semibold sm:text-sm">Budget Auto</p>
                  <p class="truncate text-[11px] text-steel-300">Service advisor · usually replies in minutes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                class="grid size-11 shrink-0 touch-manipulation place-items-center rounded-full text-steel-300 transition-colors hover:bg-white/10 hover:text-white sm:size-8"
              >
                <ChatIcon name="close" class="size-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              class="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-paper px-4 py-4 [-webkit-overflow-scrolling:touch]"
            >
              {bubbles.map((m, i) => (
                <div key={i} class={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    class={
                      m.role === 'user'
                        ? 'max-w-[85%] rounded-card rounded-br-sm bg-accent px-3.5 py-2.5 text-[15px] leading-relaxed text-white sm:text-sm'
                        : 'max-w-[85%] rounded-card rounded-bl-sm border border-black/5 bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed text-ink sm:text-sm'
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div class="flex justify-start">
                  <div class="flex gap-1 rounded-card rounded-bl-sm border border-black/5 bg-surface px-4 py-3">
                    <span class="size-1.5 animate-bounce rounded-full bg-steel-300 [animation-delay:-0.2s]" />
                    <span class="size-1.5 animate-bounce rounded-full bg-steel-300 [animation-delay:-0.1s]" />
                    <span class="size-1.5 animate-bounce rounded-full bg-steel-300" />
                  </div>
                </div>
              )}

              {submitted && (
                <div class="flex items-start gap-2 rounded-card border border-success/30 bg-success/10 px-3.5 py-2.5 text-[15px] text-ink sm:text-sm">
                  <ChatIcon name="check" class="mt-0.5 size-4 shrink-0 text-success" />
                  <span>
                    Your details are on the way to the shop. They&rsquo;ll reach out soon - usually within the hour
                    during shop hours.
                  </span>
                </div>
              )}
            </div>

            {/* Composer — padded for the iPhone home indicator on mobile */}
            <div
              class="shrink-0 border-t border-black/10 bg-surface p-3"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
              <div class="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  enterKeyHint="send"
                  autoComplete="off"
                  autoCorrect="on"
                  onInput={(e) => setInput((e.currentTarget as HTMLTextAreaElement).value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message..."
                  class="max-h-28 min-h-12 flex-1 resize-none rounded-card border border-black/10 bg-paper px-3.5 py-3 text-base text-ink outline-none transition-[box-shadow,border-color] focus:ring-2 focus:ring-accent/45 sm:min-h-11 sm:py-2.5 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  class="grid size-12 shrink-0 touch-manipulation place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50 sm:size-11"
                >
                  <ChatIcon name="send" class="size-[18px]" />
                </button>
              </div>
              <p class="mt-2 px-1 text-[11px] leading-snug text-steel-500">
                Have photos of the problem or an estimate?{' '}
                <a href="/quote" class="font-medium text-accent hover:underline">
                  Use the Free Quote form
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {/* Launcher — hidden on mobile while the sheet is open (close lives in the header). */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close chat' : 'Open chat'}
          aria-expanded={open}
          class={
            'inline-flex min-h-12 touch-manipulation items-center gap-2 rounded-full bg-accent px-4 py-3 font-display text-sm font-semibold text-white shadow-lifted transition-transform hover:-translate-y-0.5 hover:bg-accent-dark ' +
            (open ? 'hidden md:inline-flex' : '')
          }
        >
          <ChatIcon name={open ? 'close' : 'chat'} class="size-5" />
          {!open && <span>Chat with us</span>}
        </button>
      </div>
    </>
  );
}
