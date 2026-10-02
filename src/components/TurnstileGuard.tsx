/**
 * TurnstileGuard.tsx — redirect-flow gate.
 *
 * Rendered once in Base.astro on every page. On mount it asks the server
 * (`GET /api/verify-turnstile`) whether enforcement is on and whether this
 * visitor already carries a valid session cookie.
 *
 *   - not enforced, already verified, or API unreachable  → do nothing (fail-open)
 *   - enforced and not verified                           → redirect to
 *     `/verify?next=<current path>` so the challenge happens on its own page
 *
 * The `/verify` page itself is skipped to avoid a redirect loop. The real
 * security boundary stays on the server: /api/verify-turnstile enforces the
 * signed HttpOnly cookie, this component only routes the visitor there.
 */
import { useEffect } from "react";

interface Status {
  enforced?: boolean;
  verified?: boolean;
}

/** Session-scoped bypass set by /verify when the widget cannot be completed.
 *  Must match PASS_KEY in TurnstileChallenge.tsx. */
const PASS_KEY = "crinoid_turnstile_passed";

export default function TurnstileGuard({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const run = async () => {
      const path = window.location.pathname;
      if (path === "/verify" || path.startsWith("/verify/")) return;

      // Visitor tapped "continue" after the widget failed — never bounce them back.
      try {
        if (window.sessionStorage.getItem(PASS_KEY) === "1") return;
      } catch {
        /* storage blocked — ignore */
      }

      try {
        const res = await fetch("/api/verify-turnstile", {
          credentials: "same-origin",
          headers: { accept: "application/json" },
        });
        if (!res.ok) return;

        let data: Status | null = null;
        try {
          data = (await res.json()) as Status;
        } catch {
          data = null;
        }
        if (cancelled || !data) return;
        if (data.enforced !== true || data.verified === true) return;

        const next = encodeURIComponent(path + window.location.search);
        window.location.replace(`/verify?next=${next}`);
      } catch {
        /* network down or blocked — never trap the visitor */
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return null;
}
