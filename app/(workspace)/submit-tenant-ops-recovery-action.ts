"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  ensureOrganizationForUser,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";
import {
  TENANT_OPS_RECOVERY_ID,
  TENANT_OPS_RECOVERY_VERSION,
  completeTenantOpsRecovery,
  type TenantOpsRecoveryResult,
} from "@/lib/runtime-ops/tenant-ops-recovery";
import {
  getTenantContext,
  runWithTenantContext,
  type TenantContext,
} from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitTenantOpsRecoveryAction is server-only");
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
    traceId: "tenant-ops-recovery-action",
  };
}

function authFailed(itemId: string): TenantOpsRecoveryResult {
  return {
    workPackageId: TENANT_OPS_RECOVERY_ID,
    version: TENANT_OPS_RECOVERY_VERSION,
    itemId: itemId.trim(),
    organizationId: "",
    customerId: null,
    entityId: null,
    stage: null,
    recovered: false,
    result: "FAILED",
    reason: "auth-required",
  };
}

export async function submitTenantOpsRecoveryAction(
  _prev: TenantOpsRecoveryResult | null,
  formData: FormData,
): Promise<TenantOpsRecoveryResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const tenant = await tenantFromSession();
  if (!tenant) {
    return authFailed(itemId);
  }

  const result = await runWithTenantContext(tenant, async () =>
    completeTenantOpsRecovery({
      organizationId: tenant.organizationId,
      itemId,
    }),
  );

  if (result.result === "SUCCESS") {
    revalidatePath("/projects", "layout");
  }

  return result;
}
