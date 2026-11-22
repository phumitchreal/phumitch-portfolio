import { supabase } from "../db/supabase.js";
import { works as defaultWorks, type WorkCategory } from "../content/work.ts";
import { dicts } from "../i18n.ts";

export type DBProject = {
  id?: string;
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
  cover?: any;
  cover_url?: string;
  featured?: boolean;
  sort_order?: number;
};

export type DBProfile = {
  personal: {
    fullName: [string, string];
    nickname: [string, string];
    birthday: [string, string];
    location: [string, string];
    status: [string, string];
    education: [string, string];
  };
  home: {
    tag1_en: string;
    tag1_th: string;
    tag2_en: string;
    tag2_th: string;
  };
  about: {
    desc_en: string;
    desc_th: string;
  };
  what_i_do: Array<{ en: string; th: string }>;
  socials: Array<{ label: string; handle: string; href: string }>;
};

export const defaultProfile: DBProfile = {
  personal: {
    fullName: [dicts.en.personal.fullName[1], dicts.th.personal.fullName[1]],
    nickname: [dicts.en.personal.nickname[1], dicts.th.personal.nickname[1]],
    birthday: [dicts.en.personal.birthday[1], dicts.th.personal.birthday[1]],
    location: [dicts.en.personal.location[1], dicts.th.personal.location[1]],
    status: [dicts.en.personal.status[1], dicts.th.personal.status[1]],
    education: [dicts.en.personal.education[1], dicts.th.personal.education[1]],
  },
  home: {
    tag1_en: dicts.en.home.tag1,
    tag1_th: dicts.th.home.tag1,
    tag2_en: dicts.en.home.tag2,
    tag2_th: dicts.th.home.tag2,
  },
  about: {
    desc_en: dicts.en.about.desc,
    desc_th: dicts.th.about.desc,
  },
  what_i_do: [
    { en: dicts.en.do[0], th: dicts.th.do[0] },
    { en: dicts.en.do[1], th: dicts.th.do[1] },
    { en: dicts.en.do[2], th: dicts.th.do[2] },
  ],
  socials: [
    { label: "GitHub", handle: "@phumitchreal", href: "https://github.com/phumitchreal" },
    { label: "Instagram", handle: "@null_phumitch", href: "https://instagram.com/null_phumitch" },
    { label: "Discord", handle: "@phumitch.exe", href: "https://discord.com/users/919878532228841532" },
    { label: "Website", handle: "phumitch.space", href: "https://phumitch.space" },
  ],
};

/**
 * Fetch projects from Supabase with fallback to local static data
 */
export async function getProjects(): Promise<DBProject[]> {
  try {
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return defaultWorks.map((w, idx) => ({
        ...w,
        id: `static-${idx}`,
        cover_url: w.cover ? `/works/${w.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg` : undefined,
      }));
    }

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      desc: item.desc_en,
      descTh: item.desc_th,
      href: item.href || undefined,
      tags: item.tags || [],
      categories: (item.categories || ["website"]) as WorkCategory[],
      year: item.year || "2026",
      role: item.role_en,
      roleTh: item.role_th,
      monogram: item.monogram || item.title.slice(0, 2),
      cover: item.cover_url || undefined,
      cover_url: item.cover_url || undefined,
      featured: Boolean(item.featured),
      sort_order: item.sort_order ?? 0,
    }));
  } catch {
    return defaultWorks.map((w, idx) => ({
      ...w,
      id: `static-${idx}`,
    }));
  }
}

/**
 * Fetch profile information from Supabase with fallback
 */
export async function getProfile(): Promise<DBProfile> {
  try {
    const { data, error } = await supabase
      .from("portfolio_profile")
      .select("data")
      .eq("id", "main")
      .maybeSingle();

    if (error || !data || !data.data) {
      return defaultProfile;
    }

    return {
      ...defaultProfile,
      ...data.data,
      personal: {
        ...defaultProfile.personal,
        ...(data.data.personal || {}),
      },
      home: {
        ...defaultProfile.home,
        ...(data.data.home || {}),
      },
      about: {
        ...defaultProfile.about,
        ...(data.data.about || {}),
      },
    };
  } catch {
    return defaultProfile;
  }
}
