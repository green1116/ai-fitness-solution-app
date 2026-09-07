"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  TENANT_OPS_OPEN_DEAL_ID,
  TENANT_OPS_OPEN_DEAL_VERSION,
  runTenantOpsOpenDealAction,
  type TenantOpsOpenDealResult,
} from "@/lib/runtime-ops/tenant-ops-open-deal";
import { appendTenantOpsGateFailureAudit } from "@/lib/runtime-ops/tenant-ops-audit";
import { resolveTenantOpsOrgContext } from "@/lib/runtime-ops/tenant-ops-org-gate";
import {
  isTenantOpsRoleAllowed,
  TENANT_OPS_ROLE_FORBIDDEN_REASON,
} from "@/lib/runtime-ops/tenant-ops-role-gate";
import { runWithTenantContext } from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitTenantOpsOpenDealAction is server-only");
}

function gateFailed(
  itemId: string,
  organizationId: string,
  reason: string,
): TenantOpsOpenDealResult {
  return {
    workPackageId: TENANT_OPS_OPEN_DEAL_ID,
    version: TENANT_OPS_OPEN_DEAL_VERSION,
    itemId: itemId.trim(),
    organizationId,
    customerId: null,
    entityId: null,
    stage: null,
    dealId: null,
    reused: false,
    action: "open-deal",
    result: "FAILED",
    executed: false,
    reason,
  };
}

async function sessionUserId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function submitTenantOpsOpenDealAction(
  _prev: TenantOpsOpenDealResult | null,
  formData: FormData,
): Promise<TenantOpsOpenDealResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const organizationId = String(formData.get("organizationId") ?? "");
  const gate = await resolveTenantOpsOrgContext({
    organizationId,
    traceId: "tenant-ops-open-deal-action",
  });
  if (!gate.ok) {
    const failed = gateFailed(itemId, gate.organizationId, gate.reason);
    await appendTenantOpsGateFailureAudit({
      kind: "open_deal",
      organizationId: gate.organizationId,
      userId: await sessionUserId(),
      itemId,
      action: "open-deal",
      reason: gate.reason,
    });
    return failed;
  }
  if (!isTenantOpsRoleAllowed(gate.role)) {
    const failed = gateFailed(
      itemId,
      gate.tenant.organizationId,
      TENANT_OPS_ROLE_FORBIDDEN_REASON,
    );
    await appendTenantOpsGateFailureAudit({
      kind: "open_deal",
      organizationId: gate.tenant.organizationId,
      userId: gate.tenant.userId,
      itemId,
      action: "open-deal",
      reason: TENANT_OPS_ROLE_FORBIDDEN_REASON,
    });
    return failed;
  }

  const result = await runWithTenantContext(gate.tenant, async () =>
    runTenantOpsOpenDealAction({
      organizationId: gate.tenant.organizationId,
      itemId,
      userId: gate.tenant.userId,
    }),
  );

  if (result.result === "SUCCESS") {
    revalidatePath("/projects", "layout");
  }

  return result;
}
