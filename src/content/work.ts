import type { ImageMetadata } from "astro";
import zextaCover from "../assets/works/zexta.jpg";
import figurathCover from "../assets/works/figurath.jpg";
import phumitchCover from "../assets/works/phumitch.jpg";
import studioLolCover from "../assets/works/studio-lol.jpg";

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
