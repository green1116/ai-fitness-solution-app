/**
 * WP-RUNTIME-OPS-TENANT-BACKLOG-READ-MODEL-1
 * Tenant-scoped Ops backlog read model from CRM Customer + Opportunity.
 * Sidecar only — does not touch EADS/EAC/EWAS/EWEB frozen packs.
 */

import { prisma } from "@/lib/prisma";

export const TENANT_OPS_BACKLOG_VERSION =
  "runtime-ops-tenant-backlog-read-1" as const;

export type TenantOpsBacklogState = "ATTENTION" | "AVAILABLE" | "DEFERRED";

export type TenantOpsBacklogItem = Readonly<{
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  state: TenantOpsBacklogState;
  action: string;
  reason: string;
  reviewEligible: boolean;
  entity: "opportunity";
  entityId: string;
  stage: string;
}>;

export type TenantOpsBacklog = Readonly<{
  version: typeof TENANT_OPS_BACKLOG_VERSION;
  organizationId: string;
  items: readonly TenantOpsBacklogItem[];
  recordCount: number;
  attentionCount: number;
  availableCount: number;
  deferredCount: number;
}>;

type OpportunityStage = "INIT" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST" | string;

function normalizeStage(stage: string): OpportunityStage {
  return stage.trim().toUpperCase();
}

/**
 * Local derivation — not from EADS/EWAS deliveryState.
 * NEGOTIATION → ATTENTION; open early stages → AVAILABLE; terminal → DEFERRED.
 */
export function deriveTenantOpsState(stage: string): TenantOpsBacklogState {
  const s = normalizeStage(stage);
  if (s === "NEGOTIATION") return "ATTENTION";
  if (s === "WON" || s === "LOST") return "DEFERRED";
  return "AVAILABLE";
}

export function deriveTenantOpsAction(stage: string): string {
  const s = normalizeStage(stage);
  if (s === "NEGOTIATION") return "review-opportunity";
  if (s === "PROPOSAL") return "advance-proposal";
  if (s === "INIT") return "prepare-proposal";
  if (s === "WON") return "close-won";
  if (s === "LOST") return "close-lost";
  return "inspect-opportunity";
}

export function deriveTenantOpsReason(stage: string, customerName: string): string {
  const s = normalizeStage(stage);
  const name = customerName.trim() || "customer";
  if (s === "NEGOTIATION") {
    return `${name} opportunity in NEGOTIATION — tenant action required`;
  }
  if (s === "PROPOSAL") {
    return `${name} opportunity in PROPOSAL — ready to advance`;
  }
  if (s === "INIT") {
    return `${name} opportunity in INIT — prepare next step`;
  }
  if (s === "WON") {
    return `${name} opportunity WON — deferred from active ops`;
  }
  if (s === "LOST") {
    return `${name} opportunity LOST — deferred from active ops`;
  }
  return `${name} opportunity stage ${s}`;
}

/**
 * Tenant review eligibility from CRM stage only.
 * Must not consult EWI/EWEB/frozen surface item ids.
 */
export function deriveTenantReviewEligible(stage: string): boolean {
  const s = normalizeStage(stage);
  return s === "NEGOTIATION" || s === "PROPOSAL";
}

const STATE_RANK: Readonly<Record<TenantOpsBacklogState, number>> = {
  ATTENTION: 0,
  AVAILABLE: 1,
  DEFERRED: 2,
};

/**
 * Read tenant Ops backlog for an organization.
 * Ownership: Customer.organizationId; opportunities via customerId.
 */
export async function readTenantOpsBacklog(
  organizationId: string,
): Promise<TenantOpsBacklog> {
  const orgId = organizationId.trim();
  if (!orgId) {
    return {
      version: TENANT_OPS_BACKLOG_VERSION,
      organizationId: "",
      items: [],
      recordCount: 0,
      attentionCount: 0,
      availableCount: 0,
      deferredCount: 0,
    };
  }

  const customers = await prisma.customer.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (customers.length === 0) {
    return {
      version: TENANT_OPS_BACKLOG_VERSION,
      organizationId: orgId,
      items: [],
      recordCount: 0,
      attentionCount: 0,
      availableCount: 0,
      deferredCount: 0,
    };
  }

  const customerIds = customers.map((c) => c.id);
  const nameById = new Map(customers.map((c) => [c.id, c.name]));

  const opportunities = await prisma.opportunity.findMany({
    where: { customerId: { in: customerIds } },
    select: {
      id: true,
      customerId: true,
      stage: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const items: TenantOpsBacklogItem[] = opportunities.map((opp) => {
    const customerName = nameById.get(opp.customerId) ?? "";
    const stage = normalizeStage(opp.stage);
    const state = deriveTenantOpsState(stage);
    return {
      id: `crm:opportunity:${opp.id}`,
      organizationId: orgId,
      customerId: opp.customerId,
      customerName,
      state,
      action: deriveTenantOpsAction(stage),
      reason: deriveTenantOpsReason(stage, customerName),
      reviewEligible: deriveTenantReviewEligible(stage),
      entity: "opportunity",
      entityId: opp.id,
      stage,
    };
  });

  items.sort((a, b) => {
    const rank = STATE_RANK[a.state] - STATE_RANK[b.state];
    if (rank !== 0) return rank;
    return a.id.localeCompare(b.id);
  });

  return {
    version: TENANT_OPS_BACKLOG_VERSION,
    organizationId: orgId,
    items,
    recordCount: items.length,
    attentionCount: items.filter((i) => i.state === "ATTENTION").length,
    availableCount: items.filter((i) => i.state === "AVAILABLE").length,
    deferredCount: items.filter((i) => i.state === "DEFERRED").length,
  };
}
