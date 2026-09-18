import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface Props {
  texts?: string[];
  speed?: number; // ms
  blur?: number;
  dissolve?: number;
  gap?: number;
  activeColor?: string;
  inactiveColor?: string;
  fontSize?: number;
}

export default function BlurredTicker({
  texts = ["phumitch", "Phumitch", "Guitar"],
  speed = 1600,
  blur = 2,
  dissolve = 0.4,
  gap = 0,
  activeColor = "#ffffff",
  inactiveColor = "rgba(255,255,255,0.55)",
  fontSize = 84,
}: Props) {
  const items = useMemo(() => texts.filter((t) => t && t.trim().length > 0), [texts]);
  const itemCount = items.length || 1;
  const repeatCount = 40;
  const baseOffset = useMemo(() => itemCount * Math.floor(repeatCount / 2), [itemCount]);
  const [index, setIndex] = useState(baseOffset);
  const [instant, setInstant] = useState(false);
  const [w, setW] = useState<number | null>(null);

  useEffect(() => {
    const upd = () => setW(window.innerWidth);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const responsiveSize = useMemo(() => {
    if (w === null) return fontSize;
    if (w <= 767) return Math.round(fontSize * 0.52);
    if (w <= 1024) return Math.round(fontSize * 0.72);
    return fontSize;
  }, [fontSize, w]);

  useEffect(() => {
    setIndex((prev) => {
      const norm = ((prev % itemCount) + itemCount) % itemCount;
      return baseOffset + norm;
    });
  }, [baseOffset, itemCount]);

  useEffect(() => {
    if (itemCount <= 1) return;
    const id = window.setTimeout(() => {
      setInstant(false);
      setIndex((v) => v + 1);
    }, Math.max(200, speed));
    return () => window.clearTimeout(id);
  }, [speed, index, itemCount]);

  useEffect(() => {
    if (itemCount <= 1) return;
    const maxSafe = itemCount * (repeatCount - 3);
    if (index < maxSafe) return;
    setInstant(true);
    setIndex(baseOffset + (index % itemCount));
  }, [index, itemCount, baseOffset]);

  useEffect(() => {
    if (!instant) return;
    const id = window.setTimeout(() => setInstant(false), 0);
    return () => window.clearTimeout(id);
  }, [instant]);

  const rowHeight = useMemo(() => responsiveSize * 1.1, [responsiveSize]);
  const stepHeight = useMemo(() => rowHeight + gap, [rowHeight, gap]);
  const activeTrack = index;
  const translateY = -(activeTrack * stepHeight - stepHeight);

  const repeated = useMemo(() => Array.from({ length: repeatCount }, () => items).flat(), [items]);

  const dissolveStrength = Math.max(0, Math.min(1, dissolve));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: rowHeight * 3 + gap * 2,
          overflow: "hidden",
          position: "relative",
          maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <motion.div
          animate={{ y: translateY }}
          transition={{ duration: instant ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: "transform", transform: "translateZ(0)", backfaceVisibility: "hidden" } as any}
        >
          {repeated.map((text, i) => {
            const relative = i - activeTrack;
            const distance = Math.abs(relative);
            const active = distance === 0;
            const adjacent = itemCount > 2 ? distance === 1 : itemCount === 2 ? relative === 1 : false;
            const inactiveOpacity = 0.15 + dissolveStrength * 0.75;
            const grainOpacity = 0.18 + dissolveStrength * 0.5;
            const layerShift = (1 - dissolveStrength) * 3 + distance;
            return (
              <div
                key={`${text}-${i}`}
                style={{
                  height: rowHeight,
                  marginBottom: gap,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  position: "relative",
                  color: active ? activeColor : inactiveColor,
                  fontSize: responsiveSize,
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: "1em",
                  textAlign: "center",
                  filter: active ? "blur(0px)" : adjacent ? `blur(${blur}px)` : `blur(${blur * 1.2}px)`,
                  opacity: active ? 1 : adjacent ? inactiveOpacity : 0,
                  textShadow: active ? "none" : `0 0 ${2 + dissolveStrength * 5}px ${inactiveColor}`,
                }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>{text}</span>
                {!active && adjacent ? (
                  <>
                    <motion.span
                      aria-hidden
                      animate={{ x: [-layerShift, layerShift, -layerShift] }}
                      transition={{ duration: 2.8, ease: "linear", repeat: Infinity }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "transparent",
                        WebkitTextStroke: `0.6px ${inactiveColor}`,
                        opacity: 0.12 + dissolveStrength * 0.22,
                        pointerEvents: "none",
                      }}
                    >
                      {text}
                    </motion.span>
                    <motion.span
                      aria-hidden
                      animate={{
                        backgroundPosition: [
                          "0px 0px, 14px 22px, 0px 0px",
                          "18px 20px, 2px 4px, 22px 14px",
                          "0px 0px, 14px 22px, 0px 0px",
                        ],
                      }}
                      transition={{ duration: 1.8, ease: "linear", repeat: Infinity }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "transparent",
                        backgroundImage: `radial-gradient(circle, ${inactiveColor} 1.1px, transparent 1.4px), radial-gradient(circle, ${inactiveColor} 0.9px, transparent 1.25px), linear-gradient(to bottom, transparent, ${inactiveColor}, transparent)`,
                        backgroundSize: "10px 10px, 14px 14px, 100% 100%",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        opacity: grainOpacity,
                        pointerEvents: "none",
                      }}
                    >
                      {text}
                    </motion.span>
                  </>
                ) : null}
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
