import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRightIcon as ArrowUpRight,
  ArrowRightIcon as ArrowRight,
} from "@phosphor-icons/react";
import { dicts, L } from "../i18n.ts";
import type { DBProject } from "../lib/portfolioData.ts";
import { getProjectCover, isDesignWork } from "../lib/projectMedia.ts";
import DesignShowcase from "./DesignShowcase.tsx";
import ImageLightbox from "./ImageLightbox.tsx";

interface Props {
  initialWorks: DBProject[];
}

const accents = ["20%", "28%", "14%", "34%", "24%", "18%"];

const filters = [
  { id: "all", en: dicts.en.work.filterAll, th: dicts.th.work.filterAll },
  { id: "bot", en: dicts.en.work.filterBot, th: dicts.th.work.filterBot },
  { id: "website", en: dicts.en.work.filterWebsite, th: dicts.th.work.filterWebsite },
  { id: "community", en: dicts.en.work.filterCommunity, th: dicts.th.work.filterCommunity },
];

function mapProjectRow(item: any): DBProject {
  return {
    id: item.id,
    title: item.title,
    desc: item.desc_en || "",
    descTh: item.desc_th || "",
    href: item.href || undefined,
    tags: item.tags || [],
    categories: item.categories || ["website"],
    year: item.year || "2026",
    role: item.role_en || "",
    roleTh: item.role_th || "",
    monogram: item.monogram || (item.title || "").slice(0, 2),
    cover: item.cover_url || undefined,
    cover_url: item.cover_url || undefined,
    featured: Boolean(item.featured),
    sort_order: item.sort_order ?? 0,
  };
}

export default function WorkGridShowcase({ initialWorks }: Props) {
  const [works, setWorks] = useState<DBProject[]>(initialWorks || []);
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState<DBProject | null>(null);

  const fetchLiveProjects = async () => {
    try {
      const { supabase } = await import("../db/supabase.js");
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data) {
        setWorks(data.map(mapProjectRow));
      }
    } catch (err) {
      // Keep the server-rendered projects if the live fetch fails.
      console.warn("Failed to load live projects from Supabase:", err);
    }
  };

  useEffect(() => {
    // Refresh from the database so admin edits appear without a redeploy.
    void fetchLiveProjects();

    // Subscribe to realtime changes lazily (the client module is big).
    let cancelled = false;
    let supabase: any;
    let channel: any;
    void import("../db/supabase.js").then(({ supabase: s }) => {
      if (cancelled) return;
      supabase = s;
      channel = s
        .channel("work-grid-projects-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "portfolio_projects" },
          () => {
            void fetchLiveProjects();
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, []);

  // Keep newly rendered/updated tiles visible for the site-wide scroll reveal.
  useEffect(() => {
    document
      .querySelectorAll("[data-work-grid] [data-reveal]")
      .forEach((el) => el.classList.add("is-revealed"));
  }, [works, filter]);

  const devWorks = useMemo(() => works.filter((work) => !isDesignWork(work)), [works]);
  const designWorks = useMemo(() => works.filter((work) => isDesignWork(work)), [works]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? devWorks
        : devWorks.filter((work) => work.categories?.includes(filter as any)),
    [devWorks, filter]
  );

  const renderTileBody = (work: DBProject, index: number) => {
    const cover = getProjectCover(work);
    const accent = accents[index % accents.length];

    return (
      <>
        <div className="relative overflow-hidden rounded-[20px] bg-surface ring-1 ring-black/[0.06] shadow-[var(--shadow-card)]">
          <div className="work-cover-frame aspect-[16/10]">
            <div className="work-cover-media">
              {cover ? (
                <img
                  src={cover}
                  alt={work.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="work-cover"
                  style={{ "--cover-accent": accent } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <span className="work-cover__mono">{work.monogram}</span>
                </div>
              )}
            </div>

            {work.featured ? (
              <span className="absolute left-3 top-3 rounded-full bg-surface/85 px-2.5 py-1 text-[11px] font-semibold text-fg-muted backdrop-blur">
                <L en={dicts.en.work.featured} th={dicts.th.work.featured} />
              </span>
            ) : null}

            {work.href || cover ? (
              <span className="pointer-events-none absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-fg/80 text-bg opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:rotate-90 group-hover:opacity-100">
                <ArrowUpRight size={15} weight="bold" />
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
          <div className="flex items-center justify-between gap-3 text-[12px] text-fg-dim">
            <span>
              <L en={work.role} th={work.roleTh} />
            </span>
            <span className="tabular-nums">{work.year}</span>
          </div>

          <h3 className="mt-1.5 text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-fg sm:text-[24px]">
            {work.title}
          </h3>

          <p className="mt-1.5 max-w-[520px] text-[14px] leading-relaxed text-fg-muted">
            <L en={work.desc} th={work.descTh} />
          </p>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {work.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-fg-dim"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </>
    );
  };

  const tileClass =
    "work-tile group flex h-full w-full flex-col rounded-[28px] bg-mist p-4 text-left outline-none transition-colors duration-300 hover:bg-mist-strong sm:p-5";

  return (
    <section className="mt-2">
      <div
        className="inline-flex flex-wrap items-center gap-1 rounded-full bg-mist p-1"
        role="group"
        aria-label={dicts.en.work.filterLabel}
      >
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(item.id)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                active
                  ? "bg-surface text-fg shadow-[var(--shadow-card)]"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              <L en={item.en} th={item.th} />
            </button>
          );
        })}
      </div>

      <div data-work-grid className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((work, index) => {
          const cover = getProjectCover(work);
          const key = work.id || work.title;
          const delay = `${Math.min(index * 60, 300)}ms`;

          if (work.href) {
            return (
              <a
                key={key}
                href={work.href}
                target="_blank"
                rel="noopener"
                className={tileClass}
                style={{ transitionDelay: delay }}
                data-reveal
                data-work-tile
                data-tags={work.categories.join(",")}
              >
                {renderTileBody(work, index)}
              </a>
            );
          }

          // Artwork without a link: show it in a lightbox. This also handles
          // uploaded data URLs, which browsers block as top-level navigations.
          if (cover) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPreview(work)}
                className={`${tileClass} cursor-pointer`}
                style={{ transitionDelay: delay }}
                data-reveal
                data-work-tile
                data-tags={work.categories.join(",")}
              >
                {renderTileBody(work, index)}
              </button>
            );
          }

          return (
            <div
              key={key}
              className={tileClass}
              style={{ transitionDelay: delay }}
              data-reveal
              data-work-tile
              data-tags={work.categories.join(",")}
            >
              {renderTileBody(work, index)}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 rounded-[20px] bg-mist px-6 py-10 text-center text-[14px] text-fg-muted">
          <L en="No projects in this category yet." th="ยังไม่มีผลงานในหมวดหมู่นี้" />
        </p>
      )}

      <a
        href="https://zexta.xyz"
        target="_blank"
        rel="noopener"
        className="group mt-8 flex items-center justify-between gap-4 rounded-[24px] bg-mist px-6 py-5 transition-colors duration-300 hover:bg-mist-strong sm:px-8 sm:py-6"
      >
        <div>
          <p className="text-[16px] font-semibold tracking-[-0.015em] text-fg">
            <L en={dicts.en.work.moreProjects} th={dicts.th.work.moreProjects} />
          </p>
          <p className="mt-0.5 text-[13px] text-fg-muted">zexta.xyz</p>
        </div>
        <span className="grid size-9 place-items-center rounded-full bg-surface text-fg shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:translate-x-1">
          <ArrowRight size={16} weight="bold" />
        </span>
      </a>

      {preview && (
        <ImageLightbox
          src={getProjectCover(preview) || ""}
          alt={preview.title}
          onClose={() => setPreview(null)}
        />
      )}

      <DesignShowcase works={designWorks} />
    </section>
  );
}
