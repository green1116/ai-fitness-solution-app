/**
 * Product M12 — Agent Governance version metadata
 */

import {
  PRODUCT_AGENT_GOVERNANCE_BASE,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AGENT_GOVERNANCE_ID,
  PRODUCT_AGENT_GOVERNANCE_VERSION,
} from "./governance.constants";

export type AgentGovernanceMetadataRecord = {
  governanceRuntimeId: typeof PRODUCT_AGENT_GOVERNANCE_ID;
  version: typeof PRODUCT_AGENT_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AGENT_GOVERNANCE_FREEZE_TAG;
  base: typeof PRODUCT_AGENT_GOVERNANCE_BASE;
  module: "M12-P6";
  domain: "AI Agent Platform";
  layer: "governance";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AGENT_GOVERNANCE_METADATA: AgentGovernanceMetadataRecord =
  {
    governanceRuntimeId: PRODUCT_AGENT_GOVERNANCE_ID,
    version: PRODUCT_AGENT_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
    freezeTag: PRODUCT_AGENT_GOVERNANCE_FREEZE_TAG,
    base: PRODUCT_AGENT_GOVERNANCE_BASE,
    module: "M12-P6",
    domain: "AI Agent Platform",
    layer: "governance",
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

export function getAgentGovernanceMetadata(): AgentGovernanceMetadataRecord {
  return {
    ...PRODUCT_AGENT_GOVERNANCE_METADATA,
    excludes: [...PRODUCT_AGENT_GOVERNANCE_METADATA.excludes],
  };
}

export function isAgentGovernanceMetadataIntact(
  metadata: AgentGovernanceMetadataRecord = PRODUCT_AGENT_GOVERNANCE_METADATA,
): boolean {
  return (
    metadata.governanceRuntimeId ===
      "enterprise-product-agent-governance-v1" &&
    metadata.version === "product-agent-governance-1" &&
    metadata.freezeVersion === "product-agent-governance-freeze-1" &&
    metadata.base === "enterprise-product-agent-compatibility-v1" &&
    metadata.module === "M12-P6" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
