import type { Digest } from "./digests";
import type { Email } from "./mail";
import type { Locale } from "./preferences";

const brand = "Floating Wind Digest";
const labels = {
  en: { manage: "Manage preferences", unsubscribe: "Unsubscribe", edition: "Read on Floating Wind Digest",
    confirm: "Confirm your subscription", request: "Open the link and confirm your selections within 24 hours. If you did not request this email, you can ignore it." },
  zh: { manage: "管理订阅偏好", unsubscribe: "取消订阅", edition: "在 Floating Wind Digest 阅读",
    confirm: "确认您的订阅", request: "请打开链接，并在 24 小时内确认您的选择。如果您没有提交订阅请求，可以忽略此邮件。" },
};

export function manageUrl(site: string, token: string, unsubscribe = false) {
  return `${site}/subscribe/manage#${unsubscribe ? "unsubscribe." : ""}${token}`;
}

export function confirmationEmail(site: string, token: string, locale: Locale): Email {
  const { confirm, request } = labels[locale];
  const url = `${site}/subscribe/confirm#${token}`;
  return {
    subject: `${brand} — ${confirm}`,
    text: `${brand}\n${request}\n${confirm}: ${url}`,
    html: document(locale, `<h1>${escapeHtml(brand)}</h1><p>${escapeHtml(request)}</p><p>${anchor(site, url, confirm)}</p>`),
  };
}

export function digestEmail(digest: Digest, site: string, token: string, locale: Locale): Email {
  const { edition, manage, unsubscribe } = labels[locale];
  const manageHref = manageUrl(site, token);
  const unsubscribeHref = manageUrl(site, token, true);
  const plain = [brand, digest.title, digest.period];
  const html = [`<p>${escapeHtml(brand)}</p><h1>${escapeHtml(digest.title)}</h1><p>${escapeHtml(digest.period)}</p>`];
  for (const section of digest.sections) {
    if (section.title) {
      plain.push("", section.title);
      html.push(`<h2>${escapeHtml(section.title)}</h2>`);
    }
    for (const item of section.items) {
      plain.push("", item.title, ...item.lines, toHttpUrl(site, item.url) ?? "");
      html.push(`<h3>${anchor(site, item.url, item.title)}</h3>`, ...item.lines.map(paragraph));
      for (const { url, label } of item.links ?? []) {
        const safe = toHttpUrl(site, url);
        if (safe) plain.push(`${label}: ${safe}`);
        html.push(`<p>${anchor(site, url, label)}</p>`);
      }
    }
    if (section.note) {
      plain.push(section.note);
      html.push(paragraph(section.note));
    }
    if (section.url) {
      plain.push(`${edition}: ${toHttpUrl(site, section.url)}`);
      html.push(`<p>${anchor(site, section.url, edition)}</p>`);
    }
  }
  plain.push("", `${manage}: ${manageHref}`, `${unsubscribe}: ${unsubscribeHref}`);
  html.push(`<hr><p>${anchor(site, manageHref, manage)} · ${anchor(site, unsubscribeHref, unsubscribe)}</p>`);
  const subject = digest.kind === "company" && digest.companyIds.length === 1
    ? `${digest.title} — ${digest.periodEnd} | ${brand}`
    : `${brand} — ${digest.title} — ${digest.periodEnd}`;
  return { subject, text: plain.join("\n"), html: document(locale, html.join("\n")) };
}

function document(locale: Locale, body: string) {
  return `<!doctype html><html lang="${locale === "zh" ? "zh-CN" : "en"}"><head><meta charset="utf-8"></head><body>${body}</body></html>`;
}

function paragraph(value: string) {
  return `<p>${escapeHtml(value)}</p>`;
}

function anchor(site: string, url: string, label: string) {
  const safe = toHttpUrl(site, url);
  return safe ? `<a href="${escapeHtml(safe)}">${escapeHtml(label)}</a>` : escapeHtml(label);
}

function toHttpUrl(site: string, url: string) {
  try {
    const parsed = new URL(url, site);
    return ["http:", "https:"].includes(parsed.protocol) && !parsed.username && !parsed.password ? parsed.href : null;
  } catch {
    return null;
  }
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
