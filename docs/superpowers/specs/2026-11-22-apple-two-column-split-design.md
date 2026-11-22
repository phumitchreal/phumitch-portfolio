---
title: Apple Two-Column Split (v2)
slug: apple-two-column-split
---

# Design: Apple Two-Column Split (v2)

Decided in conversation: follow Approach B (Two-Column Split), because the two-column structure
is clear, data already exists in `src/content` and component data, and the design stays Apple-clean
with a two-block structure instead of the single-column startup.

## Decisions

1. **Home: Two-Column Strip (Approach B)**
   - **Left (60%):** `HeroMotion` — status pill + "Hello" ticker + name line (ภูมิทัศน์ · กีต้า) + tagline + CTAs (Work/About/Birthday) + AI Agents row + scroll cue. Unchanged.
   - **Right (40%):** `AboutPanel` (new) — replaces current `HomeAbout` as the right-side panel:
     - Portrait (uses `about-photo.jpg`, consistent with About page)
     - Facts row: Location (Nakhon Pathom, Thailand) / Education (Vocational Certificate) / Nickname (Guitar) — from `i18n.ts`
     - What I Do — three small icon cards from `do` (Code/Robot/Stack), white/mist background
     - Socials row: GitHub, Instagram, Discord (website link is in nav/footer) — quick links to contact sources
   - **Below:** `HomeWork` (mosaic) + `SongCard` — unchanged.

2. **About page: Two-Column Layout**
   - **Left (60%):** Portrait + personal facts (Full Name, Nickname, Birthday, Location, Status, Education) + Contact cards (GitHub, Instagram, Discord, Website)
   - **Right (40%):** What I Do (3 cards, existing design) + Toolkit (Languages/Frameworks/Tools, existing design)

3. **Footer:** unchanged (centered, mist background, Explore/Legal/Elsewhere groups).

4. **Navbar:** unchanged (Home/Work/About/Birthday + GitHub + Lang + Theme + active state on current page).

5. **Navbar visible to mobile:** hidden below md — stays as is.

## Files to change

- `src/pages/index.astro` — hero row: left = HeroMotion, right = AboutPanel (flex grid)
- `src/components/HomeAbout.astro` — rewrite as `AboutPanel` (right column): portrait + facts + What I Do + socials row
- `src/components/AboutPage.tsx` — two-column: left = personal facts + contact cards, right = What I Do + Toolkit

## Data sources (ข้อมูลใช้จากเดิม)

- Facts: `i18n.ts` → `personal`, `do`, `personalTitle`, `doTitle`, `toolkitTitle`
- Socials: `AboutPage.tsx` → `socials`, `stacks`
- Hero: `HeroMotion.tsx` + `dicts`

## Verification

- `pnpm astro check` — 0 errors
- `pnpm build` — static build passes
- Smoke: `/`, `/about`, `/portfolio`, `/birthday`, `/privacy` render with content, no errors, visible text present.

## Update (after review)

- Home reverted to a single-column flow: `HeroMotion` full width → `HomeWork` → `HomeAbout` as a full-width section → `SongCard`.
- `HomeAbout.astro` is a two-column *section* (portrait + socials on the left, copy + facts + What I Do + CTA on the right), not a hero-side panel.
- The two-column layout stays on the About page only (`AboutPage.tsx`, `grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`).
- `Preloader` white-screen bug fixed: the sessionStorage-guarded early return now also clears `active`, so reloads no longer leave the full-screen white overlay mounted.

