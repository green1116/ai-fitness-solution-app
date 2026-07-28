/**
 * Product M14 — Intelligence Policy Release Gate
 * MODULE: Enterprise Intelligence Policy (M14-P4)
 * BASE: enterprise-product-intelligence-dependency-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_DEPENDENCY_ID } from "../dependency-runtime/dependency.constants";
import { bindIntelligencePolicyRule } from "../policy-runtime/binding.registry";
import {
  INTELLIGENCE_POLICY_BINDING_STATUSES,
  INTELLIGENCE_POLICY_CONSTRAINTS,
  INTELLIGENCE_POLICY_ENFORCEMENTS,
  INTELLIGENCE_POLICY_KINDS,
  INTELLIGENCE_POLICY_READINESS_VERDICTS,
  INTELLIGENCE_POLICY_RULE_STATUSES,
  INTELLIGENCE_POLICY_STATUSES,
  PRODUCT_INTELLIGENCE_POLICY_BASE,
  PRODUCT_INTELLIGENCE_POLICY_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_POLICY_ID,
  PRODUCT_INTELLIGENCE_POLICY_VERSION,
} from "../policy-runtime/policy.constants";
import {
  assertIntelligencePolicyReadinessReady,
  buildIntelligencePolicyManifest,
  clearIntelligencePolicyLayer,
  evaluateIntelligencePolicyReadiness,
} from "../policy-runtime/policy.manifest";
import {
  getIntelligencePolicyMetadata,
  isIntelligencePolicyMetadataIntact,
} from "../policy-runtime/policy.metadata";
import {
  registerIntelligencePolicy,
  updateIntelligencePolicyStatus,
} from "../policy-runtime/policy.registry";
import {
  registerIntelligencePolicyRule,
  updateIntelligencePolicyRuleStatus,
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

export const PRODUCT_INTELLIGENCE_POLICY_SIGNOFF_VERSION =
  "product-intelligence-policy-signoff-1" as const;

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
  clearIntelligencePolicyLayer();
}

export function checkProductIntelligencePolicyReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getIntelligencePolicyMetadata();

  checks.push(
    check(
      "INTPOL-CONSTANTS",
      "policy-runtime",
      "Product intelligence policy version constants",
      PRODUCT_INTELLIGENCE_POLICY_ID ===
        "enterprise-product-intelligence-policy-v1" &&
        PRODUCT_INTELLIGENCE_POLICY_VERSION === "product-intelligence-policy-1" &&
        PRODUCT_INTELLIGENCE_POLICY_BASE === PRODUCT_INTELLIGENCE_DEPENDENCY_ID &&
        PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION ===
          "product-intelligence-policy-freeze-1" &&
        PRODUCT_INTELLIGENCE_POLICY_FREEZE_TAG ===
          "product-intelligence-policy-freeze-1" &&
        INTELLIGENCE_POLICY_KINDS.length === 4 &&
        INTELLIGENCE_POLICY_STATUSES.length === 4 &&
        INTELLIGENCE_POLICY_RULE_STATUSES.length === 4 &&
        INTELLIGENCE_POLICY_BINDING_STATUSES.length === 3 &&
        INTELLIGENCE_POLICY_ENFORCEMENTS.length === 3 &&
        INTELLIGENCE_POLICY_CONSTRAINTS.length === 4 &&
        INTELLIGENCE_POLICY_READINESS_VERDICTS.length === 3 &&
        isIntelligencePolicyMetadataIntact(metadata),
      `id=${PRODUCT_INTELLIGENCE_POLICY_ID} base=${PRODUCT_INTELLIGENCE_POLICY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "INTPOL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "INTPOL-UPSTREAM",
      "compatibility",
      "Depends on intelligence dependency chain",
      PRODUCT_INTELLIGENCE_POLICY_BASE ===
        "enterprise-product-intelligence-dependency-v1" &&
        PRODUCT_INTELLIGENCE_DEPENDENCY_ID ===
          "enterprise-product-intelligence-dependency-v1",
      `dependency=${PRODUCT_INTELLIGENCE_DEPENDENCY_ID}`,
    ),
  );

  try {
    cleanup();

    const policy = registerIntelligencePolicy({
      id: "intpol.gate.pol",
      policyKey: "EXECUTIVE_DECISION_GATE",
      kind: "SAFETY",
      title: "Executive decision intelligence policy gate",
      summary: "Declared policy for dependency-aware intelligence safety gates",
    });
    const active = updateIntelligencePolicyStatus({
      policyId: policy.id,
      status: "ACTIVE",
    });
    const rule = registerIntelligencePolicyRule({
      id: "intpol.gate.rule",
      policyId: policy.id,
      ruleKey: "ACYCLIC_REQUIRED",
      sequence: 1,
      constraint: "DEPENDENCY_ACYCLIC",
      enforcement: "GATE",
      graphKeyRef: "EXECUTIVE_DECISION_GRAPH",
      summary: "Soft-ref rule requiring acyclic dependency graph",
    });
    const declared = updateIntelligencePolicyRuleStatus({
      ruleId: rule.id,
      status: "DECLARED",
    });
    const binding = bindIntelligencePolicyRule({
      id: "intpol.gate.bind",
      policyId: policy.id,
      ruleId: rule.id,
      bindingKey: "GATE_TO_SUPPORT_EDGE",
      edgeKeyRef: "PORTFOLIO_REQUIRES_SUPPORT",
    });
    const manifest = buildIntelligencePolicyManifest();
    const readiness = evaluateIntelligencePolicyReadiness();

    const ok =
      policy.policyKey === "EXECUTIVE_DECISION_GATE" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.graphKeyRef === "EXECUTIVE_DECISION_GRAPH" &&
      declared.constraint === "DEPENDENCY_ACYCLIC" &&
      binding.status === "BOUND" &&
      binding.edgeKeyRef === "PORTFOLIO_REQUIRES_SUPPORT" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertIntelligencePolicyReadinessReady(readiness);
      checks.push(
        check(
          "INTPOL-STACK",
          "intelligence-policy",
          "Policy / rule / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "INTPOL-STACK",
          "intelligence-policy",
          "Policy / rule / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product intelligence policy not ready",
        ),
      );
    }

    checks.push(
      check(
        "INTPOL-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "intelligence-policy-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product intelligence policy probe failed";
    checks.push(
      check(
        "INTPOL-STACK",
        "intelligence-policy",
        "Policy / rule / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "INTPOL-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
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
      `product-intelligence-policy-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIntelligencePolicyReleaseGatePass(
  gate: ReleaseGateResult = checkProductIntelligencePolicyReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product intelligence policy release gate failed: ${gate.summary}`,
    );
  }
}
