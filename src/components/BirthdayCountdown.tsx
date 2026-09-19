import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ---------------------------------------------------------------------------
 * Birthday date math — ภูมิทัศน์ สมศรี (กีต้า) · born 11 August 2008.
 * Single source of truth for every birthday surface on the site.
 * ------------------------------------------------------------------------- */

export const BIRTH_MONTH = 7; // August (zero-indexed, like Date#getMonth)
export const BIRTH_DAY = 11;

export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

/** Next 11 August at local midnight — rolls to next year once the day itself starts. */
export function nextBirthday(from: Date = new Date()): Date {
  const year = from.getFullYear();
  const thisYear = new Date(year, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0, 0);
  const targetYear = thisYear.getTime() > from.getTime() ? year : year + 1;
  return new Date(targetYear, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0, 0);
}

/** Same shape as the Framer source: `null` once the target has passed. */
function calculateTimeLeft(target: Date): TimeLeft | null {
  const difference = target.getTime() - Date.now();
  if (difference <= 0) return null;
  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

/* ---------------------------------------------------------------------------
 * Count_Down — port of Framer "PRO COUNTDOWN"
 * https://framer.com/m/Count-Down-yIqNhX.js@YlPlrUmsTptewPC0PkbF
 *
 * Same visuals and behaviour as the original: 0.65em x 1.1em digit slots,
 * zero-padded values, spring roll-over (stiffness 450 / damping 35 / mass 1),
 * blur+y entrance, optional ":" separators, 10px uppercase micro labels,
 * and the same prop names/defaults (fontSize 60, gap 30, Inter 700, #FFFFFF,
 * #888888, separators off).
 * Two implementation notes only:
 *   - `framer`'s addPropertyControls import is dropped (it is a Framer runtime
 *     API) and replaced by typed props; the component is client-side.
 *   - the Google-Fonts <link> injection is dropped: Inter is loaded once by
 *     Base.astro with the rest of the site fonts.
 * Sizes are em-based against the container font-size, so the default fontSize
 * is a clamp that resolves to exactly 60px from ~698px viewport up (Framer's
 * default) while staying on-screen on phones.
 * ------------------------------------------------------------------------- */

const digitEnter = { y: "-60%", opacity: 0, filter: "blur(6px)" } as const;
const digitShown = { y: "0%", opacity: 1, filter: "blur(0px)" } as const;
const digitExit = { y: "60%", opacity: 0, filter: "blur(6px)" } as const;
const digitSpring = { type: "spring", stiffness: 450, damping: 35, mass: 1 } as const;


type DigitProps = {
  value: string;
  tint: string;
  fontFamily: string;
  fontWeight: number;
};

function Digit({ value, tint, fontFamily, fontWeight }: DigitProps) {
  return (
    <div style={{ position: "relative", height: "1.1em", width: "0.65em", overflow: "hidden", display: "flex", justifyContent: "center" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          style={{
            fontSize: "1em",
            lineHeight: 1,
            color: tint,
            position: "absolute",
            fontFamily,
            fontWeight,
            fontVariantNumeric: "tabular-nums",
          }}
          initial={digitEnter}
          animate={digitShown}
          exit={digitExit}
          transition={digitSpring}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

type GroupProps = {
  value: number;
  label: CountdownLabel;
  tint: string;
  labelColor: string;
  fontFamily: string;
  fontWeight: number;
};

function NumberGroup({ value, label, tint, labelColor, fontFamily, fontWeight }: GroupProps) {
  const digits = (value < 10 ? `0${value}` : `${value}`).split("");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {digits.map((digit, index) => (
          <Digit key={index} value={digit} tint={tint} fontFamily={fontFamily} fontWeight={fontWeight} />
        ))}
      </div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginTop: "6px",
          textAlign: "center",
          lineHeight: 1,
          color: labelColor,
          fontFamily,
        }}
      >
        <span data-lang="en">{label.en}</span>
        <span data-lang="th">{label.th}</span>
      </div>
    </div>
  );
}

function Separator({ tint, fontFamily }: { tint: string; fontFamily: string }) {
  return (
    <div style={{ fontWeight: "bold", lineHeight: 1, opacity: 0.2, marginTop: "-2px", color: tint, fontFamily }}>
      :
    </div>
  );
}

export type CountdownLabel = { en: string; th: string };
export type CountdownLabels = { days: CountdownLabel; hours: CountdownLabel; minutes: CountdownLabel; seconds: CountdownLabel };

const defaultLabels: CountdownLabels = {
  days: { en: "DAYS", th: "วัน" },
  hours: { en: "HOURS", th: "ชั่วโมง" },
  minutes: { en: "MINUTES", th: "นาที" },
  seconds: { en: "SECONDS", th: "วินาที" },
};

export interface BirthdayCountdownProps {
  /** Countdown target. Omit to count to the next 11 August. */
  targetDate?: Date;
  /** Space between the four groups. Number = px. Default 30 (Framer). */
  gap?: number | string;
  /** Digit font-size. Number = px. Default resolves to 60px (Framer's default). */
  fontSize?: number | string;
  /** Digit colour. Default "#FFFFFF" (Framer). */
  tint?: string;
  /** Micro-label colour. Default "#888888" (Framer). */
  labelColor?: string;
  /** Default '"Inter", sans-serif' (Framer). */
  fontFamily?: string;
  /** Default 700 (Framer). */
  fontWeight?: number;
  /** Default false (Framer). */
  showSeparators?: boolean;
  labels?: Partial<CountdownLabels>;
  className?: string;
}

export default function BirthdayCountdown({
  targetDate,
  gap = 30,
  fontSize = "clamp(1.75rem, 8.6vw, 3.75rem)", // 3.75rem = Framer's 60px default
  tint = "#FFFFFF",
  labelColor = "#888888",
  fontFamily = '"Inter", sans-serif',
  fontWeight = 700,
  showSeparators = false,
  labels,
  className = "",
}: BirthdayCountdownProps) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  const fixedTarget = targetDate ? targetDate.getTime() : null;

  useEffect(() => {
    const tick = () => setTime(calculateTimeLeft(fixedTarget === null ? nextBirthday() : new Date(fixedTarget)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [fixedTarget]);

  const shown: TimeLeft = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const size = typeof fontSize === "number" ? `${fontSize}px` : fontSize;
  const spacing = typeof gap === "number" ? `${gap}px` : gap;
  const text = { ...defaultLabels, ...labels };

  const groupProps = { tint, labelColor, fontFamily, fontWeight };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: spacing,
        fontSize: size,
        fontFamily,
        fontWeight,
        color: tint,
        /* static builds bake the HTML, so digits stay hidden until the client ticks */
        opacity: time === null ? 0 : 1,
        transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <NumberGroup value={shown.days} label={text.days} {...groupProps} />
      {showSeparators ? <Separator tint={tint} fontFamily={fontFamily} /> : null}
      <NumberGroup value={shown.hours} label={text.hours} {...groupProps} />
      {showSeparators ? <Separator tint={tint} fontFamily={fontFamily} /> : null}
      <NumberGroup value={shown.minutes} label={text.minutes} {...groupProps} />
      {showSeparators ? <Separator tint={tint} fontFamily={fontFamily} /> : null}
      <NumberGroup value={shown.seconds} label={text.seconds} {...groupProps} />
    </div>
  );
}