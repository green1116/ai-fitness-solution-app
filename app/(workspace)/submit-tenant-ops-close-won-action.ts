"use server";

import { revalidatePath } from "next/cache";

import {
  TENANT_OPS_CLOSE_WON_ID,
  TENANT_OPS_CLOSE_WON_VERSION,
  runTenantOpsCloseWonAction,
  type TenantOpsCloseWonResult,
} from "@/lib/runtime-ops/tenant-ops-close-won";
import { resolveTenantOpsOrgContext } from "@/lib/runtime-ops/tenant-ops-org-gate";
import {
  isTenantOpsRoleAllowed,
  TENANT_OPS_ROLE_FORBIDDEN_REASON,
} from "@/lib/runtime-ops/tenant-ops-role-gate";
import { runWithTenantContext } from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitTenantOpsCloseWonAction is server-only");
}

function gateFailed(
  itemId: string,
  organizationId: string,
  reason: string,
): TenantOpsCloseWonResult {
  return {
    workPackageId: TENANT_OPS_CLOSE_WON_ID,
    version: TENANT_OPS_CLOSE_WON_VERSION,
    itemId: itemId.trim(),
    organizationId,
    customerId: null,
    entityId: null,
    stage: null,
    dealId: null,
    dealStatus: null,
    reused: false,
    action: "close-won",
    result: "FAILED",
    executed: false,
    reason,
  };
}

export async function submitTenantOpsCloseWonAction(
  _prev: TenantOpsCloseWonResult | null,
  formData: FormData,
): Promise<TenantOpsCloseWonResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const organizationId = String(formData.get("organizationId") ?? "");
  const gate = await resolveTenantOpsOrgContext({
    organizationId,
    traceId: "tenant-ops-close-won-action",
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
    runTenantOpsCloseWonAction({
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
