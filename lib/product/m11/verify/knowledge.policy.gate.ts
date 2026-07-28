/**
 * Product M11 — Knowledge Policy Release Gate
 * MODULE: Knowledge Policy (M11-P4)
 * BASE: enterprise-product-knowledge-dependency-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_DEPENDENCY_ID } from "../dependency-runtime/dependency.constants";
import { bindKnowledgePolicyRule } from "../policy-runtime/binding.registry";
import {
  KNOWLEDGE_POLICY_BINDING_STATUSES,
  KNOWLEDGE_POLICY_CONSTRAINTS,
  KNOWLEDGE_POLICY_ENFORCEMENTS,
  KNOWLEDGE_POLICY_KINDS,
  KNOWLEDGE_POLICY_READINESS_VERDICTS,
  KNOWLEDGE_POLICY_RULE_STATUSES,
  KNOWLEDGE_POLICY_STATUSES,
  PRODUCT_KNOWLEDGE_POLICY_BASE,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_POLICY_ID,
  PRODUCT_KNOWLEDGE_POLICY_VERSION,
} from "../policy-runtime/policy.constants";
import {
  assertKnowledgePolicyReadinessReady,
  buildKnowledgePolicyManifest,
  clearKnowledgePolicyLayer,
  evaluateKnowledgePolicyReadiness,
} from "../policy-runtime/policy.manifest";
import {
  getKnowledgePolicyMetadata,
  isKnowledgePolicyMetadataIntact,
} from "../policy-runtime/policy.metadata";
import {
  registerKnowledgePolicy,
  updateKnowledgePolicyStatus,
} from "../policy-runtime/policy.registry";
import {
  registerKnowledgePolicyRule,
  updateKnowledgePolicyRuleStatus,
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

export const PRODUCT_KNOWLEDGE_POLICY_SIGNOFF_VERSION =
  "product-knowledge-policy-signoff-1" as const;

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
  clearKnowledgePolicyLayer();
}

export function checkProductKnowledgePolicyReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getKnowledgePolicyMetadata();

  checks.push(
    check(
      "KNWPOL-CONSTANTS",
      "policy-runtime",
      "Product knowledge policy version constants",
      PRODUCT_KNOWLEDGE_POLICY_ID ===
        "enterprise-product-knowledge-policy-v1" &&
        PRODUCT_KNOWLEDGE_POLICY_VERSION === "product-knowledge-policy-1" &&
        PRODUCT_KNOWLEDGE_POLICY_BASE === PRODUCT_KNOWLEDGE_DEPENDENCY_ID &&
        PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION ===
          "product-knowledge-policy-freeze-1" &&
        PRODUCT_KNOWLEDGE_POLICY_FREEZE_TAG ===
          "product-knowledge-policy-freeze-1" &&
        KNOWLEDGE_POLICY_KINDS.length === 4 &&
        KNOWLEDGE_POLICY_STATUSES.length === 4 &&
        KNOWLEDGE_POLICY_RULE_STATUSES.length === 4 &&
        KNOWLEDGE_POLICY_BINDING_STATUSES.length === 3 &&
        KNOWLEDGE_POLICY_ENFORCEMENTS.length === 3 &&
        KNOWLEDGE_POLICY_CONSTRAINTS.length === 4 &&
        KNOWLEDGE_POLICY_READINESS_VERDICTS.length === 3 &&
        isKnowledgePolicyMetadataIntact(metadata),
      `id=${PRODUCT_KNOWLEDGE_POLICY_ID} base=${PRODUCT_KNOWLEDGE_POLICY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "KNWPOL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "KNWPOL-UPSTREAM",
      "compatibility",
      "Depends on knowledge dependency chain",
      PRODUCT_KNOWLEDGE_POLICY_BASE ===
        "enterprise-product-knowledge-dependency-v1" &&
        PRODUCT_KNOWLEDGE_DEPENDENCY_ID ===
          "enterprise-product-knowledge-dependency-v1",
      `dependency=${PRODUCT_KNOWLEDGE_DEPENDENCY_ID}`,
    ),
  );

  try {
    cleanup();

    const policy = registerKnowledgePolicy({
      id: "knwpol.gate.pol",
      policyKey: "DOMAIN_FITNESS_GATE",
      kind: "QUALITY",
      title: "Domain fitness policy gate",
      summary: "Declared policy for dependency-aware quality gates",
    });
    const active = updateKnowledgePolicyStatus({
      policyId: policy.id,
      status: "ACTIVE",
    });
    const rule = registerKnowledgePolicyRule({
      id: "knwpol.gate.rule",
      policyId: policy.id,
      ruleKey: "ACYCLIC_REQUIRED",
      sequence: 1,
      constraint: "DEPENDENCY_ACYCLIC",
      enforcement: "GATE",
      graphKeyRef: "DOMAIN_FITNESS_GRAPH",
      summary: "Soft-ref rule requiring acyclic dependency graph",
    });
    const declared = updateKnowledgePolicyRuleStatus({
      ruleId: rule.id,
      status: "DECLARED",
    });
    const binding = bindKnowledgePolicyRule({
      id: "knwpol.gate.bind",
      policyId: policy.id,
      ruleId: rule.id,
      bindingKey: "GATE_TO_LIBRARY_EDGE",
      edgeKeyRef: "LIBRARY_REQUIRES_POLICY",
    });
    const manifest = buildKnowledgePolicyManifest();
    const readiness = evaluateKnowledgePolicyReadiness();

    const ok =
      policy.policyKey === "DOMAIN_FITNESS_GATE" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.graphKeyRef === "DOMAIN_FITNESS_GRAPH" &&
      declared.constraint === "DEPENDENCY_ACYCLIC" &&
      binding.status === "BOUND" &&
      binding.edgeKeyRef === "LIBRARY_REQUIRES_POLICY" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertKnowledgePolicyReadinessReady(readiness);
      checks.push(
        check(
          "KNWPOL-STACK",
          "knowledge-policy",
          "Policy / rule / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "KNWPOL-STACK",
          "knowledge-policy",
          "Policy / rule / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product knowledge policy not ready",
        ),
      );
    }

    checks.push(
      check(
        "KNWPOL-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
        ok && metadata.declarationOnly === true,
        "knowledge-policy-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product knowledge policy probe failed";
    checks.push(
      check(
        "KNWPOL-STACK",
        "knowledge-policy",
        "Policy / rule / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "KNWPOL-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
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
      `product-knowledge-policy-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductKnowledgePolicyReleaseGatePass(
  gate: ReleaseGateResult = checkProductKnowledgePolicyReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product knowledge policy release gate failed: ${gate.summary}`,
    );
  }
}
