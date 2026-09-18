const items = [
  "Cursor",
  "Claude",
  "Copilot",
  "OpenCode",
  "Antigravity",
  "TypeScript",
  "JavaScript",
  "Python",
  "Next.js",
  "React",
  "Astro",
  "Tailwind",
  "Node.js",
  "DirectAdmin",
  "Vibe Coding",
  "Full-stack",
];

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-t py-2.5" style={{ borderColor: "var(--border)" }}>
      <div className="marquee-track flex w-max gap-8 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={`${t}-${i}`} className="flex items-center gap-8 text-[11px] tracking-[0.16em] uppercase" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            {t} <span style={{ color: "var(--border-strong)" }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
