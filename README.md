# crinoid — ภูมิทัศน์ สมศรี (กีต้า) Portfolio

Cleanest editorial portfolio — **Astro + React + Framer Motion** — inspired by `isaeva.xyz`, content from `phumitch.space`.

- **Dark editorial default** (`#0a0a0a` + burgundy `#722f38`) + light toggle (`#fafbfc`), `localStorage` + `prefers-color-scheme`
- **Hero:** `35070.gif` banner + `IMG_3733.jpg` portrait kept, giant `GUITA` ghost watermark, parallax + trace motion
- **Stack:** Astro 7 + React 19 + Framer Motion 13 + Tailwind 4 + TypeScript 5
- **Pages:** `/` (hero: ticker + pills + agent blur row) · `/about` (info-grid + toolkit) · `/birthday` (Framer Count_Down port, component only) · `/portfolio` (selected work) · `/privacy` `/terms` `/acceptable-use` (legal, shared shell)
- **Deploy:** Vercel (`vercel.json`)

## Dev

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # → dist/
pnpm preview
pnpm astro check
```

See `CLAUDE.md` (agent memory) and `DESIGN.md` (tokens) for the full spec.
