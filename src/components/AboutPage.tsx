import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Boxes,
  Cake,
  Code,
  Globe,
  GraduationCap,
  Heart,
  Layers,
  Mail,
  MapPin,
  Tag,
  User,
  Wrench,
  Zap,
  type FramerIcon,
} from "./FramerIcons.tsx";
import {
  Astro as TheAstro,
  Claude as TheClaude,
  Cursor as TheCursor,
  DirectadminBadge as TheDirectAdmin,
  GithubCopilot as TheCopilot,
  GoogleAntigravity as TheAntigravity,
  Javascript as TheJavascript,
  Nextdotjs as TheNext,
  Nodedotjs as TheNode,
  Python as ThePython,
  React as TheReact,
  Tailwindcss as TheTailwind,
  Typescript as TheTypescript,
} from "@thesvg/react";
import LogoBlurRow from "./LogoBlurRow.tsx";
import { L, dicts } from "../i18n.ts";
import { revealProps } from "../lib/motion.ts";

function SectionHeader({ icon, title }: { icon: FramerIcon; title: React.ReactNode }) {
  const IconCmp = icon;
  return (
    <div className="flex items-center gap-2">
      <span className="text-fg/40">
        <IconCmp size={15} />
      </span>
      <h2 className="text-xs font-semibold tracking-wider text-fg/40">{title}</h2>
    </div>
  );
}

const personal: [keyof typeof dicts.en.personal, FramerIcon][] = [
  ["fullName", User],
  ["nickname", Tag],
  ["birthday", Cake],
  ["location", MapPin],
  ["status", Heart],
  ["education", GraduationCap],
];

const workIcons = [Code, Bot, Layers] as const;

type BrandIcon = React.ComponentType<{ className?: string }>;

const stacks: [keyof typeof dicts.en.toolkit, [string, BrandIcon][], FramerIcon][] = [
  [
    "languages",
    [
      ["TypeScript", TheTypescript],
      ["JavaScript", TheJavascript],
      ["Python", ThePython],
    ],
    Code,
  ],
  [
    "frameworks",
    [
      ["Next.js", TheNext],
      ["React", TheReact],
      ["Astro", TheAstro],
      ["Tailwind", TheTailwind],
      ["Node.js", TheNode],
    ],
    Boxes,
  ],
  [
    "tools",
    [
      ["Cursor", TheCursor],
      ["Claude", TheClaude],
      ["Copilot", TheCopilot],
      ["Antigravity", TheAntigravity],
      ["DirectAdmin", TheDirectAdmin],
    ],
    Wrench,
  ],
];

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

const socials: [string, string, string, BrandIcon][] = [
  ["GitHub", "@phumitchreal", "https://github.com/phumitchreal", GithubIcon],
  ["Instagram", "@null_phumitch", "https://instagram.com/null_phumitch", InstagramIcon],
  ["Discord", "@phumitch.exe", "https://discord.com/users/919878532228841532", DiscordIcon],
  ["Website", "phumitch.space", "https://phumitch.space", Globe as unknown as BrandIcon],
];

export default function AboutPage() {
  const { en: enD, th: thD } = dicts;
  const reduced = !!useReducedMotion();

  return (
    <div className="mt-12 space-y-16">
      {/* Personal Info Grid */}
      <motion.section {...revealProps(0, reduced)}>
        <SectionHeader icon={User} title={<L en={enD.personalTitle} th={thD.personalTitle} />} />
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {personal.map(([key, IconCmp]) => (
            <div
              key={key}
              className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-fg/[0.02] p-4 transition-all duration-300 hover:border-line-strong hover:bg-fg/[0.05]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-fg/[0.04] text-fg/40 transition-colors duration-300 group-hover:border-line-strong group-hover:text-fg/70">
                  <IconCmp size={14} />
                </span>
                <span className="text-xs font-medium text-fg/40 transition-colors duration-300 group-hover:text-fg/60">
                  <L en={enD.personal[key][0]} th={thD.personal[key][0]} />
                </span>
              </div>
              <span className="text-right text-xs font-medium text-fg/85 transition-colors duration-300 group-hover:text-fg">
                <L en={enD.personal[key][1]} th={thD.personal[key][1]} />
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* What I Do */}
      <motion.section {...revealProps(1, reduced)}>
        <SectionHeader icon={Zap} title={<L en={enD.doTitle} th={thD.doTitle} />} />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {enD.do.map((_, i) => {
            const IconCmp = workIcons[i];
            return (
              <div
                key={i}
                className="group relative flex flex-col justify-between rounded-xl border border-line bg-fg/[0.02] p-5 transition-all duration-300 hover:border-line-strong hover:bg-fg/[0.05]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-fg/[0.04] text-fg/40 transition-colors duration-300 group-hover:border-line-strong group-hover:text-fg">
                    <IconCmp size={16} />
                  </span>
                  <span className="font-mono text-xs font-bold text-fg/20 transition-colors duration-300 group-hover:text-fg/40">
                    0{i + 1}
                  </span>
                </div>
                <p className="mt-5 text-xs leading-relaxed text-fg/65 transition-colors duration-300 group-hover:text-fg/90">
                  <L en={enD.do[i]} th={thD.do[i]} />
                </p>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Toolkit */}
      <motion.section {...revealProps(2, reduced)}>
        <SectionHeader icon={Wrench} title={<L en={enD.toolkitTitle} th={thD.toolkitTitle} />} />

        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-fg/[0.03] to-transparent p-2 backdrop-blur-sm">
          <LogoBlurRow logos={["Cursor", "Claude", "Copilot", "Antigravity", "opencode"]} desktopCount={5} mobileCount={3} />
        </div>

        <div className="mt-6 space-y-5">
          {stacks.map(([cat, tags, IconCmp]) => (
            <div key={cat} className="rounded-xl border border-line bg-fg/[0.01] p-4">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-fg/40">
                <IconCmp size={13} className="text-fg/40" />
                <L en={enD.toolkit[cat]} th={thD.toolkit[cat]} />
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map(([tag, TagIcon]) => (
                  <span
                    key={tag}
                    className="group flex items-center gap-2 rounded-lg border border-line bg-fg/[0.03] px-3 py-1.5 font-mono text-xs font-medium text-fg/60 transition-all duration-300 hover:border-line-strong hover:bg-fg/[0.08] hover:text-fg"
                  >
                    <TagIcon className="h-4 w-4 shrink-0 opacity-60 grayscale transition-all duration-300 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Social / Contact Links */}
      <motion.section {...revealProps(3, reduced)}>
        <SectionHeader icon={Mail} title={<L en={enD.contactTitle} th={thD.contactTitle} />} />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {socials.map(([label, handle, href, IconCmp]) => (
            <motion.a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener" : undefined}
              className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-fg/[0.02] p-4 transition-all duration-300 hover:border-line-strong hover:bg-fg/[0.06] hover:shadow-[var(--shadow-card)]"
              {...revealProps(0, reduced)}
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-fg/[0.04] text-fg/50 transition-all duration-300 group-hover:border-line-strong group-hover:bg-fg/10 group-hover:text-fg">
                  <IconCmp className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg/90 transition-colors duration-300 group-hover:text-fg">
                    {label}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-fg/40 transition-colors duration-300 group-hover:text-fg/60">
                    {handle}
                  </p>
                </div>
              </div>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-fg/[0.02] text-fg/40 transition-all duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-bg">
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </motion.a>
          ))}
        </div>
      </motion.section>
    </div>
  );
}


