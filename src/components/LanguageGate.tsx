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
    setFading(true);
    window.setTimeout(() => setShow(false), 450);
  };

  if (!show) return null;

  const Btn = `inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-transparent px-7 text-sm font-medium text-white/80 transition-colors duration-300 hover:border-white/40 hover:bg-white/[0.04] hover:text-white focus-visible:outline focus-visible:outline-white/30`;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0a0a0a] px-6"
      style={{ pointerEvents: fading ? "none" : "auto" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex flex-col items-center text-center"
      >
        <ZTIcon size={28} className="mb-8 text-white" />

        <h1
          className="text-[17px] font-medium tracking-[-0.01em] text-white"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Choose a language
        </h1>
        <p className="mt-1.5 text-[13px] text-white/40">เลือกภาษาเพื่อเข้าสู่เว็บไซต์</p>

        <div className="mt-8 flex items-center gap-3">
          <button onClick={() => choose("th")} className={Btn}>
            ไทย
          </button>
          <button onClick={() => choose("en")} className={Btn}>
            English
          </button>
        </div>

        <p className="mt-9 font-mono text-[10px] uppercase tracking-[0.25em] text-white/20">
          Saved on this device
        </p>
      </motion.div>
    </motion.div>
  );
}