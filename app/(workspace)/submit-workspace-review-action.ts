"use server";

import { createHash } from "node:crypto";

import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  completeWorkspaceReviewRecovery,
  ensureWorkspaceReviewRecoveryLoaded,
} from "@/lib/commercial/action-execution/review-recovery";
import { mapWorkspaceReviewOutcome } from "@/lib/commercial/action-execution/review-outcome-surface";
import {
  EWXR_1_ID,
  WORKSPACE_REVIEW_ACTION_CAPABILITY,
  WORKSPACE_REVIEW_ACTION_VERSION,
  runWorkspaceReviewAction,
  type WorkspaceReviewActionResult,
} from "@/lib/commercial/action-execution/workspace-review-action";
import {
  ensureOrganizationForUser,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";
import {
  getTenantContext,
  runWithTenantContext,
  type TenantContext,
} from "@/lib/tenancy/tenant.context";

if (typeof window !== "undefined") {
  throw new Error("submitWorkspaceReviewAction is server-only");
}

async function tenantFromSession(): Promise<TenantContext | null> {
  const bound = getTenantContext();
  if (bound) return bound;

  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;
  try {
    user = await getCurrentUser();
  } catch {
    // Outside Next request scope (e.g. verify harness) — treat as unauthenticated.
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
    traceId: "workspace-review-recovery",
  };
}

function failedSubmitResult(
  surfaceItemId: string,
  reason: string,
): WorkspaceReviewActionResult & {
  outcome: ReturnType<typeof mapWorkspaceReviewOutcome>;
} {
  const id = surfaceItemId.trim();
  const withoutFp: Omit<WorkspaceReviewActionResult, "fingerprint"> = {
    workPackageId: EWXR_1_ID,
    capability: WORKSPACE_REVIEW_ACTION_CAPABILITY,
    version: WORKSPACE_REVIEW_ACTION_VERSION,
    surfaceItemId: id,
    requestId: null,
    result: "FAILED",
    executed: false,
    ewerFingerprint: null,
    reason,
    scope: {
      reviewOnly: true,
      noExecutionEngine: true,
      noBatch: true,
      noPersistence: true,
      noPrisma: true,
      noFrozenLayerChanges: true,
    },
  };
  const action: WorkspaceReviewActionResult = {
    ...withoutFp,
    fingerprint: createHash("sha256")
      .update(
        JSON.stringify({
          workPackageId: withoutFp.workPackageId,
          capability: withoutFp.capability,
          version: withoutFp.version,
          surfaceItemId: withoutFp.surfaceItemId,
          requestId: withoutFp.requestId,
          result: withoutFp.result,
          executed: withoutFp.executed,
          ewerFingerprint: withoutFp.ewerFingerprint,
          reason: withoutFp.reason,
          scope: withoutFp.scope,
        }),
      )
      .digest("hex"),
  };
  return {
    ...action,
    outcome: mapWorkspaceReviewOutcome(action),
  };
}

export async function submitWorkspaceReviewAction(
  _prev: unknown,
  formData: FormData,
) {
  const surfaceItemId = String(formData.get("surfaceItemId") ?? "");
  const tenant = await tenantFromSession();
  if (!tenant) {
    return failedSubmitResult(surfaceItemId, "auth-required");
  }

  return runWithTenantContext(tenant, async () => {
    await ensureWorkspaceReviewRecoveryLoaded();
    const action = runWorkspaceReviewAction(surfaceItemId);
    return {
      ...action,
      outcome: mapWorkspaceReviewOutcome(action),
    };
  });
}

export async function submitWorkspaceReviewRecoveryAction(
  _prev: unknown,
  formData: FormData,
) {
  const surfaceItemId = String(formData.get("surfaceItemId") ?? "");
  const tenant = await tenantFromSession();
  if (!tenant) {
    return failedSubmitResult(surfaceItemId, "auth-required");
  }

  return runWithTenantContext(tenant, async () => {
    const recovery = await completeWorkspaceReviewRecovery(surfaceItemId);
    if (!recovery.ok) {
      return failedSubmitResult(surfaceItemId, recovery.reason);
    }
    const action = runWorkspaceReviewAction(surfaceItemId);
    return {
      ...action,
      outcome: mapWorkspaceReviewOutcome(action),
    };
  });
}
