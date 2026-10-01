import { BookOpenIcon as BookOpen, BriefcaseIcon as Briefcase, CakeIcon as Cake, DiscordLogoIcon as DiscordLogo } from "@phosphor-icons/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useRef } from "react";
import ZTIcon from "./ZTIcon.tsx";
import BlurredTicker from "./BlurredTicker.tsx";
import LogoBlurRow from "./LogoBlurRow.tsx";
import { L, dicts } from "../i18n.ts";
import { EASE } from "../lib/motion.ts";

export default function HeroMotion() {
  const { en: enD, th: thD } = dicts;
  const reduced = useReducedMotion();
  const [logoClicks, setLogoClicks] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const clickedRef = useRef(false);

  const handleLogoClick = () => {
    if (unlocking) return;
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 2) {
      setUnlocking(true);
      setTimeout(() => {
        window.location.href = "/studio_lol";
      }, 900);
      return;
    }
    clickedRef.current = true;
    setTimeout(() => setLogoClicks(0), 400);
  };

  return (
    <section className="relative flex flex-1 flex-col overflow-x-clip">
      {/* unlock flash overlay */}
      <AnimatePresence>
        {unlocking && (
          <motion.div
            key="unlock-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.9, times: [0, 0.3, 1], ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-fg"
          >
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.4, 2.2], opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, times: [0, 0.4, 1], ease: "easeOut" }}
              className="h-40 w-40 rounded-full border-4 border-bg/80"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* center */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={
            unlocking
              ? { opacity: 1, y: 0, scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }
              : logoClicks > 0
              ? { opacity: 1, y: 0, scale: 0.94 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: unlocking ? 0.6 : 0.2, ease: EASE }}
          className="flex cursor-pointer select-none items-center gap-5 md:gap-7"
          onClick={handleLogoClick}
        >
          <ZTIcon size={88} className="h-auto w-[72px] shrink-0 sm:w-[88px] md:w-[110px]" />
          <div className="min-w-0 flex-1">
            <BlurredTicker
              texts={["Phumitch", "ZextaStudio", "Guitar", "FiguraTH"]}
              fontSize={56}
              speed={1600}
              blur={1.6}
              dissolve={0.45}
              gap={6}
              activeColor="var(--text)"
              inactiveColor="var(--text-muted)"
            />
          </div>
        </motion.div>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
          className="mt-10 max-w-[520px] text-sm leading-6 text-fg/40"
        >
          <L en={enD.home.tag1} th={thD.home.tag1} />
          <br className="hidden md:block" />
          <L en={enD.home.tag2} th={thD.home.tag2} />
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.24 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
        >
          <a href="/portfolio" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3.5 text-xs font-medium text-fg/80 transition-colors duration-300 hover:bg-surface-hover hover:text-fg">
            <Briefcase size={14} weight="bold" className="opacity-60" /> <L en={enD.home.work} th={thD.home.work} />
          </a>
          <a href="/about" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3.5 text-xs font-medium text-fg/80 transition-colors duration-300 hover:bg-surface-hover hover:text-fg">
            <BookOpen size={14} weight="bold" className="opacity-60" /> <L en={enD.home.about} th={thD.home.about} />
          </a>
          <a href="/birthday" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3.5 text-xs font-medium text-fg/80 transition-colors duration-300 hover:bg-surface-hover hover:text-fg">
            <Cake size={14} weight="bold" className="opacity-60" /> <L en={enD.home.birthday} th={thD.home.birthday} />
          </a>
          <a href="https://discord.com/users/919878532228841532" target="_blank" rel="noopener" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3.5 text-xs font-medium text-fg/80 transition-colors duration-300 hover:bg-surface-hover hover:text-fg">
            <DiscordLogo size={14} weight="bold" className="opacity-60" /> Discord
          </a>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.36 }}
          className="mt-10 w-full max-w-hero"
        >
          <p className="mb-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-fg/20">
            <L en={enD.home.agents} th={thD.home.agents} />
          </p>
          <LogoBlurRow logos={["Cursor", "Claude", "Copilot", "Antigravity", "opencode"]} />
        </motion.div>
      </div>
    </section>
  );
}
