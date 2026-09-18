import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Bot, Code, Cpu, Rocket, Sparkles, User, Smile, Calendar, MapPin, Heart, GraduationCap, Layers, Wrench } from "lucide-react";
import { Claude as ClaudeSvg, Cursor as CursorSvg, GithubCopilot, GoogleAntigravity } from "@thesvg/react";
import OpencodeIcon from "./OpencodeIcon.tsx";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Cursor: CursorSvg as any,
  Claude: ClaudeSvg as any,
  Copilot: GithubCopilot as any,
  opencode: OpencodeIcon,
  OpenCode: OpencodeIcon,
  Antigravity: GoogleAntigravity as any,
  Vibe: Sparkles,
  "ชื่อจริง": User,
  "ชื่อเล่น": Smile,
  "วันเกิด": Calendar,
  "ที่อยู่": MapPin,
  "สถานะ": Heart,
  "การศึกษา": GraduationCap,
  "Full Name": User,
  Nickname: Smile,
  Birthday: Calendar,
  Location: MapPin,
  Status: Heart,
  Education: GraduationCap,
  AI: Bot,
  Lang: Code,
  FW: Layers,
  Tools: Wrench,
};

interface Props {
  logos: { name: string }[] | string[];
  desktopCount?: number;
  mobileCount?: number;
  interval?: number;
  stagger?: number;
}

export default function LogoBlurRow({ logos: rawLogos, desktopCount = 3, mobileCount = 3, interval = 2.6, stagger = 130 }: Props) {
  const logos = rawLogos.map((l) => (typeof l === "string" ? { name: l } : l)).map((l) => ({ name: l.name, Icon: (iconMap[l.name] || Code) }));
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

  const isMobile = w < 640;
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
      className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-10 overflow-hidden p-6"
    >
      {Array.from({ length: visible }).map((_, i) => {
        const { Icon, name } = logos[indices[i] % logos.length];
        return (
          <div key={i} className="group flex flex-1 items-center justify-center min-w-0">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={name}
                initial={{ y: "24%", opacity: 0, filter: "blur(6px)" }}
                animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                exit={{ y: "-24%", opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3 grayscale-[80%] opacity-85 transition-all duration-300 ease-in-out group-hover:grayscale-0 group-hover:opacity-100">
                  <Icon className="h-7 w-7 shrink-0 text-white" />
                  <span className="text-[16px] font-semibold tracking-[-0.01em] text-white whitespace-nowrap" style={{ fontFamily: "var(--font-body)" }}>{name}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
