import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
  ArrowUpRightIcon as ArrowUpRight,
} from "@phosphor-icons/react";
import { L } from "../i18n.ts";
import type { DBProject } from "../lib/portfolioData.ts";
import { getProjectCover } from "../lib/projectMedia.ts";
import ImageLightbox from "./ImageLightbox.tsx";

interface Props {
  works: DBProject[];
}

export default function DesignShowcase({ works }: Props) {
  const slides = useMemo(
    () => (works || []).filter((work) => Boolean(getProjectCover(work))),
    [works]
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const current = useMemo(
    () => slides[Math.min(index, slides.length - 1)],
    [slides, index]
  );
  const cover = current ? getProjectCover(current) : undefined;

  // Preload the current artwork so the slide swap has no network round-trip.
  useEffect(() => {
    if (!cover) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = cover;
    document.head.appendChild(link);
    return () => link.remove();
  }, [cover]);

  useEffect(() => {
    setIndex((current) => (slides.length ? Math.min(current, slides.length - 1) : 0));
  }, [slides.length]);

  // Auto-advance, paused while the visitor hovers/focuses the slideshow.
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  const goTo = (next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  };

  return (
    <div className="mt-20 sm:mt-28">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end" data-reveal>
        <div className="max-w-[640px]">
          <p className="eyebrow">
            <L en="Graphic design" th="งานออกแบบภาพ" />
          </p>
          <h2 className="headline mt-3 text-[32px] sm:text-[44px]">
            <L en="Artwork & visuals" th="ผลงานออกแบบและภาพประกอบ" />
          </h2>
          <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed text-fg-muted">
            <L
              en="Banners, posters, logos and illustrations — separate from the web and bot projects."
              th="แบนเนอร์ โปสเตอร์ โลโก้ และภาพประกอบ — แยกจากงานเว็บและบอท"
            />
          </p>
        </div>
        <p className="flex items-baseline gap-3 sm:justify-end">
          <span className="text-[44px] font-semibold leading-none tracking-[-0.05em] text-fg tabular-nums sm:text-[56px]">
            {String(slides.length).padStart(2, "0")}
          </span>
          <span className="text-[12px] leading-[1.35] font-medium text-fg-muted">
            <L en="Artworks" th="ชิ้นงาน" />
          </span>
        </p>
      </div>

      <div
        className="relative mt-8 overflow-hidden rounded-[28px] border border-line bg-mist shadow-[var(--shadow-panel)] sm:mt-10 sm:rounded-[36px]"
        data-reveal
        tabIndex={0}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") goTo(index - 1);
          if (event.key === "ArrowRight") goTo(index + 1);
        }}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-fg/[0.04] sm:aspect-[16/9]">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={`View ${current.title} full size`}
          >
            <img
              key={current.id || current.title}
              src={cover || ""}
              alt={current.title}
              loading="lazy"
              decoding="async"
              className="design-slide size-full object-contain p-2 sm:p-6"
            />
          </button>

          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-bg/80 px-3 py-1 text-[11px] font-semibold text-fg-muted backdrop-blur">
            {index + 1} / {slides.length}
          </span>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Previous artwork"
                className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-bg/80 text-fg shadow-md backdrop-blur transition-transform hover:scale-105 sm:left-5"
              >
                <ArrowLeft size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Next artwork"
                className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-bg/80 text-fg shadow-md backdrop-blur transition-transform hover:scale-105 sm:right-5"
              >
                <ArrowRight size={18} weight="bold" />
              </button>
            </>
          )}
        </div>

        <div className="border-t border-line bg-surface/70 p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-fg-dim">
                <span className="tabular-nums">{current.year}</span>
                <span>·</span>
                <span>
                  <L en={current.role} th={current.roleTh} />
                </span>
              </div>
              <h3 className="mt-1 text-[24px] font-bold leading-tight tracking-tight text-fg sm:text-[30px]">
                {current.title}
              </h3>
              <p className="mt-1.5 max-w-[640px] text-[14px] leading-relaxed text-fg-muted sm:text-[15px]">
                <L en={current.desc} th={current.descTh} />
              </p>
              {current.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {current.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-medium text-fg-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              {current.href && (
                <a
                  href={current.href}
                  target="_blank"
                  rel="noopener"
                  className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13px]"
                >
                  <L en="Open project" th="เปิดดูโปรเจกต์" />
                  <ArrowUpRight size={15} weight="bold" />
                </a>
              )}

              {slides.length > 1 && (
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Artwork slides">
                  {slides.map((slide, slideIndex) => (
                    <button
                      key={slide.id || slide.title}
                      type="button"
                      role="tab"
                      aria-selected={slideIndex === index}
                      aria-label={`Go to artwork ${slideIndex + 1}`}
                      onClick={() => goTo(slideIndex)}
                      className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                        slideIndex === index
                          ? "w-7 bg-accent"
                          : "w-1.5 bg-fg/20 hover:bg-fg/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <ImageLightbox src={cover || ""} alt={current.title} onClose={() => setLightbox(false)} />
      )}
    </div>
  );
}
