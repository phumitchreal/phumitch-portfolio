import ZTIcon from "./ZTIcon.tsx";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const DONE_KEY = "phumitch_preloader_done";

export default function Preloader() {
  const [active, setActive] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let already = false;
    try {
      already = sessionStorage.getItem(DONE_KEY) === "1";
      sessionStorage.setItem(DONE_KEY, "1");
    } catch {}
    if (already) return;

    setActive(true);
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setFading(true);
      window.setTimeout(() => setActive(false), 600);
    };

    const gate = { fonts: false };
    const cutoff = window.setTimeout(finish, 2400);

    const check = () => {
      if (document.readyState === "complete" && gate.fonts && performance.now() - start >= 1200) {
        finish();
      }
    };

    window.addEventListener("load", check, { once: true });
    document.addEventListener("readystatechange", check);
    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          gate.fonts = true;
          check();
        })
        .catch(() => {
          gate.fonts = true;
          check();
        });
    } else {
      gate.fonts = true;
    }

    return () => {
      window.clearTimeout(cutoff);
      window.removeEventListener("load", check);
      document.removeEventListener("readystatechange", check);
    };
  }, []);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: fading ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]"
        style={{ pointerEvents: fading ? "none" : "auto" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ZTIcon size={44} className="text-white" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}