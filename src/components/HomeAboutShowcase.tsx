import React, { useState, useEffect } from "react";
import { ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react";
import { dicts } from "../i18n.ts";
import { defaultProfile, type DBProfile } from "../lib/portfolioData.ts";

interface HomeAboutShowcaseProps {
  initialProfile?: DBProfile;
}

export default function HomeAboutShowcase({ initialProfile }: HomeAboutShowcaseProps) {
  const [profile, setProfile] = useState<DBProfile>(initialProfile || defaultProfile);
  const { en, th } = dicts;

  useEffect(() => {
    // 1. Fetch live profile on mount to guarantee fresh DB state
    const fetchLiveProfile = async () => {
      try {
        const { supabase } = await import("../db/supabase.js");
        const { data, error } = await supabase
          .from("portfolio_profile")
          .select("data")
          .eq("id", "main")
          .maybeSingle();

        if (!error && data && data.data) {
          setProfile({
            ...defaultProfile,
            ...data.data,
            personal: { ...defaultProfile.personal, ...(data.data.personal || {}) },
            home: { ...defaultProfile.home, ...(data.data.home || {}) },
            about: { ...defaultProfile.about, ...(data.data.about || {}) },
          });
        }
      } catch (e) {
        console.warn("Failed to load live profile from Supabase:", e);
      }
    };

    void fetchLiveProfile();

    // 2. Subscribe to Supabase Realtime changes (lazily — the client is large)
    let cancelled = false;
    let supabase: any;
    let channel: any;
    void import("../db/supabase.js").then(({ supabase: s }) => {
      if (cancelled) return;
      supabase = s;
      channel = s
        .channel("home-about-profile-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "portfolio_profile" },
          (payload) => {
            if (payload.new && (payload.new as any).data) {
              const fresh = (payload.new as any).data;
              setProfile({
                ...defaultProfile,
                ...fresh,
                personal: { ...defaultProfile.personal, ...(fresh.personal || {}) },
                home: { ...defaultProfile.home, ...(fresh.home || {}) },
                about: { ...defaultProfile.about, ...(fresh.about || {}) },
              });
            }
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, []);

  const facts = [
    {
      en: [en.personal.status[0], profile.personal.status?.[0] || en.personal.status[1]],
      th: [th.personal.status[0], profile.personal.status?.[1] || th.personal.status[1]],
      isStatus: true,
    },
    {
      en: [en.personal.location[0], profile.personal.location[0]],
      th: [th.personal.location[0], profile.personal.location[1]],
    },
    {
      en: [en.personal.education[0], profile.personal.education[0]],
      th: [th.personal.education[0], profile.personal.education[1]],
    },
    {
      en: [en.personal.nickname[0], profile.personal.nickname[0]],
      th: [th.personal.nickname[0], profile.personal.nickname[1]],
    },
  ];

  return (
    <section id="about" className="pb-24 sm:pb-32">
      <div className="container-apple">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          {/* Portrait + quick links */}
          <div data-reveal className="mx-auto w-full max-w-[360px] lg:mx-0">
            <div className="relative overflow-hidden rounded-[28px] bg-mist ring-1 ring-black/[0.06] shadow-[var(--shadow-panel)]">
              <img
                src={profile.about?.photo_url || "/about-photo.avif"}
                alt={`${profile.personal.fullName[1]} (${profile.personal.nickname[1]}) — ${profile.personal.fullName[0]}`}
                className="aspect-[4/5] h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                style={{ objectPosition: "center 30%" }}
                loading="lazy"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {profile.socials.map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-mist px-3.5 py-2 text-[13px] font-medium text-fg-muted transition-colors duration-200 hover:bg-mist-strong hover:text-fg"
                >
                  <span>{s.label}</span>
                  <ArrowUpRight
                    size={14}
                    weight="bold"
                    className="opacity-60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Copy + facts */}
          <div data-reveal>
            <p className="eyebrow">
              <span data-lang="en">{en.about.eyebrow}</span>
              <span data-lang="th">{th.about.eyebrow}</span>
            </p>
            <h2 className="headline mt-3 text-[40px] sm:text-[56px]">
              <span data-lang="en">{en.about.title1}</span>
              <span data-lang="th">{th.about.title1}</span>
            </h2>
            <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-fg-muted sm:text-[17px]">
              <span data-lang="en">{profile.about?.desc_en || en.about.desc}</span>
              <span data-lang="th">{profile.about?.desc_th || th.about.desc}</span>
            </p>

            {/* Facts Grid */}
            <dl className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {facts.map((f, i) => (
                <div key={i} className={`rounded-2xl bg-mist px-4 py-3.5 ${f.isStatus ? "ring-1 ring-accent/20 bg-accent-soft/30" : ""}`}>
                  <dt className="text-[12px] text-fg-dim">
                    <span data-lang="en">{f.en[0]}</span>
                    <span data-lang="th">{f.th[0]}</span>
                  </dt>
                  <dd className={`mt-1 text-[13px] font-medium ${f.isStatus ? "text-accent font-semibold" : "text-fg"}`}>
                    <span data-lang="en">{f.en[1]}</span>
                    <span data-lang="th">{f.th[1]}</span>
                  </dd>
                </div>
              ))}
            </dl>

            {/* What I Do Mini Grid */}
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {profile.what_i_do.slice(0, 3).map((item, i) => (
                <div key={i} className="rounded-2xl bg-mist px-4 py-3.5">
                  <p className="truncate text-[12px] font-semibold text-accent">
                    <span data-lang="en">{item.en.split(" · ")[0]}</span>
                    <span data-lang="th">{item.th.split(" · ")[0]}</span>
                  </p>
                  <p className="mt-1 truncate text-[13px] text-fg-muted">
                    <span data-lang="en">{item.en.split(" · ").slice(1, 3).join(" · ")}</span>
                    <span data-lang="th">{item.th.split(" · ").slice(1, 3).join(" · ")}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a href="/about" className="btn-ghost">
                <span data-lang="en">More about me</span>
                <span data-lang="th">เกี่ยวกับผมเพิ่มเติม</span>
                <ArrowUpRight size={16} weight="bold" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
