/**
 * TurnstileChallenge.tsx — the standalone `/verify` page body.
 *
 * Renders the Cloudflare Turnstile widget full-page. Flow:
 *   1. ask `GET /api/verify-turnstile` — if this visitor is already verified,
 *      bounce straight to `next`.
 *   2. otherwise render the widget, POST the token to the API, and on success
 *      redirect to `next` (default `/`).
 *
 * If no sitekey is configured the page says so plainly and offers a continue
 * button instead of a dead end. The signed session cookie is set server-side.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShieldCheckIcon as ShieldCheck } from "@phosphor-icons/react";
import ZTIcon from "./ZTIcon.tsx";
import { L } from "../i18n.ts";
import { DUR, EASE } from "../lib/motion.ts";

type Phase = "checking" | "prompt" | "verifying" | "error" | "done";

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
const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SCRIPT_TIMEOUT_MS = 8000;
/** If the widget never hands back a token (blocked storage, adblock, network),
 *  surface the error state so the continue button is always reachable. */
const WIDGET_TIMEOUT_MS = 15000;
/** Session-scoped bypass so a blocked widget can never trap the visitor.
 *  Must match PASS_KEY in TurnstileGuard.tsx. */
const PASS_KEY = "crinoid_turnstile_passed";

const BTN =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-transparent px-5 text-[12px] font-medium text-fg/80 transition-colors duration-300 hover:border-fg/40 hover:bg-fg/[0.04] hover:text-fg";

/** Only allow same-origin, absolute paths — no open redirects. */
function safeNext(raw: string | null | undefined): string {
  if (!raw) return "/";
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    return "/";
  }
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

/** Load Turnstile's api.js on demand. */
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

export default function TurnstileChallenge({
  siteKey = "",
  next = "/",
}: {
  siteKey?: string;
  next?: string;
}) {
  const reduced = useReducedMotion() === true;
  const target = safeNext(next);
  const [phase, setPhase] = useState<Phase>("checking");
  const [reason, setReason] = useState("");
  const hostRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<string | null>(null);
  const apiRef = useRef<TurnstileApi | null>(null);
  const solvedRef = useRef(false);

  const finish = useCallback(() => {
    window.location.assign(target);
  }, [target]);

  /** Escape hatch: the widget is broken or blocked, so let the visitor through
   *  instead of looping them back to /verify forever. */
  const skip = useCallback(() => {
    try {
      window.sessionStorage.setItem(PASS_KEY, "1");
    } catch {
      /* storage blocked — the guard may bounce once, but never loop */
    }
    finish();
  }, [finish]);

  const submit = useCallback(
    async (token: string) => {
      solvedRef.current = true;
      setPhase("verifying");
      try {
        const res = await fetch("/api/verify-turnstile", {
          method: "POST",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          let detail = `http_${res.status}`;
          try {
            const data = (await res.json()) as { error?: string; codes?: string[] };
            detail = [data?.error, data?.codes?.length ? data.codes.join(",") : ""]
              .filter(Boolean)
              .join("_") || detail;
          } catch {
            /* keep the status-code detail */
          }
          console.error("[turnstile] verify failed:", res.status, detail);
          setReason(detail);
          setPhase("error");
          return;
        }
        finish();
      } catch (err) {
        console.error("[turnstile] verify threw:", err);
        setReason("network");
        setPhase("error");
      }
    },
    [finish]
  );

  /* 1 — already verified? bounce. Otherwise show the widget (or a notice). */
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/verify-turnstile", {
          credentials: "same-origin",
          headers: { accept: "application/json" },
        });
        if (res.ok) {
          let data: { enforced?: boolean; verified?: boolean } | null = null;
          try {
            data = (await res.json()) as { enforced?: boolean; verified?: boolean };
          } catch {
            data = null;
          }
          if (!cancelled && data && data.verified === true) {
            finish();
            return;
          }
        }
      } catch {
        /* fall through to the widget */
      }
      if (cancelled) return;
      setPhase(siteKey ? "prompt" : "done");
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [siteKey, finish]);

  /* 2 — mount the widget once we are on the prompt step. */
  useEffect(() => {
    if (phase !== "prompt" || !siteKey) return;
    const host = hostRef.current;
    if (!host || widgetRef.current) return;

    let cancelled = false;
    let watchdog: number | undefined;
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
        /* Nothing came back — blocked storage, adblock or a silent failure.
         * Without this the visitor sits on an empty prompt forever. */
        watchdog = window.setTimeout(() => {
          if (!cancelled && !solvedRef.current) setPhase("error");
        }, WIDGET_TIMEOUT_MS);
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });

    return () => {
      cancelled = true;
      if (watchdog !== undefined) window.clearTimeout(watchdog);
    };
  }, [phase, siteKey, submit]);

  /* 3 — tear the widget down on unmount. */
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

  const retry = useCallback(() => {
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

  const showWidget = phase === "prompt" || phase === "verifying" || phase === "error";

  return (
    <AnimatePresence>
      <motion.div
        key="turnstile-challenge"
        role="dialog"
        aria-modal="true"
        aria-labelledby="turnstile-title"
        initial={reduced ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : DUR.base, ease: EASE }}
        className="flex w-full max-w-[380px] flex-col items-center text-center"
      >
        <ZTIcon size={40} className="mb-7" />

        <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-fg-dim">
          <ShieldCheck size={13} weight="bold" />
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

        {showWidget ? (
          <div ref={hostRef} className="mt-7 flex min-h-[70px] w-full items-center justify-center" />
        ) : null}

        {phase === "checking" ? (
          <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
            <L en="Checking…" th="กำลังตรวจสอบ…" />
          </p>
        ) : null}

        {phase === "verifying" ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
            <L en="Verifying…" th="กำลังตรวจสอบ…" />
          </p>
        ) : null}

        {phase === "error" ? (
          <>
            <p className="mt-4 text-[12px] text-fg-muted">
              <L en="That did not go through. Try once more." th="ยังไม่ผ่าน ลองอีกครั้งได้เลย" />
            </p>
            {reason ? (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
                {reason}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={retry} className={BTN}>
                <L en="Try again" th="ลองอีกครั้ง" />
              </button>
              <button type="button" onClick={skip} className={BTN}>
                <L en="Continue to site" th="เข้าเว็บต่อ" />
              </button>
            </div>
          </>
        ) : null}

        {phase === "done" ? (
          <>
            <p className="mt-4 max-w-[300px] text-[12px] text-fg-muted">
              <L
                en="Verification is not enabled on this site right now."
                th="ขณะนี้เว็บนี้ยังไม่ได้เปิดระบบยืนยันตัวตน"
              />
            </p>
            <div className="mt-6">
              <button type="button" onClick={finish} className={BTN}>
                <L en="Continue" th="ดำเนินการต่อ" />
              </button>
            </div>
          </>
        ) : null}

        <p className="mt-9 font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
          <L en="Protected by Cloudflare" th="ป้องกันโดย Cloudflare" />
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
