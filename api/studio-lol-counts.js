const GUILD_ID = "1551900946211147827";

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`discord ${res.status} for ${url}`);
  return res.json();
}

export default async function handler(_req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
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