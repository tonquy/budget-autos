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
  "Hi — I'm the Budget Auto service advisor. Tell me what's going on, or drop a photo of the problem or another shop's estimate. I'll look at it and ask what you need.";

const SESSION_KEY = 'budgetauto-chat-opened';

const QUICK_PROMPTS = [
  { label: 'Second opinion', text: 'I have an estimate photo — can you give me a second opinion?' },
  { label: 'Is this fair?', text: 'I uploaded an estimate — does the price look fair?' },
  { label: 'What can wait?', text: 'Help me figure out what is urgent vs what can wait to save money.' },
] as const;

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
  previewUrls?: string[];
  images?: ChatImage[];
};

function ChatIcon({
  name,
  class: className = '',
}: {
  name: 'chat' | 'close' | 'send' | 'check' | 'image' | 'camera';
  class?: string;
}) {
  const paths: Record<string, string> = {
    chat: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    close:
      '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/>',
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
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [intake, setIntake] = useState<ChatIntake | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [sheetHeight, setSheetHeight] = useState<string>('min(92dvh, 100%)');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    try {
      if (isMobileViewport()) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      const t = setTimeout(() => setOpen(true), 900);
      sessionStorage.setItem(SESSION_KEY, '1');
      return () => clearTimeout(t);
    } catch {
      // private mode
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

  // Keep the mobile sheet inside the visible viewport when the keyboard opens
  // (iOS Safari visualViewport shrink). Prefer dvh on desktop.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;

    function syncHeight() {
      if (!isMobileViewport()) {
        setSheetHeight('min(32rem, 72vh)');
        return;
      }
      const h = vv?.height ?? window.innerHeight;
      // Leave a little air under the status bar; bottom sheet already sits at 0.
      const px = Math.max(320, Math.floor(h * 0.96));
      setSheetHeight(`${px}px`);
      if (document.activeElement === inputRef.current) {
        inputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    syncHeight();
    vv?.addEventListener('resize', syncHeight);
    vv?.addEventListener('scroll', syncHeight);
    window.addEventListener('resize', syncHeight);
    return () => {
      vv?.removeEventListener('resize', syncHeight);
      vv?.removeEventListener('scroll', syncHeight);
      window.removeEventListener('resize', syncHeight);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resizeComposer() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  useEffect(() => {
    resizeComposer();
  }, [input]);

  async function addFiles(fileList: FileList | File[] | null) {
    if (!fileList || fileList.length === 0) return;
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

  function dataTransferHasFiles(dt: DataTransfer | null) {
    if (!dt) return false;
    return Array.from(dt.types).includes('Files');
  }

  function onDragEnter(e: DragEvent) {
    if (!dataTransferHasFiles(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    setDragActive(true);
  }

  function onDragOver(e: DragEvent) {
    if (!dataTransferHasFiles(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  }

  function onDragLeave(e: DragEvent) {
    if (!dataTransferHasFiles(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragActive(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setDragActive(false);
    if (loading) return;
    void addFiles(e.dataTransfer?.files ?? null);
  }

  function onPaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items?.length) return;
    const files: File[] = [];
    for (const item of Array.from(items)) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length === 0) return;
    e.preventDefault();
    void addFiles(files);
  }

  async function send(presetText?: string) {
    const text = (presetText ?? input).trim();
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
    if (inputRef.current) inputRef.current.style.height = 'auto';

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
  const showQuickPrompts = messages.length === 0 && !loading && pending.length === 0;
  const atPhotoLimit = countImages(messages) + pending.length >= CHAT_MAX_IMAGES;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close chat"
          class="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px] md:hidden"
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
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onPaste={onPaste}
            style={{ height: sheetHeight, maxHeight: sheetHeight }}
            class={
              'relative flex w-full flex-col overflow-hidden border border-black/10 bg-surface shadow-lifted ' +
              'max-md:rounded-t-[1.25rem] max-md:border-b-0 ' +
              'md:mb-3 md:w-[min(24rem,calc(100vw-2rem))] md:rounded-card'
            }
          >
            {dragActive && (
              <div
                class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-ink/75 p-6"
                aria-hidden="true"
              >
                <div class="w-full max-w-[16rem] rounded-card border-2 border-dashed border-accent bg-surface px-5 py-8 text-center">
                  <ChatIcon name="image" class="mx-auto size-8 text-accent" />
                  <p class="mt-3 font-display text-sm font-semibold text-ink">Drop photo here</p>
                  <p class="mt-1 text-xs text-steel-600">Estimate or problem · JPG, PNG, WebP</p>
                </div>
              </div>
            )}

            {/* Mobile sheet handle */}
            <div class="flex shrink-0 justify-center pt-2 md:hidden" aria-hidden="true">
              <span class="h-1 w-10 rounded-full bg-steel-300/80" />
            </div>

            <div class="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-ink px-4 py-3 text-white max-md:pt-2">
              <div class="flex min-w-0 items-center gap-3">
                <span class="relative grid size-10 shrink-0 place-items-center rounded-full bg-accent text-white sm:size-9">
                  <ChatIcon name="chat" class="size-4.5" />
                  <span class="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-ink bg-success" />
                </span>
                <div class="min-w-0 leading-tight">
                  <p class="font-display text-[15px] font-semibold tracking-tight">Budget Auto</p>
                  <p class="truncate text-[11px] text-steel-300">Service advisor · usually replies fast</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                class="grid size-11 shrink-0 touch-manipulation place-items-center rounded-full text-steel-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95 sm:size-9"
              >
                <ChatIcon name="close" class="size-5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              class="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-paper px-3.5 py-4 sm:px-4 [-webkit-overflow-scrolling:touch]"
            >
              {bubbles.map((m, i) => (
                <div key={i} class={m.role === 'user' ? 'flex justify-end' : 'flex justify-start gap-2'}>
                  {m.role === 'assistant' && (
                    <span
                      class="mt-1 hidden size-7 shrink-0 place-items-center rounded-full bg-ink text-white sm:grid"
                      aria-hidden="true"
                    >
                      <ChatIcon name="chat" class="size-3.5" />
                    </span>
                  )}
                  <div
                    class={
                      m.role === 'user'
                        ? 'max-w-[88%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-[15px] leading-relaxed text-white shadow-card sm:max-w-[85%] sm:text-sm'
                        : 'max-w-[92%] rounded-2xl rounded-bl-md border border-black/5 bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed text-ink shadow-card sm:max-w-[85%] sm:text-sm'
                    }
                  >
                    {m.previewUrls && m.previewUrls.length > 0 && (
                      <div class={`flex flex-wrap gap-1.5 ${m.content ? 'mb-2.5' : ''}`}>
                        {m.previewUrls.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt="Attached photo"
                            class="h-20 w-20 rounded-lg object-cover ring-1 ring-black/10 sm:h-16 sm:w-16"
                          />
                        ))}
                      </div>
                    )}
                    {m.content && <p class="whitespace-pre-wrap text-pretty">{m.content}</p>}
                  </div>
                </div>
              ))}

              {showQuickPrompts && (
                <div class="flex flex-wrap gap-2 pt-1 sm:pl-9">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      disabled={loading}
                      onClick={() => void send(q.text)}
                      class="min-h-10 touch-manipulation rounded-full border border-ink/10 bg-surface px-3.5 py-2 text-left text-[13px] font-medium text-ink-soft shadow-card transition-colors hover:border-accent/40 hover:text-accent-dark active:scale-[0.98]"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div class="flex justify-start gap-2">
                  <span
                    class="mt-1 hidden size-7 shrink-0 place-items-center rounded-full bg-ink text-white sm:grid"
                    aria-hidden="true"
                  >
                    <ChatIcon name="chat" class="size-3.5" />
                  </span>
                  <div class="rounded-2xl rounded-bl-md border border-black/5 bg-surface px-4 py-3 shadow-card">
                    <div class="flex gap-1.5">
                      <span class="size-1.5 animate-bounce rounded-full bg-steel-300 [animation-delay:-0.2s]" />
                      <span class="size-1.5 animate-bounce rounded-full bg-steel-300 [animation-delay:-0.1s]" />
                      <span class="size-1.5 animate-bounce rounded-full bg-steel-300" />
                    </div>
                    <p class="mt-1.5 text-[11px] text-steel-500">Looking at your message…</p>
                  </div>
                </div>
              )}

              {submitted && (
                <div class="flex items-start gap-2.5 rounded-2xl border border-success/25 bg-success/10 px-3.5 py-3 text-[14px] leading-relaxed text-ink sm:text-sm">
                  <ChatIcon name="check" class="mt-0.5 size-4 shrink-0 text-success" />
                  <span>
                    Details sent to the shop. They&rsquo;ll reach out soon — usually within the hour during shop
                    hours.
                  </span>
                </div>
              )}
            </div>

            <div
              class="shrink-0 border-t border-black/8 bg-surface px-3 pt-2.5 sm:px-3.5"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
              {pending.length > 0 && (
                <div class="mb-2.5 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {pending.map((p) => (
                    <div key={p.id} class="relative shrink-0">
                      <img
                        src={p.previewUrl}
                        alt="Pending upload"
                        class={`h-16 w-16 rounded-xl object-cover ring-1 ring-black/10 sm:h-14 sm:w-14 ${
                          p.status === 'compressing' ? 'opacity-60' : ''
                        } ${p.status === 'error' ? 'opacity-40' : ''}`}
                      />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={() => removePending(p.id)}
                        class="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-ink text-white active:scale-95"
                      >
                        <ChatIcon name="close" class="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {mediaNotice && (
                <p class="mb-2 px-0.5 text-[12px] leading-snug text-accent-dark">{mediaNotice}</p>
              )}

              {/* Mobile: labeled attach row so photo actions are obvious */}
              <div class="mb-2 flex gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={loading || atPhotoLimit}
                  class="inline-flex min-h-10 flex-1 touch-manipulation items-center justify-center gap-1.5 rounded-control border border-black/10 bg-paper px-3 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-steel-100 active:scale-[0.98] disabled:opacity-40"
                >
                  <ChatIcon name="image" class="size-4" />
                  Photos
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  disabled={loading || atPhotoLimit}
                  class="inline-flex min-h-10 flex-1 touch-manipulation items-center justify-center gap-1.5 rounded-control border border-black/10 bg-paper px-3 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-steel-100 active:scale-[0.98] disabled:opacity-40"
                >
                  <ChatIcon name="camera" class="size-4" />
                  Camera
                </button>
              </div>

              <div class="flex items-end gap-2">
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
                  disabled={loading || atPhotoLimit}
                  aria-label="Browse photos and files"
                  title="Browse photos and files"
                  class="hidden size-11 shrink-0 touch-manipulation place-items-center rounded-full border border-black/10 text-ink-soft transition-colors hover:bg-steel-100 active:scale-95 disabled:opacity-40 md:grid"
                >
                  <ChatIcon name="image" class="size-4.5" />
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  // @ts-expect-error Preact DOM typings use lowercase enterkeyhint
                  enterKeyHint="send"
                  autoComplete="off"
                  autoCorrect="on"
                  onInput={(e) => {
                    setInput((e.currentTarget as HTMLTextAreaElement).value);
                    resizeComposer();
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Type a message…"
                  class="max-h-[7.5rem] min-h-12 flex-1 resize-none rounded-2xl border border-black/10 bg-paper px-3.5 py-3 text-base leading-snug text-ink outline-none transition-[box-shadow,border-color] focus:border-accent/40 focus:ring-2 focus:ring-accent/30 sm:min-h-11 sm:py-2.5 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!canSend}
                  aria-label="Send message"
                  class="grid size-12 shrink-0 touch-manipulation place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 sm:size-11"
                >
                  <ChatIcon name="send" class="size-4.5" />
                </button>
              </div>

              <p class="mt-2 px-0.5 text-[11px] leading-snug text-steel-500">
                <span class="md:hidden">Add a photo of the estimate or issue, then send.</span>
                <span class="hidden md:inline">Drag &amp; drop a photo, or browse files.</span>
                {' '}
                Lots of files?{' '}
                <a href="/quote" class="font-semibold text-accent hover:text-accent-dark">
                  Free Quote form
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
            'inline-flex min-h-12 touch-manipulation items-center gap-2 rounded-full bg-accent px-4 py-3 font-display text-sm font-semibold text-white shadow-lifted transition-transform hover:bg-accent-dark active:scale-[0.98] ' +
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
