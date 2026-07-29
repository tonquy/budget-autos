import { useEffect, useRef, useState } from 'preact/hooks';
import type { ChatImage, ChatIntake, ChatMessage } from '../../lib/chatIntake';
import {
  CHAT_MAX_IMAGES,
  CHAT_MAX_IMAGES_PER_MESSAGE,
  CHAT_MAX_IMAGE_BYTES,
  compressChatPhoto,
  fileToBase64,
  isAllowedChatImage,
} from '../../lib/chatMedia';

// Opener is display-only. It is NOT sent to the API so the model conversation
// always starts with a user turn (Gemini requires that).
const OPENER =
  "Hi! I'm the Budget Auto service advisor. Tell me what's going on — or attach a photo of the problem or another shop's estimate. I'll look at it, give you a straight read, and help you figure out next steps.";

const SESSION_KEY = 'budgetauto-chat-opened';

type ApiResponse = {
  ok: boolean;
  reply?: string;
  intake?: ChatIntake;
  submitted?: boolean;
  overloaded?: boolean;
  error?: string;
};

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'compressing' | 'ready' | 'error';
};

type UiMessage = {
  role: 'user' | 'assistant';
  content: string;
  /** Object URLs for bubble thumbnails (display only). */
  previewUrls?: string[];
  /** Base64 payloads kept for Gemini + shop email. */
  images?: ChatImage[];
};

function ChatIcon({
  name,
  class: className = '',
}: {
  name: 'chat' | 'close' | 'send' | 'minimize' | 'check' | 'image' | 'camera';
  class?: string;
}) {
  const paths: Record<string, string> = {
    chat: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    close:
      '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/>',
    minimize:
      '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>',
    send: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zm7.318-19.539l-10.94 10.939"/>',
    check:
      '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"/>',
    image:
      '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></g>',
    camera:
      '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/></g>',
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

function countImages(messages: UiMessage[]) {
  return messages.reduce((n, m) => n + (m.images?.length ?? 0), 0);
}

/** Build API transcript: keep text history; include images (capped from the end). */
function toApiMessages(messages: UiMessage[]): ChatMessage[] {
  let remaining = CHAT_MAX_IMAGES;
  const reversed = [...messages].reverse().map((m) => {
    if (m.role !== 'user' || !m.images?.length) {
      return { role: m.role, content: m.content } satisfies ChatMessage;
    }
    const take = Math.min(m.images.length, remaining);
    remaining -= take;
    const images = take > 0 ? m.images.slice(-take) : undefined;
    return { role: m.role, content: m.content, images } satisfies ChatMessage;
  });
  return reversed.reverse();
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [intake, setIntake] = useState<ChatIntake | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      if (isMobileViewport()) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      const t = setTimeout(() => setOpen(true), 900);
      sessionStorage.setItem(SESSION_KEY, '1');
      return () => clearTimeout(t);
    } catch {
      // sessionStorage can throw in private mode - just skip auto-open.
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open, pending]);

  useEffect(() => {
    if (!open) return;
    if (!isCoarsePointer()) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || !isMobileViewport()) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;

    function onResize() {
      if (!isMobileViewport()) return;
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

  // Revoke pending object URLs on unmount.
  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setMediaNotice(null);

    const already = countImages(messages) + pending.length;
    const room = CHAT_MAX_IMAGES - already;
    if (room <= 0) {
      setMediaNotice(`You can attach up to ${CHAT_MAX_IMAGES} photos in chat.`);
      return;
    }

    const perMessageRoom = CHAT_MAX_IMAGES_PER_MESSAGE - pending.length;
    const slots = Math.min(room, perMessageRoom, fileList.length);
    if (slots <= 0) {
      setMediaNotice(`You can attach up to ${CHAT_MAX_IMAGES_PER_MESSAGE} photos per message.`);
      return;
    }

    const picked = Array.from(fileList).slice(0, slots);
    const starters: PendingImage[] = [];

    for (const file of picked) {
      if (!isAllowedChatImage(file)) {
        setMediaNotice('Please attach JPG, PNG, or WebP photos.');
        continue;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      starters.push({
        id,
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'compressing',
      });
    }

    if (starters.length === 0) return;
    setPending((prev) => [...prev, ...starters]);

    for (const item of starters) {
      try {
        const compressed = await compressChatPhoto(item.file);
        if (compressed.size > CHAT_MAX_IMAGE_BYTES) {
          setPending((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'error' } : p)));
          setMediaNotice('One photo was still too large after compression. Try a clearer, closer shot.');
          continue;
        }
        setPending((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, file: compressed, status: 'ready' } : p)),
        );
      } catch {
        setPending((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'error' } : p)));
      }
    }
  }

  function removePending(id: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function send() {
    const text = input.trim();
    const readyPending = pending.filter((p) => p.status === 'ready');
    if ((!text && readyPending.length === 0) || loading) return;
    if (pending.some((p) => p.status === 'compressing')) return;

    setLoading(true);
    setMediaNotice(null);

    let images: ChatImage[] = [];
    try {
      images = await Promise.all(readyPending.map((p) => fileToBase64(p.file)));
    } catch {
      setMediaNotice('Could not read one of the photos. Please try again.');
      setLoading(false);
      return;
    }

    const previewUrls = readyPending.map((p) => p.previewUrl);
    const userMessage: UiMessage = {
      role: 'user',
      content: text,
      previewUrls,
      images: images.length ? images : undefined,
    };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput('');
    setPending([]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: toApiMessages(next),
          intake,
          alreadySubmitted: submitted,
        }),
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

  const bubbles: UiMessage[] = [{ role: 'assistant', content: OPENER }, ...messages];
  const compressing = pending.some((p) => p.status === 'compressing');
  const canSend =
    !loading && !compressing && (Boolean(input.trim()) || pending.some((p) => p.status === 'ready'));

  return (
    <>
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
            ? 'fixed inset-x-0 bottom-0 z-50 flex flex-col md:inset-auto md:bottom-5 md:left-4 md:items-start'
            : 'fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-50 flex flex-col items-start md:bottom-5'
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
              'max-md:h-[92dvh] max-md:max-h-[92dvh] max-md:rounded-t-2xl max-md:border-b-0 ' +
              'md:mb-3 md:h-[min(32rem,72vh)] md:w-[min(23rem,calc(100vw-2rem))] md:rounded-card'
            }
          >
            <div class="flex shrink-0 items-center justify-between gap-2 bg-ink px-4 py-3.5 text-white max-md:pt-[max(0.875rem,env(safe-area-inset-top))]">
              <div class="flex min-w-0 items-center gap-2.5">
                <span class="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-white sm:size-8">
                  <ChatIcon name="chat" class="size-4" />
                </span>
                <div class="min-w-0 leading-tight">
                  <p class="font-display text-sm font-semibold sm:text-sm">Budget Auto</p>
                  <p class="truncate text-[11px] text-steel-300">
                    Service advisor · sends photos for a second look
                  </p>
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
                    {m.previewUrls && m.previewUrls.length > 0 && (
                      <div class={`mb-2 flex flex-wrap gap-1.5 ${m.content ? '' : ''}`}>
                        {m.previewUrls.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt="Attached photo"
                            class="h-16 w-16 rounded-md object-cover ring-1 ring-black/10"
                          />
                        ))}
                      </div>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div class="flex justify-start">
                  <div class="flex flex-col gap-1.5 rounded-card rounded-bl-sm border border-black/5 bg-surface px-4 py-3">
                    <div class="flex gap-1">
                      <span class="size-1.5 animate-bounce rounded-full bg-steel-300 [animation-delay:-0.2s]" />
                      <span class="size-1.5 animate-bounce rounded-full bg-steel-300 [animation-delay:-0.1s]" />
                      <span class="size-1.5 animate-bounce rounded-full bg-steel-300" />
                    </div>
                    <p class="text-[11px] text-steel-500">Looking at your message…</p>
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

            <div
              class="shrink-0 border-t border-black/10 bg-surface p-3"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
              {pending.length > 0 && (
                <div class="mb-2 flex flex-wrap gap-2">
                  {pending.map((p) => (
                    <div key={p.id} class="relative">
                      <img
                        src={p.previewUrl}
                        alt="Pending upload"
                        class={`h-14 w-14 rounded-md object-cover ring-1 ring-black/10 ${
                          p.status === 'compressing' ? 'opacity-60' : ''
                        } ${p.status === 'error' ? 'opacity-40' : ''}`}
                      />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={() => removePending(p.id)}
                        class="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-white"
                      >
                        <ChatIcon name="close" class="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {mediaNotice && <p class="mb-2 px-1 text-[11px] text-accent-dark">{mediaNotice}</p>}

              <div class="flex items-end gap-1.5">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  class="hidden"
                  onChange={(e) => {
                    void addFiles((e.currentTarget as HTMLInputElement).files);
                    (e.currentTarget as HTMLInputElement).value = '';
                  }}
                />
                <input
                  ref={cameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  class="hidden"
                  onChange={(e) => {
                    void addFiles((e.currentTarget as HTMLInputElement).files);
                    (e.currentTarget as HTMLInputElement).value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={loading || countImages(messages) + pending.length >= CHAT_MAX_IMAGES}
                  aria-label="Attach photo"
                  class="grid size-11 shrink-0 touch-manipulation place-items-center rounded-full border border-black/10 text-ink-soft transition-colors hover:bg-steel-100 disabled:opacity-40 sm:size-10"
                >
                  <ChatIcon name="image" class="size-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  disabled={loading || countImages(messages) + pending.length >= CHAT_MAX_IMAGES}
                  aria-label="Take photo"
                  class="grid size-11 shrink-0 touch-manipulation place-items-center rounded-full border border-black/10 text-ink-soft transition-colors hover:bg-steel-100 disabled:opacity-40 sm:size-10 md:hidden"
                >
                  <ChatIcon name="camera" class="size-4.5" />
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  // @ts-expect-error Preact DOM typings use lowercase enterkeyhint
                  enterKeyHint="send"
                  autoComplete="off"
                  autoCorrect="on"
                  onInput={(e) => setInput((e.currentTarget as HTMLTextAreaElement).value)}
                  onKeyDown={onKeyDown}
                  placeholder="Message or attach a photo…"
                  class="max-h-28 min-h-12 flex-1 resize-none rounded-card border border-black/10 bg-paper px-3.5 py-3 text-base text-ink outline-none transition-[box-shadow,border-color] focus:ring-2 focus:ring-accent/45 sm:min-h-11 sm:py-2.5 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!canSend}
                  aria-label="Send message"
                  class="grid size-12 shrink-0 touch-manipulation place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50 sm:size-11"
                >
                  <ChatIcon name="send" class="size-4.5" />
                </button>
              </div>
              <p class="mt-2 px-1 text-[11px] leading-snug text-steel-500">
                Attach a photo of the issue or another shop&rsquo;s estimate for a second opinion. Need lots of
                files?{' '}
                <a href="/quote" class="font-medium text-accent hover:underline">
                  Use the Free Quote form
                </a>
                .
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close chat' : 'Open chat'}
          aria-expanded={open}
          class={
            'inline-flex min-h-12 touch-manipulation items-center gap-2 rounded-full bg-accent px-4 py-3 font-display text-sm font-semibold text-white shadow-lifted transition-colors hover:bg-accent-dark ' +
            (open ? 'hidden md:inline-flex' : 'chat-launcher-nudge')
          }
        >
          <ChatIcon name={open ? 'close' : 'chat'} class="size-5" />
          {!open && <span>Chat with us</span>}
        </button>
      </div>
    </>
  );
}
