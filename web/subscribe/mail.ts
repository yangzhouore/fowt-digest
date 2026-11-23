export type Email = { subject: string; text: string; html: string };
export type SendOutcome = { status: "sent"; providerId: string } | { status: "failed" | "uncertain"; detail: string };
export type Mailer = (email: string, content: Email, idempotencyKey: string) => Promise<SendOutcome>;

export function resendMailer(apiKey: string, from: string): Mailer {
  return async (email, content, idempotencyKey) => {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ ...content, from, to: [email] }),
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
        redirect: "error",
      });
      // Resend explicitly rejected these requests. Conflicts, network and
      // server errors can leave acceptance unresolved, so never auto-replay them.
      if (!response.ok) {
        const rejected = [400, 401, 403, 404, 422, 429].includes(response.status);
        return { status: rejected ? "failed" : "uncertain", detail: `provider_http_${response.status}` };
      }
      const result = await response.json();
      if (typeof result?.id === "string" && result.id.trim().length > 0 && result.id.length <= 128) {
        return { status: "sent", providerId: result.id };
      }
      return { status: "uncertain", detail: "provider_id_missing" };
    } catch {
      return { status: "uncertain", detail: "provider_unreachable" };
    }
  };
}
