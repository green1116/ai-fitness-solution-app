/**
 * Product M12 — AI Agent Platform Foundation Release Gate
 * MODULE: AI Agent Platform Foundation (M12-P1)
 * BASE: enterprise-product-knowledge-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID } from "../../m11/baseline/freeze/freeze.lock";
import {
  AGENT_CAPABILITY_KINDS,
  AGENT_CAPABILITY_STATUSES,
  AGENT_DOMAIN_SCOPES,
  AGENT_GOVERNANCE_POLICY_KINDS,
  AGENT_GOVERNANCE_POLICY_STATUSES,
  AGENT_INVOCATION_MODES,
  AGENT_READINESS_VERDICTS,
  AGENT_ROLES,
  AGENT_STATUSES,
  PRODUCT_AGENT_FOUNDATION_BASE,
  PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AGENT_FOUNDATION_ID,
  PRODUCT_AGENT_FOUNDATION_VERSION,
  PRODUCT_AGENT_FREEZE_TAG,
} from "../foundation/agent.constants";
import {
  assertAgentFoundationReadinessReady,
  buildAgentFoundationManifest,
  clearAgentFoundationLayer,
  evaluateAgentFoundationReadiness,
} from "../foundation/agent.manifest";
import {
  getAgentFoundationMetadata,
  isAgentFoundationMetadataIntact,
  validateAgentDefinition,
} from "../foundation/agent.metadata";
import {
  registerAgentDefinition,
  updateAgentDefinitionStatus,
} from "../foundation/agent.registry";
import {
  registerAgentCapability,
  updateAgentCapabilityStatus,
} from "../foundation/capability.registry";
import { registerAgentGovernancePolicy } from "../foundation/governance.policy";
import { evaluateAgentInvocationContract } from "../foundation/invocation.contract";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_AGENT_FOUNDATION_SIGNOFF_VERSION =
  "product-agent-foundation-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearAgentFoundationLayer();
}

export function checkProductAgentFoundationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAgentFoundationMetadata();

  checks.push(
    check(
      "AGT-CONSTANTS",
      "foundation",
      "Product agent foundation version constants",
      PRODUCT_AGENT_FOUNDATION_ID ===
        "enterprise-product-agent-foundation-v1" &&
        PRODUCT_AGENT_FOUNDATION_VERSION === "product-agent-1" &&
        PRODUCT_AGENT_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID &&
        PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION ===
          "product-agent-foundation-freeze-1" &&
        PRODUCT_AGENT_FREEZE_TAG === "product-agent-foundation-freeze-1" &&
        AGENT_ROLES.length === 6 &&
        AGENT_STATUSES.length === 4 &&
        AGENT_CAPABILITY_KINDS.length === 6 &&
        AGENT_CAPABILITY_STATUSES.length === 4 &&
        AGENT_DOMAIN_SCOPES.length === 4 &&
        AGENT_INVOCATION_MODES.length === 3 &&
        AGENT_GOVERNANCE_POLICY_KINDS.length === 4 &&
        AGENT_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        AGENT_READINESS_VERDICTS.length === 3 &&
        isAgentFoundationMetadataIntact(metadata),
      `id=${PRODUCT_AGENT_FOUNDATION_ID} base=${PRODUCT_AGENT_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AGT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AGT-UPSTREAM",
      "compatibility",
      "Depends on knowledge baseline",
      PRODUCT_AGENT_FOUNDATION_BASE ===
        "enterprise-product-knowledge-baseline-v1" &&
        ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID ===
          "enterprise-product-knowledge-baseline-v1",
      `knowledgeBaseline=${ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID}`,
    ),
  );

  try {
    cleanup();

    const agent = registerAgentDefinition({
      id: "agt.gate.def",
      agentKey: "DOMAIN_FITNESS_PLANNER",
      role: "PLANNER",
      scope: "DOMAIN",
      title: "Domain fitness planner agent",
      summary: "Declared planner agent for domain fitness planning",
      knowledgeBaselineRef: ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
    });
    const active = updateAgentDefinitionStatus({
      agentId: agent.id,
      status: "ACTIVE",
    });
    const validation = validateAgentDefinition(active);
    const capability = registerAgentCapability({
      id: "agt.gate.cap",
      agentId: agent.id,
      capabilityKey: "PLAN_FITNESS_CYCLE",
      kind: "PLAN",
      summary: "Declared planning capability for fitness cycles",
    });
    const declared = updateAgentCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const policy = registerAgentGovernancePolicy({
      id: "agt.gate.gov",
      policyKey: "PLANNER_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Planner agent access control",
      agentKeyRef: agent.agentKey,
      ruleRef: "AGT_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateAgentInvocationContract({
      id: "agt.gate.inv",
      contractKey: "PLANNER_DOMAIN_LOOKUP",
      query: {
        queryKey: "FITNESS_PLANNER_Q",
        mode: "DECLARED",
        role: "PLANNER",
        capabilityKind: "PLAN",
        scope: "DOMAIN",
        agentKeys: [agent.agentKey],
      },
    });
    const manifest = buildAgentFoundationManifest();
    const readiness = evaluateAgentFoundationReadiness();

    const ok =
      agent.agentKey === "DOMAIN_FITNESS_PLANNER" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.agentKeyRef === "DOMAIN_FITNESS_PLANNER" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAgentFoundationReadinessReady(readiness);
      checks.push(
        check(
          "AGT-STACK",
          "agent-foundation",
          "Definition / capability / governance / invocation / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AGT-STACK",
          "agent-foundation",
          "Definition / capability / governance / invocation / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product agent foundation not ready",
        ),
      );
    }

    checks.push(
      check(
        "AGT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "agent-foundation-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product agent foundation probe failed";
    checks.push(
      check(
        "AGT-STACK",
        "agent-foundation",
        "Definition / capability / governance / invocation / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AGT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-agent-foundation-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAgentFoundationReleaseGatePass(
  gate: ReleaseGateResult = checkProductAgentFoundationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product agent foundation release gate failed: ${gate.summary}`,
    );
  }
}
