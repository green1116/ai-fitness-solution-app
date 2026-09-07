"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  TENANT_OPS_CLOSE_LOST_ID,
  TENANT_OPS_CLOSE_LOST_VERSION,
  runTenantOpsCloseLostAction,
  type TenantOpsCloseLostResult,
} from "@/lib/runtime-ops/tenant-ops-close-lost";
import { appendTenantOpsGateFailureAudit } from "@/lib/runtime-ops/tenant-ops-audit";
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

async function sessionUserId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
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
    const failed = gateFailed(itemId, gate.organizationId, gate.reason);
    await appendTenantOpsGateFailureAudit({
      kind: "close_lost",
      organizationId: gate.organizationId,
      userId: await sessionUserId(),
      itemId,
      action: "close-lost",
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
      kind: "close_lost",
      organizationId: gate.tenant.organizationId,
      userId: gate.tenant.userId,
      itemId,
      action: "close-lost",
      reason: TENANT_OPS_ROLE_FORBIDDEN_REASON,
    });
    return failed;
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
