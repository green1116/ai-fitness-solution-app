/**
 * Product M12 — AI Agent Platform Foundation manifest builder
 */

import { createHash } from "node:crypto";

import { ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID } from "../../m11/baseline/freeze/freeze.lock";
import {
  PRODUCT_AGENT_FOUNDATION_BASE,
  PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AGENT_FOUNDATION_ID,
  PRODUCT_AGENT_FOUNDATION_VERSION,
} from "./agent.constants";
import {
  getAgentFoundationMetadata,
  validateAgentDefinition,
} from "./agent.metadata";
import {
  clearAgentDefinitions,
  listAgentDefinitions,
} from "./agent.registry";
import type {
  AgentFoundationManifest,
  AgentReadinessCheck,
  AgentReadinessResult,
} from "./agent.types";
import {
  clearAgentCapabilities,
  listAgentCapabilities,
} from "./capability.registry";
import {
  clearAgentGovernancePolicies,
  listAgentGovernancePolicies,
} from "./governance.policy";
import {
  clearAgentInvocationContracts,
  listAgentInvocationContracts,
} from "./invocation.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AgentReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAgentFoundationLayer(): void {
  clearAgentInvocationContracts();
  clearAgentGovernancePolicies();
  clearAgentCapabilities();
  clearAgentDefinitions();
}

export function buildAgentFoundationManifest(): AgentFoundationManifest {
  const agents = listAgentDefinitions();
  const capabilities = listAgentCapabilities();
  const policies = listAgentGovernancePolicies();
  const contracts = listAgentInvocationContracts();
  const metadata = getAgentFoundationMetadata();
  const active = agents.filter((a) => a.status === "ACTIVE");

  const payload = {
    foundationId: PRODUCT_AGENT_FOUNDATION_ID,
    version: PRODUCT_AGENT_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_AGENT_FOUNDATION_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    agents: agents.map((a) => ({
      agentKey: a.agentKey,
      role: a.role,
      status: a.status,
      scope: a.scope,
      knowledgeBaselineRef: a.knowledgeBaselineRef,
    })),
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      agentId: c.agentId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      agentKeyRef: p.agentKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    foundationId: PRODUCT_AGENT_FOUNDATION_ID,
    version: PRODUCT_AGENT_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_AGENT_FOUNDATION_BASE,
    agentCount: agents.length,
    activeCount: active.length,
    capabilityCount: capabilities.length,
    policyCount: policies.length,
    contractCount: contracts.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAgentFoundationReadiness(): AgentReadinessResult {
  const checks: AgentReadinessCheck[] = [];
  const metadata = getAgentFoundationMetadata();
  const agents = listAgentDefinitions();
  const capabilities = listAgentCapabilities();
  const policies = listAgentGovernancePolicies();
  const contracts = listAgentInvocationContracts();
  const manifest = buildAgentFoundationManifest();
  const agentsValid = agents.every((a) => validateAgentDefinition(a).ok);

  checks.push(
    check(
      "AGT-BASE",
      "foundation",
      "knowledge baseline aligned",
      PRODUCT_AGENT_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID &&
        ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID ===
          "enterprise-product-knowledge-baseline-v1",
      `base=${PRODUCT_AGENT_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "AGT-META",
      "metadata",
      "Agent foundation metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AGT-DEF",
      "agent",
      "Active agent definitions present and valid",
      agents.some((a) => a.status === "ACTIVE") && agentsValid,
      `agents=${agents.length}`,
    ),
  );

  checks.push(
    check(
      "AGT-CAP",
      "capability",
      "Declared capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "AGT-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "AGT-INV",
      "invocation",
      "Invocation contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "AGT-MAN",
      "manifest",
      "Agent foundation manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.foundationId === PRODUCT_AGENT_FOUNDATION_ID &&
        manifest.activeCount >= 1 &&
        manifest.capabilityCount >= 1 &&
        manifest.policyCount >= 1 &&
        manifest.contractCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-agent-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAgentFoundationReadinessReady(
  result: AgentReadinessResult,
): asserts result is AgentReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product agent foundation not ready: ${result.summary}`);
  }
}
