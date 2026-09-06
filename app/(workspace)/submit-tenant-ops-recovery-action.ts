"use server";

import { revalidatePath } from "next/cache";

import { resolveTenantOpsOrgContext } from "@/lib/runtime-ops/tenant-ops-org-gate";
import {
  TENANT_OPS_RECOVERY_ID,
  TENANT_OPS_RECOVERY_VERSION,
  completeTenantOpsRecovery,
  type TenantOpsRecoveryResult,
} from "@/lib/runtime-ops/tenant-ops-recovery";
import {
  isTenantOpsRoleAllowed,
  TENANT_OPS_ROLE_FORBIDDEN_REASON,
} from "@/lib/runtime-ops/tenant-ops-role-gate";
import { runWithTenantContext } from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitTenantOpsRecoveryAction is server-only");
}

function gateFailed(
  itemId: string,
  organizationId: string,
  reason: string,
): TenantOpsRecoveryResult {
  return {
    workPackageId: TENANT_OPS_RECOVERY_ID,
    version: TENANT_OPS_RECOVERY_VERSION,
    itemId: itemId.trim(),
    organizationId,
    customerId: null,
    entityId: null,
    stage: null,
    recovered: false,
    result: "FAILED",
    reason,
  };
}

export async function submitTenantOpsRecoveryAction(
  _prev: TenantOpsRecoveryResult | null,
  formData: FormData,
): Promise<TenantOpsRecoveryResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const organizationId = String(formData.get("organizationId") ?? "");
  const gate = await resolveTenantOpsOrgContext({
    organizationId,
    traceId: "tenant-ops-recovery-action",
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
    completeTenantOpsRecovery({
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
