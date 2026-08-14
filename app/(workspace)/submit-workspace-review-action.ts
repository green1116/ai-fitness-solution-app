"use server";

import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  completeWorkspaceReviewRecovery,
  ensureWorkspaceReviewRecoveryLoaded,
} from "@/lib/commercial/action-execution/review-recovery";
import { mapWorkspaceReviewOutcome } from "@/lib/commercial/action-execution/review-outcome-surface";
import { runWorkspaceReviewAction } from "@/lib/commercial/action-execution/workspace-review-action";
import {
  ensureOrganizationForUser,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";
import {
  runWithTenantContext,
  type TenantContext,
} from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitWorkspaceReviewAction is server-only");
}

async function tenantFromSession(): Promise<TenantContext | null> {
  const user = await getCurrentUser();
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
    traceId: "workspace-review-recovery",
  };
}

export async function submitWorkspaceReviewAction(
  _prev: unknown,
  formData: FormData,
) {
  const tenant = await tenantFromSession();
  const run = async () => {
    await ensureWorkspaceReviewRecoveryLoaded();
    const action = runWorkspaceReviewAction(
      String(formData.get("surfaceItemId") ?? ""),
    );
    return {
      ...action,
      outcome: mapWorkspaceReviewOutcome(action),
    };
  };
  return tenant ? runWithTenantContext(tenant, run) : run();
}

export async function submitWorkspaceReviewRecoveryAction(
  _prev: unknown,
  formData: FormData,
) {
  const tenant = await tenantFromSession();
  const surfaceItemId = String(formData.get("surfaceItemId") ?? "");
  const run = async () => {
    await completeWorkspaceReviewRecovery(surfaceItemId);
    const action = runWorkspaceReviewAction(surfaceItemId);
    return {
      ...action,
      outcome: mapWorkspaceReviewOutcome(action),
    };
  };
  return tenant ? runWithTenantContext(tenant, run) : run();
}
