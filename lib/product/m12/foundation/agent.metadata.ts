/**
 * Product M12 — AI Agent Platform Foundation metadata + agent validator
 */

import {
  AGENT_DOMAIN_SCOPES,
  AGENT_ROLES,
  AGENT_STATUSES,
  PRODUCT_AGENT_FOUNDATION_BASE,
  PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AGENT_FOUNDATION_ID,
  PRODUCT_AGENT_FOUNDATION_VERSION,
  PRODUCT_AGENT_FREEZE_TAG,
} from "./agent.constants";
import type {
  AgentDefinition,
  AgentDefinitionValidationResult,
  RegisterAgentDefinitionInput,
} from "./agent.types";

export type AgentFoundationMetadata = {
  foundationId: typeof PRODUCT_AGENT_FOUNDATION_ID;
  version: typeof PRODUCT_AGENT_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AGENT_FREEZE_TAG;
  base: typeof PRODUCT_AGENT_FOUNDATION_BASE;
  module: "M12-P1";
  domain: "AI Agent Platform";
  layer: "foundation";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AGENT_FOUNDATION_METADATA: AgentFoundationMetadata = {
  foundationId: PRODUCT_AGENT_FOUNDATION_ID,
  version: PRODUCT_AGENT_FOUNDATION_VERSION,
  freezeVersion: PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
  freezeTag: PRODUCT_AGENT_FREEZE_TAG,
  base: PRODUCT_AGENT_FOUNDATION_BASE,
  module: "M12-P1",
  domain: "AI Agent Platform",
  layer: "foundation",
  declarationOnly: true,
  excludes: [
    "database",
    "vector-store",
    "rag-runtime",
    "embedding",
    "external-provider",
    "model-execution",
    "agent-execution",
    "tool-runtime",
  ],
};

export function getAgentFoundationMetadata(): AgentFoundationMetadata {
  return {
    ...PRODUCT_AGENT_FOUNDATION_METADATA,
    excludes: [...PRODUCT_AGENT_FOUNDATION_METADATA.excludes],
  };
}

export function isAgentFoundationMetadataIntact(
  metadata: AgentFoundationMetadata = PRODUCT_AGENT_FOUNDATION_METADATA,
): boolean {
  return (
    metadata.foundationId === "enterprise-product-agent-foundation-v1" &&
    metadata.version === "product-agent-1" &&
    metadata.freezeVersion === "product-agent-foundation-freeze-1" &&
    metadata.base === "enterprise-product-knowledge-baseline-v1" &&
    metadata.module === "M12-P1" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateAgentDefinitionInput(
  input: RegisterAgentDefinitionInput,
): AgentDefinitionValidationResult {
  const issues: AgentDefinitionValidationResult["issues"] = [];
  const agentKey = input.agentKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!agentKey) issues.push({ field: "agentKey", message: "required" });
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (!(AGENT_ROLES as readonly string[]).includes(input.role)) {
    issues.push({ field: "role", message: `invalid role: ${input.role}` });
  }
  if (!(AGENT_DOMAIN_SCOPES as readonly string[]).includes(input.scope)) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateAgentDefinition(
  agent: AgentDefinition,
): AgentDefinitionValidationResult {
  const issues: AgentDefinitionValidationResult["issues"] = [];
  if (!agent.id.trim()) issues.push({ field: "id", message: "required" });
  if (!agent.agentKey.trim()) {
    issues.push({ field: "agentKey", message: "required" });
  }
  if (!(AGENT_ROLES as readonly string[]).includes(agent.role)) {
    issues.push({ field: "role", message: `invalid role: ${agent.role}` });
  }
  if (!(AGENT_STATUSES as readonly string[]).includes(agent.status)) {
    issues.push({
      field: "status",
      message: `invalid status: ${agent.status}`,
    });
  }
  if (!(AGENT_DOMAIN_SCOPES as readonly string[]).includes(agent.scope)) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${agent.scope}`,
    });
  }
  if (!agent.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!agent.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!agent.knowledgeBaselineRef.trim()) {
    issues.push({ field: "knowledgeBaselineRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
