/**
 * Product M12 — Agent Dependency Runtime version metadata
 */

import {
  PRODUCT_AGENT_DEPENDENCY_BASE,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_TAG,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_AGENT_DEPENDENCY_ID,
  PRODUCT_AGENT_DEPENDENCY_VERSION,
} from "./dependency.constants";

export type AgentDependencyMetadataRecord = {
  dependencyRuntimeId: typeof PRODUCT_AGENT_DEPENDENCY_ID;
  version: typeof PRODUCT_AGENT_DEPENDENCY_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AGENT_DEPENDENCY_FREEZE_TAG;
  base: typeof PRODUCT_AGENT_DEPENDENCY_BASE;
  module: "M12-P3";
  domain: "AI Agent Platform";
  layer: "dependency-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AGENT_DEPENDENCY_METADATA: AgentDependencyMetadataRecord =
  {
    dependencyRuntimeId: PRODUCT_AGENT_DEPENDENCY_ID,
    version: PRODUCT_AGENT_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
    freezeTag: PRODUCT_AGENT_DEPENDENCY_FREEZE_TAG,
    base: PRODUCT_AGENT_DEPENDENCY_BASE,
    module: "M12-P3",
    domain: "AI Agent Platform",
    layer: "dependency-runtime",
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

export function getAgentDependencyMetadata(): AgentDependencyMetadataRecord {
  return {
    ...PRODUCT_AGENT_DEPENDENCY_METADATA,
    excludes: [...PRODUCT_AGENT_DEPENDENCY_METADATA.excludes],
  };
}

export function isAgentDependencyMetadataIntact(
  metadata: AgentDependencyMetadataRecord = PRODUCT_AGENT_DEPENDENCY_METADATA,
): boolean {
  return (
    metadata.dependencyRuntimeId ===
      "enterprise-product-agent-dependency-v1" &&
    metadata.version === "product-agent-dependency-1" &&
    metadata.freezeVersion === "product-agent-dependency-freeze-1" &&
    metadata.base === "enterprise-product-agent-catalog-v1" &&
    metadata.module === "M12-P3" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
