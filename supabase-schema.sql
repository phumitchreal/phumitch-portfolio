-- ==============================================================================
-- Supabase Schema & Initial Data for Phumitch Portfolio (phumitch.space)
-- Run this in your Supabase Project: SQL Editor -> New query -> Paste & Run
-- ==============================================================================

-- 1. Table: Admin Users (ผู้ดูแลระบบ)
create table if not exists public.portfolio_admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  salt text not null,
  session_token text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.portfolio_admins enable row level security;

-- Policies for portfolio_admins
drop policy if exists "Allow select portfolio_admins" on public.portfolio_admins;
create policy "Allow select portfolio_admins" on public.portfolio_admins for select using (true);

drop policy if exists "Allow insert portfolio_admins" on public.portfolio_admins;
create policy "Allow insert portfolio_admins" on public.portfolio_admins for insert with check (true);

drop policy if exists "Allow update portfolio_admins" on public.portfolio_admins;
create policy "Allow update portfolio_admins" on public.portfolio_admins for update using (true);


-- 2. Table: Projects / Works (ผลงาน)
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  desc_en text default '' not null,
  desc_th text default '' not null,
  href text default '',
  tags text[] default '{}'::text[] not null,
  categories text[] default '{website}'::text[] not null,
  year text default '2026' not null,
  role_en text default '' not null,
  role_th text default '' not null,
  monogram text default '' not null,
  cover_url text default '',
  featured boolean default false not null,
  sort_order integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.portfolio_projects enable row level security;

-- Policies for portfolio_projects
drop policy if exists "Allow public read portfolio_projects" on public.portfolio_projects;
create policy "Allow public read portfolio_projects" on public.portfolio_projects for select using (true);

drop policy if exists "Allow insert portfolio_projects" on public.portfolio_projects;
create policy "Allow insert portfolio_projects" on public.portfolio_projects for insert with check (true);

drop policy if exists "Allow update portfolio_projects" on public.portfolio_projects;
create policy "Allow update portfolio_projects" on public.portfolio_projects for update using (true);

drop policy if exists "Allow delete portfolio_projects" on public.portfolio_projects;
create policy "Allow delete portfolio_projects" on public.portfolio_projects for delete using (true);


-- 3. Table: Profile & Personal Info (ข้อมูลส่วนตัวและโปรไฟล์)
create table if not exists public.portfolio_profile (
  id text primary key default 'main',
  data jsonb not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.portfolio_profile enable row level security;

-- Policies for portfolio_profile
drop policy if exists "Allow public read portfolio_profile" on public.portfolio_profile;
create policy "Allow public read portfolio_profile" on public.portfolio_profile for select using (true);

drop policy if exists "Allow insert portfolio_profile" on public.portfolio_profile;
create policy "Allow insert portfolio_profile" on public.portfolio_profile for insert with check (true);

drop policy if exists "Allow update portfolio_profile" on public.portfolio_profile;
create policy "Allow update portfolio_profile" on public.portfolio_profile for update using (true);


-- ==============================================================================
-- Initial Seed Data (ข้อมูลเริ่มต้น)
-- ==============================================================================

-- Clear old initial records if needed and insert fresh seeds
delete from public.portfolio_projects;

insert into public.portfolio_projects (
  title, desc_en, desc_th, href, tags, categories, year, role_en, role_th, monogram, cover_url, featured, sort_order
) values
(
  'Zexta Studio',
  'Discord Bot and website studio · designed for real use, scalable and maintainable',
  'Discord Bot และสตูดิโอเว็บไซต์ · ออกแบบเพื่อใช้งานจริง มั่นคงและดูแลง่าย',
  'https://zexta.xyz/',
  array['Discord Bot', 'Website', 'Full-stack'],
  array['bot', 'website'],
  '2024',
  'Studio · Full-stack',
  'สตูดิโอ · Full-stack',
  'Zx',
  '/works/zexta.jpg',
  true,
  0
),
(
  'Fuyuri TR',
  'Full-service dev team site · services, VPS hosting, Discord server setup and smart classroom',
  'เว็บทีมพัฒนาครบวงจร · บริการออกแบบระบบ, VPS Hosting, เซ็ตอัปเซิร์ฟเวอร์ Discord และห้องเรียนสมาร์ท',
  'https://fuyuri.net/',
  array['Website', 'Services', 'Full-stack'],
  array['website'],
  '2026',
  'Design + Build',
  'ออกแบบและพัฒนา',
  'Fu',
  '/works/fuyuri.jpg',
  false,
  1
),
(
  'Aven Labs',
  'Thai Minecraft mod studio · SmoothThai font mod, open-source, weekly playtests and community',
  'สตูดิโอม็อด Minecraft ของคนไทย · ม็อดฟอนต์ SmoothThai โอเพ่นซอร์ส ทดสอบเล่นทุกสัปดาห์พร้อมคอมมูนิตี้',
  'https://aven-labs.phumitch.space/',
  array['Website', 'Minecraft', 'Open Source'],
  array['website', 'community'],
  '2026',
  'Design + Build',
  'ออกแบบและพัฒนา',
  'Av',
  '/works/aven-labs.jpg',
  false,
  2
),
(
  'FiguraTH',
  'Community + docs for Figura mod · Thai distribution and cloud tooling.',
  'คอมมูนิตี้ + เอกสารของโมด Figura · ช่องทางแจกจ่ายไทยและระบบคลาวด์',
  'https://figurath.vercel.app/',
  array['Community', 'Docs'],
  array['community'],
  '2024',
  'Community · Docs',
  'คอมมูนิตี้ · เอกสาร',
  'Fg',
  '/works/figurath.jpg',
  false,
  3
),
(
  'phumitch.space',
  'Personal portfolio · Apple-inspired design system, light-first, bilingual.',
  'เว็บพอร์ตส่วนตัว · ระบบดีไซน์แบบ Apple, light-first, สองภาษา',
  'https://phumitch.space/',
  array['Website', 'Design System'],
  array['website'],
  '2025',
  'Personal site · design + build',
  'เว็บส่วนตัว · ออกแบบและพัฒนา',
  'P.',
  '/works/phumitch.jpg',
  false,
  4
),
(
  'studio.lol',
  'Discord community project · moderation and member tooling.',
  'โปรเจกต์คอมมูนิตี้ Discord · ระบบมอดดูเลชันและเครื่องมือสมาชิก',
  '',
  array['Community', 'Discord Bot'],
  array['community', 'bot'],
  '2025',
  'Community · Bot',
  'คอมมูนิตี้ · บอท',
  'sl',
  '/works/studio-lol.jpg',
  false,
  5
);

-- Seed Profile Data
insert into public.portfolio_profile (id, data, updated_at)
values (
  'main',
  '{
    "personal": {
      "fullName": ["Mr. Phumitch Somsri", "นาย ภูมิทัศน์ สมศรี"],
      "nickname": ["Guitar", "กีต้า"],
      "birthday": ["11 Aug 2008", "11 ส.ค. 2551"],
      "location": ["Nakhon Pathom, Thailand", "นครปฐม, ประเทศไทย"],
      "status": ["Single", "โสด"],
      "education": ["Vocational Certificate", "ประกาศนียบัตรวิชาชีพ"]
    },
    "home": {
      "tag1_en": "Expert in prompting AI to build production websites · Vibe Coding ◆ Full-stack",
      "tag1_th": "ผู้เชี่ยวชาญด้านการสั่ง AI เขียนเว็บ · Vibe Coding · Full-stack",
      "tag2_en": "Discord Bot and website studio · built for real use, scalable and maintainable",
      "tag2_th": "Discord Bot และสตูดิโอเว็บไซต์ · สร้างเพื่อใช้งานจริง มั่นคงและดูแลง่าย"
    },
    "about": {
      "desc_en": "Vibe Coding · prompting AI to write production-grade code, not demos. Currently focused on Full-stack and AI tooling",
      "desc_th": "Vibe Coding · สั่ง AI เขียนโค้ดระดับ production ไม่ใช่แค่เดโม่ ตอนนี้โฟกัส Full-stack และ AI tooling"
    },
    "what_i_do": [
      {
        "en": "Full-stack · Next.js · React · Astro · Tailwind · Node.js",
        "th": "ทำ Full-stack · Next.js · React · Astro · Tailwind · Node.js"
      },
      {
        "en": "AI Tooling · Cursor · Claude · Copilot · OpenCode · Antigravity",
        "th": "เครื่องมือ AI · Cursor · Claude · Copilot · OpenCode · Antigravity"
      },
      {
        "en": "Product · Discord Bot · Website · Backend Systems",
        "th": "โปรดักท์ · Discord Bot · เว็บไซต์ · Backend Systems"
      }
    ],
    "socials": [
      { "label": "GitHub", "handle": "@phumitchreal", "href": "https://github.com/phumitchreal" },
      { "label": "Instagram", "handle": "@null_phumitch", "href": "https://instagram.com/null_phumitch" },
      { "label": "Discord", "handle": "@phumitch.exe", "href": "https://discord.com/users/919878532228841532" },
      { "label": "Website", "handle": "phumitch.space", "href": "https://phumitch.space" }
    ]
  }'::jsonb,
  now()
)
on conflict (id) do update set
  data = excluded.data,
  updated_at = now();
