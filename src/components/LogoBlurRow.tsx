import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CalendarBlankIcon as CalendarBlank, CodeIcon as Code, GraduationCapIcon as GraduationCap, HeartIcon as Heart, MapPinIcon as MapPin, RobotIcon as Robot, SmileyIcon as Smiley, SparkleIcon as Sparkle, StackIcon as Stack, UserIcon as User, WrenchIcon as Wrench } from "@phosphor-icons/react";
import { Claude as ClaudeSvg, Cursor as CursorSvg, GithubCopilot, GoogleAntigravity } from "@thesvg/react";
import OpencodeIcon from "./OpencodeIcon.tsx";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Cursor: CursorSvg as any,
  Claude: ClaudeSvg as any,
  Copilot: GithubCopilot as any,
  opencode: OpencodeIcon,
  OpenCode: OpencodeIcon,
  Antigravity: GoogleAntigravity as any,
  Vibe: Sparkle,
  "ชื่อจริง": User,
  "ชื่อเล่น": Smiley,
  "วันเกิด": CalendarBlank,
  "ที่อยู่": MapPin,
  "สถานะ": Heart,
  "การศึกษา": GraduationCap,
  "Full Name": User,
  Nickname: Smiley,
  Birthday: CalendarBlank,
  Location: MapPin,
  Status: Heart,
  Education: GraduationCap,
  AI: Robot,
  Lang: Code,
  FW: Stack,
  Tools: Wrench,
};

const agentLinks: Record<string, string> = {
  Cursor: "https://cursor.com",
  Claude: "https://claude.ai",
  Copilot: "https://github.com/features/copilot",
  Antigravity: "https://antigravity.google",
  opencode: "https://opencode.ai",
  OpenCode: "https://opencode.ai",
};

interface LogoItem {
  name: string;
  href?: string;
  monogram?: string;
  image?: string;
  imageDark?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface Props {
  logos: (LogoItem | string)[];
  desktopCount?: number;
  mobileCount?: number;
  interval?: number;
  stagger?: number;
  forceTheme?: "light" | "dark";
}

export default function LogoBlurRow({ logos: rawLogos, desktopCount = 3, mobileCount = 3, interval = 2.6, stagger = 130, forceTheme }: Props) {
  const logos = rawLogos
    .map((l) => (typeof l === "string" ? { name: l } : l))
    .map((l) => ({
      name: l.name,
      href: l.href || agentLinks[l.name],
      monogram: l.monogram,
      image: l.image,
      imageDark: l.imageDark,
      Icon: l.icon || iconMap[l.name] || null,
    }));
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1024);
  const [indices, setIndices] = useState(() => logos.slice(0, desktopCount).map((_, i) => i));
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const upd = () => setW(window.innerWidth);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    const onVisibility = () => setPageVisible(document.visibilityState !== "hidden");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const isMobile = w < 768;
  const visible = Math.min(isMobile ? mobileCount : desktopCount, logos.length || 1);

  useEffect(() => {
    setIndices(Array.from({ length: visible }, (_, i) => i % logos.length));
  }, [visible, logos.length]);

  useEffect(() => {
    if (logos.length <= visible) return;
    if (paused || !inView || !pageVisible) return;
    const id = window.setInterval(() => {
      for (let i = 0; i < visible; i++) {
        window.setTimeout(() => {
          setIndices((prev) => {
            const next = [...prev];
            next[i] = (next[i] + visible) % logos.length;
            return next;
          });
        }, i * stagger);
      }
    }, interval * 1000);
    return () => window.clearInterval(id);
  }, [visible, logos.length, interval, stagger, paused, inView, pageVisible]);

  if (!logos.length) return null;

  return (
    <div
      ref={ref}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-3 overflow-hidden p-4 sm:gap-6 sm:p-6"
    >
      {Array.from({ length: visible }).map((_, i) => {
        // `indices` can briefly be shorter than `visible` during a resize
        // (mobile → desktop). Fall back to the slot position instead of
        // dereferencing `logos[undefined]`.
        const idx = (indices[i] ?? i) % logos.length;
        const { Icon, name, href, monogram, image, imageDark } = logos[idx];
        return (
          <div key={i} className="group flex flex-1 items-center justify-center min-w-0">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.a
                key={name}
                href={href}
                target={href ? "_blank" : undefined}
                rel={href ? "noopener noreferrer" : undefined}
                aria-label={href ? `${name} — visit website` : undefined}
                title={href ? `${name} — visit website` : undefined}
                initial={{ y: "40%", opacity: 0, filter: "blur(8px)" }}
                animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                exit={{ y: "-40%", opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 grayscale-[80%] opacity-85 transition-all duration-300 ease-in-out group-hover:scale-[1.04] group-hover:translate-y-[-1.5px] group-hover:grayscale-0 group-hover:opacity-100">
                  {forceTheme === "dark" ? (
                    imageDark || image ? (
                      <img
                        src={imageDark || image}
                        alt={name}
                        width={32}
                        height={32}
                        className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 object-contain"
                      />
                    ) : Icon ? (
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 text-white" />
                    ) : (
                      <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-neutral-800 text-[11px] sm:text-[12px] font-bold text-white ring-1 ring-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                        {monogram || name.slice(0, 2)}
                      </span>
                    )
                  ) : forceTheme === "light" ? (
                    image ? (
                      <img
                        src={image}
                        alt={name}
                        width={32}
                        height={32}
                        className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 object-contain"
                      />
                    ) : Icon ? (
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 text-neutral-900" />
                    ) : (
                      <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-white text-[11px] sm:text-[12px] font-bold text-neutral-900 ring-1 ring-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        {monogram || name.slice(0, 2)}
                      </span>
                    )
                  ) : image ? (
                    <>
                      {imageDark ? (
                        <>
                          <img
                            src={image}
                            alt={name}
                            width={32}
                            height={32}
                            className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 object-contain dark:hidden [html[data-theme='dark']_&]:hidden"
                          />
                          <img
                            src={imageDark}
                            alt={name}
                            width={32}
                            height={32}
                            className="hidden h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 object-contain dark:block [html[data-theme='dark']_&]:block"
                          />
                        </>
                      ) : (
                        <img
                          src={image}
                          alt={name}
                          width={32}
                          height={32}
                          className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 rounded-lg object-contain"
                        />
                      )}
                    </>
                  ) : Icon ? (
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0 text-fg" />
                  ) : monogram ? (
                    <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-surface text-[11px] sm:text-[12px] font-bold text-fg ring-1 ring-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:ring-white/[0.1]">
                      {monogram}
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-surface text-[11px] sm:text-[12px] font-bold text-fg ring-1 ring-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:ring-white/[0.1]">
                      {name.slice(0, 2)}
                    </span>
                  )}
                  <span
                    className={`text-[13px] sm:text-[14px] md:text-[15px] font-semibold tracking-[-0.01em] whitespace-nowrap ${
                      forceTheme === "dark"
                        ? "text-white"
                        : forceTheme === "light"
                        ? "text-neutral-900"
                        : "text-fg"
                    }`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {name}
                  </span>
                </div>
              </motion.a>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
