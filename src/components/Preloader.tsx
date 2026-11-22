import ZTIcon from "./ZTIcon.tsx";
import { useEffect, useState } from "react";

const TRANSITION = "transform 0.7s cubic-bezier(.7,.2,.2,1), opacity 0.7s cubic-bezier(.7,.2,.2,1)";
const DONE_KEY = "phumitch_preloader_done";

/**
 * LogoPreloader — adapted from the Framer logo preloader pattern:
 * the ZT sticker lifts in from below, fades, animates up and out, then the
 * full-screen overlay fades away. Announces `crinoid:preloader-done` when done.
 *
 * It only runs once per session (sessionStorage guard) so that in-app page
 * navigations (ClientRouter) show no loading animation at all.
 */
export default function Preloader({ enabled = true }: { enabled?: boolean }) {
  // null = still deciding (server render + first paint). Only render the overlay
  // once we know this is a genuine first visit of the session.
  const [active, setActive] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<"init" | "loading" | "logoOut" | "done">("init");

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }

    let already = false;
    try {
      already = sessionStorage.getItem(DONE_KEY) === "1";
      sessionStorage.setItem(DONE_KEY, "1");
    } catch {}

    if (already) {
      // First-visit only: nothing to show on later reloads or client-side navigations.
      setActive(false);
      return;
    }

    setActive(true);

    const t0 = window.setTimeout(() => setPhase("loading"), 50);
    const t1 = window.setTimeout(() => setPhase("logoOut"), 2 * 1000 + 50);
    const t2 = window.setTimeout(() => {
      setPhase("done");
      window.dispatchEvent(new CustomEvent("crinoid:preloader-done"));
      window.setTimeout(() => setActive(false), 700);
    }, 2 * 1000 + 750);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [enabled]);

  if (!active) return null;

  const translateY = phase === "init" ? 80 : phase === "logoOut" ? -80 : 0;
  const opacity = phase === "init" ? 0 : phase === "logoOut" ? 0 : 1;
  // Stay opaque through init/loading, then fade out once and stay out.
  const bgOpacity = phase === "logoOut" || phase === "done" ? 0 : 1;

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: `opacity 0.7s cubic-bezier(.7,.2,.2,1)`,
        opacity: bgOpacity,
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      <ZTIcon size={96} style={{ opacity, transform: `translateY(${translateY}px)`, transition: TRANSITION }} />
    </div>
  );
}
