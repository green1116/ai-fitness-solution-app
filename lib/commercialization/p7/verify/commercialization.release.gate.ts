/**
 * Commercialization P7 — Commercial Governance Release Gate
 * BASE: enterprise-commercialization-p6-revenue-intelligence-v1
 * Isolated namespace — does not mutate E01–E12 or P1–P6 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../../p1/sales/sales.constants";
import { COMMERCIALIZATION_PRODUCT_PACKAGING_ID } from "../../p2/tier/tier.constants";
import { COMMERCIALIZATION_PRICING_CONTRACT_ID } from "../../p3/pricing/pricing.constants";
import { COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID } from "../../p4/onboarding/onboarding.constants";
import { COMMERCIALIZATION_DELIVERY_OPERATIONS_ID } from "../../p5/delivery/delivery.constants";
import {
  COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
} from "../../p6/kpi/kpi.constants";
import {
  APPROVAL_STATES,
  AUDIT_EVENT_KINDS,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION,
  COMMERCIALIZATION_P7_GOVERNANCE_FREEZE_VERSION,
  COMPLIANCE_VERDICTS,
  GOVERNANCE_MANAGER_STATUSES,
  GOVERNANCE_POLICY_STATUSES,
  GOVERNANCE_READINESS_VERDICTS,
  GOVERNANCE_SCOPES,
  RISK_LEVELS,
} from "../governance/governance.constants";
import {
  assertCommercialGovernanceReadinessReady,
  clearCommercialGovernanceLayer,
  createCommercialGovernanceManager,
  getGovernanceRegistryManifest,
} from "../governance.manager";

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

export const COMMERCIALIZATION_P7_SIGNOFF_VERSION =
  "commercialization-p7-signoff-1" as const;

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
  clearCommercialGovernanceLayer();
}

export function checkCommercializationP7ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "COM-P7-CONSTANTS",
      "governance",
      "Commercial governance version constants",
      COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID ===
        "enterprise-commercialization-p7-commercial-governance-v1" &&
        COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION ===
          "commercialization-p7-1" &&
        COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE ===
          COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID &&
        COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE ===
          "enterprise-commercialization-p6-revenue-intelligence-v1" &&
        COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION ===
          "commercialization-commercial-governance-freeze-1" &&
        COMMERCIALIZATION_P7_GOVERNANCE_FREEZE_VERSION ===
          "commercialization-p7-commercial-governance-freeze-1" &&
        GOVERNANCE_SCOPES.length === 4 &&
        GOVERNANCE_POLICY_STATUSES.length === 4 &&
        APPROVAL_STATES.length === 4 &&
        RISK_LEVELS.length === 4 &&
        AUDIT_EVENT_KINDS.length === 4 &&
        COMPLIANCE_VERDICTS.length === 3 &&
        GOVERNANCE_READINESS_VERDICTS.length === 3 &&
        GOVERNANCE_MANAGER_STATUSES.length === 4,
      `id=${COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID} base=${COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "COM-P7-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "COM-P7-P6-BASE",
      "revenue-intelligence",
      "P6 revenue-intelligence freeze preserved as BASE",
      COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID ===
        "enterprise-commercialization-p6-revenue-intelligence-v1" &&
        COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE ===
          COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID &&
        COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION ===
          "commercialization-p6-revenue-intelligence-freeze-1" &&
        COMMERCIALIZATION_DELIVERY_OPERATIONS_ID ===
          "enterprise-commercialization-p5-delivery-operations-foundation-v1" &&
        COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID ===
          "enterprise-commercialization-p4-customer-onboarding-foundation-v1" &&
        COMMERCIALIZATION_PRICING_CONTRACT_ID ===
          "enterprise-commercialization-p3-pricing-contract-foundation-v1" &&
        COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
          "enterprise-commercialization-p2-product-packaging-foundation-v1" &&
        COMMERCIALIZATION_SALES_FOUNDATION_ID ===
          "enterprise-commercialization-p1-sales-foundation-v1",
      `p6=${COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID}`,
    ),
  );

  checks.push(
    check(
      "COM-P7-UPSTREAM",
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
    const mgr = createCommercialGovernanceManager({
      managerId: "comm-p7-gate",
    });
    mgr.initialize();
    mgr.start();

    const gov = mgr.registerGovernance({
      id: "comm.p7.gate.gov",
      name: "Acme Discount Governance",
      scope: "DISCOUNT",
      owner: "commercial-ops",
    });
    mgr.definePolicy({
      id: "comm.p7.gate.policy",
      governanceId: gov.id,
      title: "Max discount threshold",
      threshold: 15,
    });

    const rule = mgr.defineApprovalRule({
      id: "comm.p7.gate.rule",
      name: "Standard commercial approval",
      maxAutoApprove: 1000,
      escalateAbove: 10000,
    });
    const approvalPath = mgr.evaluateApprovalAmount(2500, rule.id);
    const request = mgr.submitApproval({
      id: "comm.p7.gate.apr",
      governanceId: gov.id,
      subject: "acme-discount-request",
      requester: "ae.jordan",
      amount: 2500,
    });
    mgr.decideApproval({
      id: "comm.p7.gate.apd",
      requestId: request.id,
      state: "APPROVED",
      reviewer: "cfo.lee",
      rationale: "Within policy",
    });

    const risk = mgr.assessRisk({
      id: "comm.p7.gate.risk",
      governanceId: gov.id,
      title: "Discount leakage",
      impact: 70,
      likelihood: 40,
    });
    mgr.applyRiskControl({
      id: "comm.p7.gate.ctl",
      assessmentId: risk.id,
      name: "Dual approval",
      mitigation: "Require dual approval above threshold",
      residualLevel: "LOW",
    });

    mgr.recordAudit({
      id: "comm.p7.gate.aud1",
      kind: "POLICY",
      actor: "commercial-ops",
      subject: gov.id,
      message: "Policy activated",
    });
    mgr.recordAudit({
      id: "comm.p7.gate.aud2",
      kind: "APPROVAL",
      actor: "cfo.lee",
      subject: gov.id,
      message: "Discount approved",
    });
    mgr.assembleTrail({
      id: "comm.p7.gate.trail",
      subject: gov.id,
    });

    mgr.runComplianceCheck({
      id: "comm.p7.gate.chk1",
      name: "Policy active",
      component: "governance",
      ok: true,
    });
    mgr.runComplianceCheck({
      id: "comm.p7.gate.chk2",
      name: "Approval trail complete",
      component: "audit",
      ok: true,
    });
    const compliance = mgr.evaluateCompliance({
      id: "comm.p7.gate.status",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getGovernanceRegistryManifest();

    const ok =
      approvalPath === "REVIEW" &&
      compliance.verdict === "COMPLIANT" &&
      readiness.verdict === "READY" &&
      registry.foundationId === COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID &&
      registry.base === COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE &&
      registry.governanceCount >= 1 &&
      registry.policyCount >= 1 &&
      registry.approvalCount >= 1 &&
      registry.ruleCount >= 1 &&
      registry.riskCount >= 1 &&
      registry.controlCount >= 1 &&
      registry.auditCount >= 2 &&
      registry.trailCount >= 1 &&
      registry.complianceCheckCount >= 2 &&
      registry.complianceStatusCount >= 1;

    try {
      assertCommercialGovernanceReadinessReady(readiness);
      checks.push(
        check(
          "COM-P7-STACK",
          "governance",
          "Governance / approval / risk / audit / compliance / readiness",
          ok,
          `path=${approvalPath} compliance=${compliance.verdict} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "COM-P7-STACK",
          "governance",
          "Governance / approval / risk / audit / compliance / readiness",
          false,
          error instanceof Error
            ? error.message
            : "commercial governance not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "COM-P7-STACK",
        "governance",
        "Governance / approval / risk / audit / compliance / readiness",
        false,
        error instanceof Error
          ? error.message
          : "commercial governance probe failed",
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
      `commercialization-p7-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertCommercializationP7ReleaseGatePass(
  gate: ReleaseGateResult = checkCommercializationP7ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Commercialization P7 release gate failed: ${gate.summary}`,
    );
  }
}
