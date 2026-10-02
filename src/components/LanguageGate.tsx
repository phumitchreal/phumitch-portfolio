import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ZTIcon from "./ZTIcon.tsx";
import { setLang } from "../i18n.ts";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LanguageGate() {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("crinoid_lang") !== null) return;
      setShow(true);
    } catch {}
  }, []);

  const choose = (lang: string) => {
    setLang(lang === "th" ? "th" : "en");
    // The Turnstile gate queues behind this overlay — see TurnstileGate.tsx.
    window.dispatchEvent(new CustomEvent("crinoid:lang-chosen", { detail: { lang } }));
    setFading(true);
    window.setTimeout(() => setShow(false), 450);
  };

  if (!show) return null;

  const Btn = `inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-transparent px-7 text-sm font-medium text-fg/80 transition-colors duration-300 hover:border-fg/40 hover:bg-fg/[0.04] hover:text-fg`;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-bg px-6"
      style={{ pointerEvents: fading ? "none" : "auto" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex flex-col items-center text-center"
      >
        <ZTIcon size={40} className="mb-8" />

        <h1
          className="text-[17px] font-medium tracking-[-0.01em] text-fg"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Choose a language
        </h1>
        <p className="mt-1.5 text-[13px] text-fg-muted">เลือกภาษาเพื่อเข้าสู่เว็บไซต์</p>

        <div className="mt-8 flex items-center gap-3">
          <button onClick={() => choose("th")} className={Btn}>
            ไทย
          </button>
          <button onClick={() => choose("en")} className={Btn}>
            English
          </button>
        </div>

        <p className="mt-9 font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
          Saved on this device
        </p>
      </motion.div>
    </motion.div>
  );
}