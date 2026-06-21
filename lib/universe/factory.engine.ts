/**
 * V65 — SaaS factory engine
 */

import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import {
  cloneBusinessToNewIndustry,
  cloneBusinessModule,
} from "@/lib/expansion/expansion.engine";
import { generateSaaSInstance } from "./product.generator";
import { registerSaaSInstance, getSaaSInstanceById } from "./universe.store";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export function cloneBusinessModel(input: {
  sourceVertical: VerticalIndustry;
  targetVertical: VerticalIndustry;
  organizationId: string;
}): {
  instance: ReturnType<typeof generateSaaSInstance>;
  clone: ReturnType<typeof cloneBusinessModule>;
} {
  const clone = cloneBusinessModule({
    sourceVertical: input.sourceVertical,
    targetVertical: input.targetVertical,
  });

  const instance = generateSaaSInstance({ industry: input.targetVertical });
  registerSaaSInstance({
    ...instance,
    modules: clone.clonedModules,
    status: "draft",
  });

  appendGrowthEvent({
    event: "universe.model_cloned",
    organizationId: input.organizationId,
    meta: {
      source: input.sourceVertical,
      target: input.targetVertical,
      layer: "v65-universe",
    },
  });

  return { instance, clone };
}

export function deployNewSaaS(input: {
  instanceId: string;
  organizationId: string;
  environment?: "staging" | "production";
}): ReturnType<typeof getSaaSInstanceById> {
  const existing = getSaaSInstanceById(input.instanceId);
  if (!existing) throw new Error(`SaaS instance not found: ${input.instanceId}`);

  const deployment = cloneBusinessToNewIndustry({
    organizationId: input.organizationId,
    sourceVertical: "fitness",
    targetVertical: existing.industry,
  });

  const deployed = {
    ...existing,
    status: "deployed" as const,
    deployedAt: new Date().toISOString(),
    mrr: Math.max(existing.mrr, 499),
    modules: deployment.clone.clonedModules,
  };

  registerSaaSInstance(deployed);

  appendGrowthEvent({
    event: "universe.saas_deployed",
    organizationId: input.organizationId,
    meta: {
      instanceId: input.instanceId,
      industry: existing.industry,
      deploymentId: deployment.deployment.deploymentId,
      layer: "v65-universe",
    },
  });

  return deployed;
}
