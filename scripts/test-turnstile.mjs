/**
 * scripts/test-turnstile.mjs โ€” exercises the Turnstile endpoints end to end.
 *
 *   pnpm test:turnstile
 *
 * Runs the real handlers with mocked req/res. Uses the live keys from .env.local
 * (so a forged token is genuinely rejected by Cloudflare) and the documented dummy
 * keys for the success path. Needs network access.
 */
import fs from "node:fs";

/* โ”€โ”€ env โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
const envPath = new URL("../.env.local", import.meta.url);
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = /^([A-Za-z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const verify = (await import("../api/verify-turnstile.js")).default;
const counts = (await import("../api/studio-lol-counts.js")).default;
const { COOKIE_NAME, isAllowedHostname, issueSession } = await import("../api/_turnstile.js");

/* โ”€โ”€ tiny harness โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
let pass = 0;
let fail = 0;
function check(label, ok, detail = "") {
  if (ok) {
    pass += 1;
    console.log(`  ok   ${label}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${label}  ${detail}`);
  }
}

function mockRes() {
  const headers = {};
  let code = 200;
  let body = null;
  return {
    headers,
    setHeader(name, value) {
      headers[String(name).toLowerCase()] = value;
    },
    status(value) {
      code = value;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
    get code() {
      return code;
    },
    get body() {
      return body;
    },
  };
}

function mockReq({ method = "GET", body, cookie, ip = "203.0.113.7" } = {}) {
  const headers = { "x-forwarded-for": ip };
  if (cookie) headers.cookie = cookie;
  return { method, headers, body };
}

async function call(handler, req) {
  const res = mockRes();
  await handler(req, res);
  return res;
}

const real = {
  secret: process.env.TURNSTILE_SECRET,
  session: process.env.TURNSTILE_SESSION_SECRET,
};
const DUMMY_PASS = "1x0000000000000000000000000000000AA";
const DUMMY_FAIL = "2x0000000000000000000000000000000AA";
const DUMMY_REPLAY = "3x0000000000000000000000000000000AA";
const DUMMY_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";
const HOURS = 60 * 60 * 1000;

console.log("\n[1] live keys โ€” a forged token must be rejected by Cloudflare");
const bogus = await call(verify, mockReq({ method: "POST", body: { token: DUMMY_TOKEN } }));
check("POST forged token โ’ 403", bogus.code === 403, `got ${bogus.code}`);
check(
  "cloudflare error code surfaced",
  (bogus.body?.codes ?? []).includes("invalid-input-response"),
  JSON.stringify(bogus.body)
);
check("no cookie handed out on failure", !bogus.headers["set-cookie"]);

console.log("\n[2] status probe + cookie signing");
const probe = await call(verify, mockReq());
check(
  "GET without cookie โ’ enforced, not verified",
  probe.code === 200 && probe.body.enforced === true && probe.body.verified === false,
  JSON.stringify(probe.body)
);
const forged = await call(verify, mockReq({ cookie: `${COOKIE_NAME}=9999999999999.forged` }));
check("forged cookie rejected", forged.body.verified === false, JSON.stringify(forged.body));
const good = await call(verify, mockReq({ cookie: `${COOKIE_NAME}=${issueSession()}` }));
check("valid signed cookie accepted", good.body.verified === true, JSON.stringify(good.body));
const expired = await call(verify, mockReq({ cookie: `${COOKIE_NAME}=${issueSession(Date.now() - 13 * HOURS)}` }));
check("expired cookie rejected", expired.body.verified === false, JSON.stringify(expired.body));

console.log("\n[3] dummy keys โ€” success path issues the session");
process.env.TURNSTILE_SECRET = DUMMY_PASS;
const dummyOk = await call(verify, mockReq({ method: "POST", body: { token: DUMMY_TOKEN } }));
check("POST dummy token โ’ 200", dummyOk.code === 200, JSON.stringify(dummyOk.body));
const issued = dummyOk.headers["set-cookie"] ?? "";
check(
  "cookie is HttpOnly + Secure + SameSite=Lax",
  issued.includes(`${COOKIE_NAME}=`) &&
    issued.includes("HttpOnly") &&
    issued.includes("Secure") &&
    issued.includes("SameSite=Lax"),
  issued
);

console.log("\n[4] dummy keys โ€” failure path");
process.env.TURNSTILE_SECRET = DUMMY_FAIL;
const dummyFail = await call(verify, mockReq({ method: "POST", body: { token: DUMMY_TOKEN } }));
check("always-fail secret โ’ 403", dummyFail.code === 403, JSON.stringify(dummyFail.body));

console.log("\n[5] request guards");
const badMethod = await call(verify, mockReq({ method: "DELETE" }));
check(
  "DELETE โ’ 405 + Allow header",
  badMethod.code === 405 && badMethod.headers.allow === "GET, POST",
  String(badMethod.code)
);
const empty = await call(verify, mockReq({ method: "POST", body: {} }));
check("empty body โ’ 400 missing_token", empty.code === 400, JSON.stringify(empty.body));

console.log("\n[6] /api/studio-lol-counts is gated");
process.env.TURNSTILE_SECRET = real.secret;
const blocked = await call(counts, mockReq());
check("no cookie โ’ 401", blocked.code === 401, JSON.stringify(blocked.body));
check("rejection is never cached", (blocked.headers["cache-control"] ?? "").includes("no-store"));

const savedDiscord = process.env.DISCORD_BOT_TOKEN;
delete process.env.DISCORD_BOT_TOKEN;
const allowed = await call(counts, mockReq({ cookie: `${COOKIE_NAME}=${issueSession()}` }));
check(
  "valid cookie passes the gate",
  allowed.code === 500 && allowed.body?.error === "missing DISCORD_BOT_TOKEN",
  `${allowed.code} ${JSON.stringify(allowed.body)}`
);
check("verified response stays private", (allowed.headers["cache-control"] ?? "").startsWith("private"));
if (savedDiscord) process.env.DISCORD_BOT_TOKEN = savedDiscord;

console.log("\n[7] no keys configured โ’ the gate stays inert");
process.env.TURNSTILE_SECRET = "";
process.env.TURNSTILE_SESSION_SECRET = "";
const off = await call(verify, mockReq());
check("probe reports enforced:false", off.body.enforced === false, JSON.stringify(off.body));
const offCounts = await call(counts, mockReq());
check("counts endpoint not gated", offCounts.code !== 401, String(offCounts.code));
check("legacy public caching kept", (offCounts.headers["cache-control"] ?? "").startsWith("public"));
process.env.TURNSTILE_SECRET = real.secret;
process.env.TURNSTILE_SESSION_SECRET = real.session;

console.log("\n[8] spin-flow aliases + token lifecycle");
// The alias must still work when the canonical name is absent.
process.env.TURNSTILE_SECRET_KEY = DUMMY_PASS;
delete process.env.TURNSTILE_SECRET;
const viaAlias = await call(
  verify,
  mockReq({ method: "POST", body: { "cf-turnstile-response": DUMMY_TOKEN } })
);
check(
  "TURNSTILE_SECRET_KEY alias + cf-turnstile-response field accepted",
  viaAlias.code === 200,
  `${viaAlias.code} ${JSON.stringify(viaAlias.body)}`
);
delete process.env.TURNSTILE_SECRET_KEY;

process.env.TURNSTILE_SECRET = DUMMY_REPLAY;
const replay = await call(verify, mockReq({ method: "POST", body: { token: DUMMY_TOKEN } }));
check(
  "replayed token rejected (single-use)",
  replay.code === 403 && (replay.body?.codes ?? []).includes("timeout-or-duplicate"),
  JSON.stringify(replay.body)
);

process.env.TURNSTILE_SECRET = real.secret;
process.env.TURNSTILE_EXPECTED_HOSTNAME = "preview.example.com";
check("TURNSTILE_EXPECTED_HOSTNAME extends the allowlist", isAllowedHostname("preview.example.com") === true);
check("unknown hostname still rejected", isAllowedHostname("evil.example") === false);
delete process.env.TURNSTILE_EXPECTED_HOSTNAME;
check("default allowlist keeps the live domain", isAllowedHostname("phumitch.space") === true);
check("www + preview deploys allowed", isAllowedHostname("www.phumitch.space") && isAllowedHostname("crinoid-abc.vercel.app"));

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);