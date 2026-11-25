import type { DBProject } from "./portfolioData.ts";

/** Resolve a project cover whether it is a public URL (DB) or an Astro image asset. */
export function getProjectCover(work: Pick<DBProject, "cover" | "cover_url">): string | undefined {
  if (typeof work.cover === "string") return work.cover || undefined;
  if (work.cover && typeof work.cover === "object" && "src" in work.cover) {
    return (work.cover as { src?: string }).src;
  }
  return work.cover_url || undefined;
}

/** Design/artwork projects are shown in their own slideshow, not the dev grid. */
export function isDesignWork(work: Pick<DBProject, "categories">): boolean {
  return Array.isArray(work.categories) && work.categories.includes("design");
}

/**
 * Cover images under /works/*.avif also ship pre-resized variants
 * (400 / 640 / 800 / 1200 px wide) so phones never download a 1600 px asset.
 * Remote covers (Supabase storage, data URLs) get no srcset and load as-is.
 */
const VARIANT_NAMES = new Set([
  "aven-labs",
  "figurath",
  "fuyuri",
  "zexta",
  "studio-lol",
  "phumitch",
]);

const VARIANT_WIDTHS = [400, 640, 800, 1200];

/** Build a responsive `srcset` for a local /works/*.avif cover, when variants exist. */
export function getCoverSrcSet(src?: string): string | undefined {
  if (!src) return undefined;
  const match = src.match(/^\/works\/([a-z0-9-]+)\.avif$/i);
  if (!match || !VARIANT_NAMES.has(match[1])) return undefined;
  const base = `/works/${match[1]}`;
  return [
    ...VARIANT_WIDTHS.map((w) => `${base}-${w}.avif ${w}w`),
    `${base}.avif 1600w`,
  ].join(", ");
}
