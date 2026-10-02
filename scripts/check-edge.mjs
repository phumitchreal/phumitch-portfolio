/**
 * scripts/check-edge.mjs — verifies the Cloudflare edge layer after cutover.
 *
 *   pnpm check:edge            # defaults to https://phumitch.space
 *   EDGE_ORIGIN=https://... pnpm check:edge
 *
 * Read-only. Reports whether Cloudflare is proxying, whether the settings that
 * would break this site are in the safe position (Rocket Loader off, HTML and /api
 * not cached), and whether the Turnstile gate is actually live in production.
 */
const ORIGIN = process.env.EDGE_ORIGIN || "https://phumitch.space";
const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

let pass = 0;
let warn = 0;
let fail = 0;
function report(level, label, detail = "") {
  if (level === "ok") pass += 1;
  else if (level === "warn") warn += 1;
  else fail += 1;
  console.log(`  ${level.padEnd(4)} ${label}${detail ? `  ${detail}` : ""}`);
}

async function get(path, init) {
  try {
    return await fetch(ORIGIN + path, { redirect: "follow", ...init });
  } catch (err) {
    return { ok: false, status: 0, headers: new Headers(), error: err };
  }
}

const home = await get("/", { headers: { "user-agent": "crinoid-edge-check/1.0" } });
const html = home.status ? await home.text() : "";
const h = (name) => home.headers.get(name) ?? "";

console.log(`\nedge check — ${ORIGIN}\n`);

console.log("[1] Cloudflare proxy");
report(home.status === 200 ? "ok" : "fail", "site responds", `status ${home.status}`);
report("cf-ray" in Object.fromEntries(home.headers) ? "ok" : "warn", "cf-ray header present", h("cf-ray") || "(proxy is OFF — DNS-only)");
report("", "server header", h("server") || "(none)");

console.log("\n[2] settings that would break this site");
report(/rocket-loader/i.test(html) ? "fail" : "ok", "Rocket Loader", /rocket-loader/i.test(html) ? "DETECTED — turn it OFF, it breaks the React islands" : "off (good)");
const cache = h("cf-cache-status");
report(cache === "HIT" ? "fail" : "ok", "HTML not cached at the edge", `cf-cache-status: ${cache || "(none)"}`);

console.log("\n[3] Turnstile gate");
report(html.includes("TurnstileGate") ? "ok" : "fail", "gate island in the HTML");
report(/0x4AAAAAAFLj2KdJ-qrmnc_J/.test(html) ? "ok" : "fail", "sitekey inlined at build time", "(needs PUBLIC_TURNSTILE_SITE_KEY in Vercel)");
report(/challenges\.cloudflare\.com/.test(html) ? "ok" : "warn", "preconnect to challenges.cloudflare.com");

const probe = await get("/api/verify-turnstile", { headers: { accept: "application/json" } });
let probeJson = null;
try {
  probeJson = JSON.parse(await probe.text());
} catch {
  probeJson = null;
}
const hasProbe = probeJson !== null && typeof probeJson.enforced === "boolean";
report(
  hasProbe ? "ok" : "fail",
  "GET /api/verify-turnstile returns the probe",
  hasProbe ? JSON.stringify(probeJson) : `status ${probe.status} — function missing or a Cloudflare challenge page`
);
if (hasProbe) {
  report(
    probeJson.enforced === true ? "ok" : "warn",
    "Turnstile enforcement is ON",
    probeJson.enforced === true ? "" : "set TURNSTILE_SECRET + TURNSTILE_SESSION_SECRET in Vercel"
  );
}

const counts = await get("/api/studio-lol-counts", { headers: { accept: "application/json" } });
report(counts.status === 401 ? "ok" : "warn", "/api/studio-lol-counts is gated", `status ${counts.status}${counts.status === 200 ? " (not enforced — keys missing)" : ""}`);

console.log("\n[4] third parties");
const ts = await fetch(TURNSTILE_SCRIPT).catch(() => null);
report(ts && ts.ok ? "ok" : "fail", "Turnstile api.js reachable", ts ? `status ${ts.status}` : "unreachable");

console.log(`\n${pass} ok, ${warn} warn, ${fail} fail\n`);
if (fail) process.exitCode = 1;