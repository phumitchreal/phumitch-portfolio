/**
 * TurnstileGate.tsx — the Cloudflare Turnstile "verify you are human" overlay.
 *
 * It only appears when the server says so: `GET /api/verify-turnstile` reports
 * `{ enforced, verified }`. No keys configured, API unreachable, or already
 * verified in this session → the gate renders nothing and the site is untouched.
 *
 * Sequencing: Preloader (z-9999) → LanguageGate (z-10000) → this gate (z-10000).
 * It waits for the language choice and the preloader finish (with fallbacks) so
 * the overlays never stack, and it is deliberately fail-open: if the widget script
 * is blocked or too slow the visitor gets a "skip" button instead of a dead end.
 * The real security boundary is the API, which enforces the signed cookie itself.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShieldCheckIcon as ShieldCheck } from "@phosphor-icons/react";
import ZTIcon from "./ZTIcon.tsx";
import { L } from "../i18n.ts";
import { DUR, EASE } from "../lib/motion.ts";

type Phase = "idle" | "prompt" | "verifying" | "error" | "done";

interface TurnstileWidgetOptions {
  sitekey: string;
  action?: string;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "flexible" | "compact";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
}

interface TurnstileApi {
  render: (target: HTMLElement, options: TurnstileWidgetOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Must match EXPECTED_ACTION in api/_turnstile.js. */
const ACTION = "site-gate";
const OK_KEY = "phumitch_turnstile_ok";
const SKIP_KEY = "phumitch_turnstile_skipped";
const LANG_KEY = "crinoid_lang";
const LANG_EVENT = "crinoid:lang-chosen";
const PRELOADER_EVENT = "crinoid:preloader-done";
const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SCRIPT_TIMEOUT_MS = 8000;
const PRELOADER_FALLBACK_MS = 2600;
const LANG_FALLBACK_MS = 30000;
const SKIP_AFTER_MS = 15000;

const BTN =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-transparent px-5 text-[12px] font-medium text-fg/80 transition-colors duration-300 hover:border-fg/40 hover:bg-fg/[0.04] hover:text-fg";

function readFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* private mode — the cookie still carries the real state */
  }
}

/** Resolve on `eventName`, or as soon as `isReady()`, or after `timeoutMs`. */
function waitFor(eventName: string, isReady: () => boolean, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    if (isReady()) return resolve();
    const done = () => {
      window.removeEventListener(eventName, done);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, timeoutMs);
    window.addEventListener(eventName, done, { once: true });
  });
}

/** Load Turnstile's api.js on demand — visitors who never see the gate never pay for it. */
function loadTurnstile(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    const loaded = window.turnstile;
    if (loaded) return resolve(loaded);

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const started = Date.now();
    const poll = () => {
      const api = window.turnstile;
      if (api) return resolve(api);
      if (Date.now() - started > SCRIPT_TIMEOUT_MS) return reject(new Error("turnstile-timeout"));
      window.setTimeout(poll, 120);
    };
    script.addEventListener("error", () => reject(new Error("turnstile-blocked")));
    poll();
  });
}

export default function TurnstileGate({ siteKey = "" }: { siteKey?: string }) {
  const reduced = useReducedMotion() === true;
  const [phase, setPhase] = useState<Phase>("idle");
  const [canSkip, setCanSkip] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<string | null>(null);
  const apiRef = useRef<TurnstileApi | null>(null);

  const visible = phase === "prompt" || phase === "verifying" || phase === "error";

  const skip = useCallback(() => {
    writeFlag(SKIP_KEY);
    setPhase("done");
  }, []);

  const submit = useCallback(async (token: string) => {
    setPhase("verifying");
    try {
      const res = await fetch("/api/verify-turnstile", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setPhase("error");
        return;
      }
      writeFlag(OK_KEY);
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }, []);

  const retry = useCallback(() => {
    setCanSkip(false);
    const api = apiRef.current;
    const id = widgetRef.current;
    if (api && id) {
      try {
        api.reset(id);
      } catch {
        /* widget already torn down */
      }
    }
    setPhase("prompt");
  }, []);

  /* 1 — ask the server whether a gate is needed at all. */
  useEffect(() => {
    if (!siteKey) return;
    if (readFlag(OK_KEY) || readFlag(SKIP_KEY)) {
      setPhase("done");
      return;
    }

    let cancelled = false;
    const decide = async () => {
      const langReady = () => {
        try {
          return localStorage.getItem(LANG_KEY) !== null;
        } catch {
          return false;
        }
      };
      await Promise.all([
        waitFor(LANG_EVENT, langReady, LANG_FALLBACK_MS),
        waitFor(PRELOADER_EVENT, () => false, PRELOADER_FALLBACK_MS),
      ]);
      if (cancelled) return;

      try {
        const res = await fetch("/api/verify-turnstile", {
          credentials: "same-origin",
          headers: { accept: "application/json" },
        });
        if (!res.ok) {
          setPhase("done");
          return;
        }
        // In `astro dev` there is no serverless runtime and Vite answers with the
        // raw module source — anything that is not JSON means "no gate here".
        let data: { enforced?: boolean; verified?: boolean } | null = null;
        try {
          data = (await res.json()) as { enforced?: boolean; verified?: boolean };
        } catch {
          data = null;
        }
        if (cancelled) return;
        if (!data || data.enforced !== true || data.verified === true) {
          if (data) writeFlag(OK_KEY);
          setPhase("done");
          return;
        }
        setPhase("prompt");
      } catch {
        // Network down or the request was blocked → never trap the visitor.
        if (!cancelled) setPhase("done");
      }
    };

    void decide();
    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  /* 2 — mount the widget once the overlay is on screen. */
  useEffect(() => {
    if (!visible || !siteKey) return;
    const host = hostRef.current;
    if (!host || widgetRef.current) return;

    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || widgetRef.current) return;
        apiRef.current = api;
        widgetRef.current = api.render(host, {
          sitekey: siteKey,
          action: ACTION,
          theme: document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark",
          size: "flexible",
          callback: (token) => void submit(token),
          "error-callback": () => setPhase("error"),
          "expired-callback": () => setPhase("error"),
        });
      })
      .catch(() => {
        if (cancelled) return;
        setCanSkip(true);
        setPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, [visible, siteKey, submit]);

  /* 3 — after a while, offer a way out instead of trapping the visitor. */
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setCanSkip(true), SKIP_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [visible]);

  /* 4 — focus the dialog; Escape is the keyboard escape hatch. */
  useEffect(() => {
    if (!visible) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, skip]);

  /* 5 — tear the widget down on unmount. */
  useEffect(
    () => () => {
      const api = apiRef.current;
      const id = widgetRef.current;
      if (!api || !id) return;
      try {
        api.remove(id);
      } catch {
        /* container already detached */
      }
      widgetRef.current = null;
    },
    []
  );

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="turnstile-gate"
          role="dialog"
          aria-modal="true"
          aria-labelledby="turnstile-title"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : DUR.base, ease: EASE }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-bg px-6"
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : DUR.base, ease: EASE }}
            className="flex w-full max-w-[380px] flex-col items-center text-center outline-none"
          >
            <ZTIcon size={40} className="mb-7" />

            <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-fg-dim">
              <ShieldCheck size={13} weight="bold" />
              {/* Cloudflare is a product name — no translation */}
              <span>Cloudflare Turnstile</span>
            </span>

            <h1 id="turnstile-title" className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-fg">
              <L en="Verify you are human" th="ยืนยันว่าคุณไม่ใช่บอท" />
            </h1>
            <p className="mt-2 max-w-[300px] text-[13px] leading-relaxed text-fg-muted">
              <L
                en="A quick check keeps the site safe from bots and scrapers."
                th="การตรวจสอบสั้น ๆ ช่วยกันบอทและตัวดึงข้อมูลออกจากเว็บ"
              />
            </p>

            <div ref={hostRef} className="mt-7 flex min-h-[70px] w-full items-center justify-center" />

            {phase === "verifying" ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
                <L en="Verifying…" th="กำลังตรวจสอบ…" />
              </p>
            ) : null}

            {phase === "error" ? (
              <p className="text-[12px] text-fg-muted">
                <L en="That did not go through. Try once more." th="ยังไม่ผ่าน ลองอีกครั้งได้เลย" />
              </p>
            ) : null}

            {phase === "error" || canSkip ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {phase === "error" ? (
                  <button type="button" onClick={retry} className={BTN}>
                    <L en="Try again" th="ลองอีกครั้ง" />
                  </button>
                ) : null}
                {canSkip ? (
                  <button type="button" onClick={skip} className={BTN}>
                    <L en="Skip for now" th="ข้ามไปก่อน" />
                  </button>
                ) : null}
              </div>
            ) : null}

            <p className="mt-9 font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
              <L en="Protected by Cloudflare" th="ป้องกันโดย Cloudflare" />
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}