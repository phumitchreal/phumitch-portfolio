/**
 * authCrypto.ts - Web Crypto API based PBKDF2 password hashing & token generation.
 * Works natively in modern browsers and Node.js with zero dependencies.
 */

export function generateSalt(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSessionToken(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return generateSalt(24);
}

export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const exported = await crypto.subtle.exportKey("raw", key);
  return Array.from(new Uint8Array(exported))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
