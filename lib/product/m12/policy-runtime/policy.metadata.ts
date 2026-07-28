/**
 * Product M12 — Agent Policy Runtime version metadata
 */

import {
  PRODUCT_AGENT_POLICY_BASE,
  PRODUCT_AGENT_POLICY_FREEZE_TAG,
  PRODUCT_AGENT_POLICY_FREEZE_VERSION,
  PRODUCT_AGENT_POLICY_ID,
  PRODUCT_AGENT_POLICY_VERSION,
} from "./policy.constants";

export type AgentPolicyMetadataRecord = {
  policyRuntimeId: typeof PRODUCT_AGENT_POLICY_ID;
  version: typeof PRODUCT_AGENT_POLICY_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_POLICY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AGENT_POLICY_FREEZE_TAG;
  base: typeof PRODUCT_AGENT_POLICY_BASE;
  module: "M12-P4";
  domain: "AI Agent Platform";
  layer: "policy-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AGENT_POLICY_METADATA: AgentPolicyMetadataRecord = {
  policyRuntimeId: PRODUCT_AGENT_POLICY_ID,
  version: PRODUCT_AGENT_POLICY_VERSION,
  freezeVersion: PRODUCT_AGENT_POLICY_FREEZE_VERSION,
  freezeTag: PRODUCT_AGENT_POLICY_FREEZE_TAG,
  base: PRODUCT_AGENT_POLICY_BASE,
  module: "M12-P4",
  domain: "AI Agent Platform",
  layer: "policy-runtime",
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

export function getAgentPolicyMetadata(): AgentPolicyMetadataRecord {
  return {
    ...PRODUCT_AGENT_POLICY_METADATA,
    excludes: [...PRODUCT_AGENT_POLICY_METADATA.excludes],
  };
}

export function isAgentPolicyMetadataIntact(
  metadata: AgentPolicyMetadataRecord = PRODUCT_AGENT_POLICY_METADATA,
): boolean {
  return (
    metadata.policyRuntimeId === "enterprise-product-agent-policy-v1" &&
    metadata.version === "product-agent-policy-1" &&
    metadata.freezeVersion === "product-agent-policy-freeze-1" &&
    metadata.base === "enterprise-product-agent-dependency-v1" &&
    metadata.module === "M12-P4" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
