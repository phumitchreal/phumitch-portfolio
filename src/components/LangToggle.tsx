import { setLang } from "../i18n.ts";

export default function LangToggle({ className = "" }: { className?: string }) {
  const btn = (lang: "en" | "th", label: string) => (
    <button
      key={lang}
      onClick={() => setLang(lang)}
      data-act={lang}
      className={`cursor-pointer rounded-full px-2 py-1 text-fg-muted transition-colors duration-200 hover:text-fg ${className}`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="flex items-center rounded-full bg-mist p-0.5 text-[11px] font-medium"
      aria-label="Language"
    >
      {btn("en", "EN")}
      {btn("th", "ไทย")}
    </div>
  );
}
