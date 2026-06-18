import type { ProductSku, SlaTier } from "../shared/constants";
import type { SlaAssignment, SlaDefinition } from "../shared/types";

const SLA_DEFINITIONS: Record<SlaTier, SlaDefinition> = {
  "48h": {
    tier: "48h",
    label: "加急 48 小时",
    deliveryHours: 48,
    revisionRounds: 1,
    supportLevel: "priority",
  },
  "72h": {
    tier: "72h",
    label: "快速 72 小时",
    deliveryHours: 72,
    revisionRounds: 1,
    supportLevel: "priority",
  },
  "7d": {
    tier: "7d",
    label: "标准 7 天",
    deliveryHours: 7 * 24,
    revisionRounds: 2,
    supportLevel: "standard",
  },
  "14d": {
    tier: "14d",
    label: "完整 14 天",
    deliveryHours: 14 * 24,
    revisionRounds: 3,
    supportLevel: "standard",
  },
};

export function getSlaDefinition(tier: SlaTier): SlaDefinition {
  return SLA_DEFINITIONS[tier];
}

export function assignSla(input: {
  sku: ProductSku;
  tier: SlaTier;
  projectName: string;
  startAt?: Date;
}): SlaAssignment {
  const definition = getSlaDefinition(input.tier);
  const startAt = input.startAt ?? new Date("2026-06-18T00:00:00.000Z");
  const dueAt = new Date(startAt.getTime() + definition.deliveryHours * 60 * 60 * 1000);

  return {
    assignmentId: `cp-sla-${input.sku}-${input.projectName.replace(/\s+/g, "-").toLowerCase()}`,
    sku: input.sku,
    tier: input.tier,
    definition,
    dueAtIso: dueAt.toISOString(),
  };
}

export function buildSlaRegistry(): SlaDefinition[] {
  return Object.values(SLA_DEFINITIONS);
}
