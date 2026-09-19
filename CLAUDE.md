# CLAUDE.md — crinoid

> Astro + React + Framer Motion portfolio for **ภูมิทัศน์ สมศรี — กีต้า** — cleanest editorial, inspired by `isaeva.xyz`, content from `phumitch.space`.

## Stack

- **Astro 4** — static-first, islands architecture. Only `Hero`, `Nav`, `ThemeToggle` hydrate (`client:load`). Everything else is `.astro` static.
- **React 18** — motion islands only.
- **Framer Motion 11** — parallax, wordmark trace, CTA expand, scroll reveals. Respects `prefers-reduced-motion`.
- **Tailwind CSS 3** — tokens in `src/styles/tokens.css` + `tailwind.config.mjs`.
- **TypeScript strict** — no `any`.
- **Deploy:** Vercel (`vercel.json` → `framework: astro`, static output).

## Commands

```bash
pnpm dev          # astro dev --host --port 4321
pnpm build        # astro check && astro build
pnpm preview      # astro preview
pnpm astro check  # type check
```

When starting dev server, use background mode:

```
astro dev --background
```

Manage with `astro dev stop`, `astro dev status`, `astro dev logs`.

Node ≥ 20, pnpm ≥ 8.

## Project Map

```
public/
  IMG_3733.jpg        # portrait (from phumitch.space)
  35070.gif           # banner (kept per user choice)
  favicon.svg
src/
  layouts/Base.astro  # <html lang="th">, SEO, theme script, ClientRouter
  pages/
    index.astro       # homepage → SiteNav + HeroMotion
    about.astro       # full info-grid + skills detail
    birthday.astro    # /birthday → SiteNav + Count_Down port (component only)
    portfolio.astro   # selected work gallery
    privacy.astro / terms.astro / acceptable-use.astro  # legal, same shell
  components/
    SiteNav.astro     # THE navbar — shared by all pages (ZTIcon + LangToggle + GitHub pill)
    ZTIcon.tsx        # logo asset render (zt-icon.png, mix-blend lighten)
    HeroMotion.tsx    # client:load — homepage hero island (no navbar inside)
    Nav.tsx           # legacy floating nav + ThemeToggle.tsx — not routed
    AboutPage.tsx     # client:load — /about island
    BirthdayCountdown.tsx  # client:load — Framer Count_Down port (targets next 11 Aug)
    WorkGallery.tsx   # client:load — /portfolio island
    LangToggle.tsx    # client:load — EN/ไทย switch (localStorage → html[lang])
    Preloader.tsx     # client:load — first-visit preloader
    LanguageGate.tsx  # client:load — first-visit language gate
  styles/
    tokens.css        # CSS vars: colors, type scale, easing
  content/
    work.ts           # Zexta + future projects data
astro.config.mjs      # @astrojs/react + @astrojs/tailwind
tailwind.config.mjs   # extends tokens
DESIGN.md             # design system source of truth
```

## Conventions

- **Conventional Commits** — `feat:`, `fix:`, `chore:`, `docs:`.
- **Islands rule:** Only add `client:load` when motion/interactivity requires JS. Prefer `.astro` otherwise.
- **Navbar rule:** `src/components/SiteNav.astro` is the single navbar for **every** page (`/`, `/about`, `/portfolio`, `/privacy`, `/terms`, `/acceptable-use`). Never inline a second nav bar in a page or island — edit `SiteNav.astro` once and all pages follow.
- **No `any`, no `// @ts-ignore`.** Use `type`/`interface`.
- **Copy:** Thai primary (`สวัสดีครับ`, `ข้อมูล`, `ผลงาน`). Keep English for tech terms (`Vibe Coding`, `Full-stack`). `lang="th"` on `<html>`.
- **Assets:** Optimize with `astro:assets` (`Image` component). Keep originals in `public/` for direct link compatibility with `phumitch.space`.
- **Motion guard:** Every Framer Motion component checks `useReducedMotion()` — if true, skip trace/parallax, use instant opacity.
- **Theme:** Toggle writes `localStorage["theme"]` = `dark|light`, reads on inline script in `<head>` to avoid FOUC. Default `dark`.

## Content Source

All copy/links from `https://phumitch.space/` (2026-09-17 snapshot):

- Name: นายภูมิทัศน์ สมศรี / กีต้า / 11 ส.ค. 2008 / นครปฐม / โสด / ปวช.
- Tagline: `ผู้เชี่ยวชาญด้านการสั่ง AI เขียนเว็บ — Vibe Coding ◆ Full-stack`
- Links: `github.com/phumitchreal`, `instagram.com/null_phumitch`, `discord.com/users/919878532228841532`, `buymeacoffee.com/phumitch`, `zexta.xyz`
- Skills: `Cursor Claude Copilot OpenCode Antigravity | TypeScript JavaScript Python | Next.js React Astro Tailwind Node.js | DirectAdmin`
- Project: `Zexta Studio — สตูดิโอพัฒนา Discord Bot และเว็บไซต์`

## Design Reference

- Visual system copies `isaeva.xyz` (see `DESIGN.md:1`) — editorial restraint, ghost wordmark, pill CTA expand, `cubic-bezier(.16,1,.3,1)`.
- Do not reintroduce bento `5-col card-grid` or heavy shadows. Whitespace > decoration.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Workflow

1. Edit copy in `src/pages/index.astro` and `src/content/work.ts`.
2. Tokens in `DESIGN.md` → `src/styles/tokens.css` → `tailwind.config.mjs`.
3. Verify: `pnpm astro check && pnpm build` must pass before commit.
4. Deploy via `git push` → Vercel auto-build.

## Notes for Agents

- Check `DESIGN.md` before touching colors/type/motion.
- pnpm is required (npm will work but lockfile is `pnpm-lock.yaml`).
- Windows-safe: avoid `head`, use `Select-Object` in bash; prefer `default.read`/`default.edit` over `bash` file ops.
