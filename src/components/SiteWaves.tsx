import { useEffect, useState } from "react";
import PatternWaves from "./PatternWaves";

const FALLBACK_INK = "#e8e8e8";

function readInk(): string {
  if (typeof window === "undefined") return FALLBACK_INK;
  const value = getComputedStyle(document.documentElement).getPropertyValue("--text-body").trim();
  return value || FALLBACK_INK;
}

/** Ambient PatternWaves backdrop, mounted once in Base.astro behind every page.
 *  The colour follows --text-body so the pattern stays legible in both themes:
 *  dark theme draws light marks, light theme switches the shader into ink mode. */
export default function SiteWaves() {
  const [ink, setInk] = useState(FALLBACK_INK);

  useEffect(() => {
    const sync = () => setInk(readInk());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <PatternWaves
        preset="mesh"
        color={ink}
        backgroundColor="transparent"
        opacity={0.35}
        fade="edges"
        fadeSize={0.62}
        interactive
        cursorSize={90}
        cursorStrength={0.35}
        speed={0.28}
      />
    </div>
  );
}