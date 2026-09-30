import { Moon, Sun } from "./FramerIcons.tsx";

/**
 * Light/dark switch. The icon is pure CSS (html[data-theme] selectors in
 * global.css), so there is no hydration flash; the handler only flips the
 * attribute + localStorage — the exact contract the inline head script reads.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme / สลับธีม"
      title="Theme / ธีม"
      className={`theme-toggle flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-line bg-surface text-fg/60 transition-colors duration-300 hover:bg-surface-hover hover:text-fg ${className}`}
    >
      <span className="theme-icon theme-icon--sun">
        <Sun size={13} />
      </span>
      <span className="theme-icon theme-icon--moon">
        <Moon size={13} />
      </span>
    </button>
  );
}

