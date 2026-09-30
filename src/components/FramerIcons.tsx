import type { ComponentType, ReactNode } from "react";

/**
 * Framer-style icon set (matches the Framer "Home" icon:
 * bold 0.125 stroke ratio => strokeWidth 3 @ 24 viewBox, round caps/joins).
 * Color always follows `currentColor`.
 */
export type FramerIcon = ComponentType<{ size?: number; className?: string }>;

function make(name: string, node: ReactNode, sw = 3): FramerIcon {
  const C = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {node}
    </svg>
  );
  C.displayName = name;
  return C;
}

export const Bag = make("Bag", <>
  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
  <path d="M3 6h18" />
  <path d="M16 10a4 4 0 0 1-8 0" />
</>);

export const Book = make("Book", <>
  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
</>);

export const Cake = make("Cake", <>
  <rect x="4" y="13" width="16" height="7" rx="2.6" />
  <path d="M8.5 13V9.6" />
  <path d="M15.5 13V9.6" />
  <path d="M12 13V8.8" />
</>);

export const Chat = make("Chat", <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />);

export const ArrowRight = make("ArrowRight", <>
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</>);

export const ArrowUpRight = make("ArrowUpRight", <>
  <path d="M7 7h10v10" />
  <path d="M7 17 17 7" />
</>);

export const User = make("User", <>
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
</>);

export const Tag = make("Tag", <>
  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
  <path d="M7 7h.01" />
</>);

export const MapPin = make("MapPin", <>
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
  <circle cx="12" cy="10" r="3" />
</>);

export const Heart = make("Heart", <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />);

export const GraduationCap = make("GraduationCap", <>
  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
  <path d="M6 12v5c3 3 9 3 12 0v-5" />
</>);

export const Code = make("Code", <>
  <path d="m18 16 4-4-4-4" />
  <path d="m6 8-4 4 4 4" />
  <path d="m14.5 4-5 16" />
</>);

export const Bot = make("Bot", <>
  <path d="M12 8V4H8" />
  <rect x="4" y="8" width="16" height="12" rx="2" />
  <path d="M2 14h2" />
  <path d="M20 14h2" />
  <path d="M15 13v2" />
  <path d="M9 13v2" />
</>);

export const Layers = make("Layers", <>
  <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
  <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
  <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
</>);

export const Boxes = make("Boxes", <>
  <rect x="3.5" y="3.5" width="7.4" height="7.4" rx="2.2" />
  <rect x="13.1" y="3.5" width="7.4" height="7.4" rx="2.2" />
  <rect x="3.5" y="13.1" width="7.4" height="7.4" rx="2.2" />
  <rect x="13.1" y="13.1" width="7.4" height="7.4" rx="2.2" />
</>, 2.6);

export const Wrench = make("Wrench", <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />);

export const Zap = make("Zap", <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />);

export const Mail = make("Mail", <>
  <rect x="2" y="4" width="20" height="16" rx="2" />
  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
</>);

export const Globe = make("Globe", <>
  <circle cx="12" cy="12" r="10" />
  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
  <path d="M2 12h20" />
</>);

export const Sun = make("Sun", <>
  <circle cx="12" cy="12" r="4" />
  <path d="M12 2v2" />
  <path d="M12 20v2" />
  <path d="m4.93 4.93 1.41 1.41" />
  <path d="m17.66 17.66 1.41 1.41" />
  <path d="M2 12h2" />
  <path d="M20 12h2" />
  <path d="m6.34 17.66-1.41 1.41" />
  <path d="m19.07 4.93-1.41 1.41" />
</>);

export const Moon = make("Moon", <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />);
