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

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [intake, setIntake] = useState<ChatIntake | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-open once per browser session so visitors notice it.
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        const t = setTimeout(() => setOpen(true), 900);
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

  useEffect(() => {
    if (open) inputRef.current?.focus();
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
    <div class="fixed bottom-22 left-4 z-50 flex flex-col items-start md:bottom-5">
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Budget Auto"
          class="mb-3 flex h-[min(30rem,70vh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-black/10 bg-surface shadow-lifted"
        >
          {/* Header */}
          <div class="flex items-center justify-between gap-2 bg-ink px-4 py-3 text-white">
            <div class="flex items-center gap-2.5">
              <span class="grid size-8 place-items-center rounded-full bg-accent text-white">
                <ChatIcon name="chat" class="size-4" />
              </span>
              <div class="leading-tight">
                <p class="font-display text-sm font-semibold">Budget Auto</p>
                <p class="text-[11px] text-steel-300">Service advisor - usually replies in minutes</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Minimize chat"
              class="grid size-8 shrink-0 place-items-center rounded-full text-steel-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChatIcon name="minimize" class="size-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} class="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4">
            {bubbles.map((m, i) => (
              <div key={i} class={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  class={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-card rounded-br-sm bg-accent px-3.5 py-2.5 text-sm leading-relaxed text-white'
                      : 'max-w-[85%] rounded-card rounded-bl-sm border border-black/5 bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink'
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
              <div class="flex items-start gap-2 rounded-card border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm text-ink">
                <ChatIcon name="check" class="mt-0.5 size-4 shrink-0 text-success" />
                <span>Your details are on the way to the shop. They'll reach out soon - usually within the hour during shop hours.</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div class="border-t border-black/10 bg-surface p-3">
            <div class="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                rows={1}
                onInput={(e) => setInput((e.currentTarget as HTMLTextAreaElement).value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message..."
                class="max-h-28 min-h-11 flex-1 resize-none rounded-card border border-black/10 bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-colors focus:border-accent sm:text-sm"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                class="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
        class="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 font-display text-sm font-semibold text-white shadow-lifted transition-transform hover:-translate-y-0.5 hover:bg-accent-dark"
      >
        <ChatIcon name={open ? 'close' : 'chat'} class="size-5" />
        {!open && <span>Chat with us</span>}
      </button>
    </div>
  );
}
