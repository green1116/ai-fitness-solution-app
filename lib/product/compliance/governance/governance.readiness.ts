/**
 * Product Compliance — readiness
 */

import { PRODUCT_OPERATIONS_CONSOLE_ID } from "../../operations/console/console.constants";
import { listComplianceAssessments } from "../assessment/assessment.registry";
import { listComplianceControls } from "../control/control.registry";
import { listComplianceEvidences } from "../evidence/evidence.registry";
import { listComplianceFrameworks } from "../framework/framework.registry";
import { PRODUCT_COMPLIANCE_GOVERNANCE_BASE } from "./governance.constants";
import type {
  ComplianceReadinessCheck,
  ComplianceReadinessResult,
} from "./governance.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): ComplianceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateComplianceGovernanceReadiness(): ComplianceReadinessResult {
  const checks: ComplianceReadinessCheck[] = [];

  checks.push(
    check(
      "CMP-BASE",
      "governance",
      "Operations console aligned",
      PRODUCT_COMPLIANCE_GOVERNANCE_BASE === PRODUCT_OPERATIONS_CONSOLE_ID,
      `base=${PRODUCT_COMPLIANCE_GOVERNANCE_BASE}`,
    ),
  );

  const frameworks = listComplianceFrameworks();
  checks.push(
    check(
      "CMP-FW",
      "framework",
      "Active frameworks present",
      frameworks.some((f) => f.status === "ACTIVE"),
      `frameworks=${frameworks.length}`,
    ),
  );

  const controls = listComplianceControls();
  checks.push(
    check(
      "CMP-CTL",
      "control",
      "Implemented or monitored controls present",
      controls.some(
        (c) => c.status === "IMPLEMENTED" || c.status === "MONITORED",
      ),
      `controls=${controls.length}`,
    ),
  );

  const evidences = listComplianceEvidences();
  checks.push(
    check(
      "CMP-EV",
      "evidence",
      "Evidence present",
      evidences.length >= 1,
      `evidences=${evidences.length}`,
    ),
  );

  const assessments = listComplianceAssessments();
  checks.push(
    check(
      "CMP-ASM",
      "assessment",
      "Passing assessments present",
      assessments.some((a) => a.result === "PASS"),
      `assessments=${assessments.length}`,
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
    summary: `product-compliance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertComplianceGovernanceReadinessReady(
  result: ComplianceReadinessResult,
): asserts result is ComplianceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product compliance governance not ready: ${result.summary}`,
    );
  }
}
