/**
 * Workspace ACTION_REQUIRED recovery overlay.
 * Does not mutate frozen ESCS-4 / EWER / EWXR REVIEW.
 */

import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenancy/tenant.context";

import { getActionIntents } from "../action-intent/action-intent";
import { getCustomerSuccessReview } from "../customer-success/customer-success-review";

const recoveredByOrg = new Map<string, Set<string>>();
const loadedOrgs = new Set<string>();

function completionFingerprint(surfaceItemId: string, customerId: string): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        surfaceItemId,
        customerId,
        recovered: true,
      }),
    )
    .digest("hex");
}

function currentOrganizationId(): string | null {
  const id = getTenantContext()?.organizationId.trim();
  return id ? id : null;
}

function orgRecovered(organizationId: string): Set<string> {
  let set = recoveredByOrg.get(organizationId);
  if (!set) {
    set = new Set();
    recoveredByOrg.set(organizationId, set);
  }
  return set;
}

export async function ensureWorkspaceReviewRecoveryLoaded(): Promise<void> {
  const organizationId = currentOrganizationId();
  if (!organizationId || loadedOrgs.has(organizationId)) return;
  const rows = await prisma.workspaceReviewRecovery.findMany({
    where: { organizationId },
    select: { surfaceItemId: true },
  });
  const set = orgRecovered(organizationId);
  set.clear();
  for (const row of rows) {
    set.add(row.surfaceItemId);
  }
  loadedOrgs.add(organizationId);
}

export function isWorkspaceReviewRecovered(surfaceItemId: string): boolean {
  const organizationId = currentOrganizationId();
  if (!organizationId) return false;
  return orgRecovered(organizationId).has(surfaceItemId.trim());
}

export async function clearWorkspaceReviewRecovery(): Promise<void> {
  const organizationId = currentOrganizationId();
  if (!organizationId) return;
  await prisma.workspaceReviewRecovery.deleteMany({
    where: { organizationId },
  });
  recoveredByOrg.set(organizationId, new Set());
  loadedOrgs.add(organizationId);
}

export async function completeWorkspaceReviewRecovery(surfaceItemId: string): Promise<{
  ok: boolean;
  recovered: boolean;
  surfaceItemId: string;
  customerId: string | null;
  fingerprint: string | null;
  reason: string;
}> {
  const organizationId = currentOrganizationId();
  const id = surfaceItemId.trim();
  if (!organizationId) {
    return {
      ok: false,
      recovered: false,
      surfaceItemId: id,
      customerId: null,
      fingerprint: null,
      reason: "auth-required",
    };
  }

  await ensureWorkspaceReviewRecoveryLoaded();

  if (!id) {
    return {
      ok: false,
      recovered: false,
      surfaceItemId: id,
      customerId: null,
      fingerprint: null,
      reason: "surface-item-missing",
    };
  }

  const customerId =
    getActionIntents().records.find((row) => row.surfaceItemId === id)
      ?.customerId ?? null;
  const recovered = orgRecovered(organizationId);

  if (recovered.has(id)) {
    return {
      ok: true,
      recovered: true,
      surfaceItemId: id,
      customerId,
      fingerprint: customerId ? completionFingerprint(id, customerId) : null,
      reason: "already-recovered",
    };
  }

  const review = customerId
    ? getCustomerSuccessReview().records.find(
        (row) => row.customerId === customerId,
      )
    : undefined;

  if (!review || review.reviewStatus !== "ACTION_REQUIRED") {
    return {
      ok: false,
      recovered: false,
      surfaceItemId: id,
      customerId,
      fingerprint: null,
      reason: "not-action-required",
    };
  }

  await prisma.workspaceReviewRecovery.upsert({
    where: {
      organizationId_surfaceItemId: { organizationId, surfaceItemId: id },
    },
    create: { organizationId, surfaceItemId: id },
    update: {},
  });
  recovered.add(id);

  return {
    ok: true,
    recovered: true,
    surfaceItemId: id,
    customerId,
    fingerprint: completionFingerprint(id, customerId!),
    reason: "recovered",
  };
}
