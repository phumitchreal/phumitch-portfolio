# CLAUDE.md — crinoid

> Astro 7 + React 19 islands + Framer Motion 12 + Tailwind 4 portfolio for **ภูมิทัศน์ สมศรี — กีต้า** (Phumitch Somsri / Guitar).
> Editorial v2 redesign: dark-first + working light toggle, real token system, shared shell components.

## Stack (verified)

- **Astro 7.3.3** — static-first, islands. Only motion/interactive components hydrate (`client:load`).
- **React 19.3** islands · **Framer Motion 12.23** · **Tailwind 4.3** (`@tailwindcss/vite`) · **TypeScript strict**.
- **Deploy:** Vercel (`vercel.json` → `framework: astro`, static build).

## Commands

```bash
pnpm dev          # astro dev (http://localhost:4321)
pnpm build        # astro build
pnpm astro check  # type check
```

Dev server in background: `astro dev --background` → manage with `astro dev status|stop|logs`.

## Project Map

```
src/
  layouts/Base.astro      # <html> shell: SEO/OG, theme+lang script, ClientRouter, skip-link, overlays
  layouts/Legal.astro     # legal shell (privacy/terms/acceptable-use)
  pages/
    index.astro           # homepage → SiteNav + HeroMotion + Footer
    about.astro           # PageHero + AboutPage + BackHome
    portfolio.astro       # PageHero + WorkGallery + BackHome
    birthday.astro        # Count_Down port; caption date computed via nextBirthday()
    privacy.astro · terms.astro · acceptable-use.astro   # use Legal.astro
    studio_lol.astro      # hidden easter egg — intentionally fixed-dark video splash
  components/
    SiteNav.astro         # THE navbar — logo, primary links, LangToggle, ThemeToggle, GitHub
    Footer.astro          # shared footer (active prop)
    PageHero.astro        # eyebrow + title + lede ({en,th} props)
    BackHome.astro        # back-home pill
    SongCard.astro         # homepage "now playing" card — paste lyrics in content/song.ts
    HeroMotion.tsx        # homepage island — avatar easter egg, tickers, pills
    AboutPage.tsx         # /about island (4 reveal sections)
    WorkGallery.tsx       # /portfolio island
    BirthdayCountdown.tsx # Framer Count_Down port + nextBirthday()
    BlurredTicker.tsx · LogoBlurRow.tsx · ZTIcon.tsx
    ThemeToggle.tsx · LangToggle.tsx · Preloader.tsx · LanguageGate.tsx
    OpencodeIcon.tsx
  lib/motion.ts           # EASE / DUR / revealProps(i, reduced) — all islands use these
  styles/tokens.css       # design tokens — SINGLE SOURCE (see DESIGN.md §2)
  styles/global.css       # tailwind import + @theme map + editorial classes + prose + skip link
  content/work.ts · content/song.ts · i18n.ts
```

## Conventions

- **Tokens only.** Style via the Tailwind map (`bg-surface`, `text-fg/40`, `border-line`, `max-w-page`…). Never hardcode hexes in pages/components — if a value is missing, add it to `tokens.css` + the `@theme` map.
- **Icons:** UI icons — `@phosphor-icons/react` (one family; weight **`bold` at ≤14px, `regular` at ≥15px**; color via `currentColor`). Brand/tech logos — `@thesvg/react` + solid custom marks (GitHub / Instagram / Discord / opencode). Never mix other icon sets.
- **Islands rule:** `client:load` only when motion/interactivity requires JS; otherwise plain `.astro`.
- **Motion guard:** every island uses `useReducedMotion()` and spreads `revealProps(i, reduced)` from `lib/motion.ts`. CSS honors `prefers-reduced-motion` globally.
- **Load-in animation:** static markup gets `.reveal` (add `.reveal-1…5` to stagger); page heroes (`PageHero`) and legal prose sections animate automatically — don't hand-roll animation in markup.
- **Navbar/footer rule:** `SiteNav.astro` and `Footer.astro` are single sources shared by every page. Never inline a second nav/footer — extend the shared components.
- **Theme:** dark is the default (DESIGN.md); `ThemeToggle` only writes `localStorage["theme"]` + `data-theme`; the inline head script reads it (no FOUC). Everything repaints from tokens.
- **Language:** `<html lang="th">` default; bilingual content via `data-lang` spans in `.astro` and the `L()` helper in islands (`i18n.ts`); `LangToggle` writes `localStorage["crinoid_lang"]`.
- **Copy:** Thai primary (สวัสดีครับ, ข้อมูล, ผลงาน). Keep English for tech terms (Vibe Coding, Full-stack).
- **studio_lol exception:** fixed-dark immersive page — do not tokenize its colors.
- **No `any`, no `@ts-ignore`.** Use `type`/`interface`.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Run `pnpm astro check && pnpm build` before committing.

## Easter Egg

`/studio_lol` is hidden: double-click the hero avatar on `/` (flash overlay → route). Keep it the only trigger.

## Content Source

All copy/links from `https://phumitch.space/` snapshot:

- Name: นายภูมิทัศน์ สมศรี / กีต้า / 11 ส.ค. 2008 / นครปฐม / โสด / ปวช.
- Tagline: `ผู้เชี่ยวชาญด้านการสั่ง AI เขียนเว็บ — Vibe Coding ◆ Full-stack`
- Links: `github.com/phumitchreal`, `instagram.com/null_phumitch`, `discord.com/users/919878532228841532`, `zexta.xyz`
- Skills: `Cursor Claude Copilot OpenCode Antigravity | TypeScript JavaScript Python | Next.js React Astro Tailwind Node.js | DirectAdmin`

## Documentation

Full documentation: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Notes for Agents

- Check `DESIGN.md` before touching colors/type/motion — it is the source of truth.
- pnpm is required (lockfile is `pnpm-lock.yaml`). Windows-safe: prefer `Select-Object` over `head`.
- Keep `src/styles/tokens.css` and the `@theme` map in `global.css` in sync.
