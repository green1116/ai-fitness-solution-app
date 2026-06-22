import { NextRequest, NextResponse } from "next/server";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function assertPrismaOpsAccess(req: NextRequest, body?: Record<string, unknown>) {
  const expected = (process.env.INTERNAL_PACK_SECRET || "").trim();
  const secret = (req.headers.get("x-internal-pack-secret") || "").trim();
  if (expected && secret === expected) {
    return { authorized: true as const };
  }

  try {
    await runSaasOrgGate(req, "/api/prisma/ops", body, "manage_billing");
    return { authorized: true as const };
  } catch (err) {
    return { authorized: false as const, response: saasGateErrorResponse(err) };
  }
}

export function opsDenied() {
  return NextResponse.json(
    { ok: false, code: "PRISMA_OPS_DENIED", message: "manage_billing or internal secret required" },
    { status: 403 },
  );
}
