/**
 * Product M12 — Agent Policy Release Gate
 * MODULE: Agent Policy (M12-P4)
 * BASE: enterprise-product-agent-dependency-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AGENT_DEPENDENCY_ID } from "../dependency-runtime/dependency.constants";
import { bindAgentPolicyRule } from "../policy-runtime/binding.registry";
import {
  AGENT_POLICY_BINDING_STATUSES,
  AGENT_POLICY_CONSTRAINTS,
  AGENT_POLICY_ENFORCEMENTS,
  AGENT_POLICY_KINDS,
  AGENT_POLICY_READINESS_VERDICTS,
  AGENT_POLICY_RULE_STATUSES,
  AGENT_POLICY_STATUSES,
  PRODUCT_AGENT_POLICY_BASE,
  PRODUCT_AGENT_POLICY_FREEZE_TAG,
  PRODUCT_AGENT_POLICY_FREEZE_VERSION,
  PRODUCT_AGENT_POLICY_ID,
  PRODUCT_AGENT_POLICY_VERSION,
} from "../policy-runtime/policy.constants";
import {
  assertAgentPolicyReadinessReady,
  buildAgentPolicyManifest,
  clearAgentPolicyLayer,
  evaluateAgentPolicyReadiness,
} from "../policy-runtime/policy.manifest";
import {
  getAgentPolicyMetadata,
  isAgentPolicyMetadataIntact,
} from "../policy-runtime/policy.metadata";
import {
  registerAgentPolicy,
  updateAgentPolicyStatus,
} from "../policy-runtime/policy.registry";
import {
  registerAgentPolicyRule,
  updateAgentPolicyRuleStatus,
} from "../policy-runtime/rule.registry";

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

export const PRODUCT_AGENT_POLICY_SIGNOFF_VERSION =
  "product-agent-policy-signoff-1" as const;

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
  clearAgentPolicyLayer();
}

export function checkProductAgentPolicyReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAgentPolicyMetadata();

  checks.push(
    check(
      "AGTPOL-CONSTANTS",
      "policy-runtime",
      "Product agent policy version constants",
      PRODUCT_AGENT_POLICY_ID === "enterprise-product-agent-policy-v1" &&
        PRODUCT_AGENT_POLICY_VERSION === "product-agent-policy-1" &&
        PRODUCT_AGENT_POLICY_BASE === PRODUCT_AGENT_DEPENDENCY_ID &&
        PRODUCT_AGENT_POLICY_FREEZE_VERSION ===
          "product-agent-policy-freeze-1" &&
        PRODUCT_AGENT_POLICY_FREEZE_TAG === "product-agent-policy-freeze-1" &&
        AGENT_POLICY_KINDS.length === 4 &&
        AGENT_POLICY_STATUSES.length === 4 &&
        AGENT_POLICY_RULE_STATUSES.length === 4 &&
        AGENT_POLICY_BINDING_STATUSES.length === 3 &&
        AGENT_POLICY_ENFORCEMENTS.length === 3 &&
        AGENT_POLICY_CONSTRAINTS.length === 4 &&
        AGENT_POLICY_READINESS_VERDICTS.length === 3 &&
        isAgentPolicyMetadataIntact(metadata),
      `id=${PRODUCT_AGENT_POLICY_ID} base=${PRODUCT_AGENT_POLICY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AGTPOL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AGTPOL-UPSTREAM",
      "compatibility",
      "Depends on agent dependency chain",
      PRODUCT_AGENT_POLICY_BASE ===
        "enterprise-product-agent-dependency-v1" &&
        PRODUCT_AGENT_DEPENDENCY_ID ===
          "enterprise-product-agent-dependency-v1",
      `dependency=${PRODUCT_AGENT_DEPENDENCY_ID}`,
    ),
  );

  try {
    cleanup();

    const policy = registerAgentPolicy({
      id: "agtpol.gate.pol",
      policyKey: "DOMAIN_FITNESS_GATE",
      kind: "SAFETY",
      title: "Domain fitness agent policy gate",
      summary: "Declared policy for dependency-aware safety gates",
    });
    const active = updateAgentPolicyStatus({
      policyId: policy.id,
      status: "ACTIVE",
    });
    const rule = registerAgentPolicyRule({
      id: "agtpol.gate.rule",
      policyId: policy.id,
      ruleKey: "ACYCLIC_REQUIRED",
      sequence: 1,
      constraint: "DEPENDENCY_ACYCLIC",
      enforcement: "GATE",
      graphKeyRef: "DOMAIN_FITNESS_GRAPH",
      summary: "Soft-ref rule requiring acyclic dependency graph",
    });
    const declared = updateAgentPolicyRuleStatus({
      ruleId: rule.id,
      status: "DECLARED",
    });
    const binding = bindAgentPolicyRule({
      id: "agtpol.gate.bind",
      policyId: policy.id,
      ruleId: rule.id,
      bindingKey: "GATE_TO_FLEET_EDGE",
      edgeKeyRef: "FLEET_REQUIRES_PLANNER",
    });
    const manifest = buildAgentPolicyManifest();
    const readiness = evaluateAgentPolicyReadiness();

    const ok =
      policy.policyKey === "DOMAIN_FITNESS_GATE" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.graphKeyRef === "DOMAIN_FITNESS_GRAPH" &&
      declared.constraint === "DEPENDENCY_ACYCLIC" &&
      binding.status === "BOUND" &&
      binding.edgeKeyRef === "FLEET_REQUIRES_PLANNER" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAgentPolicyReadinessReady(readiness);
      checks.push(
        check(
          "AGTPOL-STACK",
          "agent-policy",
          "Policy / rule / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AGTPOL-STACK",
          "agent-policy",
          "Policy / rule / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product agent policy not ready",
        ),
      );
    }

    checks.push(
      check(
        "AGTPOL-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "agent-policy-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product agent policy probe failed";
    checks.push(
      check(
        "AGTPOL-STACK",
        "agent-policy",
        "Policy / rule / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AGTPOL-SCOPE",
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
      `product-agent-policy-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAgentPolicyReleaseGatePass(
  gate: ReleaseGateResult = checkProductAgentPolicyReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product agent policy release gate failed: ${gate.summary}`,
    );
  }
}
