"use server";

import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  TENANT_OPS_REVIEW_ACTION_ID,
  TENANT_OPS_REVIEW_ACTION_VERSION,
  runTenantOpsReviewAction,
  type TenantOpsReviewActionResult,
} from "@/lib/runtime-ops/tenant-ops-action";
import { appendTenantOpsGateFailureAudit } from "@/lib/runtime-ops/tenant-ops-audit";
import { resolveTenantOpsOrgContext } from "@/lib/runtime-ops/tenant-ops-org-gate";
import {
  isTenantOpsRoleAllowed,
  TENANT_OPS_ROLE_FORBIDDEN_REASON,
} from "@/lib/runtime-ops/tenant-ops-role-gate";
import { runWithTenantContext } from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitTenantOpsReviewAction is server-only");
}

function gateFailed(
  itemId: string,
  organizationId: string,
  reason: string,
): TenantOpsReviewActionResult {
  return {
    workPackageId: TENANT_OPS_REVIEW_ACTION_ID,
    version: TENANT_OPS_REVIEW_ACTION_VERSION,
    itemId: itemId.trim(),
    organizationId,
    customerId: null,
    entityId: null,
    stage: null,
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

export async function submitTenantOpsReviewAction(
  _prev: TenantOpsReviewActionResult | null,
  formData: FormData,
): Promise<TenantOpsReviewActionResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const organizationId = String(formData.get("organizationId") ?? "");
  const gate = await resolveTenantOpsOrgContext({
    organizationId,
    traceId: "tenant-ops-review-action",
  });
  if (!gate.ok) {
    const failed = gateFailed(itemId, gate.organizationId, gate.reason);
    await appendTenantOpsGateFailureAudit({
      kind: "review",
      organizationId: gate.organizationId,
      userId: await sessionUserId(),
      itemId,
      action: "review",
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
      kind: "review",
      organizationId: gate.tenant.organizationId,
      userId: gate.tenant.userId,
      itemId,
      action: "review",
      reason: TENANT_OPS_ROLE_FORBIDDEN_REASON,
    });
    return failed;
  }

  return runWithTenantContext(gate.tenant, async () =>
    runTenantOpsReviewAction({
      organizationId: gate.tenant.organizationId,
      itemId,
      userId: gate.tenant.userId,
    }),
  );
}
