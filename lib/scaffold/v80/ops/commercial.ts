/** V80 CODE P4 — Commercial runtime (billing gates, usage → charge mapping) */
import { BILLING_FEATURE_GATING_MATRIX } from "@/lib/app/v80/production.billing.spec";

import { V80RuntimeError } from "../runtime/errors";
import { resolveEntitlements } from "../services/entitlement.service";
import { recordEntitlementTrail } from "./governance";

export type V80CommercialRouteSpec = {
  endpoint: string;
  featureKey: string;
  gateKey: string;
  usageType: string | null;
  chargeUnits: number;
  bootstrap?: boolean;
};

/** /api/v80 routes → APP P4 billing matrix */
export const V80_COMMERCIAL_ROUTES: V80CommercialRouteSpec[] = [
  {
    endpoint: "/api/v80/tenant/run",
    featureKey: "planGeneration",
    gateKey: "workspaceQuota",
    usageType: null,
    chargeUnits: 0,
    bootstrap: true,
  },
  {
    endpoint: "/api/v80/entitlements",
    featureKey: "planGeneration",
    gateKey: "canGenerateQuote",
    usageType: null,
    chargeUnits: 0,
  },
  {
    endpoint: "/api/v80/budget/calculate",
    featureKey: "budgetGeneration",
    gateKey: "canGenerateBudget",
    usageType: "BUDGET",
    chargeUnits: 1,
  },
  {
    endpoint: "/api/v80/autopilot/job/run",
    featureKey: "tenderPackage",
    gateKey: "canGenerateTender",
    usageType: "TENDER",
    chargeUnits: 1,
  },
  {
    endpoint: "/api/v80/tender/intake",
    featureKey: "planGeneration",
    gateKey: "canGenerateQuote",
    usageType: "QUOTE",
    chargeUnits: 1,
  },
  {
    endpoint: "/api/v80/proposal-pdf/render",
    featureKey: "proposalPdf",
    gateKey: "canExportPDF",
    usageType: "PDF",
    chargeUnits: 1,
  },
  {
    endpoint: "/api/v80/pdf",
    featureKey: "proposalPdf",
    gateKey: "canExportPDF",
    usageType: "PDF",
    chargeUnits: 1,
  },
  {
    endpoint: "/api/v80/production/integrity",
    featureKey: "planGeneration",
    gateKey: "enterpriseAdmin",
    usageType: null,
    chargeUnits: 0,
  },
];

function parseMonthlyLimit(limit: string | number | undefined): number | null {
  if (limit === undefined || limit === "unlimited") return null;
  if (typeof limit === "number") return limit;
  const m = limit.match(/^(\d+)\/mo$/);
  return m ? Number(m[1]) : null;
}

export function getCommercialSpec(endpoint: string) {
  return V80_COMMERCIAL_ROUTES.find((r) => r.endpoint === endpoint) ?? null;
}

export function mapUsageToCharge(input: {
  usageType: string;
  units: number;
  plan: string;
}): { usageType: string; units: number; chargeCents: number; plan: string } {
  const gate = BILLING_FEATURE_GATING_MATRIX.find((b) => b.usageType === input.usageType);
  const unitCents =
    input.usageType === "BUDGET" ? 50 : input.usageType === "TENDER" ? 200 : input.usageType === "PDF" ? 25 : 0;
  return {
    usageType: input.usageType,
    units: input.units,
    chargeCents: unitCents * input.units,
    plan: gate?.plan ?? input.plan,
  };
}

function featureUsageCount(usage: Record<string, number>, featureKey: string): number {
  switch (featureKey) {
    case "budgetGeneration":
      return usage.budget_calculate ?? 0;
    case "tenderPackage":
      return usage.workflow_run ?? 0;
    case "planGeneration":
      return usage.tender_intake ?? 0;
    case "proposalPdf":
      return usage.pdf ?? 0;
    default:
      return 0;
  }
}

export async function enforceV80CommercialGate(input: {
  endpoint: string;
  organizationId?: string;
  traceId: string;
  correlationId: string;
}) {
  const spec = getCommercialSpec(input.endpoint);
  if (!spec || spec.bootstrap || !input.organizationId) return { allowed: true as const };

  const ent = await resolveEntitlements(input.organizationId);
  const featureEnabled = Boolean(ent.features[spec.featureKey as keyof typeof ent.features]);

  const gate = BILLING_FEATURE_GATING_MATRIX.find(
    (b) => b.plan === ent.tier && b.featureKey === spec.featureKey,
  );
  const monthlyCap = parseMonthlyLimit(gate?.limit ?? ent.limits[spec.featureKey as keyof typeof ent.limits]);
  const currentUsage = featureUsageCount(ent.usage, spec.featureKey);

  const allowed = featureEnabled && (monthlyCap === null || currentUsage < monthlyCap);

  recordEntitlementTrail({
    traceId: input.traceId,
    correlationId: input.correlationId,
    organizationId: input.organizationId,
    endpoint: input.endpoint,
    featureKey: spec.featureKey,
    allowed,
    usageAfter: currentUsage,
    limit: monthlyCap ?? undefined,
  });

  if (!featureEnabled) {
    throw new V80RuntimeError("Feature not enabled for plan", "FEATURE_GATE", 403);
  }
  if (monthlyCap !== null && currentUsage >= monthlyCap) {
    throw new V80RuntimeError("Usage limit exceeded", "USAGE_LIMIT", 429);
  }

  return { allowed: true as const, spec, ent };
}

export async function recordV80CommercialUsage(input: {
  endpoint: string;
  organizationId: string;
  traceId: string;
}) {
  const spec = getCommercialSpec(input.endpoint);
  if (!spec?.usageType || spec.chargeUnits <= 0) return null;

  const ent = await resolveEntitlements(input.organizationId);
  return mapUsageToCharge({
    usageType: spec.usageType,
    units: spec.chargeUnits,
    plan: ent.tier,
  });
}

export function isV80CommercialMatrixComplete(): boolean {
  return V80_COMMERCIAL_ROUTES.length === 8;
}
