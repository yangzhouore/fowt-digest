import type { Preferences } from "../../subscribe/preferences";

export type ActionResult = { code: string; preferences?: Preferences; token?: string };

export async function callSubscribe(input: Record<string, unknown>): Promise<ActionResult> {
  try {
    const response = await fetch("/api/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    });
    const body = await response.json();
    return typeof body?.code === "string" ? body : { code: "unavailable" };
  } catch {
    return { code: "unavailable" };
  }
}

export const messages = {
  requested: { en: "Check your inbox for a confirmation link.", zh: "请检查收件箱，打开订阅确认链接。" },
  confirmed: { en: "Your subscription is confirmed.", zh: "您的订阅已确认。" },
  saved: { en: "Your preferences were saved.", zh: "您的订阅偏好已保存。" },
  unsubscribed: { en: "You’ve unsubscribed from all emails.", zh: "您已取消所有电子邮件订阅。" },
  invalidLink: { en: "This link is invalid, expired, or has already been used.", zh: "此链接无效、已过期或已使用。" },
  invalidEmail: { en: "Enter a valid email address.", zh: "请输入有效的电子邮件地址。" },
  selection: { en: "Choose at least one subscription.", zh: "请至少选择一项订阅。" },
  companyRequired: { en: "Select at least one company for Company Brief.", zh: "请为企业简报至少选择一家企业。" },
  invalid: { en: "Check your selections and try again.", zh: "请检查您的选择后重试。" },
  throttled: { en: "Please wait before requesting another confirmation link.", zh: "请稍候再申请新的确认链接。" },
  unavailable: { en: "Subscriptions are temporarily unavailable. Please try again later.", zh: "订阅服务暂时不可用，请稍后重试。" },
};
