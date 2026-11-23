import React, { useState, useEffect } from "react";
import { ArrowUpRightIcon as ArrowUpRight, CaretRightIcon as CaretRight } from "@phosphor-icons/react";
import { supabase } from "../db/supabase.js";
import { L } from "../i18n.ts";
import type { DBProject } from "../lib/portfolioData.ts";

interface Props {
  initialWorks: DBProject[];
}

const categoryLabels: Record<string, { en: string; th: string }> = {
  bot: { en: "Discord Bot", th: "Discord Bot" },
  website: { en: "Website", th: "เว็บไซต์" },
  community: { en: "Community", th: "คอมมูนิตี้" },
};

export default function HomeWorkShowcase({ initialWorks }: Props) {
  const [works, setWorks] = useState<DBProject[]>(initialWorks || []);

  const fetchLiveProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setWorks(
          data.map((item) => ({
            id: item.id,
            title: item.title,
            desc: item.desc_en,
            descTh: item.desc_th,
            href: item.href || undefined,
            tags: item.tags || [],
            categories: item.categories || ["website"],
            year: item.year || "2026",
            role: item.role_en,
            roleTh: item.role_th,
            monogram: item.monogram || item.title.slice(0, 2),
            cover: item.cover_url || undefined,
            cover_url: item.cover_url || undefined,
            featured: Boolean(item.featured),
            sort_order: item.sort_order ?? 0,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching live projects:", err);
    }
  };

  useEffect(() => {
    // 1. Fetch latest projects on client mount
    fetchLiveProjects();

    // 2. Subscribe to real-time changes from Supabase
    const channel = supabase
      .channel("home-projects-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portfolio_projects" },
        () => {
          fetchLiveProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const featured = works.find((w) => w.featured) || works[0];
  const rest = works.filter((w) => w !== featured);
  const duo = rest.slice(0, 2);
  const trio = rest.slice(2);

  const getHostname = (url?: string) => {
    if (!url) return "";
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  return (
    <section id="works" className="py-24 sm:py-32">
      <div className="container-apple">
        {/* Apple-style Section Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end" data-reveal>
          <div className="max-w-[720px]">
            <p className="eyebrow">
              <L en="Selected work" th="ผลงานที่เลือก" />
            </p>
            <h2 className="headline mt-3 text-[40px] sm:text-[56px]">
              <L en="Things I've built" th="ผลงานที่ลงมือทำ" />
            </h2>
            <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-fg-muted sm:text-[17px]">
              <L
                en="Production websites, Discord bots and communities — designed for real use, not demos."
                th="เว็บไซต์ Discord bot และคอมมูนิตี้ที่ใช้งานจริง — ออกแบบมาเพื่อ production ไม่ใช่แค่เดโม่"
              />
            </p>
          </div>
          <p className="flex items-baseline gap-3 sm:justify-end">
            <span className="text-[56px] font-semibold leading-none tracking-[-0.05em] text-fg tabular-nums sm:text-[72px]">
              {String(works.length).padStart(2, "0")}
            </span>
            <span className="text-[13px] leading-[1.35] font-medium text-fg-muted">
              <span data-lang="en">
                Projects
                <br />
                shipped
              </span>
              <span data-lang="th">
                โปรเจกต์
                <br />
                ที่ส่งงานจริง
              </span>
            </span>
          </p>
        </div>

        {/* APPLE PRODUCT SHOWCASE BENTO */}
        <div className="mt-12 sm:mt-16 space-y-6">
          {/* TIER 1: FLAGSHIP HERO */}
          {featured && (
            <div data-reveal>
              <div className="group relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-mist border border-line ring-1 ring-black/[0.04] dark:ring-white/[0.06] p-7 sm:p-12 lg:p-14 shadow-[var(--shadow-panel)] transition-all duration-500 hover:shadow-2xl">
                {/* Ambient Glow */}
                <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-accent/10 blur-[120px]" />
                <div className="pointer-events-none absolute -left-24 -bottom-24 size-96 rounded-full bg-accent/5 blur-[120px]" />

                <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
                  {/* Story & Copy */}
                  <div className="flex flex-col lg:col-span-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-accent">
                        <L en="Featured Flagship" th="ผลงานเด่นพิเศษ" />
                      </span>
                      <span className="text-fg-dim">·</span>
                      <span className="text-[12px] font-medium text-fg-dim uppercase tracking-wider">
                        {categoryLabels[featured.categories[0]] ? (
                          <L
                            en={categoryLabels[featured.categories[0]].en}
                            th={categoryLabels[featured.categories[0]].th}
                          />
                        ) : (
                          featured.categories[0]
                        )}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[36px] sm:text-[48px] lg:text-[52px] font-bold tracking-tight text-fg leading-[1.08]">
                      {featured.title}
                    </h3>

                    <p className="mt-2 text-[14px] sm:text-[16px] font-medium text-fg-dim">
                      <L en={featured.role} th={featured.roleTh} />
                      <span className="mx-1.5 opacity-40">·</span>
                      <span className="tabular-nums">{featured.year}</span>
                    </p>

                    <p className="mt-4 max-w-xl text-[15px] sm:text-[17px] leading-relaxed text-fg-muted">
                      <L en={featured.desc} th={featured.descTh} />
                    </p>

                    {/* Tags */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {featured.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-surface px-3 py-1.5 text-[12px] font-medium text-fg-body shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Action Link */}
                    {featured.href && (
                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <a
                          href={featured.href}
                          target="_blank"
                          rel="noopener"
                          className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-[14px] shadow-lg shadow-accent/20 transition-transform duration-300 hover:scale-[1.02]"
                        >
                          <L en="Explore Project" th="เปิดดูโปรเจกต์" />
                          <ArrowUpRight size={16} weight="bold" />
                        </a>

                        <span className="text-[13px] text-fg-dim">{getHostname(featured.href)}</span>
                      </div>
                    )}
                  </div>

                  {/* Device Mockup Showcase */}
                  <div className="lg:col-span-6">
                    <a
                      href={featured.href || undefined}
                      target={featured.href ? "_blank" : undefined}
                      rel={featured.href ? "noopener" : undefined}
                      className="group/screen relative block overflow-hidden rounded-[24px] sm:rounded-[28px] bg-surface ring-1 ring-black/[0.08] shadow-[var(--shadow-card)] dark:ring-white/[0.12] transition-transform duration-500 ease-apple group-hover:scale-[1.01]"
                    >
                      <div className="work-cover-frame relative aspect-[16/10] w-full overflow-hidden">
                        {featured.cover_url || featured.cover ? (
                          <img
                            src={featured.cover_url || featured.cover}
                            alt={featured.title}
                            className="size-full object-cover transition-transform duration-500 group-hover/screen:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center font-bold text-fg-dim text-[48px] bg-mist">
                            {featured.monogram || featured.title.slice(0, 2)}
                          </div>
                        )}
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TIER 2: THE DUO */}
          {duo.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {duo.map((w, idx) => (
                <div key={w.id || w.title} data-reveal style={{ transitionDelay: `${idx * 100}ms` }}>
                  <a
                    href={w.href}
                    target={w.href ? "_blank" : undefined}
                    rel={w.href ? "noopener" : undefined}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] sm:rounded-[36px] bg-mist border border-line ring-1 ring-black/[0.04] dark:ring-white/[0.06] p-7 sm:p-9 shadow-sm transition-all duration-500 hover:bg-mist-strong hover:shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold tracking-[0.12em] uppercase text-accent">
                          {categoryLabels[w.categories[0]] ? (
                            <L
                              en={categoryLabels[w.categories[0]].en}
                              th={categoryLabels[w.categories[0]].th}
                            />
                          ) : (
                            w.categories[0]
                          )}
                        </span>
                        <span className="text-fg-dim tabular-nums font-medium">{w.year}</span>
                      </div>

                      <h3 className="mt-2.5 text-[28px] sm:text-[34px] font-bold tracking-tight text-fg leading-tight">
                        {w.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-[14px] sm:text-[15px] leading-relaxed text-fg-muted">
                        <L en={w.desc} th={w.descTh} />
                      </p>

                      <div className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium text-accent group-hover:underline">
                        <L en="Learn more" th="ดูรายละเอียด" />
                        <CaretRight
                          size={14}
                          weight="bold"
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-[20px] bg-surface ring-1 ring-black/[0.08] dark:ring-white/[0.1] shadow-md">
                      <div className="work-cover-frame relative aspect-[16/10] w-full overflow-hidden transition-transform duration-500 ease-apple group-hover:scale-[1.03]">
                        {w.cover_url || w.cover ? (
                          <img
                            src={w.cover_url || w.cover}
                            alt={w.title}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center font-bold text-fg-dim text-[36px] bg-mist">
                            {w.monogram || w.title.slice(0, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* TIER 3: THE TRIO */}
          {trio.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trio.map((w, idx) => (
                <div key={w.id || w.title} data-reveal style={{ transitionDelay: `${idx * 80}ms` }}>
                  <a
                    href={w.href}
                    target={w.href ? "_blank" : undefined}
                    rel={w.href ? "noopener" : undefined}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] sm:rounded-[28px] bg-mist border border-line ring-1 ring-black/[0.04] dark:ring-white/[0.06] p-6 sm:p-7 shadow-xs transition-all duration-400 hover:bg-mist-strong hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold tracking-[0.12em] uppercase text-fg-dim">
                          {categoryLabels[w.categories[0]] ? (
                            <L
                              en={categoryLabels[w.categories[0]].en}
                              th={categoryLabels[w.categories[0]].th}
                            />
                          ) : (
                            w.categories[0]
                          )}
                        </span>
                        <span className="text-fg-dim tabular-nums font-medium">{w.year}</span>
                      </div>

                      <h4 className="mt-2 text-[22px] sm:text-[24px] font-bold tracking-tight text-fg leading-tight">
                        {w.title}
                      </h4>

                      <p className="mt-1.5 line-clamp-2 text-[13px] sm:text-[14px] leading-relaxed text-fg-muted">
                        <L en={w.desc} th={w.descTh} />
                      </p>

                      <div className="mt-3.5 inline-flex items-center gap-1 text-[13px] font-medium text-accent group-hover:underline">
                        <L en="Explore" th="สำรวจ" />
                        <CaretRight
                          size={13}
                          weight="bold"
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-[16px] bg-surface ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-sm">
                      <div className="work-cover-frame relative aspect-[16/10] w-full overflow-hidden transition-transform duration-500 ease-apple group-hover:scale-[1.04]">
                        {w.cover_url || w.cover ? (
                          <img
                            src={w.cover_url || w.cover}
                            alt={w.title}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center font-bold text-fg-dim text-[28px] bg-mist">
                            {w.monogram || w.title.slice(0, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* See All Work CTA */}
        <div className="mt-14 flex justify-center" data-reveal>
          <a href="/portfolio" className="btn-ghost">
            <L en="Explore all projects" th="สำรวจผลงานทั้งหมด" />
            <ArrowUpRight size={16} weight="bold" />
          </a>
        </div>
      </div>
    </section>
  );
}
