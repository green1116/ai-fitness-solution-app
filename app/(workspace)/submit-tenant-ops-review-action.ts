"use server";

import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  ensureOrganizationForUser,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";
import {
  TENANT_OPS_REVIEW_ACTION_ID,
  TENANT_OPS_REVIEW_ACTION_VERSION,
  runTenantOpsReviewAction,
  type TenantOpsReviewActionResult,
} from "@/lib/runtime-ops/tenant-ops-action";
import {
  getTenantContext,
  runWithTenantContext,
  type TenantContext,
} from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitTenantOpsReviewAction is server-only");
}

async function tenantFromSession(): Promise<TenantContext | null> {
  const bound = getTenantContext();
  if (bound) return bound;

  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;
  try {
    user = await getCurrentUser();
  } catch {
    return null;
  }
  if (!user) return null;
  const existing = await listOrganizationsForUser(user.id);
  const organization =
    existing[0]?.organization ??
    (await ensureOrganizationForUser({
      userId: user.id,
      name: user.name ?? undefined,
    }));
  return {
    organizationId: organization.id,
    userId: user.id,
    traceId: "tenant-ops-review-action",
  };
}

function authFailed(itemId: string): TenantOpsReviewActionResult {
  return {
    workPackageId: TENANT_OPS_REVIEW_ACTION_ID,
    version: TENANT_OPS_REVIEW_ACTION_VERSION,
    itemId: itemId.trim(),
    organizationId: "",
    customerId: null,
    entityId: null,
    stage: null,
    result: "FAILED",
    executed: false,
    reason: "auth-required",
  };
}

export async function submitTenantOpsReviewAction(
  _prev: TenantOpsReviewActionResult | null,
  formData: FormData,
): Promise<TenantOpsReviewActionResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const tenant = await tenantFromSession();
  if (!tenant) {
    return authFailed(itemId);
  }

  return runWithTenantContext(tenant, async () =>
    runTenantOpsReviewAction({
      organizationId: tenant.organizationId,
      itemId,
    }),
  );
}
