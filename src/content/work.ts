import type { ImageMetadata } from "astro";
import zextaCover from "../assets/works/zexta.jpg";
import figurathCover from "../assets/works/figurath.jpg";
import phumitchCover from "../assets/works/phumitch.jpg";
import studioLolCover from "../assets/works/studio-lol.jpg";
import fuyuriCover from "../assets/works/fuyuri.jpg";
import avenLabsCover from "../assets/works/aven-labs.jpg";

export type WorkCategory = "bot" | "website" | "community";

export type Work = {
  title: string;
  desc: string;
  descTh: string;
  href?: string;
  tags: string[];
  categories: WorkCategory[];
  year: string;
  role: string;
  roleTh: string;
  monogram: string;
  /** Optional cover image (drop files in src/assets/works/ and import here).
   *  When absent, WorkCover renders the tokenized CSS cover instead. */
  cover?: ImageMetadata;
  featured?: boolean;
};

export const works: Work[] = [
  {
    title: "Zexta Studio",
    desc: "Discord Bot and website studio · designed for real use, scalable and maintainable",
    descTh: "Discord Bot และสตูดิโอเว็บไซต์ · ออกแบบเพื่อใช้งานจริง มั่นคงและดูแลง่าย",
    href: "https://zexta.xyz/",
    tags: ["Discord Bot", "Website", "Full-stack"],
    categories: ["bot", "website"],
    year: "2024",
    role: "Studio · Full-stack",
    roleTh: "สตูดิโอ · Full-stack",
    monogram: "Zx",
    cover: zextaCover,
    featured: true,
  },
  {
    title: "Fuyuri TR",
    desc: "Full-service dev team site · services, VPS hosting, Discord server setup and smart classroom",
    descTh: "เว็บทีมพัฒนาครบวงจร · บริการออกแบบระบบ, VPS Hosting, เซ็ตอัปเซิร์ฟเวอร์ Discord และห้องเรียนสมาร์ท",
    href: "https://fuyuri.net/",
    tags: ["Website", "Services", "Full-stack"],
    categories: ["website"],
    year: "2026",
    role: "Design + Build",
    roleTh: "ออกแบบและพัฒนา",
    monogram: "Fu",
    cover: fuyuriCover,
  },
  {
    title: "Aven Labs",
    desc: "Thai Minecraft mod studio · SmoothThai font mod, open-source, weekly playtests and community",
    descTh: "สตูดิโอม็อด Minecraft ของคนไทย · ม็อดฟอนต์ SmoothThai โอเพ่นซอร์ส ทดสอบเล่นทุกสัปดาห์พร้อมคอมมูนิตี้",
    href: "https://aven-labs.phumitch.space/",
    tags: ["Website", "Minecraft", "Open Source"],
    categories: ["website", "community"],
    year: "2026",
    role: "Design + Build",
    roleTh: "ออกแบบและพัฒนา",
    monogram: "Av",
    cover: avenLabsCover,
  },
  {
    title: "FiguraTH",
    desc: "Community + docs for Figura mod · Thai distribution and cloud tooling.",
    descTh: "คอมมูนิตี้ + เอกสารของโมด Figura · ช่องทางแจกจ่ายไทยและระบบคลาวด์",
    href: "https://figurath.vercel.app/",
    tags: ["Community", "Docs"],
    categories: ["community"],
    year: "2024",
    role: "Community · Docs",
    roleTh: "คอมมูนิตี้ · เอกสาร",
    monogram: "Fg",
    cover: figurathCover,
  },
  {
    title: "phumitch.space",
    desc: "Personal portfolio · editorial design system, dark-first, bilingual.",
    descTh: "เว็บพอร์ตส่วนตัว · ระบบดีไซน์แบบ editorial, dark-first, สองภาษา",
    href: "https://phumitch.space/",
    tags: ["Website", "Design System"],
    categories: ["website"],
    year: "2025",
    role: "Personal site · design + build",
    roleTh: "เว็บส่วนตัว · ออกแบบและพัฒนา",
    monogram: "P.",
    cover: phumitchCover,
  },
  {
    title: "studio.lol",
    desc: "Discord community project · moderation and member tooling.",
    descTh: "โปรเจกต์คอมมูนิตี้ Discord · ระบบมอดดูเลชันและเครื่องมือสมาชิก",
    tags: ["Community", "Discord Bot"],
    categories: ["community", "bot"],
    year: "2025",
    role: "Community · Bot",
    roleTh: "คอมมูนิตี้ · บอท",
    monogram: "sl",
    cover: studioLolCover,
  },
];
