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
