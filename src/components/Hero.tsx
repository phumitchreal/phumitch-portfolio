import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 40;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      x.set(nx);
      y.set(ny);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* grid + blobs — CSS only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle at 30% 30%, var(--accent), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[520px] w-[520px] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle at 50% 50%, var(--accent), transparent 70%)" }}
      />

      {/* ghost — framer-motion parallax (CSS fallback: static) */}
      <motion.div
        ref={ghostRef as any}
        aria-hidden
        className="hero-ghost pointer-events-none absolute inset-0 flex items-center justify-center select-none will-change-transform"
        style={{ x: springX, y: springY } as any}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease }}
      >
        <span className="translate-x-[-2%] translate-y-[-6%]">GUITAR</span>
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[22%] h-px w-[68%] -translate-x-1/2 overflow-hidden opacity-30"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease, delay: 0.4 }}
        style={{ background: "var(--border-strong)", transformOrigin: "left" }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease, delay: 0 }}
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <img src="/35070.gif" alt="banner" className="h-44 w-full object-cover sm:h-52" loading="eager" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
        </motion.div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.06 }}
              className="text-xs font-bold tracking-[0.45em] uppercase"
              style={{ color: "var(--text-dim)" }}
            >
              สวัสดีครับ — PHUMITCH
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.12 }}
              className="hero-title mt-4"
              style={{ color: "var(--text)" }}
            >
              ผม <span style={{ color: "var(--accent)" }}>กีต้า</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.18 }}
              className="mt-5 border-l-2 pl-4"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>ผู้เชี่ยวชาญด้านการสั่ง AI เขียนเว็บ</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--accent)" }}>
                Vibe Coding <span style={{ color: "var(--text-dim)" }} className="mx-1">◆</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Full-stack</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.24 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a href="#work" className="group inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
                ดูผลงาน <span className="transition-transform group-hover:translate-x-0.5"><ArrowRight size={16} strokeWidth={1.5} /></span>
              </a>
              <a href="https://github.com/phumitchreal" target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-medium hover:opacity-90" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}>
                <span className="inline-flex items-center gap-2">GitHub @phumitchreal<ArrowRight size={16} strokeWidth={1.5} /></span>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-2 text-xs"
            >
              {["Cursor", "Claude", "Copilot", "OpenCode", "Antigravity", "TypeScript", "React", "Astro"].map((tag) => (
                <span key={tag} className="rounded-full border px-3 py-1" style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--surface)" }}>
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <img src="/IMG_3733.jpg" alt="ภูมิทัศน์ สมศรี — กีต้า" className="aspect-[3/4] w-full object-cover object-top" loading="eager" onError={(e) => ((e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/600x800/0a0a0a/722f38?text=GUITAR")} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-xs font-medium tracking-wide text-white/90">นครปฐม, ไทย · ปวช. · 11 ส.ค. 2008</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
