/**
 * Product Compliance — Governance & Compliance Release Gate
 * MODULE: Compliance
 * BASE: enterprise-product-operations-console-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../../customer-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID } from "../../analytics-baseline/freeze/freeze.lock";
import { PRODUCT_ADMIN_FOUNDATION_ID } from "../../admin/foundation/foundation.constants";
import { PRODUCT_SYSTEM_CONFIGURATION_ID } from "../../configuration/management/management.constants";
import { PRODUCT_OPERATIONS_CONSOLE_ID } from "../../operations/console/console.constants";
import { PRODUCT_TENANT_ADMINISTRATION_ID } from "../../tenant/administration/administration.constants";
import { PRODUCT_USER_ADMINISTRATION_ID } from "../../user/administration/administration.constants";
import {
  assertComplianceGovernanceReadinessReady,
  clearComplianceGovernanceLayer,
  createComplianceManager,
  getComplianceRegistryManifest,
} from "../compliance.manager";
import {
  COMPLIANCE_ASSESSMENT_RESULTS,
  COMPLIANCE_CONTROL_STATUSES,
  COMPLIANCE_EVIDENCE_KINDS,
  COMPLIANCE_FRAMEWORK_KINDS,
  COMPLIANCE_FRAMEWORK_STATUSES,
  COMPLIANCE_MANAGER_STATUSES,
  COMPLIANCE_READINESS_VERDICTS,
  PRODUCT_COMPLIANCE_FREEZE_VERSION,
  PRODUCT_COMPLIANCE_GOVERNANCE_BASE,
  PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_COMPLIANCE_GOVERNANCE_ID,
  PRODUCT_COMPLIANCE_GOVERNANCE_VERSION,
} from "../governance/governance.constants";

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

export const PRODUCT_COMPLIANCE_SIGNOFF_VERSION =
  "product-compliance-signoff-1" as const;

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
  clearComplianceGovernanceLayer();
}

export function checkProductComplianceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CMP-CONSTANTS",
      "governance",
      "Product compliance governance version constants",
      PRODUCT_COMPLIANCE_GOVERNANCE_ID ===
        "enterprise-product-compliance-governance-v1" &&
        PRODUCT_COMPLIANCE_GOVERNANCE_VERSION === "product-compliance-1" &&
        PRODUCT_COMPLIANCE_GOVERNANCE_BASE ===
          PRODUCT_OPERATIONS_CONSOLE_ID &&
        PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION ===
          "product-compliance-governance-freeze-1" &&
        PRODUCT_COMPLIANCE_FREEZE_VERSION ===
          "product-compliance-governance-freeze-1" &&
        COMPLIANCE_FRAMEWORK_KINDS.length === 4 &&
        COMPLIANCE_FRAMEWORK_STATUSES.length === 3 &&
        COMPLIANCE_CONTROL_STATUSES.length === 3 &&
        COMPLIANCE_EVIDENCE_KINDS.length === 3 &&
        COMPLIANCE_ASSESSMENT_RESULTS.length === 3 &&
        COMPLIANCE_READINESS_VERDICTS.length === 3 &&
        COMPLIANCE_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_COMPLIANCE_GOVERNANCE_ID} base=${PRODUCT_COMPLIANCE_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "CMP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CMP-OPS-BASE",
      "product-operations-console",
      "Operations console BASE preserved",
      PRODUCT_COMPLIANCE_GOVERNANCE_BASE ===
        "enterprise-product-operations-console-v1" &&
        PRODUCT_OPERATIONS_CONSOLE_ID ===
          "enterprise-product-operations-console-v1" &&
        PRODUCT_SYSTEM_CONFIGURATION_ID ===
          "enterprise-product-system-configuration-v1" &&
        PRODUCT_USER_ADMINISTRATION_ID ===
          "enterprise-product-user-administration-v1" &&
        PRODUCT_TENANT_ADMINISTRATION_ID ===
          "enterprise-product-tenant-administration-v1" &&
        PRODUCT_ADMIN_FOUNDATION_ID ===
          "enterprise-product-admin-foundation-v1" &&
        ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
          "enterprise-product-analytics-baseline-v1" &&
        ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
          "enterprise-product-customer-baseline-v1" &&
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
          "enterprise-product-billing-baseline-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_COMPLIANCE_GOVERNANCE_BASE}`,
    ),
  );

  checks.push(
    check(
      "CMP-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createComplianceManager({ managerId: "prod-cmp-gate" });
    mgr.initialize();
    mgr.start();

    const framework = mgr.registerFramework({
      id: "cmp.gate.fw",
      code: "SOC2_TYPE2",
      name: "SOC 2 Type II",
      kind: "SOC2",
      opsSurfaceId: "ops.gate.sfc",
    });
    mgr.updateFrameworkStatus({
      frameworkId: framework.id,
      status: "ACTIVE",
    });
    const control = mgr.defineControl({
      id: "cmp.gate.ctl",
      frameworkId: framework.id,
      code: "CC6.1",
      title: "Logical access controls",
    });
    mgr.updateControlStatus({
      controlId: control.id,
      status: "IMPLEMENTED",
    });
    const evidence = mgr.collectEvidence({
      id: "cmp.gate.ev",
      controlId: control.id,
      kind: "LOG",
      reference: "ops.gate.dsp",
    });
    const assessment = mgr.runAssessment({
      id: "cmp.gate.asm",
      frameworkId: framework.id,
      controlIds: [control.id],
      evidenceIds: [evidence.id],
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getComplianceRegistryManifest();

    const ok =
      assessment.result === "PASS" &&
      readiness.verdict === "READY" &&
      registry.governanceId === PRODUCT_COMPLIANCE_GOVERNANCE_ID &&
      registry.base === PRODUCT_COMPLIANCE_GOVERNANCE_BASE &&
      registry.frameworkCount >= 1 &&
      registry.controlCount >= 1 &&
      registry.evidenceCount >= 1 &&
      registry.assessmentCount >= 1;

    try {
      assertComplianceGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "CMP-STACK",
          "governance",
          "Framework / control / evidence / assessment",
          ok,
          `readiness=${readiness.verdict} result=${assessment.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "CMP-STACK",
          "governance",
          "Framework / control / evidence / assessment",
          false,
          error instanceof Error
            ? error.message
            : "product compliance not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "CMP-STACK",
        "governance",
        "Framework / control / evidence / assessment",
        false,
        error instanceof Error
          ? error.message
          : "product compliance probe failed",
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
      `product-compliance-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductComplianceReleaseGatePass(
  gate: ReleaseGateResult = checkProductComplianceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product compliance release gate failed: ${gate.summary}`,
    );
  }
}
