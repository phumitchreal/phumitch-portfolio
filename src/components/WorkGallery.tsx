import { motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react";
import { works } from "../content/work.ts";
import { L, dicts } from "../i18n.ts";
import { revealProps } from "../lib/motion.ts";

export default function WorkGallery() {
  const reduced = useReducedMotion();
  return (
    <div className="mt-2">
      {works.map((w, i) => (
        <motion.a
          key={w.title}
          href={w.href}
          target="_blank"
          rel="noopener"
          {...revealProps(i, !!reduced, { y: 24, blur: 8 })}
          className="group -mx-4 flex items-center gap-4 rounded-xl border-t border-line px-4 py-7 transition-colors duration-300 last:border-b hover:bg-fg/[0.03] md:gap-8 md:py-8"
        >
          <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-fg/25 transition-colors duration-300 group-hover:text-fg/50">
            {String(i + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold tracking-[-0.01em] text-fg/85 transition-all duration-300 group-hover:translate-x-1 group-hover:text-fg md:text-[26px]">
                {w.title}
              </h3>
              {w.featured ? (
                <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg/30">
                  <L en={dicts.en.work.featured} th={dicts.th.work.featured} />
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 max-w-[520px] text-sm leading-6 text-fg/40">
              <L en={w.desc} th={w.descTh} />
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {w.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-fg/30 transition-colors duration-300 group-hover:text-fg/45"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <span className="flex h-10 w-10 shrink-0 -translate-x-1 items-center justify-center rounded-full border border-line text-fg/40 transition-all duration-300 group-hover:translate-x-0 group-hover:border-fg group-hover:bg-fg group-hover:text-bg">
            <ArrowRight size={16} weight="bold" />
          </span>
        </motion.a>
      ))}

      <motion.a
        href="https://zexta.xyz"
        target="_blank"
        rel="noopener"
        {...revealProps(0, !!reduced, { y: 16 })}
        className="group mt-8 flex items-center justify-between rounded-xl border border-line bg-surface px-6 py-5 transition-colors duration-300 hover:border-line-strong hover:bg-surface-hover"
      >
        <div>
          <p className="text-sm font-medium text-fg">
            <L en={dicts.en.work.moreProjects} th={dicts.th.work.moreProjects} />
          </p>
          <p className="mt-0.5 font-mono text-xs text-fg/35">zexta.xyz</p>
        </div>
        <span className="text-fg/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-fg">
          <ArrowRight size={18} weight="bold" />
        </span>
      </motion.a>
    </div>
  );
}
