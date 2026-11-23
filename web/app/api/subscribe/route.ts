import { subscriptionRuntime } from "../../../subscribe/runtime";
import { subscriptionAction } from "../../../subscribe/service";

function respond(data: object, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const runtime = subscriptionRuntime();
  if (!runtime) return respond({ code: "unavailable" }, 503);
  if (request.headers.get("origin") !== runtime.site) return respond({ code: "invalid" }, 403);
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return respond({ code: "invalid" }, 415);
  if (Number(request.headers.get("content-length")) > 4096) return respond({ code: "invalid" }, 413);
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 4096) return respond({ code: "invalid" }, 413);
    body = JSON.parse(text);
  } catch {
    return respond({ code: "invalid" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return respond({ code: "invalid" }, 400);
  try {
    const result = await subscriptionAction(runtime, body as Record<string, unknown>);
    return respond(result, result.code === "unavailable" ? 503 : result.code === "invalidLink" ? 401 :
      result.code === "throttled" ? 429 :
      ["invalid", "invalidEmail", "companyRequired", "selection"].includes(result.code) ? 400 : 200);
  } catch {
    // Driver and provider errors can contain sensitive values. Return a generic status.
    return respond({ code: "unavailable" }, 503);
  }
}
