import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { works } from "../content/work.ts";
import { L, dicts } from "../i18n.ts";

const ease = [0.16, 1, 0.3, 1] as const;

export default function WorkGallery() {
  return (
    <div className="mt-2">
      {works.map((w, i) => (
        <motion.a
          key={w.title}
          href={w.href}
          target="_blank"
          rel="noopener"
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease, delay: i * 0.12 }}
          className="group -mx-4 flex items-center gap-4 rounded-xl border-t border-white/[0.06] px-4 py-7 transition-colors duration-300 hover:bg-[#141414] last:border-b md:gap-8 md:py-8"
        >
          <span
            className="w-7 shrink-0 text-xs tabular-nums text-white/25 transition-colors duration-300 group-hover:text-white/50"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3
                className="text-xl font-semibold tracking-[-0.02em] text-white/85 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white md:text-[26px]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {w.title}
              </h3>
              {w.featured ? (
                <span
                  className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/30"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <L en={dicts.en.work.featured} th={dicts.th.work.featured} />
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 max-w-[520px] text-sm leading-6 text-white/35">
              <L en={w.desc} th={w.descTh} />
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {w.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-white/30 transition-colors duration-300 group-hover:text-white/45"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <span className="flex h-10 w-10 shrink-0 -translate-x-1 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all duration-300 group-hover:translate-x-0 group-hover:border-white group-hover:bg-white group-hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </motion.a>
      ))}

      <motion.a
        href="https://zexta.xyz"
        target="_blank"
        rel="noopener"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="group mt-8 flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#111111] px-6 py-5 transition-colors duration-300 hover:border-white/[0.12] hover:bg-[#161616]"
      >
        <div>
          <p className="text-sm font-medium text-white" style={{ fontFamily: "var(--font-body)" }}><L en={dicts.en.work.moreProjects} th={dicts.th.work.moreProjects} /></p>
          <p className="mt-0.5 text-xs text-white/35" style={{ fontFamily: "var(--font-mono)" }}>zexta.xyz</p>
        </div>
        <span className="text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white"><ArrowRight size={18} strokeWidth={1.5} /></span>
      </motion.a>
    </div>
  );
}