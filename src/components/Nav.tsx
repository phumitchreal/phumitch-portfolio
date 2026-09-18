import { ArrowUpRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle.tsx";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--bg) 80%, transparent)", borderBottom: "1px solid var(--border)" }}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-3">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold tracking-widest"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            ก
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:block" style={{ color: "var(--text)" }}>
            กีต้า — phumitch.space
          </span>
        </a>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: "var(--text-muted)" }}>
            <a href="/portfolio" className="hover:opacity-80" style={{ color: "inherit" }}>ผลงาน</a>
            <a href="/about" className="hover:opacity-80" style={{ color: "inherit" }}>เกี่ยวกับ</a>
          </nav>
          <ThemeToggle />
          <a
            href="#contact"
            className="group inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <span>ติดต่อ</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
