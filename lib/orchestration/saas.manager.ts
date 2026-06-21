/**
 * V65 — SaaS instance manager
 */

import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import type { SaaSInstance } from "@/lib/universe/universe.types";
import {
  getSaaSInstancesSnapshot,
  getSaaSInstanceById,
  registerSaaSInstance,
  countInstancesByIndustry,
} from "@/lib/universe/universe.store";
import { generateSaaSInstance } from "@/lib/universe/product.generator";
import { deployNewSaaS } from "@/lib/universe/factory.engine";
import { aggregateRevenueMetrics } from "@/lib/revenue/core/revenue.context";
import { computeUniverseThresholds } from "@/lib/universe/universe.types";

export function listManagedSaaS(): ReturnType<typeof getSaaSInstancesSnapshot> {
  return getSaaSInstancesSnapshot();
}

export function autoCreateSaaS(industry: VerticalIndustry, organizationId?: string): ReturnType<typeof generateSaaSInstance> {
  const instance = generateSaaSInstance({ industry, organizationId });
  if (organizationId) {
    appendGrowthEvent({
      event: "universe.saas_managed",
      organizationId,
      meta: { instanceId: instance.id, action: "created", layer: "v65-orchestration" },
    });
  }
  return instance;
}

export function autoScaleSaaS(instanceId: string): SaaSInstance {
  const inst = getSaaSInstanceById(instanceId);
  if (!inst) throw new Error(`Instance not found: ${instanceId}`);

  const metrics = aggregateRevenueMetrics();
  const thresholds = computeUniverseThresholds({
    totalMrr: metrics.mrr,
    instanceCount: getSaaSInstancesSnapshot().length,
  });

  const scaled = {
    ...inst,
    status: "scaling" as const,
    mrr: Math.round(inst.mrr * (inst.mrr < thresholds.mrrScaleMin ? 1.15 : 1.05)),
  };
  registerSaaSInstance(scaled);
  return scaled;
}

export function findIndustriesNeedingInstances(): VerticalIndustry[] {
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeUniverseThresholds({
    totalMrr: metrics.mrr,
    instanceCount: getSaaSInstancesSnapshot().length,
  });

  const industries: VerticalIndustry[] = ["fitness", "education", "procurement", "hr_admin", "enterprise"];
  return industries.filter((i) => countInstancesByIndustry(i) < thresholds.industryGapMin);
}

export { deployNewSaaS };
