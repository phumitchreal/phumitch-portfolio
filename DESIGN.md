# DESIGN.md — crinoid Design System (Editorial v2)

> Source of truth for the `crinoid` portfolio. Editorial minimalism inspired by `isaeva.xyz`; content from `phumitch.space`.
> Locked choices: **dark-first + working light toggle · Burgundy `#722f38` accent · clean flat canvas · mono micro-labels · Thai-first type**.

---

## 1. Principles

1. **Editorial restraint** — one hero gesture, then stillness. Whitespace > decoration.
2. **Clean canvas + pill** — the background stays flat (no watermark, no glow); expanding pill CTAs are the only signature. Everything else is quiet.
3. **Motion is physics** — `cubic-bezier(.16,1,.3,1)` everywhere; every island guards `useReducedMotion()` and CSS honors `prefers-reduced-motion`. Load-in entrances use the CSS reveal system (`.reveal` + `.reveal-1…5` delays); page heroes stagger eyebrow → title → lede on their own, and legal prose sections stagger automatically.
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
| `--surface` | `#111111` | `#ffffff` | cards / pills |
| `--surface-hover` | `#1a1a1a` | `#f3f6f9` | hover surface |
| `--surface-muted` | `#0f0f0f` | `#f1f5f9` | subtle wells (code) |
| `--line` / `--line-strong` | white 8% / 14% | slate 9% / 16% | hairlines |
| `--text` | `#ffffff` | `#0f172a` | primary fg |
| `--text-body` | `#e8e8e8` | `#334155` | body text |
| `--text-muted` | `#8a8a8a` | `#64748b` | secondary text |
| `--text-dim` | `#6a6a6a` | `#94a3b8` | tertiary / micro labels |
| `--accent` | `#722f38` | `#722f38` | burgundy accent (selection) |
| `--accent-hover` | `#8a3a44` | `#8a3a44` | accent hover · focus ring |
| `--selection-bg` / `--selection-color` | burgundy 60% / white | burgundy 18% / deep maroon | `::selection` |
| `--shadow-card` / `--shadow-panel` | dark elevation | soft slate elevation | cards / panels |

Type tokens: `--ff-body` (RABBIT — self-hosted OTF, Thai + Latin, weights 100/400/700/800 in `src/styles/fonts.css`), `--ff-mono` (system mono stack). No third-party font requests.
Fluid sizes: `--type-hero`, `--type-page`, `--type-h2`.
Motion tokens: `--ease`, `--ease-soft`, `--dur-fast`, `--dur`, `--dur-slow`.

### Tailwind map (in `global.css` `@theme`)

- Colors → utilities: `--color-bg`, `--color-surface*`, `--color-line*`, `--color-fg*`, `--color-accent*` → `bg-surface`, `text-fg/40`, `border-line`, `bg-accent`, …
- Containers → `max-w-shell` (1200px), `max-w-page` (800px), `max-w-hero` (640px).
- Fonts → `font-body` (RABBIT) / `font-mono` (system stack).

---

## 3. Pages & Routing

- `/` — homepage: avatar/ticker + tagline + quick pills + AI-agent ticker, then a "now playing" song card (`components/SongCard.astro`, content lives in `content/song.ts`) + shared footer.
- `/about` — profile header (circle avatar + nickname pill + bio), profile grid, What I Do (3 cards), toolkit ticker + grouped badges, contact cards.
- `/portfolio` — image-forward project grid: a full-width featured tile, a tag-filterable 2-col grid (`All / Bot / Website / Community`), and a more-projects card. Server-rendered `.astro` (no React island) with CSS `.reveal` + a tiny inline filter script.
- `/birthday` — Framer Count_Down port (behavior 1:1); the caption date is computed at build time from the same `nextBirthday()` helper the island counts to.
- `/privacy` `/terms` `/acceptable-use` — shared `Legal.astro` shell + `.prose-editorial` typography.
- `/studio_lol` — hidden immersive splash (video scrim). **Deliberate exception:** fixed-dark styling, not tokenized. Trigger: double-click the hero avatar.

---

## 4. Component Inventory

| Component | Role |
|---|---|
| `layouts/Base.astro` | `<html>` shell: SEO + OG + Twitter meta, theme/lang inline script, `ClientRouter`, skip-link, Preloader, LanguageGate, TurnstileGate |
| `layouts/Legal.astro` | shared legal shell (nav + PageHero + `.prose-editorial` slot + BackHome + footer) |
| `components/SiteNav.astro` | **THE navbar** — logo → `/`, primary links, LangToggle, ThemeToggle, GitHub pill |
| `components/Footer.astro` | shared footer link row (`active` prop highlights the current page) |
| `components/PageHero.astro` | eyebrow + page title + optional lede (`{en,th}` props) |
| `components/BackHome.astro` | "กลับหน้าแรก / Back to Home" pill |
| `components/HeroMotion.tsx` | homepage island: avatar (2-click easter egg → `/studio_lol`), tickers, pills |
| `components/AboutPage.tsx` | about island (4 scroll-reveal sections) |
| `components/WorkGrid.astro` | portfolio grid — filter chips + featured/regular tiles + more-projects card (server-rendered) |
| `components/WorkTile.astro` | single project card (cover, title, year, role, tags, hover arrow) |
| `components/WorkCover.astro` | cover — real `astro:assets` `<Image>` when a file exists, else the tokenized CSS cover fallback |
| `components/BirthdayCountdown.tsx` | Framer Count_Down port; exports `nextBirthday()` |
| `components/BlurredTicker.tsx` · `LogoBlurRow.tsx` | motion tickers (pause out of view) |
| `components/ThemeToggle.tsx` · `LangToggle.tsx` | CSS-driven toggles (no hydration flash) |
| `components/Preloader.tsx` · `LanguageGate.tsx` | first-visit overlays (both announce a `crinoid:*` event when done) |
| `components/TurnstileGate.tsx` | Cloudflare "verify you are human" overlay — only shows when the API says it must (§6) |
| `components/ZTIcon.tsx` | sticker avatar; `.zt-icon` swaps blend mode per theme |
| `lib/motion.ts` | `EASE`, `EASE_OUT`, `DUR`, `revealProps(i, reduced, opts)` |

**Rules:** `SiteNav` / `Footer` are single sources — never inline a second nav or footer. Every island spreads `revealProps(i, reduced)` with `useReducedMotion()`; static `.astro` lists (e.g. `WorkGrid`) use the CSS `.reveal` system instead.

---

## 5. Icons & Vectors

- **UI icons — `@phosphor-icons/react`** (single family, `currentColor`): weight rule **`bold` at ≤14px, `regular` at ≥15px**. Works in islands *and* server-rendered `.astro` (no hydration cost).
- **Brand / tech logos — `@thesvg/react`** (colored; grayscale → color on hover) plus solid custom marks for GitHub / Instagram / Discord / opencode.
- Never mix in other icon sets or hand-drawn chunky strokes.

---

## 6. Security — Cloudflare Turnstile

A "verify you are human" gate **plus** a signed session, so bots never reach the
endpoints and humans never see it twice.

**Overlay order:** `Preloader` (z-9999) → `LanguageGate` (z-10000) → `TurnstileGate` (z-10000).
The gate waits for the other two via the `crinoid:preloader-done` / `crinoid:lang-chosen`
events (with timeouts as a backstop), then asks `GET /api/verify-turnstile` what to do.
It is **fail-open by design**: no keys, unreachable API, blocked script, or a
non-JSON answer (that is what `astro dev` returns) all mean "render nothing".
After 15s a *ข้ามไปก่อน / Skip for now* button appears so nobody is ever trapped.

**Server side (`api/`):**

| File | Role |
|---|---|
| `_turnstile.js` | shared helpers: Siteverify call (5s timeout), hostname/action checks, HMAC-SHA256 cookie sign/verify, client IP, enforcement switch |
| `verify-turnstile.js` | `POST { token }` → 200 + `pv_verified` cookie · `GET` → `{ enforced, verified }` probe · 400/403/405/429/502 for the rest |
| `studio-lol-counts.js` | Discord numbers — `401` without a valid cookie; `Cache-Control: private` when gated |

**Cookie:** `pv_verified`, `HttpOnly; Secure; SameSite=Lax; Path=/`, 12h. The expiry is
inside the signed payload, so a forged or expired value is rejected by `timingSafeEqual`.
Cache: rejections are `no-store`; verified responses are `private` — never CDN-cached.

**Env** (`TURNSTILE_SECRET` — canonical, `TURNSTILE_SECRET_KEY` accepted as an alias ·
`PUBLIC_TURNSTILE_SITE_KEY` · `TURNSTILE_SESSION_SECRET` · optional `TURNSTILE_ALLOWED_HOSTS`
and `TURNSTILE_EXPECTED_HOSTNAME`) — see `.env.example`. Enforcement turns on only when
the secret *and* a 16+ char session secret exist; otherwise the site behaves exactly as
before. `pnpm test:turnstile` exercises all of it (dummy Cloudflare keys included).

**Edge layer:** Cloudflare's DNS is already in front of `phumitch.space`, but DDoS
protection is *not* the app gate — it lives at Vercel's platform firewall (free on every
plan) or behind Cloudflare's orange cloud. Vercel explicitly discourages proxying through
Cloudflare because it blinds Vercel's own firewall; pick one deliberately.

---

## 7. Verification

1. `pnpm astro check` — types must pass.
2. `pnpm build` — static build must pass.
3. Smoke test: `pnpm astro dev --background` → every route in TH + EN, light + dark.
