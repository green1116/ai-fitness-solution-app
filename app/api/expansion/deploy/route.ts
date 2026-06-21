import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import {
  deployTenantInstance,
  listDeploymentsForOrganization,
} from "@/lib/expansion/expansion.service";
import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

const VALID = new Set(["fitness", "education", "procurement", "enterprise", "hr_admin"]);

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/expansion/deploy");
    traceId = gate.traceId;

    const deployments = listDeploymentsForOrganization(gate.organizationId);
    return NextResponse.json({ ok: true, deployments, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/expansion/deploy" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Failed to list deployments", traceId }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/expansion/deploy", body);
    traceId = gate.traceId;

    const vertical = String(body?.vertical ?? "fitness") as VerticalIndustry;
    if (!VALID.has(vertical)) {
      return NextResponse.json({ ok: false, message: "Invalid vertical", traceId }, { status: 400 });
    }

    const deployment = deployTenantInstance({
      organizationId: gate.organizationId,
      vertical,
      branding: body?.companyName
        ? {
            companyName: String(body.companyName),
            logoUrl: body?.logoUrl,
            domain: body?.domain,
          }
        : undefined,
    });

    return NextResponse.json({ ok: true, deployment, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/expansion/deploy" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Deployment failed", traceId }, { status: 500 });
  }
}
