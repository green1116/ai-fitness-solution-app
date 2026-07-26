/**
 * Product M10 — AI Resource Manager version metadata
 */

import {
  PRODUCT_AI_RESOURCE_MANAGER_BASE,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_TAG,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
  PRODUCT_AI_RESOURCE_MANAGER_ID,
  PRODUCT_AI_RESOURCE_MANAGER_VERSION,
} from "./resource.constants";

export type AiResourceManagerMetadata = {
  resourceManagerId: typeof PRODUCT_AI_RESOURCE_MANAGER_ID;
  version: typeof PRODUCT_AI_RESOURCE_MANAGER_VERSION;
  freezeVersion: typeof PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_RESOURCE_MANAGER_FREEZE_TAG;
  base: typeof PRODUCT_AI_RESOURCE_MANAGER_BASE;
  module: "M10-P5";
  domain: "Enterprise AI Runtime";
  layer: "resource-manager";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_RESOURCE_MANAGER_METADATA: AiResourceManagerMetadata =
  {
    resourceManagerId: PRODUCT_AI_RESOURCE_MANAGER_ID,
    version: PRODUCT_AI_RESOURCE_MANAGER_VERSION,
    freezeVersion: PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
    freezeTag: PRODUCT_AI_RESOURCE_MANAGER_FREEZE_TAG,
    base: PRODUCT_AI_RESOURCE_MANAGER_BASE,
    module: "M10-P5",
    domain: "Enterprise AI Runtime",
    layer: "resource-manager",
    declarationOnly: true,
    excludes: [
      "resource-allocation-runtime",
      "token-accounting",
      "autoscaling",
      "provider-runtime",
      "model-execution",
      "queue-execution",
      "monitoring",
    ],
  };

export function getAiResourceManagerMetadata(): AiResourceManagerMetadata {
  return {
    ...PRODUCT_AI_RESOURCE_MANAGER_METADATA,
    excludes: [...PRODUCT_AI_RESOURCE_MANAGER_METADATA.excludes],
  };
}

export function isAiResourceManagerMetadataIntact(
  metadata: AiResourceManagerMetadata = PRODUCT_AI_RESOURCE_MANAGER_METADATA,
): boolean {
  return (
    metadata.resourceManagerId ===
      "enterprise-product-ai-resource-manager-v1" &&
    metadata.version === "product-ai-resource-manager-1" &&
    metadata.freezeVersion === "product-ai-resource-manager-freeze-1" &&
    metadata.base === "enterprise-product-ai-scheduler-v1" &&
    metadata.module === "M10-P5" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
