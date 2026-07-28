/**
 * Product M12 — Agent Compatibility Runtime version metadata
 */

import {
  PRODUCT_AGENT_COMPATIBILITY_BASE,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_AGENT_COMPATIBILITY_ID,
  PRODUCT_AGENT_COMPATIBILITY_VERSION,
} from "./compatibility.constants";

export type AgentCompatibilityMetadataRecord = {
  compatibilityRuntimeId: typeof PRODUCT_AGENT_COMPATIBILITY_ID;
  version: typeof PRODUCT_AGENT_COMPATIBILITY_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AGENT_COMPATIBILITY_FREEZE_TAG;
  base: typeof PRODUCT_AGENT_COMPATIBILITY_BASE;
  module: "M12-P5";
  domain: "AI Agent Platform";
  layer: "compatibility-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AGENT_COMPATIBILITY_METADATA: AgentCompatibilityMetadataRecord =
  {
    compatibilityRuntimeId: PRODUCT_AGENT_COMPATIBILITY_ID,
    version: PRODUCT_AGENT_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
    freezeTag: PRODUCT_AGENT_COMPATIBILITY_FREEZE_TAG,
    base: PRODUCT_AGENT_COMPATIBILITY_BASE,
    module: "M12-P5",
    domain: "AI Agent Platform",
    layer: "compatibility-runtime",
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

export function getAgentCompatibilityMetadata(): AgentCompatibilityMetadataRecord {
  return {
    ...PRODUCT_AGENT_COMPATIBILITY_METADATA,
    excludes: [...PRODUCT_AGENT_COMPATIBILITY_METADATA.excludes],
  };
}

export function isAgentCompatibilityMetadataIntact(
  metadata: AgentCompatibilityMetadataRecord = PRODUCT_AGENT_COMPATIBILITY_METADATA,
): boolean {
  return (
    metadata.compatibilityRuntimeId ===
      "enterprise-product-agent-compatibility-v1" &&
    metadata.version === "product-agent-compatibility-1" &&
    metadata.freezeVersion === "product-agent-compatibility-freeze-1" &&
    metadata.base === "enterprise-product-agent-policy-v1" &&
    metadata.module === "M12-P5" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
