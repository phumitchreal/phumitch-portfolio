# DESIGN.md — crinoid Design System (Editorial v2)

> Source of truth for the `crinoid` portfolio. Editorial minimalism inspired by `isaeva.xyz`; content from `phumitch.space`.
> Locked choices: **dark-first + working light toggle · Burgundy `#722f38` accent · ghost wordmark · mono micro-labels · Thai-first type**.

---

## 1. Principles

1. **Editorial restraint** — one hero gesture, then stillness. Whitespace > decoration.
2. **Ghost + pill** — giant watermark wordmark (`--bg-ghost`) + pill CTAs are the signature. Everything else is quiet.
3. **Motion is physics** — `cubic-bezier(.16,1,.3,1)` everywhere; every island guards `useReducedMotion()` and CSS honors `prefers-reduced-motion`.
4. **Tokens only** — no hardcoded colors in pages/components. Missing a color? Add a token.
5. **Thai-first typography** — natural tracking for Thai script (never forced `tracking-tight` or uppercasing).

---

## 2. Theme

- **Dark (default):** `#0a0a0a` background · white foreground · burgundy accent.
- **Light:** `#fafbfc` background · slate-900 foreground · same burgundy accent.
- The toggle lives in `SiteNav` (`ThemeToggle.tsx`); it writes `localStorage["theme"]` and the inline `<head>` script applies it before first paint (no FOUC). The sun/moon icon swap is pure CSS on `html[data-theme]` — no hydration flash.

### Token table (`src/styles/tokens.css`)

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0a0a0a` | `#fafbfc` | page background |
| `--bg-ghost` | `#141414` | `#e9edf2` | ghost wordmark |
| `--surface` | `#111111` | `#ffffff` | cards / pills |
| `--surface-hover` | `#1a1a1a` | `#f3f6f9` | hover surface |
| `--surface-muted` | `#0f0f0f` | `#f1f5f9` | subtle wells (code) |
| `--line` / `--line-strong` | white 8% / 14% | slate 9% / 16% | hairlines |
| `--text` | `#ffffff` | `#0f172a` | primary fg |
| `--text-body` | `#e8e8e8` | `#334155` | body text |
| `--text-muted` | `#8a8a8a` | `#64748b` | secondary text |
| `--text-dim` | `#6a6a6a` | `#94a3b8` | tertiary / micro labels |
| `--accent` | `#722f38` | `#722f38` | burgundy accent (selection glow, ambient) |
| `--accent-hover` | `#8a3a44` | `#8a3a44` | accent hover · focus ring |
| `--accent-glow` | burgundy 14% | burgundy 10% | ambient radial glow |
| `--selection-bg` / `--selection-color` | burgundy 60% / white | burgundy 18% / deep maroon | `::selection` |
| `--shadow-card` / `--shadow-panel` | dark elevation | soft slate elevation | cards / panels |

Type tokens: `--ff-display` (Anton), `--ff-body` (Anuphan → LINE Seed Sans TH), `--ff-mono` (JetBrains Mono).
Fluid sizes: `--type-ghost`, `--type-ghost-sm`, `--type-hero`, `--type-page`, `--type-h2`.
Motion tokens: `--ease`, `--ease-soft`, `--dur-fast`, `--dur`, `--dur-slow`.

### Tailwind map (in `global.css` `@theme`)

- Colors → utilities: `--color-bg`, `--color-surface*`, `--color-line*`, `--color-fg*`, `--color-accent*` → `bg-surface`, `text-fg/40`, `border-line`, `bg-accent`, …
- Containers → `max-w-shell` (1200px), `max-w-page` (800px), `max-w-hero` (640px).
- Fonts → `font-display` / `font-body` / `font-mono`.

---

## 3. Pages & Routing

- `/` — homepage: ghost wordmark (scroll parallax) + avatar/ticker + tagline + quick pills + AI-agent ticker + shared footer.
- `/about` — profile grid, What I Do (3 cards), toolkit ticker + grouped badges, contact cards; ambient burgundy glow (`--accent-glow`).
- `/portfolio` — editorial work list (numbered rows, featured badge, more-projects card).
- `/birthday` — Framer Count_Down port (behavior 1:1); the caption date is computed at build time from the same `nextBirthday()` helper the island counts to.
- `/privacy` `/terms` `/acceptable-use` — shared `Legal.astro` shell + `.prose-editorial` typography.
- `/studio_lol` — hidden immersive splash (video scrim). **Deliberate exception:** fixed-dark styling, not tokenized. Trigger: double-click the hero avatar.

---

## 4. Component Inventory

| Component | Role |
|---|---|
| `layouts/Base.astro` | `<html>` shell: SEO + OG + Twitter meta, theme/lang inline script, `ClientRouter`, skip-link, Preloader, LanguageGate |
| `layouts/Legal.astro` | shared legal shell (nav + PageHero + `.prose-editorial` slot + BackHome + footer) |
| `components/SiteNav.astro` | **THE navbar** — logo → `/`, primary links, LangToggle, ThemeToggle, GitHub pill |
| `components/Footer.astro` | shared footer link row (`active` prop highlights the current page) |
| `components/PageHero.astro` | eyebrow + page title + optional lede (`{en,th}` props) |
| `components/BackHome.astro` | "กลับหน้าแรก / Back to Home" pill |
| `components/HeroMotion.tsx` | homepage island: ghost parallax, avatar (2-click easter egg → `/studio_lol`), tickers, pills |
| `components/AboutPage.tsx` | about island (4 scroll-reveal sections) |
| `components/WorkGallery.tsx` | portfolio island |
| `components/BirthdayCountdown.tsx` | Framer Count_Down port; exports `nextBirthday()` |
| `components/BlurredTicker.tsx` · `LogoBlurRow.tsx` | motion tickers (pause out of view) |
| `components/ThemeToggle.tsx` · `LangToggle.tsx` | CSS-driven toggles (no hydration flash) |
| `components/Preloader.tsx` · `LanguageGate.tsx` | first-visit overlays |
| `components/ZTIcon.tsx` | sticker avatar; `.zt-icon` swaps blend mode per theme |
| `lib/motion.ts` | `EASE`, `EASE_OUT`, `DUR`, `revealProps(i, reduced, opts)` |

**Rules:** `SiteNav` / `Footer` are single sources — never inline a second nav or footer. Every island spreads `revealProps(i, reduced)` with `useReducedMotion()`.

---

## 5. Icons & Vectors

- **UI icons — `@phosphor-icons/react`** (single family, `currentColor`): weight rule **`bold` at ≤14px, `regular` at ≥15px**. Works in islands *and* server-rendered `.astro` (no hydration cost).
- **Brand / tech logos — `@thesvg/react`** (colored; grayscale → color on hover) plus solid custom marks for GitHub / Instagram / Discord / opencode.
- Never mix in other icon sets or hand-drawn chunky strokes.

---

## 6. Verification

1. `pnpm astro check` — types must pass.
2. `pnpm build` — static build must pass.
3. Smoke test: `pnpm astro dev --background` → every route in TH + EN, light + dark.
