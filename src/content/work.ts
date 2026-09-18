export type Work = { title: string; desc: string; descTh: string; href: string; tags: string[]; featured?: boolean };

export const works: Work[] = [
  {
    title: "Zexta Studio",
    desc: "Discord Bot and website studio · designed for real use, scalable and maintainable",
    descTh: "Discord Bot และสตูดิโอเว็บไซต์ · ออกแบบเพื่อใช้งานจริง มั่นคงและดูแลง่าย",
    href: "https://zexta.xyz/",
    tags: ["Discord Bot", "Website", "Full-stack"],
    featured: true,
  },
  {
    title: "FiguraTH",
    desc: "Community + docs for Figura mod · Thai distribution and cloud tooling.",
    descTh: "คอมมูนิตี้ + เอกสารของโมด Figura · ช่องทางแจกจ่ายไทยและระบบคลาวด์",
    href: "https://zexta.xyz/",
    tags: ["Community", "Docs"],
  },
];
