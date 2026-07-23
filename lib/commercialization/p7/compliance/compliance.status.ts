/**
 * Commercialization P7 — Compliance status + readiness
 */

import { COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID } from "../../p6/kpi/kpi.constants";
import { listApprovalRules } from "../approval/approval.rules";
import { listApprovalRequests } from "../approval/approval.workflow";
import { listAuditRecords } from "../audit/audit.record";
import { listAuditTrails } from "../audit/audit.trail";
import {
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE,
} from "../governance/governance.constants";
import { listGovernancePolicies } from "../governance/governance.policy";
import { listGovernance } from "../governance/governance.registry";
import { listRiskAssessments } from "../risk/risk.assessment";
import { listRiskControls } from "../risk/risk.control";
import { listComplianceChecks } from "./compliance.checks";
import type {
  ComplianceStatus,
  ComplianceVerdict,
  EvaluateComplianceStatusInput,
  GovernanceReadinessCheck,
  GovernanceReadinessResult,
} from "./compliance.types";

const statuses = new Map<string, ComplianceStatus>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStatus(status: ComplianceStatus): ComplianceStatus {
  return { ...status };
}

function verdictFromScore(score: number, failCount: number): ComplianceVerdict {
  if (failCount === 0 && score >= 100) return "COMPLIANT";
  if (score >= 50) return "PARTIAL";
  return "NON_COMPLIANT";
}

export function evaluateComplianceStatus(
  input: EvaluateComplianceStatusInput = {},
): ComplianceStatus {
  const checks = listComplianceChecks();
  if (checks.length < 1) {
    throw new Error("no compliance checks available");
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.length - passCount;
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const passedWeight = checks
    .filter((c) => c.ok)
    .reduce((sum, c) => sum + c.weight, 0);
  const score =
    totalWeight === 0
      ? 0
      : Math.max(0, Math.min(100, Math.round((passedWeight / totalWeight) * 100)));
  const verdict = verdictFromScore(score, failCount);

  const id = input.id?.trim() || createId("cst");
  if (statuses.has(id)) {
    throw new Error(`compliance status already exists: ${id}`);
  }

  const status: ComplianceStatus = {
    id,
    verdict,
    score,
    checkCount: checks.length,
    passCount,
    failCount,
    detail: `verdict=${verdict} score=${score} pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
  statuses.set(id, status);
  return cloneStatus(status);
}

export function getComplianceStatus(
  id: string,
): ComplianceStatus | undefined {
  const status = statuses.get(id.trim());
  return status ? cloneStatus(status) : undefined;
}

export function listComplianceStatuses(): ComplianceStatus[] {
  return [...statuses.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneStatus);
}

export function clearComplianceStatuses(): void {
  statuses.clear();
}

function readinessCheck(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateCommercialGovernanceReadiness(): GovernanceReadinessResult {
  const checks: GovernanceReadinessCheck[] = [];

  checks.push(
    readinessCheck(
      "COM-P7-BASE",
      "foundation",
      "P6 revenue-intelligence baseline aligned",
      COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE ===
        COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
      `base=${COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE}`,
    ),
  );

  const governance = listGovernance();
  checks.push(
    readinessCheck(
      "COM-P7-GOV",
      "governance",
      "Governance records registered",
      governance.length >= 1,
      `governance=${governance.length}`,
    ),
  );

  const policies = listGovernancePolicies();
  checks.push(
    readinessCheck(
      "COM-P7-POL",
      "governance",
      "Governance policies defined",
      policies.length >= 1,
      `policies=${policies.length}`,
    ),
  );

  const approvals = listApprovalRequests();
  checks.push(
    readinessCheck(
      "COM-P7-APR",
      "approval",
      "Approval requests present",
      approvals.length >= 1,
      `approvals=${approvals.length}`,
    ),
  );

  const rules = listApprovalRules();
  checks.push(
    readinessCheck(
      "COM-P7-RULE",
      "approval",
      "Approval rules defined",
      rules.length >= 1,
      `rules=${rules.length}`,
    ),
  );

  const risks = listRiskAssessments();
  checks.push(
    readinessCheck(
      "COM-P7-RISK",
      "risk",
      "Risk assessments present",
      risks.length >= 1,
      `risks=${risks.length}`,
    ),
  );

  const controls = listRiskControls();
  checks.push(
    readinessCheck(
      "COM-P7-CTL",
      "risk",
      "Risk controls applied",
      controls.length >= 1,
      `controls=${controls.length}`,
    ),
  );

  const audits = listAuditRecords();
  checks.push(
    readinessCheck(
      "COM-P7-AUD",
      "audit",
      "Audit records present",
      audits.length >= 1,
      `audits=${audits.length}`,
    ),
  );

  const trails = listAuditTrails();
  checks.push(
    readinessCheck(
      "COM-P7-TRL",
      "audit",
      "Audit trails assembled",
      trails.length >= 1,
      `trails=${trails.length}`,
    ),
  );

  const complianceChecks = listComplianceChecks();
  checks.push(
    readinessCheck(
      "COM-P7-CHK",
      "compliance",
      "Compliance checks present",
      complianceChecks.length >= 1,
      `checks=${complianceChecks.length}`,
    ),
  );

  const complianceStatuses = listComplianceStatuses();
  checks.push(
    readinessCheck(
      "COM-P7-STS",
      "compliance",
      "Compliance status evaluated",
      complianceStatuses.length >= 1,
      `statuses=${complianceStatuses.length}`,
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
    summary: `commercial-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertCommercialGovernanceReadinessReady(
  result: GovernanceReadinessResult,
): asserts result is GovernanceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `commercial governance foundation not ready: ${result.summary}`,
    );
  }
}
