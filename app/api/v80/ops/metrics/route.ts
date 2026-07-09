import { getV80MetricsSnapshot } from "@/lib/scaffold/v80/ops/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, metrics: getV80MetricsSnapshot() });
}
