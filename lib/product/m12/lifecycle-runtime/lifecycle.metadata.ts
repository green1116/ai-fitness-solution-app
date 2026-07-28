/**
 * Product M12 — Agent Lifecycle Runtime version metadata
 */

import {
  PRODUCT_AGENT_LIFECYCLE_BASE,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_TAG,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_AGENT_LIFECYCLE_ID,
  PRODUCT_AGENT_LIFECYCLE_VERSION,
} from "./lifecycle.constants";

export type AgentLifecycleMetadataRecord = {
  lifecycleRuntimeId: typeof PRODUCT_AGENT_LIFECYCLE_ID;
  version: typeof PRODUCT_AGENT_LIFECYCLE_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AGENT_LIFECYCLE_FREEZE_TAG;
  base: typeof PRODUCT_AGENT_LIFECYCLE_BASE;
  module: "M12-P7";
  domain: "AI Agent Platform";
  layer: "lifecycle-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AGENT_LIFECYCLE_METADATA: AgentLifecycleMetadataRecord = {
  lifecycleRuntimeId: PRODUCT_AGENT_LIFECYCLE_ID,
  version: PRODUCT_AGENT_LIFECYCLE_VERSION,
  freezeVersion: PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
  freezeTag: PRODUCT_AGENT_LIFECYCLE_FREEZE_TAG,
  base: PRODUCT_AGENT_LIFECYCLE_BASE,
  module: "M12-P7",
  domain: "AI Agent Platform",
  layer: "lifecycle-runtime",
  declarationOnly: true,
  excludes: [
    "database",
    "vector-store",
    "rag-runtime",
    "embedding",
    "external-provider",
    "agent-execution",
    "tool-runtime",
  ],
};

export function getAgentLifecycleMetadata(): AgentLifecycleMetadataRecord {
  return {
    ...PRODUCT_AGENT_LIFECYCLE_METADATA,
    excludes: [...PRODUCT_AGENT_LIFECYCLE_METADATA.excludes],
  };
}

export function isAgentLifecycleMetadataIntact(
  metadata: AgentLifecycleMetadataRecord = PRODUCT_AGENT_LIFECYCLE_METADATA,
): boolean {
  return (
    metadata.lifecycleRuntimeId === "enterprise-product-agent-lifecycle-v1" &&
    metadata.version === "product-agent-lifecycle-1" &&
    metadata.freezeVersion === "product-agent-lifecycle-freeze-1" &&
    metadata.base === "enterprise-product-agent-governance-v1" &&
    metadata.module === "M12-P7" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
