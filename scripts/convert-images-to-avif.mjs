/**
 * One-off / maintenance script: convert local project images and Supabase
 * image fields to AVIF.
 *
 *   node scripts/convert-images-to-avif.mjs
 *
 * It converts:
 *  - public/works/*.jpg|png|webp and src/assets/works/*
 *  - public/about-photo.*, src/assets/about-photo.*, public/song-cover.*
 *  - every portfolio_projects.cover_url (path, external URL or data URL)
 *  - portfolio_profile.about.photo_url
 *
 * Already-AVIF values are skipped, so it is safe to run again later.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SUPABASE_URL =
  process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://bzdsqdorqpwjkdioopzk.supabase.co";
const SUPABASE_KEY =
  process.env.PUBLIC_SUPABASE_KEY ||
  process.env.SUPABASE_KEY ||
  "sb_publishable_NYRy_5uBmCXgr3N4XG6mcA_74XzYcu5";

const REST = `${SUPABASE_URL}/rest/v1`;
const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const AVIF_OPTIONS = { quality: 62, effort: 5 };
const oldFiles = [];

async function toAvifBuffer(input) {
  return sharp(input).rotate().avif(AVIF_OPTIONS).toBuffer();
}

function isAvif(value) {
  return Boolean(value && (/^data:image\/avif/i.test(value) || /\.avif(?:[?#]|$)/i.test(value)));
}

function bufferToDataUrl(buffer) {
  return `data:image/avif;base64,${buffer.toString("base64")}`;
}

function dataUrlToBuffer(value) {
  const match = /^data:image\/[^;]+;base64,(.*)$/is.exec(value);
  if (!match) throw new Error("Unsupported data URL");
  return Buffer.from(match[1], "base64");
}

async function download(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; phumitch-portfolio image migration)" },
  });
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function listImages(dir) {
  try {
    return (await fs.readdir(dir))
      .filter((name) => IMAGE_EXT.test(name))
      .map((name) => path.join(dir, name));
  } catch {
    return [];
  }
}

async function convertLocalFile(file) {
  const output = file.replace(IMAGE_EXT, ".avif");
  await fs.mkdir(path.dirname(output), { recursive: true });
  await sharp(file).rotate().avif(AVIF_OPTIONS).toFile(output);
  oldFiles.push(file);
  console.log(`  ✓ ${file} → ${output}`);
  return output;
}

async function patch(table, query, body) {
  const response = await fetch(`${REST}/${table}?${query}`, {
    method: "PATCH",
    headers: { ...HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Supabase update failed (${response.status}): ${await response.text()}`);
  }
}

async function convertProjectCovers() {
  console.log("\nProjects:");
  const projects = await (await fetch(`${REST}/portfolio_projects?select=*`, { headers: HEADERS })).json();

  for (const project of projects) {
    const cover = (project.cover_url || "").trim();
    if (!cover || isAvif(cover)) continue;

    let next = cover;

    if (cover.startsWith("data:image/")) {
      next = bufferToDataUrl(await toAvifBuffer(dataUrlToBuffer(cover)));
    } else if (cover.startsWith("/works/") && IMAGE_EXT.test(cover)) {
      next = cover.replace(IMAGE_EXT, ".avif");
    } else if (/^https?:\/\//i.test(cover)) {
      const slug = slugify(project.title) || `project-${project.id.slice(0, 8)}`;
      const output = path.join("public", "works", `${slug}-cover.avif`);
      await fs.mkdir(path.dirname(output), { recursive: true });
      await fs.writeFile(output, await toAvifBuffer(await download(cover)));
      next = `/works/${slug}-cover.avif`;
    }

    if (next === cover) continue;
    await patch("portfolio_projects", `id=eq.${project.id}`, { cover_url: next });
    console.log(`  ✓ ${project.title}: ${cover.slice(0, 42)}… → ${next.slice(0, 42)}…`);
  }
}

async function convertProfile() {
  console.log("\nProfile:");
  const rows = await (await fetch(`${REST}/portfolio_profile?select=*&id=eq.main`, { headers: HEADERS })).json();
  if (!rows.length) return;

  const row = rows[0];
  const data = row.data || {};
  const about = { ...(data.about || {}) };
  const photo = (about.photo_url || "").trim();
  if (!photo || isAvif(photo)) return;

  if (photo.startsWith("data:image/")) {
    about.photo_url = bufferToDataUrl(await toAvifBuffer(dataUrlToBuffer(photo)));
  } else if (/^https?:\/\//i.test(photo)) {
    const output = path.join("public", "about-photo.avif");
    await fs.writeFile(output, await toAvifBuffer(await download(photo)));
    about.photo_url = "/about-photo.avif";
  } else if (IMAGE_EXT.test(photo)) {
    about.photo_url = photo.replace(IMAGE_EXT, ".avif");
  } else {
    return;
  }

  await patch("portfolio_profile", "id=eq.main", { data: { ...data, about } });
  console.log(`  ✓ about photo → ${about.photo_url.slice(0, 42)}…`);
}

async function main() {
  console.log("Local images:");
  const localFiles = [
    "public/about-photo.jpg",
    "public/song-cover.jpg",
    "src/assets/about-photo.jpg",
    ...(await listImages("public/works")),
    ...(await listImages("src/assets/works")),
  ];

  for (const file of localFiles) {
    try {
      await fs.access(file);
    } catch {
      continue;
    }
    await convertLocalFile(file);
  }

  await convertProjectCovers();
  await convertProfile();

  // Remove the now-replaced originals only after all conversions succeeded.
  for (const file of oldFiles) {
    await fs.rm(file, { force: true });
  }
  console.log(`\nDone. Converted ${oldFiles.length} local files and removed the originals.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
