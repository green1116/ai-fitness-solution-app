"use server";

import { revalidatePath } from "next/cache";

import {
  TENANT_OPS_OPEN_DEAL_ID,
  TENANT_OPS_OPEN_DEAL_VERSION,
  runTenantOpsOpenDealAction,
  type TenantOpsOpenDealResult,
} from "@/lib/runtime-ops/tenant-ops-open-deal";
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
    return gateFailed(itemId, gate.organizationId, gate.reason);
  }
  if (!isTenantOpsRoleAllowed(gate.role)) {
    return gateFailed(
      itemId,
      gate.tenant.organizationId,
      TENANT_OPS_ROLE_FORBIDDEN_REASON,
    );
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
