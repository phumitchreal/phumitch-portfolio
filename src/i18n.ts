import React, { createElement } from "react";

export type Lang = "th" | "en";

const LANG_KEY = "crinoid_lang";

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
  document.documentElement.lang = lang;
}

const en = {
  home: {
    tag1: "Expert in prompting AI to build production websites · Vibe Coding ◆ Full-stack",
    tag2: "Discord Bot and website studio · built for real use, scalable and maintainable",
    agents: "AI Agents in Use",
    work: "Work",
    about: "About",
  },
  about: {
    eyebrow: "About",
    title1: "Phumitch Somsri",
    title2: "Guitar",
    desc: "Vibe Coding · prompting AI to write production-grade code, not demos. Currently focused on Full-stack and AI tooling",
    back: "← Back to Home",
  },
  footer: {
    about: "About",
    privacy: "Privacy",
    terms: "Terms",
    acceptableUse: "Acceptable Use",
    status: "Status",
  },
  personalTitle: "Personal Info",
  personal: {
    fullName: ["Full Name", "Mr. Phumitch Somsri"],
    nickname: ["Nickname", "Guitar"],
    birthday: ["Birthday", "11 Aug 2008"],
    location: ["Location", "Nakhon Pathom, Thailand"],
    status: ["Status", "Single"],
    education: ["Education", "Vocational Certificate"],
  },
  doTitle: "What I Do",
  toolkitTitle: "Toolkit",
  contactTitle: "Contact",
  do: [
    "Full-stack · Next.js · React · Astro · Tailwind · Node.js",
    "AI Tooling · Cursor · Claude · Copilot · OpenCode · Antigravity",
    "Product · Discord Bot · Website · Backend Systems",
  ],
  toolkit: { languages: "Languages", frameworks: "Frameworks", tools: "Tools" },
  work: {
    featured: "Featured",
    moreProjects: "More projects",
  },
};

const th: typeof en = {
  home: {
    tag1: "ผู้เชี่ยวชาญด้านการสั่ง AI เขียนเว็บ · Vibe Coding ◆ Full-stack",
    tag2: "Discord Bot และสตูดิโอเว็บไซต์ · สร้างเพื่อใช้งานจริง มั่นคงและดูแลง่าย",
    agents: "AI Agents ที่ใช้",
    work: "ผลงาน",
    about: "เกี่ยวกับ",
  },
  about: {
    eyebrow: "เกี่ยวกับ",
    title1: "ภูมิทัศน์ สมศรี",
    title2: "กีต้า",
    desc: "Vibe Coding · สั่ง AI เขียนโค้ดระดับ production ไม่ใช่แค่เดโม่ ตอนนี้โฟกัส Full-stack และ AI tooling",
    back: "← กลับหน้าแรก",
  },
  footer: {
    about: "เกี่ยวกับ",
    privacy: "ความเป็นส่วนตัว",
    terms: "ข้อกำหนด",
    acceptableUse: "การใช้งานที่เหมาะสม",
    status: "สถานะ",
  },
  personalTitle: "ข้อมูลส่วนตัว",
  personal: {
    fullName: ["ชื่อ-นามสกุล", "นาย ภูมิทัศน์ สมศรี"],
    nickname: ["ชื่อเล่น", "กีต้า"],
    birthday: ["วันเกิด", "11 ส.ค. 2008"],
    location: ["ที่อยู่", "นครปฐม, ประเทศไทย"],
    status: ["สถานะ", "โสด"],
    education: ["การศึกษา", "ประกาศนียบัตรวิชาชีพ"],
  },
  doTitle: "สิ่งที่ฉันทำ",
  toolkitTitle: "ชุดเครื่องมือ",
  contactTitle: "ติดต่อ",
  do: [
    "ทำ Full-stack · Next.js · React · Astro · Tailwind · Node.js",
    "เครื่องมือ AI · Cursor · Claude · Copilot · OpenCode · Antigravity",
    "โปรดักท์ · Discord Bot · เว็บไซต์ · Backend Systems",
  ],
  toolkit: { languages: "ภาษา", frameworks: "เฟรมเวิร์ก", tools: "เครื่องมือ" },
  work: {
    featured: "เด่น",
    moreProjects: "โปรเจกต์เพิ่มเติม",
  },
};

export const dicts = { en, th } as const;
export type Dict = typeof en;

/** Renders a text in both languages; CSS shows only the active one via html[lang]. */
export function L({ en: enText, th: thText }: { en: string; th: string }) {
  return createElement(
    React.Fragment,
    null,
    createElement("span", { "data-lang": "en" }, enText),
    createElement("span", { "data-lang": "th" }, thText)
  );
}