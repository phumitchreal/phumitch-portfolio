/**
 * POST /api/verify-turnstile — exchange a Turnstile widget token for a session.
 *
 * Body (JSON or form): { token } or cf-turnstile-response
 *   200 { enforced: false }            → no keys configured, gate stays out of the way
 *   200 { ok: true, verified: true }   → sets the signed pv_verified cookie
 *   400 missing_token · 403 verification_failed · 429 too_many_requests · 502 cloudflare_unreachable
 *
 * GET /api/verify-turnstile → { enforced, verified } — cheap status probe for the gate.
 *
 * The cookie is HttpOnly + HMAC-SHA256 signed, so the client cannot forge it.
 * All traffic goes through Cloudflare's Siteverify API (see api/_turnstile.js).
 */
import {
  EXPECTED_ACTION,
  getClientIp,
  isAllowedHostname,
  isEnforced,
  isSessionValid,
  setSessionCookie,
  siteverify,
} from "./_turnstile.js";

/* Best-effort abuse brake. Serverless instances are per-instance, so this is a
   speed bump on top of the Turnstile challenge itself — not a hard guarantee. */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;
const RATE_MAX_KEYS = 5000;
const buckets = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const key = ip || "unknown";
  const entry = buckets.get(key);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    if (buckets.size >= RATE_MAX_KEYS) buckets.clear();
    buckets.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

/** Vercel parses JSON bodies, but accept form posts (and raw strings) too. */
function readToken(req) {
  let payload = req.body;
  if (typeof payload === "string" && payload.length) {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = Object.fromEntries(new URLSearchParams(payload));
    }
  }
  if (!payload || typeof payload !== "object") return "";
  const raw = payload.token ?? payload["cf-turnstile-response"] ?? "";
  const token = typeof raw === "string" ? raw.trim() : "";
  return token.length <= 2048 ? token : "";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  if (!isEnforced()) {
    return res.status(200).json({ enforced: false, verified: true, reason: "not_configured" });
  }

  if (req.method === "GET") {
    return res.status(200).json({ enforced: true, verified: isSessionValid(req) });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const ip = getClientIp(req);
  if (rateLimited(ip)) {
    res.setHeader("Retry-After", String(RATE_WINDOW_MS / 1000));
    return res.status(429).json({ error: "too_many_requests" });
  }

  const token = readToken(req);
  if (!token) return res.status(400).json({ error: "missing_token" });

  const result = await siteverify(token, ip);
  if (!result.ok) {
    return res.status(result.status).json({ error: "verification_failed", codes: result.codes });
  }

  /* Dummy test keys report a synthetic hostname/action — skip the extra checks there. */
  if (!result.test) {
    if (!isAllowedHostname(result.hostname)) {
      return res.status(403).json({ error: "hostname_mismatch" });
    }
    if (result.action && result.action !== EXPECTED_ACTION) {
      return res.status(403).json({ error: "action_mismatch" });
    }
  }

  setSessionCookie(res);
  return res.status(200).json({ ok: true, enforced: true, verified: true });
}