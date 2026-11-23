import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const uuid = "[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}";
const grantPattern = new RegExp(`^(${uuid})\\.(${uuid})\\.([A-Za-z0-9_-]{43})$`);

export const confirmationLifetimeMs = 24 * 60 * 60 * 1000;
export function newConfirmationToken() {
  return randomBytes(32).toString("base64url");
}

export function confirmationHash(token: unknown) {
  return typeof token === "string" && tokenPattern.test(token) ? hash(token).toString("hex") : null;
}

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

export function secureEqual(a: string, b: string) {
  return timingSafeEqual(hash(a), hash(b));
}

export type Grant = { id: string; version: string };

export function managementToken({ id, version }: Grant, secret: string) {
  const payload = `${id}.${version}`;
  const signature = createHmac("sha256", secret).update(`floating-wind-digest:manage:v1:${payload}`).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyManagementToken(token: unknown, secret: string): Grant | null {
  if (typeof token !== "string" || token.length !== 117) return null;
  const match = grantPattern.exec(token);
  if (!match) return null;
  const grant = { id: match[1], version: match[2] };
  return secureEqual(token, managementToken(grant, secret)) ? grant : null;
}
