/**
 * _turnstile.js — shared Cloudflare Turnstile helpers for the /api functions.
 *
 * Two jobs:
 *   1. validate a widget token against Cloudflare's Siteverify API
 *   2. issue / check the signed "human verified" session cookie (HMAC-SHA256)
 *
 * The leading underscore keeps this file out of the routable surface. It still
 * exports a harmless default handler, so even if a host decided to route it the
 * worst case is a 404 instead of a broken build.
 *
 * Env (see .env.example):
 *   TURNSTILE_SECRET           — widget secret (server only, never public).
 *                                `TURNSTILE_SECRET_KEY` is accepted as an alias.
 *   PUBLIC_TURNSTILE_SITE_KEY  — the same widget's sitekey (public)
 *   TURNSTILE_SESSION_SECRET   — 32+ byte random string used to sign the cookie
 *   TURNSTILE_ALLOWED_HOSTS    — optional comma-separated override of the allowlist
 *   TURNSTILE_EXPECTED_HOSTNAME— optional single host added to the allowlist
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "pv_verified";
/** Must match the `action` the widget renders with (see TurnstileGate.tsx). */
export const EXPECTED_ACTION = "site-gate";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SITEVERIFY_TIMEOUT_MS = 5000;
const COOKIE_ATTRS = "HttpOnly; Secure; SameSite=Lax; Path=/";
const DEFAULT_ALLOWED_HOSTS = ["phumitch.space", "www.phumitch.space", "localhost", "127.0.0.1"];

/* ------------------------------------------------------------------ config */

/** Canonical `TURNSTILE_SECRET` first; `TURNSTILE_SECRET_KEY` kept as an alias. */
function secretKey() {
  return process.env.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET_KEY || "";
}

function sessionSecret() {
  return process.env.TURNSTILE_SESSION_SECRET || "";
}

/**
 * Enforcement is on only when the server can both validate tokens and sign the
 * cookie. Without keys the site behaves exactly as before — a missing env var
 * must never brick the portfolio.
 */
export function isEnforced() {
  return Boolean(secretKey() && sessionSecret().length >= 16);
}

/** Dummy keys from the Cloudflare docs — hostname/action are not meaningful for them. */
function isTestSecret() {
  return /^[123]x0{20,}[A-Z]{2}$/.test(secretKey());
}

/** Hostnames a token may come from. Previews on *.vercel.app are allowed too. */
export function isAllowedHostname(hostname) {
  if (typeof hostname !== "string" || !hostname) return false;
  const configured = (process.env.TURNSTILE_ALLOWED_HOSTS || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  const expected = (process.env.TURNSTILE_EXPECTED_HOSTNAME || "").trim().toLowerCase();
  const allowed = configured.length ? configured : [...DEFAULT_ALLOWED_HOSTS];
  if (expected) allowed.push(expected);
  const host = hostname.toLowerCase();
  return allowed.includes(host) || host.endsWith(".vercel.app");
}

/* ----------------------------------------------------------------- session */

function sign(value) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

/** `<expires-at-ms>.<hmac>` — the expiry lives inside the signed payload. */
export function issueSession(now = Date.now()) {
  const expires = String(now + SESSION_TTL_MS);
  return `${expires}.${sign(`v1:${expires}`)}`;
}

export function readSession(token, now = Date.now()) {
  if (typeof token !== "string") return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const expires = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  if (!/^\d{1,20}$/.test(expires)) return false;
  if (Number(expires) <= now) return false;
  const expected = sign(`v1:${expires}`);
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export function parseCookies(req) {
  const header = req?.headers?.cookie;
  const out = {};
  if (typeof header !== "string" || !header) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (!name) continue;
    try {
      out[name] = decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      /* malformed percent-encoding — treat as absent */
    }
  }
  return out;
}

/** True when the request carries a valid, unexpired verification cookie. */
export function isSessionValid(req) {
  if (!isEnforced()) return true;
  return readSession(parseCookies(req)[COOKIE_NAME]);
}

export function setSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${issueSession()}; ${COOKIE_ATTRS}; Max-Age=${SESSION_TTL_MS / 1000}`);
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; ${COOKIE_ATTRS}; Max-Age=0`);
}

/** First hop in X-Forwarded-For is the visitor; Vercel sets it for us. */
export function getClientIp(req) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof first === "string" && first.length) return first.split(",")[0].trim();
  const real = req?.headers?.["x-real-ip"];
  if (typeof real === "string" && real.length) return real.trim();
  return "";
}

/* --------------------------------------------------------------- siteverify */

/**
 * Validate a widget token with Cloudflare.
 * @returns {Promise<{ok: boolean, status: number, codes: string[], hostname: string|null, action: string|null, test: boolean}>}
 *   `status` is the HTTP status the endpoint should answer the client with.
 */
export async function siteverify(token, ip) {
  const body = new URLSearchParams();
  body.set("secret", secretKey());
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SITEVERIFY_TIMEOUT_MS);
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    if (!data || typeof data !== "object") {
      return { ok: false, status: 502, codes: ["bad-siteverify-response"], hostname: null, action: null, test: false };
    }
    const codes = Array.isArray(data["error-codes"]) ? data["error-codes"].map(String) : [];
    return {
      ok: data.success === true,
      status: data.success === true ? 200 : 403,
      codes,
      hostname: typeof data.hostname === "string" ? data.hostname : null,
      action: typeof data.action === "string" ? data.action : null,
      test: isTestSecret(),
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      status: 502,
      codes: [aborted ? "siteverify-timeout" : "siteverify-unreachable"],
      hostname: null,
      action: null,
      test: false,
    };
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------- not-a-route guard */

/** Never invoked when the file is treated as a helper — keeps it harmless if it is. */
export default function helperOnly(_req, res) {
  res.status(404).json({ error: "not_found" });
}
