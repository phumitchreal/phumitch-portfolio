import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowDownIcon as ArrowDown, BriefcaseIcon as Briefcase, UserIcon as User } from "@phosphor-icons/react";
import ZTIcon from "./ZTIcon.tsx";
import LogoBlurRow from "./LogoBlurRow.tsx";
import { L, dicts } from "../i18n.ts";
import { EASE } from "../lib/motion.ts";

const GREETINGS = [
  { text: "สวัสดี", lang: "th" },
  { text: "Hello", lang: "en" },
  { text: "Hallo", lang: "de" },
  { text: "こんにちは", lang: "ja" },
];

export default function HeroMotion() {
  const { en: enD, th: thD } = dicts;
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const greeting = GREETINGS[index];

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % GREETINGS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduced]);

  const nextGreeting = () => setIndex((i) => (i + 1) % GREETINGS.length);

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-x-clip">

      <div className="container-apple flex flex-1 flex-col items-center justify-center pt-24 pb-24 text-center">
        {/* status pill */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="glass inline-flex items-center gap-2 rounded-full border border-line px-2 py-1.5 pr-3.5 text-[12px] font-medium text-fg-muted"
        >
          <span className="flex items-center" aria-hidden="true">
            <ZTIcon size={22} />
          </span>
          <span className="relative flex size-1.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          <span>phumitch.space</span>
        </motion.div>

        {/* giant greeting ticker — the page's one loud gesture */}
        <button
          type="button"
          onClick={nextGreeting}
          aria-label="แสดงคำทักทายถัดไป / Next greeting"
          className="relative mt-6 grid w-full max-w-[1200px] cursor-pointer place-items-center outline-none"
          style={{ fontSize: "min(clamp(64px, 13vw, 196px), 20.48vw)", height: "1.2em" }}
        >
          <span className="sr-only">Hello สวัสดี</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={greeting.text}
              lang={greeting.lang}
              initial={reduced ? false : { opacity: 0, y: "0.32em", filter: "blur(18px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: "-0.32em", filter: "blur(18px)" }}
              transition={{ duration: reduced ? 0.1 : 0.4, ease: EASE }}
              className="absolute inset-0 flex items-center justify-center whitespace-nowrap font-semibold text-fg"
              style={{
                fontSize: "1em",
                letterSpacing: greeting.lang === "th" ? "-0.015em" : "-0.045em",
                lineHeight: 1.1,
              }}
            >
              {greeting.text}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* name + position */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="mt-6 max-w-[640px]"
        >
          <h1 className="text-[15px] font-medium text-fg sm:text-[17px]">
            <L en="Phumitch Somsri · Guitar" th="ภูมิทัศน์ สมศรี · กีต้า" />
          </h1>
          <p className="mt-2 text-pretty text-[15px] leading-relaxed text-fg-muted sm:text-[17px]">
            <L en={enD.home.tag1} th={thD.home.tag1} />
          </p>
          <p className="mt-1 text-pretty text-[13px] leading-relaxed text-fg-dim sm:text-[14px]">
            <L en={enD.home.tag2} th={thD.home.tag2} />
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.28 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          <a href="/portfolio" className="btn-primary">
            <Briefcase size={16} weight="bold" />
            <L en={enD.home.work} th={thD.home.work} />
          </a>
          <a href="/about" className="btn-ghost">
            <User size={16} weight="bold" />
            <L en={enD.home.about} th={thD.home.about} />
          </a>
        </motion.div>

        {/* Partners & Clients */}
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.42 }}
          className="mt-14 w-full max-w-[680px]"
        >
          <p className="mb-1 text-center text-[11px] font-medium tracking-[0.14em] text-fg-dim uppercase">
            <L en={enD.home.agents} th={thD.home.agents} />
          </p>
          <LogoBlurRow
            logos={[
              { name: "Zexta Studio", href: "https://zexta.xyz/", image: "/partners/zexta.avif", monogram: "Zx" },
              {
                name: "Fuyuri TR",
                href: "https://fuyuri.net/",
                image: "/partners/fuyuri-black.avif",
                imageDark: "/partners/fuyuri-white.avif",
                monogram: "Fu",
              },
              { name: "Aven Labs", href: "https://aven-labs.phumitch.space/", image: "/partners/avenlabs.avif", monogram: "Av" },
              { name: "FiguraTH", href: "https://figurath.vercel.app/", image: "/partners/figurath.avif", monogram: "Fg" },
            ]}
            desktopCount={3}
            mobileCount={2}
            interval={2.4}
            stagger={160}
          />
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.8 }}
        className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center gap-2"
      >
        <span className="text-[11px] font-medium tracking-[0.18em] text-fg-dim uppercase">
          <L en="Scroll to explore" th="เลื่อนเพื่อสำรวจ" />
        </span>
        <span className="flex h-9 w-[22px] justify-center rounded-full border-[1.5px] border-line-strong pt-1.5">
          <span className="h-2 w-[3px] animate-[scroll-dot_1.6s_ease_infinite] rounded-full bg-fg-dim" />
        </span>
        <ArrowDown size={12} className="opacity-0" aria-hidden="true" />
      </motion.div>

      <style>{`
        @keyframes scroll-dot {
          0% { opacity: 1; transform: translateY(0); }
          80% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 0; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
