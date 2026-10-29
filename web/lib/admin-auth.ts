import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export function adminAuth(authorization: string | null, env = process.env): "ok" | "denied" | "unconfigured" {
  const user = env.ADMIN_ANALYTICS_USERNAME;
  const password = env.ADMIN_ANALYTICS_PASSWORD;
  if (!user || user.includes(":") || !password || password.length < 32) return "unconfigured";
  if (!authorization || authorization.length > 4096 || !/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(authorization)) return "denied";
  const supplied = Buffer.from(authorization.slice(6), "base64").toString("utf8");
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(supplied), digest(`${user}:${password}`)) ? "ok" : "denied";
}

export const adminHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
};
