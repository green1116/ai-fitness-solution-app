"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  ensureOrganizationForUser,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";
import {
  TENANT_OPS_EXECUTE_ID,
  TENANT_OPS_EXECUTE_VERSION,
  runTenantOpsExecuteAction,
  type TenantOpsExecuteActionResult,
} from "@/lib/runtime-ops/tenant-ops-execute";
import {
  getTenantContext,
  runWithTenantContext,
  type TenantContext,
} from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitTenantOpsExecuteAction is server-only");
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
    traceId: "tenant-ops-execute-action",
  };
}

function authFailed(itemId: string): TenantOpsExecuteActionResult {
  return {
    workPackageId: TENANT_OPS_EXECUTE_ID,
    version: TENANT_OPS_EXECUTE_VERSION,
    itemId: itemId.trim(),
    organizationId: "",
    customerId: null,
    entityId: null,
    fromStage: null,
    toStage: null,
    action: null,
    result: "FAILED",
    executed: false,
    reason: "auth-required",
  };
}

export async function submitTenantOpsExecuteAction(
  _prev: TenantOpsExecuteActionResult | null,
  formData: FormData,
): Promise<TenantOpsExecuteActionResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const tenant = await tenantFromSession();
  if (!tenant) {
    return authFailed(itemId);
  }

  const result = await runWithTenantContext(tenant, async () =>
    runTenantOpsExecuteAction({
      organizationId: tenant.organizationId,
      itemId,
      userId: tenant.userId,
    }),
  );

  if (result.result === "SUCCESS") {
    revalidatePath("/projects", "layout");
  }

  return result;
}
