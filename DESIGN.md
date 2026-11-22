# DESIGN.md — crinoid Design System (Apple Editorial v3)

> Source of truth for the `crinoid` portfolio. Apple-inspired light editorial, with a working dark theme.
> Locked choices: **light-first + working dark toggle · Apple blue `#0071e3` accent · flat white canvas with `#f5f5f7` mist sections · glass nav · SF-first system type · Thai-first bilingual copy**.

---

## 1. Principles

1. **One loud gesture** — the giant greeting ticker in the hero. Everything after it stays quiet.
2. **White canvas, mist sections** — pages are white; sections alternate onto `--mist` (`#f5f5f7`) for rhythm. No watermark, glow or ambient shader.
3. **Apple spacing and shape** — 1200px container, 24–32px card radius (28px on work cards), generous vertical padding (`py-24`/`py-32`).
4. **Motion is physics** — `cubic-bezier(.16,1,.3,1)` everywhere. Scroll reveals use a blur + rise (`.reveal`, `[data-reveal]`); every island guards `useReducedMotion()`; CSS honors `prefers-reduced-motion`.
5. **Tokens only** — no hardcoded colors in pages/components. Missing a color? Add a token.
6. **Thai-first typography** — natural tracking for Thai script; never force uppercase or negative tracking on Thai headings.

---

## 2. Theme

- **Light (default):** `#ffffff` background · `#1d1d1f` ink · `#f5f5f7` mist · `#0071e3` accent.
- **Dark:** `#000000` background · `#f5f5f7` ink · `#101012` mist · `#2997ff` accent.
- The toggle lives in `SiteNav` (`ThemeToggle.tsx`) and writes `localStorage["theme"]`. The inline `<head>` script applies it before first paint (no FOUC); the sun/moon swap is pure CSS on `html[data-theme]`.

### Token table (`src/styles/tokens.css`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#ffffff` | `#000000` | page background |
| `--surface` | `#ffffff` | `#1d1d1f` | cards / raised surfaces |
| `--surface-hover` | `#f5f5f7` | `#2a2a2c` | hover surface |
| `--surface-muted` / `--mist` | `#f5f5f7` | `#101012` | mist sections |
| `--mist-strong` | `#e8e8ed` | `#1d1d1f` | mist hover |
| `--line` / `--line-strong` | black 8% / 16% | white 12% / 24% | hairlines |
| `--text` | `#1d1d1f` | `#f5f5f7` | primary ink |
| `--text-body` | `#424245` | `#d2d2d7` | body text |
| `--text-muted` | `#6e6e73` | `#a1a1a6` | secondary text |
| `--text-dim` | `#86868b` | `#86868b` | tertiary / meta |
| `--accent` | `#0071e3` | `#2997ff` | links, primary CTA, focus |
| `--accent-hover` | `#0077ed` | `#47a9ff` | hover |
| `--accent-soft` | blue 10% | blue 14% | tinted pills |
| `--selection-bg` / `--selection-color` | blue 18% / `#0a2540` | blue 30% / white | `::selection` |
| `--shadow-card` / `--shadow-panel` / `--shadow-float` | soft grey elevation | deep black elevation | cards / panels |

Type tokens: `--ff-body` — **Sukhumvit Set** (self-hosted woff2, Thai glyphs included; Thin/Light/Text/Medium/SemiBold/Bold, with 800/900 aliased to Bold), with `SF Pro Display`/`SF Pro Text`, `Inter`, `Noto Sans Thai` fallbacks for glyphs the family lacks. `--ff-mono` is used only for tabular data. Fluid sizes: `--type-hero`, `--type-page`, `--type-h2`.
Motion tokens: `--ease`, `--ease-soft`, `--dur-fast`, `--dur`, `--dur-slow`.

### Tailwind map (in `global.css` `@theme`)

- Colors → `bg-bg`, `bg-surface`, `bg-mist`, `bg-mist-strong`, `text-fg`, `text-fg-body`, `text-fg-muted`, `text-fg-dim`, `border-line`, `text-accent`, …
- Containers → `max-w-shell` (1200px), `max-w-page` (800px), `max-w-hero` (640px), plus `.container-apple` for the standard 1200px + 16/24px gutter.
- Fonts → `font-body` / `font-mono`.
- Buttons → `.btn-primary` (blue pill) and `.btn-ghost` (hairline pill).

---

## 3. Pages & Routing

- `/` — hero greeting ticker + name/tagline + CTAs + AI-agent row → **work showcase** (`HomeWork.astro`, uniform 3-col card grid) → **about strip** (`HomeAbout.astro`, mist section with profile card + What I Do) → now-playing song card → footer.
- `/about` — profile header (large avatar + name + nickname pill + bio), then `AboutPage.tsx`: personal info, What I Do, toolkit + tickers, contact cards.
- Toolkit logo row (`LogoBlurRow`): all 5 brands on mobile and desktop (`mobileCount={5} desktopCount={5}`), staggered entrance (`delay: i * 0.08`, 0.6s), icons `h-8`, text `text-[17px]`, hover: scale 1.04 + small up-shift.
- `/portfolio` — Apple-style page header, filter chips (All / Bot / Website / Community), uniform 2-col card grid (`WorkGrid.astro`), more-projects card.
- `/birthday` — Count_Down port on a mist card; caption date computed at build time from `nextBirthday()`.
- `/privacy` `/terms` `/acceptable-use` — shared `Legal.astro` shell + `.prose-editorial` cards.
- `/studio_lol` — hidden immersive splash (video scrim). **Deliberate exception:** fixed-dark styling, not tokenized. Trigger: double-click the avatar inside the hero status pill.

---

## 4. Component Inventory

| Component | Role |
|---|---|
| `layouts/Base.astro` | `<html>` shell: SEO + OG + Twitter meta, theme/lang inline script, `ClientRouter`, skip-link, Preloader, LanguageGate, TurnstileGate, scroll-reveal observer |
| `layouts/Legal.astro` | shared legal shell (nav + PageHero + `.prose-editorial` slot + BackHome + footer) |
| `components/SiteNav.astro` | **THE navbar** — fixed glass bar (48px), logo + wordmark, primary links incl. Home (`/portfolio`, `/about`, `/birthday`), LangToggle, ThemeToggle, blue GitHub pill · active link is highlighted with `bg-mist` + semibold on the current path; bar tints on scroll · below `md` a hamburger opens a full-screen Apple-style sheet with large type rows, the same active state (accent), a full-width GitHub button, scroll lock, Escape/close handling and focus return |
- **GitHub button sizes** — the hero CTA (`HeroMotion`, `a.btn-primary[href="/portfolio"]`) keeps the default 44px. The navbar pill is compact: `header .btn-primary { height: 1.5rem; font-size: 0.6875rem; padding-inline: 0.5rem; }` (24px/11px). The sheet button is `[data-nav-menu] .btn-primary { height: 2rem; font-size: 0.8125rem; }` (32px/13px). Sizes live in `global.css` — Tailwind `h-*` utilities lose to `.btn-primary` here, so the compact sizes are overridden with higher specificity.
| `components/Footer.astro` | shared footer — brand blurb + Explore / Legal / Elsewhere groups + colophon |
| `components/PageHero.astro` | eyebrow + page title + optional lede (`{en,th}` props) |
| `components/BackHome.astro` | "กลับหน้าแรก / Back to Home" ghost pill |
| `components/HeroMotion.tsx` | homepage island: status pill + avatar easter egg, giant multilingual greeting ticker, tagline, CTAs, AI-agent ticker |
| `components/HomeWork.astro` | homepage work showcase — server-rendered card grid from `content/work.ts` |
| `components/HomeAbout.astro` | homepage about strip — mist section, profile card, What I Do preview |
| `components/AboutPage.tsx` | about island (4 scroll-reveal sections) |
| `components/WorkGrid.astro` | portfolio grid — filter chips + tile grid + more-projects card (server-rendered) |
| `components/WorkTile.astro` | single project card (mist card, 16:10 cover, role/year, tags, hover arrow) |
| `components/WorkCover.astro` | cover — real `astro:assets` `<Image>` when a file exists, else the tokenized CSS cover fallback |
| `components/BirthdayCountdown.tsx` | Framer Count_Down port; exports `nextBirthday()` |
| `components/BlurredTicker.tsx` · `LogoBlurRow.tsx` | motion tickers (pause out of view) |
| `components/ThemeToggle.tsx` · `LangToggle.tsx` | CSS-driven toggles (no hydration flash) |
| `components/Preloader.tsx` · `LanguageGate.tsx` | first-visit overlays (both announce a `crinoid:*` event when done) |
| `components/SmoothScroll.astro` | Lenis wheel smoothing for desktop trackpad/mouse (`smoothWheel`, `lerp 0.1`); native touch stays (`syncTouch: false`); reads `window.__lenis` → `stop()/start()` |
| `components/TurnstileGate.tsx` | Cloudflare "verify you are human" overlay — only shows when the API says it must (§6) |
| `components/ZTIcon.tsx` | sticker avatar; `.zt-icon` swaps blend mode per theme |
| `lib/motion.ts` | `EASE`, `EASE_OUT`, `DUR`, `revealProps(i, reduced, opts)` |

**Rules:** `SiteNav` / `Footer` are single sources — never inline a second nav or footer. Every island spreads `revealProps(i, reduced)` with `useReducedMotion()`; static `.astro` sections use `data-reveal` (observed once in `Base.astro`).

**Smooth scroll:** `SmoothScroll` (Lenis `1.3`) adds floaty wheel behavior on desktop; phones and users with **Reduce motion** (explicit `matchMedia` guard + `respectReducedMotion`) get native scrolling. `SiteNav` stops Lenis while the mobile sheet is open. Anchors still use `scroll-behavior: smooth` (`scroll-padding-top: 4.5rem` for the fixed bar); Lenis itself calls `behavior: "instant"`.

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
4. Visual check: home hero, work grid, about, legal, birthday at 1440px and 390px.
