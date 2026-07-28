/**
 * Product M13 — OS Policy Release Gate
 * MODULE: OS Policy (M13-P4)
 * BASE: enterprise-product-os-dependency-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_OS_DEPENDENCY_ID } from "../dependency-runtime/dependency.constants";
import { bindOsPolicyRule } from "../policy-runtime/binding.registry";
import {
  OS_POLICY_BINDING_STATUSES,
  OS_POLICY_CONSTRAINTS,
  OS_POLICY_ENFORCEMENTS,
  OS_POLICY_KINDS,
  OS_POLICY_READINESS_VERDICTS,
  OS_POLICY_RULE_STATUSES,
  OS_POLICY_STATUSES,
  PRODUCT_OS_POLICY_BASE,
  PRODUCT_OS_POLICY_FREEZE_TAG,
  PRODUCT_OS_POLICY_FREEZE_VERSION,
  PRODUCT_OS_POLICY_ID,
  PRODUCT_OS_POLICY_VERSION,
} from "../policy-runtime/policy.constants";
import {
  assertOsPolicyReadinessReady,
  buildOsPolicyManifest,
  clearOsPolicyLayer,
  evaluateOsPolicyReadiness,
} from "../policy-runtime/policy.manifest";
import {
  getOsPolicyMetadata,
  isOsPolicyMetadataIntact,
} from "../policy-runtime/policy.metadata";
import {
  registerOsPolicy,
  updateOsPolicyStatus,
} from "../policy-runtime/policy.registry";
import {
  registerOsPolicyRule,
  updateOsPolicyRuleStatus,
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

export const PRODUCT_OS_POLICY_SIGNOFF_VERSION =
  "product-os-policy-signoff-1" as const;

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
  clearOsPolicyLayer();
}

export function checkProductOsPolicyReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getOsPolicyMetadata();

  checks.push(
    check(
      "OSPOL-CONSTANTS",
      "policy-runtime",
      "Product OS policy version constants",
      PRODUCT_OS_POLICY_ID === "enterprise-product-os-policy-v1" &&
        PRODUCT_OS_POLICY_VERSION === "product-os-policy-1" &&
        PRODUCT_OS_POLICY_BASE === PRODUCT_OS_DEPENDENCY_ID &&
        PRODUCT_OS_POLICY_FREEZE_VERSION === "product-os-policy-freeze-1" &&
        PRODUCT_OS_POLICY_FREEZE_TAG === "product-os-policy-freeze-1" &&
        OS_POLICY_KINDS.length === 4 &&
        OS_POLICY_STATUSES.length === 4 &&
        OS_POLICY_RULE_STATUSES.length === 4 &&
        OS_POLICY_BINDING_STATUSES.length === 3 &&
        OS_POLICY_ENFORCEMENTS.length === 3 &&
        OS_POLICY_CONSTRAINTS.length === 4 &&
        OS_POLICY_READINESS_VERDICTS.length === 3 &&
        isOsPolicyMetadataIntact(metadata),
      `id=${PRODUCT_OS_POLICY_ID} base=${PRODUCT_OS_POLICY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OSPOL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OSPOL-UPSTREAM",
      "compatibility",
      "Depends on OS dependency chain",
      PRODUCT_OS_POLICY_BASE === "enterprise-product-os-dependency-v1" &&
        PRODUCT_OS_DEPENDENCY_ID === "enterprise-product-os-dependency-v1",
      `dependency=${PRODUCT_OS_DEPENDENCY_ID}`,
    ),
  );

  try {
    cleanup();

    const policy = registerOsPolicy({
      id: "ospol.gate.pol",
      policyKey: "DOMAIN_CONTROL_GATE",
      kind: "SAFETY",
      title: "Domain control OS policy gate",
      summary: "Declared policy for dependency-aware OS safety gates",
    });
    const active = updateOsPolicyStatus({
      policyId: policy.id,
      status: "ACTIVE",
    });
    const rule = registerOsPolicyRule({
      id: "ospol.gate.rule",
      policyId: policy.id,
      ruleKey: "ACYCLIC_REQUIRED",
      sequence: 1,
      constraint: "DEPENDENCY_ACYCLIC",
      enforcement: "GATE",
      graphKeyRef: "DOMAIN_CONTROL_GRAPH",
      summary: "Soft-ref rule requiring acyclic dependency graph",
    });
    const declared = updateOsPolicyRuleStatus({
      ruleId: rule.id,
      status: "DECLARED",
    });
    const binding = bindOsPolicyRule({
      id: "ospol.gate.bind",
      policyId: policy.id,
      ruleId: rule.id,
      bindingKey: "GATE_TO_FLEET_EDGE",
      edgeKeyRef: "FLEET_REQUIRES_CONTROL",
    });
    const manifest = buildOsPolicyManifest();
    const readiness = evaluateOsPolicyReadiness();

    const ok =
      policy.policyKey === "DOMAIN_CONTROL_GATE" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.graphKeyRef === "DOMAIN_CONTROL_GRAPH" &&
      declared.constraint === "DEPENDENCY_ACYCLIC" &&
      binding.status === "BOUND" &&
      binding.edgeKeyRef === "FLEET_REQUIRES_CONTROL" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertOsPolicyReadinessReady(readiness);
      checks.push(
        check(
          "OSPOL-STACK",
          "os-policy",
          "Policy / rule / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OSPOL-STACK",
          "os-policy",
          "Policy / rule / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product os policy not ready",
        ),
      );
    }

    checks.push(
      check(
        "OSPOL-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "os-policy-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product os policy probe failed";
    checks.push(
      check(
        "OSPOL-STACK",
        "os-policy",
        "Policy / rule / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "OSPOL-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
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
      `product-os-policy-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOsPolicyReleaseGatePass(
  gate: ReleaseGateResult = checkProductOsPolicyReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product OS policy release gate failed: ${gate.summary}`);
  }
}
