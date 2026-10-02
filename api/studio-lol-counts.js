/**
 * GET /api/studio-lol-counts — Discord guild numbers for the /studio_lol splash.
 *
 * Gated by the Turnstile session cookie (see api/_turnstile.js): when verification
 * is enforced, only visitors who passed the challenge get live numbers. Without it
 * the page keeps its static fallback text, so the easter egg never looks broken.
 */
import { isEnforced, isSessionValid } from "./_turnstile.js";

const GUILD_ID = "1551900946211147827";

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`discord ${res.status} for ${url}`);
  return res.json();
}

export default async function handler(req, res) {
  const enforced = isEnforced();

  if (enforced && !isSessionValid(req)) {
    // Never CDN-cache a rejection, or a stored copy would leak to unverified visitors.
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Type", "application/json");
    return res.status(401).json({ error: "verification_required" });
  }

  // Verified visitors only → the shared edge cache is off, the browser cache stays.
  res.setHeader(
    "Cache-Control",
    enforced ? "private, max-age=60, stale-while-revalidate=120" : "public, s-maxage=60, stale-while-revalidate=120"
  );
  res.setHeader("Content-Type", "application/json");

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "missing DISCORD_BOT_TOKEN" });
  }

  try {
    const auth = { Authorization: `Bot ${token}` };

    let profile = null;
    try {
      const guild = await fetchJson(
        `https://discord.com/api/v10/guilds/${GUILD_ID}`,
        auth
      );
      profile = { name: guild.name };
      if (guild.icon) {
        profile.icon = `https://cdn.discordapp.com/icons/${GUILD_ID}/${guild.icon}.png?size=256`;
      }
    } catch {
      profile = null;
    }

    const members = await fetchJson(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`,
      auth
    );

    const humans = members.filter((m) => !m.user?.bot);
    const humanCount = humans.length;

    const botNames = new Set();
    for (const m of members) {
      if (!m.user?.bot) continue;
      for (const name of [m.user.username, m.user.global_name, m.nick]) {
        if (name) botNames.add(String(name).toLowerCase());
      }
    }

    let online;
    try {
      const widget = await fetchJson(
        `https://discord.com/api/v10/guilds/${GUILD_ID}/widget.json`
      );
      online = (widget.members || []).filter(
        (m) => !botNames.has(String(m.username || m.name || "").toLowerCase())
      ).length;
    } catch {
      online = null;
    }

    return res.json({ members: humanCount, online, profile });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}