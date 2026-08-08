/**
 * Minimal portal route adapter for Pilot APIs.
 * Reuses SaaS org gate — no separate portal auth stack required for P1.
 */
import { NextRequest, NextResponse } from "next/server";

import {
  runSaasOrgGate,
  saasGateErrorResponse,
} from "@/lib/saas/api-gate";

export type PortalUserContext = {
  id: string;
  email: string;
  organizationId: string | null;
  role?: string;
  traceId: string;
};

/** Forwards the real Request into SaaS org gate (Pilot P1 auth). */
export async function withPilotRoute(
  req: Request,
  handler: (ctx: PortalUserContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  const nextReq =
    req instanceof NextRequest ? req : new NextRequest(req.url, req);
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(nextReq, nextReq.nextUrl.pathname);
    traceId = gate.traceId;
    return await handler({
      id: gate.userId,
      email: gate.email,
      organizationId: gate.organizationId,
      role: gate.role,
      traceId: gate.traceId,
    });
  } catch (err) {
    return saasGateErrorResponse(err, traceId);
  }
}

/** @deprecated Prefer withPilotRoute(req, handler) */
export async function withPortalRoute(
  _surface: string,
  handler: (ctx: PortalUserContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  return withPilotRoute(new NextRequest("http://local/api/pilot"), handler);
}
