# crinoid — ภูมิทัศน์ สมศรี (กีต้า) Portfolio

Editorial personal portfolio — **Astro 7 + React 19 islands + Framer Motion 12** — dark-first with a working light theme, bilingual TH/EN.

- **Design system:** `src/styles/tokens.css` is the single source → Tailwind 4 `@theme` map in `global.css` → utilities like `bg-surface`, `text-fg/40`, `border-line`. No hardcoded colors in pages.
- **Theme:** dark default, real toggle in the navbar (`localStorage["theme"]`, no FOUC; icon swap is pure CSS).
- **Signature:** clean flat canvas + blur tickers + pill CTAs · `cubic-bezier(.16,1,.3,1)` everywhere · `prefers-reduced-motion` respected in CSS and every island.
- **Pages:** `/` · `/about` · `/portfolio` · `/birthday` · `/privacy` · `/terms` · `/acceptable-use` · `/studio_lol` (hidden easter egg — double-click the hero avatar).
- **Deploy:** Vercel (`vercel.json`).

## Dev

```sh
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # astro build
pnpm astro check  # type check
pnpm preview
```

See `DESIGN.md` (design system) and `CLAUDE.md` (agent notes) for the full spec.
