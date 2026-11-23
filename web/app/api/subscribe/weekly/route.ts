import { deliverWeekly } from "../../../../subscribe/delivery";
import { configuredCronSecret, subscriptionRuntime } from "../../../../subscribe/runtime";
import { secureEqual } from "../../../../subscribe/tokens";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = configuredCronSecret();
  const headers = { "Cache-Control": "no-store" };
  if (!secret || !secureEqual(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return Response.json({ status: "unauthorized" }, { status: 401, headers });
  }
  const runtime = subscriptionRuntime();
  if (!runtime) return Response.json({ status: "unavailable" }, { status: 503, headers });
  try {
    const result = await deliverWeekly(runtime);
    return Response.json(result, { status: result.incomplete || result.unresolved || result.failed ? 503 : 200, headers });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers });
  }
}
