/**
 * ข้อมูลแฟน + หน้า /love
 *
 * ไฟล์นี้เป็น "ค่าเริ่มต้น" เท่านั้น — ข้อมูลจริงถูกเก็บใน Supabase
 * (portfolio_profile.data.girlfriend) และแก้ได้จากหน้า /admin แท็บ "แฟน"
 */

export type Bi = { th: string; en: string };

export type LoveMoment = { date: Bi; title: Bi; desc: Bi };

export type LoveContent = {
  hero: { eyebrow: Bi; title: Bi; subtitle: Bi; hint: Bi };
  reasons: Bi[];
  moments: LoveMoment[];
  letter: Bi;
  closing: Bi;
};

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
  /** เนื้อหาหน้า /love */
  love: LoveContent;
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
  love: {
    hero: {
      eyebrow: { th: "หน้าเว็บเล็ก ๆ ที่ตั้งใจทำให้คนหนึ่งคน", en: "A tiny website made for one person" },
      title: { th: "สำหรับเธอ", en: "For you" },
      subtitle: {
        th: "ทุกวันที่มีเธอ ธรรมดาก็กลายเป็นเรื่องพิเศษ",
        en: "Every day with you turns ordinary into something special.",
      },
      hint: { th: "เลื่อนลงมาช้า ๆ นะ", en: "Scroll down slowly." },
    },
    reasons: [
      {
        th: "รอยยิ้มของเธอทำให้วันที่แย่ที่สุด กลายเป็นวันที่พอทนได้",
        en: "Your smile turns the worst days into days I can get through.",
      },
      {
        th: "เธอฟังทุกเรื่องของเรา แม้เรื่องที่ไม่มีสาระเลยก็ตาม",
        en: "You listen to everything I say — even the pointless things.",
      },
      {
        th: "อยู่กับเธอแล้วรู้สึกเหมือนได้กลับบ้าน ทั้งที่อยู่ที่ไหนก็ได้",
        en: "With you I feel at home, no matter where we are.",
      },
      {
        th: "ความอดทนของเธอ กับความพยายามที่ไม่เคยหยุดของเธอ",
        en: "Your patience, and the way you never stop trying.",
      },
      {
        th: "เธอเชื่อในเรา ในวันที่เรายังไม่กล้าเชื่อในตัวเอง",
        en: "You believe in us on the days I forget to believe in myself.",
      },
      {
        th: "และเพราะเธอเป็นเธอ — แค่นั้นก็พอแล้ว",
        en: "And because you're you — that's already enough.",
      },
    ],
    moments: [
      {
        date: { th: "วันแรก", en: "Day one" },
        title: { th: "วันที่เราเริ่มรู้จักกัน", en: "The day we first met" },
        desc: {
          th: "วันที่ไม่มีอะไรพิเศษในปฏิทิน แต่พิเศษที่สุดในความจำ",
          en: "A date with nothing special on the calendar — and everything special in my memory.",
        },
      },
      {
        date: { th: "ครั้งแรก", en: "First time" },
        title: { th: "ทริปแรกที่ได้ไปด้วยกัน", en: "Our first trip together" },
        desc: {
          th: "หลงทางนิดหน่อย แต่ไม่เคยรู้สึกว่าอยากกลับ",
          en: "We got a little lost, and I never once wanted to turn back.",
        },
      },
      {
        date: { th: "ทุกวัน", en: "Every day" },
        title: { th: "วันที่เราเลือกกันและกัน", en: "The day we chose each other" },
        desc: {
          th: "ไม่ใช่แค่วันเดียว แต่เลือกซ้ำ ๆ ทุกวัน",
          en: "Not just once — we choose each other again, every day.",
        },
      },
      {
        date: { th: "ตอนนี้", en: "Right now" },
        title: { th: "และทุก ๆ วันหลังจากนี้", en: "And every day after this" },
        desc: {
          th: "ยังอยากเดินข้าง ๆ เธออยู่เหมือนเดิม",
          en: "I still want to walk beside you, just like this.",
        },
      },
    ],
    letter: {
      th: `ถึงเธอ,

ขอบคุณที่เข้ามาเป็นส่วนหนึ่งของทุกวัน
ขอบคุณที่อยู่ตอนที่เราไม่ได้น่ารัก
และขอบคุณที่เลือกจะเดินต่อด้วยกัน

เราไม่ได้สมบูรณ์แบบ แต่ทุกครั้งที่เจอปัญหา
เราได้เรียนรู้ที่จะเข้าใจกันมากขึ้นเรื่อย ๆ
และนั่นคือสิ่งที่มีค่าที่สุดสำหรับเรา

ไม่ว่าจะผ่านไปอีกกี่ปี
ก็ยังอยากเป็นคนที่ทำให้เธอยิ้มได้ในทุกวัน

รักเธอเสมอ,
กีต้า`,
      en: `To you,

Thank you for being part of my every day.
Thank you for staying on the days I wasn't easy to love.
And thank you for choosing to keep walking forward together.

We're not perfect, but every time something gets hard,
we learn to understand each other a little more.
That is the most valuable thing I have.

No matter how many years pass,
I still want to be the person who makes you smile.

Always,
Guitar`,
    },
    closing: {
      th: "ถ้าให้เริ่มใหม่ทั้งหมด ก็ยังจะเลือกเธอ",
      en: "If I could start over, I'd still choose you.",
    },
  },
};
