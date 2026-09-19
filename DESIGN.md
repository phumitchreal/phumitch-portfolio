# DESIGN.md — crinoid Design System

> Source of truth for `crinoid` portfolio. Inspired by `isaeva.xyz` editorial minimalism — content from `phumitch.space`.
> Choices locked 2026-09-17/18: **Both+toggle (dark default) · Burgundy #722f38 accent · Editorial Glass Cards · Monochrome Vector Icons · Thai+Vercel**.

---

## 1. Principles

1. **Editorial restraint** — one hero gesture, then stillness. Whitespace > decoration.
2. **Ghost + pill** — giant watermark wordmark (`color: ghost`) + expanding pill CTAs are the signature. Everything else is quiet.
3. **Motion is physics** — `cubic-bezier(.16,1,.3,1)` everywhere. Respect `prefers-reduced-motion`.
4. **Natural Thai typography** — headings and body in Thai preserve natural letter-spacing (no heavy uppercase or cramped `tracking-tight` forced on Thai script).

---

## 2. Pages & Routing

- `/` — Homepage: Hero rise, animated brand ticker, quick action pills (`/portfolio`, `/about`, Discord).
- `/about` — About Page: Ambient burgundy glow, 2-column personal info grid, 3-card "What I Do", glassmorphism toolkit ticker & badges, monochrome social contact cards.
- `/birthday` — Birthday Countdown (วันเกิด): the ported Framer `Count_Down` component **only** — same props/defaults and motion as the original, nothing else on the page besides the shared navbar/footer.
- `/portfolio` — Selected Work Gallery (`1–2` featured pieces, Isaeva style).
- `/privacy` — Privacy Policy (นโยบายความเป็นส่วนตัว).
- `/terms` — Terms of Service (ข้อกำหนดการให้บริการ).
- `/acceptable-use` — Acceptable Use Policy (นโยบายการใช้งานที่เหมาะสม).

---

## 3. Theme & Styling System

### Theme Colors

- **Primary Background:** `#0a0a0a` (Dark mode default)
- **Accent Color:** `#722f38` (Burgundy glow & selection highlight)
- **Glassmorphism Panels:** `border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]`
- **Text Palette:** Pure white (`#ffffff`), `text-white/70`, muted `text-white/40`, dim `text-white/30`

### Color Tokens (`src/styles/tokens.css`)

```css
--bg: #0a0a0a;
--bg-ghost: #0c0c0c;        /* hero-bg watermark */
--surface: #1a1a1a;          /* pills/cards */
--surface-hover: #242424;
--surface-muted: #161616;
--border: rgba(255,255,255,0.06);
--border-strong: rgba(255,255,255,0.12);
--text: #ffffff;
--text-body: #e0e0e0;
--text-muted: #858585;
--text-dim: #6a6a6a;
--accent: #722f38;           /* burgundy */
--accent-hover: #8a3a44;
```

### Ambient Glow

```html
<div class="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(114,47,56,0.12),transparent)]"></div>
```

---

## 4. Icon & Vector Sources

- **UI & System Icons:** `lucide-react` (`Globe`, `ChevronRight`, `Sparkles`, `ExternalLink`, etc.).
- **Social & Brand Vectors:** Custom solid monochrome SVG paths embedded directly in components with `fill="currentColor"`.
  - **GitHub:** Official monochrome cat vector path (`fill="currentColor"`).
  - **Instagram:** Solid camera glyph (`fill="currentColor"`).
  - **Discord:** Solid Clyde logo (`fill="currentColor"`).
  - **Website / Link:** Lucide `Globe` icon (`stroke="currentColor"`).
- **Rule:** No raw multi-colored SVGs with hardcoded RGB fills in dark containers. Icons inherit text opacity (`text-white/40`) and hover states (`group-hover:text-white/80`).

---

## 5. Component Inventory & Sources

- **`src/components/SiteNav.astro`** — **Single source of truth for the site navbar**, used on every page (`/`, `/about`, `/portfolio`, `/privacy`, `/terms`, `/acceptable-use`). Same markup everywhere: `ZTIcon size={32}` logo → `/`, then `LangToggle` + GitHub pill. Rendered on `/` by `index.astro` above the hero island. Never fork this markup per page — extend the shared component instead.
- **`src/components/Nav.tsx`** — Legacy/standalone floating nav (kept for the theme-toggle experiment, currently not routed).
- **`src/components/HeroMotion.tsx`** — Homepage motion hero island (`Framer Motion`), ghost wordmark, and footer legal/about links. Contains no navbar — the shared `SiteNav.astro` sits above it.
- **`src/components/AboutPage.tsx`** — Main React motion island for `/about` containing personal info grid, numbered service cards, toolkit pill grid, and monochrome social links.
- **`src/components/BirthdayCountdown.tsx`** — Port of Framer `Count_Down` (`framer.com/m/Count-Down-yIqNhX`), the *only* content of `/birthday`. Framer's props and defaults are kept 1:1 (`targetDate`, `fontSize` 60, `gap` 30, `fontFamily` `"Inter"`, `fontWeight` 700, `tint` `#FFFFFF`, `labelColor` `#888888`, `showSeparators` off, `labels` `DAYS/HOURS/MINUTES/SECONDS`) along with its 0.65em×1.1em digit slots, spring roll-over and blur+y entrance. Only three differences: `addPropertyControls` (Framer runtime API) → typed props, the runtime Google-Fonts injection → Inter loaded once in `Base.astro`, and em-based sizing so the default resolves to Framer's 60px on desktop while still fitting a phone. Doesn't render any facts/banner/caption — that is the point.
- **`src/components/WorkGallery.tsx`** — Interactive project gallery for `/portfolio`.
- **`src/components/LogoBlurRow.tsx`** — Infinite horizontal tech logo blur ticker.

---

## 6. Typography

- **Display:** `Anton` 400 for `hero-bg`/`hero-title`.
- **Body/UI:** `Anuphan` / `Satoshi` / `Noto Sans Thai` for glyphs.
- **Thai Typography:** Keep tracking normal (`tracking-normal` / `tracking-wider` max). Never use `tracking-tight` or heavy uppercase transforms on Thai headings.

---

## 7. Workflow & Verification

1. Build & Typecheck: `pnpm build` (runs `astro check && astro build`).
2. Deploy: `git push` → Vercel static deployment.
