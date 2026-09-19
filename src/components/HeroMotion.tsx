import { BookOpen, Cake, MessageCircle, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import ZTIcon from "./ZTIcon.tsx";
import BlurredTicker from "./BlurredTicker.tsx";
import LogoBlurRow from "./LogoBlurRow.tsx";
import { L, dicts } from "../i18n.ts";

const ease = [0.16, 1, 0.3, 1] as const;

export default function HeroMotion() {
  const { en: enD, th: thD } = dicts;
  return (
    <section className="relative flex flex-1 flex-col">
      {/* center */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="flex items-center gap-5 md:gap-7"
        >
          <ZTIcon size={88} className="text-white md:w-[110px] shrink-0" style={{ height: "auto" }} />
          <div className="flex-1 min-w-0">
            <BlurredTicker texts={["Phumitch", "ZextaStudio", "Guitar", "FiguraTH"]} fontSize={56} speed={1600} blur={1.6} dissolve={0.45} gap={6} activeColor="#ffffff" inactiveColor="rgba(255,255,255,0.55)" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.12 }}
          className="mt-10 max-w-[520px] text-sm leading-6 text-white/40"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <L en={enD.home.tag1} th={thD.home.tag1} />
          <br className="hidden md:block" />
          <L en={enD.home.tag2} th={thD.home.tag2} />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.24 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
        >
          <a href="/portfolio" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1a1a1a] px-3.5 text-xs font-medium text-white/80 hover:bg-[#242424] hover:text-white transition-colors">
            <ShoppingBag size={12} className="opacity-60" /> <L en={enD.home.work} th={thD.home.work} />
          </a>
          <a href="/about" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1a1a1a] px-3.5 text-xs font-medium text-white/80 hover:bg-[#242424] hover:text-white transition-colors">
            <BookOpen size={12} className="opacity-60" /> <L en={enD.home.about} th={thD.home.about} />
          </a>
          <a href="/birthday" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1a1a1a] px-3.5 text-xs font-medium text-white/80 hover:bg-[#242424] hover:text-white transition-colors">
            <Cake size={12} className="opacity-60" /> <L en={enD.home.birthday} th={thD.home.birthday} />
          </a>
          <a href="https://discord.com/users/919878532228841532" target="_blank" rel="noopener" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1a1a1a] px-3.5 text-xs font-medium text-white/80 hover:bg-[#242424] hover:text-white transition-colors">
            <MessageCircle size={12} className="opacity-60" /> Discord
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.36 }}
          className="mt-10 w-full max-w-[640px]"
        >
          <p className="mb-3 text-center text-[11px] tracking-[0.16em] uppercase text-white/20" style={{ fontFamily: "var(--font-mono)" }}><L en={enD.home.agents} th={thD.home.agents} /></p>
          <LogoBlurRow logos={["Cursor", "Claude", "Copilot", "Antigravity", "opencode"]} />
        </motion.div>
      </div>

      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-center gap-5 px-6 pb-6 pt-8 text-xs text-white/25">
        <a href="/about" className="hover:text-white/50 transition-colors"><L en={enD.footer.about} th={thD.footer.about} /></a>
        <a href="/birthday" className="hover:text-white/50 transition-colors"><L en={enD.footer.birthday} th={thD.footer.birthday} /></a>
        <a href="/privacy" className="hover:text-white/50 transition-colors"><L en={enD.footer.privacy} th={thD.footer.privacy} /></a>
        <a href="/terms" className="hover:text-white/50 transition-colors"><L en={enD.footer.terms} th={thD.footer.terms} /></a>
        <a href="/acceptable-use" className="hover:text-white/50 transition-colors"><L en={enD.footer.acceptableUse} th={thD.footer.acceptableUse} /></a>
      </div>
    </section>
  );
}
