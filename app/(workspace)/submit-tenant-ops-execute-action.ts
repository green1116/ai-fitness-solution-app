"use server";

import { revalidatePath } from "next/cache";

import {
  TENANT_OPS_EXECUTE_ID,
  TENANT_OPS_EXECUTE_VERSION,
  runTenantOpsExecuteAction,
  type TenantOpsExecuteActionResult,
} from "@/lib/runtime-ops/tenant-ops-execute";
import { resolveTenantOpsOrgContext } from "@/lib/runtime-ops/tenant-ops-org-gate";
import {
  isTenantOpsRoleAllowed,
  TENANT_OPS_ROLE_FORBIDDEN_REASON,
} from "@/lib/runtime-ops/tenant-ops-role-gate";
import { runWithTenantContext } from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitTenantOpsExecuteAction is server-only");
}

function gateFailed(
  itemId: string,
  organizationId: string,
  reason: string,
): TenantOpsExecuteActionResult {
  return {
    workPackageId: TENANT_OPS_EXECUTE_ID,
    version: TENANT_OPS_EXECUTE_VERSION,
    itemId: itemId.trim(),
    organizationId,
    customerId: null,
    entityId: null,
    fromStage: null,
    toStage: null,
    action: null,
    result: "FAILED",
    executed: false,
    reason,
  };
}

export async function submitTenantOpsExecuteAction(
  _prev: TenantOpsExecuteActionResult | null,
  formData: FormData,
): Promise<TenantOpsExecuteActionResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const organizationId = String(formData.get("organizationId") ?? "");
  const gate = await resolveTenantOpsOrgContext({
    organizationId,
    traceId: "tenant-ops-execute-action",
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
    runTenantOpsExecuteAction({
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
