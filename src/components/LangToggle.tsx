import { setLang } from "../i18n.ts";

export default function LangToggle({ className = "" }: { className?: string }) {
  const btn = (lang: "en" | "th", label: string) => (
    <button
      key={lang}
      onClick={() => setLang(lang)}
      data-act={lang}
      className={`cursor-pointer px-2.5 py-1.5 text-white/40 transition-colors duration-300 hover:text-white ${className}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`flex items-center overflow-hidden rounded-md border border-white/10 text-[11px] font-medium ${className}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {btn("en", "EN")}
      {btn("th", "ไทย")}
    </div>
  );
}