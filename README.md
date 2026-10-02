# crinoid — ภูมิทัศน์ สมศรี (กีต้า) Portfolio

Editorial personal portfolio — **Astro 7 + React 19 islands + Framer Motion 12** — dark-first with a working light theme, bilingual TH/EN.

- **Design system:** `src/styles/tokens.css` is the single source → Tailwind 4 `@theme` map in `global.css` → utilities like `bg-surface`, `text-fg/40`, `border-line`. No hardcoded colors in pages.
- **Theme:** dark default, real toggle in the navbar (`localStorage["theme"]`, no FOUC; icon swap is pure CSS).
- **Signature:** clean flat canvas + blur tickers + pill CTAs · `cubic-bezier(.16,1,.3,1)` everywhere · `prefers-reduced-motion` respected in CSS and every island.
- **Pages:** `/` · `/about` · `/portfolio` · `/birthday` · `/privacy` · `/terms` · `/acceptable-use` · `/studio_lol` (hidden easter egg — double-click the hero avatar).
- **Bot protection:** Cloudflare Turnstile "verify you are human" gate (`components/TurnstileGate.tsx`) backed by a signed 12h session cookie — see DESIGN.md §6.
- **Deploy:** Vercel (`vercel.json`).

## Dev

```sh
pnpm install
pnpm dev              # http://localhost:4321
pnpm build            # astro build
pnpm astro check      # type check
pnpm test:turnstile   # verify the Turnstile endpoints (reads .env.local)
pnpm preview
```

## Environment

Copy `.env.example` → `.env.local` (gitignored) for local work, and add the same names
in **Vercel → Project → Settings → Environment Variables** for Production, Preview and
Development.

| Name | Purpose |
|---|---|
| `DISCORD_BOT_TOKEN` | live numbers on the `/studio_lol` easter egg |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget sitekey (public, inlined into the page) |
| `TURNSTILE_SECRET_KEY` | Turnstile widget secret — **server only** |
| `TURNSTILE_SESSION_SECRET` | 32+ byte random string that HMAC-signs the `pv_verified` cookie |

Without the Turnstile keys the gate simply stays off and the site behaves as before —
nothing breaks, nothing is blocked. Rotating `TURNSTILE_SESSION_SECRET` invalidates every
existing session (visitors just verify once more).

### The `/api` endpoints

| Endpoint | Behaviour |
|---|---|
| `POST /api/verify-turnstile` | validates the widget token with Cloudflare, sets the signed cookie |
| `GET /api/verify-turnstile` | `{ enforced, verified }` probe the gate uses to decide |
| `GET /api/studio-lol-counts` | Discord guild numbers — `401` unless the cookie is valid |

These run as Vercel Functions, so they are **not** available under `astro dev`; the gate
detects that and stays out of the way locally.

See `DESIGN.md` (design system + security) and `CLAUDE.md` (agent notes) for the full spec.
