"use server";

import { revalidatePath } from "next/cache";

import {
  TENANT_OPS_CLOSE_LOST_ID,
  TENANT_OPS_CLOSE_LOST_VERSION,
  runTenantOpsCloseLostAction,
  type TenantOpsCloseLostResult,
} from "@/lib/runtime-ops/tenant-ops-close-lost";
import { resolveTenantOpsOrgContext } from "@/lib/runtime-ops/tenant-ops-org-gate";
import {
  isTenantOpsRoleAllowed,
  TENANT_OPS_ROLE_FORBIDDEN_REASON,
} from "@/lib/runtime-ops/tenant-ops-role-gate";
import { runWithTenantContext } from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitTenantOpsCloseLostAction is server-only");
}

function gateFailed(
  itemId: string,
  organizationId: string,
  reason: string,
): TenantOpsCloseLostResult {
  return {
    workPackageId: TENANT_OPS_CLOSE_LOST_ID,
    version: TENANT_OPS_CLOSE_LOST_VERSION,
    itemId: itemId.trim(),
    organizationId,
    customerId: null,
    entityId: null,
    stage: null,
    dealId: null,
    dealStatus: null,
    reused: false,
    action: "close-lost",
    result: "FAILED",
    executed: false,
    reason,
  };
}

export async function submitTenantOpsCloseLostAction(
  _prev: TenantOpsCloseLostResult | null,
  formData: FormData,
): Promise<TenantOpsCloseLostResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const organizationId = String(formData.get("organizationId") ?? "");
  const gate = await resolveTenantOpsOrgContext({
    organizationId,
    traceId: "tenant-ops-close-lost-action",
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
    runTenantOpsCloseLostAction({
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
