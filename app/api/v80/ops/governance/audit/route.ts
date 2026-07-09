import { getV80AuditTrail } from "@/lib/scaffold/v80/ops/governance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(100, Number(url.searchParams.get("limit") ?? 50));
  return Response.json({ ok: true, audit: getV80AuditTrail(limit) });
}
