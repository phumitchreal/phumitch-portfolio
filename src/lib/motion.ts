/**
 * motion.ts — shared motion system for every Framer Motion island.
 * One easing curve, one reveal recipe, one spring. See DESIGN.md § Motion.
 */
import type { Easing } from "framer-motion";

/** The site's signature curve — physics, not decoration. */
export const EASE = [0.16, 1, 0.3, 1] as const;
/** Slightly gentler variant used for tickers / logo swaps. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Framer Count_Down roll-over spring (kept 1:1 with the original). */
export const SPRING_ROLL = { type: "spring", stiffness: 450, damping: 35, mass: 1 } as const;

export const DUR = { fast: 0.25, base: 0.6, slow: 0.9 } as const;

interface RevealOptions {
  /** Entrance offset in px (default 20). */
  y?: number;
  /** Entrance blur in px (default 6). */
  blur?: number;
  /** IntersectionObserver root margin (default "-60px"). */
  margin?: string;
}

/**
 * Shared scroll-reveal props: `<motion.section {...revealProps(1, reduced)} />`.
 * Pass `reduced = useReducedMotion()` so the island degrades to instant content —
 * DESIGN.md requires every motion component to guard this.
 */
export function revealProps(
  i = 0,
  reduced = false,
  { y = 20, blur = 6, margin = "-60px" }: RevealOptions = {}
) {
  return {
    initial: reduced
      ? { opacity: 1, y: 0, filter: "blur(0px)" }
      : { opacity: 0, y, filter: `blur(${blur}px)` },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, margin },
    transition: reduced
      ? { duration: 0 }
      : { duration: DUR.base, ease: EASE as unknown as Easing, delay: i * 0.06 },
  };
}
