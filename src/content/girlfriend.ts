/**
 * ข้อมูลแฟน
 *
 * ไฟล์นี้เป็น "ค่าเริ่มต้น" เท่านั้น — ข้อมูลจริงถูกเก็บใน Supabase
 * (portfolio_profile.data.girlfriend) และแก้ได้จากหน้า /admin แท็บ "แฟน"
 */

export type Bi = { th: string; en: string };

export type GirlfriendProfile = {
  /** true = ยังเป็นข้อมูลตัวอย่าง (จะแสดงป้ายเตือนบนหน้าเว็บ) */
  isPlaceholder: boolean;
  fullName: Bi;
  nickname: Bi;
  /** YYYY-MM-DD — ใช้คำนวณอายุและวันเกิดอัตโนมัติ */
  birthDate: string;
  hometown: Bi;
  bio: Bi;
  likes: Bi[];
  /** ใส่ path รูป เช่น "/girlfriend.avif" (วางไฟล์ไว้ใน public/) */
  photo?: string;
  /** วันที่เริ่มคบกัน YYYY-MM-DD (ไม่บังคับ) */
  togetherSince?: string;
};

export const girlfriend: GirlfriendProfile = {
  isPlaceholder: true,
  fullName: { th: "ณัฐธิดา ใจดี", en: "Natthida Jaidee" },
  nickname: { th: "นุ่น", en: "Noon" },
  birthDate: "2003-04-18",
  hometown: { th: "กรุงเทพมหานคร", en: "Bangkok, Thailand" },
  bio: {
    th: "คนที่ทำให้ทุกวันธรรมดากลายเป็นเรื่องน่ารัก ชอบดูซีรีส์ตอนดึก ชอบแมว และเก่งเรื่องการทำให้คนรอบตัวยิ้มได้โดยไม่ต้องพยายาม",
    en: "The person who makes ordinary days feel lovely. Loves late-night series, cats, and has a natural gift for making everyone around her smile.",
  },
  likes: [
    { th: "แมว", en: "Cats" },
    { th: "ซีรีส์ตอนดึก", en: "Late-night series" },
    { th: "ชานมไข่มุก", en: "Bubble tea" },
    { th: "ถ่ายรูป", en: "Taking photos" },
    { th: "เพลงเศร้า", en: "Sad songs" },
    { th: "ทะเล", en: "The sea" },
  ],
  togetherSince: "2023-02-14",
  // photo: "/girlfriend.avif",
};
