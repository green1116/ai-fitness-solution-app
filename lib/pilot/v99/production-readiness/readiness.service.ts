/**
 * V99 — Readiness engine (read from V98–V81 services)
 */

import { listIntakeSessionsForOrg } from "@/lib/pilot/v80";
import { listDeliveryTrackingForOrg } from "@/lib/pilot/v81";
import { buildBoardGovernanceDashboard } from "@/lib/pilot/v92";
import { listBoardPackets } from "@/lib/pilot/v93";
import { listBriefingPacks } from "@/lib/pilot/v94";
import { buildExecutiveActionDashboard } from "@/lib/pilot/v95";
import { listArchiveRecords } from "@/lib/pilot/v96";
import { buildExecutiveComplianceDashboard } from "@/lib/pilot/v97";
import { buildPolicyEnforcementDashboard } from "@/lib/pilot/v98";

import { getCertifiedAt, getGateOverride } from "./certification-cache";
import type {
  ArtifactLink,
  AuditReference,
  CertificationGate,
  GateStatus,
  OverallReadiness,
  ReadinessDimension,
  ReadinessDimensionResult,
  ReadinessSummary,
  RiskSummaryItem,
} from "./readiness.types";

const DIMENSION_LABELS: Record<ReadinessDimension, string> = {
  architecture: "架构就绪",
  workflow: "工作流就绪",
  delivery: "交付就绪",
  governance: "治理就绪",
  compliance: "合规就绪",
  operations: "运营就绪",
};

function applyOverride(organizationId: string, gateId: string, status: GateStatus): GateStatus {
  return getGateOverride(organizationId, gateId) ?? status;
}

export function evaluateArchitecture(organizationId: string): ReadinessDimensionResult {
  const sessions = listIntakeSessionsForOrg(organizationId);
  const signedOff = sessions.filter((s) => s.signedOff);
  const checksTotal = 2;
  let checksPassed = 0;
  if (sessions.length > 0) checksPassed++;
  if (signedOff.length > 0) checksPassed++;

  const score = Math.round((checksPassed / checksTotal) * 100);
  const gateStatus: GateStatus =
    signedOff.length === 0 ? "blocked" : sessions.length < signedOff.length ? "warning" : "pass";

  return {
    dimension: "architecture",
    label: DIMENSION_LABELS.architecture,
    score,
    gateStatus: applyOverride(organizationId, "gate-architecture", gateStatus),
    summary: `${signedOff.length}/${sessions.length} 会话已签收`,
    checksPassed,
    checksTotal,
    readOnly: true,
  };
}

export function evaluateWorkflow(organizationId: string): ReadinessDimensionResult {
  const packets = listBoardPackets(organizationId);
  const briefings = listBriefingPacks(organizationId);
  const checksTotal = 2;
  let checksPassed = 0;
  if (packets.length > 0) checksPassed++;
  if (briefings.length > 0) checksPassed++;

  const score = Math.round((checksPassed / checksTotal) * 100);
  const gateStatus: GateStatus =
    checksPassed === 0 ? "blocked" : checksPassed < checksTotal ? "warning" : "pass";

  return {
    dimension: "workflow",
    label: DIMENSION_LABELS.workflow,
    score,
    gateStatus: applyOverride(organizationId, "gate-workflow", gateStatus),
    summary: `材料包 ${packets.length} · 简报 ${briefings.length}`,
    checksPassed,
    checksTotal,
    readOnly: true,
  };
}

export function evaluateDelivery(organizationId: string): ReadinessDimensionResult {
  const sessions = listIntakeSessionsForOrg(organizationId).filter((s) => s.signedOff);
  const tracking = listDeliveryTrackingForOrg(organizationId);
  const checksTotal = 2;
  let checksPassed = 0;
  if (sessions.length >= 1) checksPassed++;
  if (tracking.length >= 1) checksPassed++;

  const score = Math.round((checksPassed / checksTotal) * 100);
  const gateStatus: GateStatus =
    sessions.length === 0 ? "blocked" : tracking.length === 0 ? "warning" : "pass";

  return {
    dimension: "delivery",
    label: DIMENSION_LABELS.delivery,
    score,
    gateStatus: applyOverride(organizationId, "gate-delivery", gateStatus),
    summary: `签收 ${sessions.length} · 跟踪事件 ${tracking.length}`,
    checksPassed,
    checksTotal,
    readOnly: true,
  };
}

export function evaluateGovernance(organizationId: string): ReadinessDimensionResult {
  const governance = buildBoardGovernanceDashboard(organizationId);
  const checksTotal = 2;
  let checksPassed = 0;
  if (governance.summary.total >= 1) checksPassed++;
  if (
    governance.summary.approved >= 1 ||
    governance.allItems.some((i) => i.governance.decisionCount > 0)
  ) {
    checksPassed++;
  }

  const score = Math.round((checksPassed / checksTotal) * 100);
  const gateStatus: GateStatus =
    governance.summary.total === 0 ? "blocked" : checksPassed < checksTotal ? "warning" : "pass";

  return {
    dimension: "governance",
    label: DIMENSION_LABELS.governance,
    score,
    gateStatus: applyOverride(organizationId, "gate-governance", gateStatus),
    summary: `治理队列 ${governance.summary.total} 项`,
    checksPassed,
    checksTotal,
    readOnly: true,
  };
}

export function evaluateCompliance(organizationId: string): ReadinessDimensionResult {
  const compliance = buildExecutiveComplianceDashboard(organizationId);
  const archives = listArchiveRecords(organizationId);
  const checksTotal = 2;
  let checksPassed = 0;
  if (archives.length >= 1) checksPassed++;
  if (compliance.summary.reviewed >= 1 || archives.filter((a) => a.status === "archived").length >= 1) {
    checksPassed++;
  }

  const score = Math.round((checksPassed / checksTotal) * 100);
  const gateStatus: GateStatus =
    archives.length === 0
      ? "blocked"
      : compliance.summary.pendingReview > 0
        ? "warning"
        : "pass";

  return {
    dimension: "compliance",
    label: DIMENSION_LABELS.compliance,
    score,
    gateStatus: applyOverride(organizationId, "gate-compliance", gateStatus),
    summary: `归档 ${archives.length} · 待审 ${compliance.summary.pendingReview}`,
    checksPassed,
    checksTotal,
    readOnly: true,
  };
}

export function evaluateOperations(organizationId: string): ReadinessDimensionResult {
  const actions = buildExecutiveActionDashboard(organizationId);
  const enforcement = buildPolicyEnforcementDashboard(organizationId);
  const checksTotal = 2;
  let checksPassed = 0;
  if (actions.summary.completed >= 1 || actions.summary.total >= 1) checksPassed++;
  if (enforcement.summary.actionsTaken >= 1 || enforcement.summary.enforced >= 1) checksPassed++;

  const score = Math.round((checksPassed / checksTotal) * 100);
  const gateStatus: GateStatus =
    enforcement.summary.blocked > 0
      ? "blocked"
      : checksPassed < checksTotal
        ? "warning"
        : "pass";

  return {
    dimension: "operations",
    label: DIMENSION_LABELS.operations,
    score,
    gateStatus: applyOverride(organizationId, "gate-operations", gateStatus),
    summary: `行动闭环 ${actions.summary.completed} · 策略执行 ${enforcement.summary.enforced}`,
    checksPassed,
    checksTotal,
    readOnly: true,
  };
}

export function buildReadinessDimensions(organizationId: string): ReadinessDimensionResult[] {
  return [
    evaluateArchitecture(organizationId),
    evaluateWorkflow(organizationId),
    evaluateDelivery(organizationId),
    evaluateGovernance(organizationId),
    evaluateCompliance(organizationId),
    evaluateOperations(organizationId),
  ];
}

export function buildCertificationGates(organizationId: string): CertificationGate[] {
  const dimensions = buildReadinessDimensions(organizationId);

  return dimensions.map((d) => ({
    id: `gate-${d.dimension}`,
    dimension: d.dimension,
    label: d.label,
    status: d.gateStatus,
    requirement: `${d.label}检查通过`,
    evidence: d.summary,
    readOnly: true,
  }));
}

export function computeOverallReadiness(
  gates: CertificationGate[],
  organizationId: string,
): OverallReadiness {
  if (getCertifiedAt(organizationId)) return "certified";

  const effective = gates.map((g) => g.status);
  if (effective.some((s) => s === "blocked")) return "not_ready";
  if (effective.some((s) => s === "warning")) return "conditional";
  if (effective.every((s) => s === "pass" || s === "waived")) return "ready";
  return "conditional";
}

export function buildReadinessSummary(organizationId: string): ReadinessSummary {
  const dimensions = buildReadinessDimensions(organizationId);
  const gates = buildCertificationGates(organizationId);
  const overallReadiness = computeOverallReadiness(gates, organizationId);
  const gatesPassed = gates.filter((g) => g.status === "pass" || g.status === "waived").length;

  const certificationStatus =
    overallReadiness === "certified"
      ? "已认证"
      : overallReadiness === "ready"
        ? "就绪"
        : overallReadiness === "conditional"
          ? "有条件就绪"
          : "未就绪";

  return {
    dimensions,
    overallReadiness,
    gatesPassed,
    gatesTotal: gates.length,
    certificationStatus,
    readOnly: true,
  };
}

export function buildRiskSummary(organizationId: string): RiskSummaryItem[] {
  const enforcement = buildPolicyEnforcementDashboard(organizationId);
  const compliance = buildExecutiveComplianceDashboard(organizationId);
  const risks: RiskSummaryItem[] = [];

  if (enforcement.summary.blocked > 0) {
    risks.push({
      id: "risk-enforcement-blocked",
      label: "策略执行阻断",
      severity: "high",
      exposure: `${enforcement.summary.blocked} 项阻断`,
      readOnly: true,
    });
  }
  if (compliance.summary.expired > 0) {
    risks.push({
      id: "risk-compliance-expired",
      label: "合规记录过期",
      severity: "medium",
      exposure: `${compliance.summary.expired} 项过期`,
      readOnly: true,
    });
  }
  if (compliance.summary.pendingReview > 0) {
    risks.push({
      id: "risk-pending-review",
      label: "待合规审阅",
      severity: "medium",
      exposure: `${compliance.summary.pendingReview} 项待审`,
      readOnly: true,
    });
  }
  if (risks.length === 0) {
    risks.push({
      id: "risk-none",
      label: "无显著风险",
      severity: "low",
      exposure: "所有门控通过或已豁免",
      readOnly: true,
    });
  }

  return risks;
}

export function buildArtifactLinks(organizationId: string): ArtifactLink[] {
  return [
    {
      id: "art-reporting",
      label: "高管报告",
      href: "/pilot/executive-reporting",
      layer: "V93",
      readOnly: true,
    },
    {
      id: "art-briefing",
      label: "高管简报",
      href: "/pilot/executive-briefing",
      layer: "V94",
      readOnly: true,
    },
    {
      id: "art-archive",
      label: "归档审计",
      href: "/pilot/executive-archive",
      layer: "V96",
      readOnly: true,
    },
    {
      id: "art-compliance",
      label: "合规审阅",
      href: "/pilot/executive-compliance",
      layer: "V97",
      readOnly: true,
    },
    {
      id: "art-enforcement",
      label: "策略执行",
      href: "/pilot/policy-enforcement",
      layer: "V98",
      readOnly: true,
    },
  ];
}

export function buildAuditReferences(organizationId: string): AuditReference[] {
  const enforcement = buildPolicyEnforcementDashboard(organizationId);
  const archives = listArchiveRecords(organizationId);

  const refs: AuditReference[] = enforcement.recentActions.slice(0, 5).map((a) => ({
    id: a.id,
    label: a.action,
    sessionId: a.sessionId,
    timestamp: a.timestamp,
    source: "V98-enforcement",
    readOnly: true,
  }));

  for (const archive of archives.slice(0, 3)) {
    refs.push({
      id: `audit-${archive.id}`,
      label: "归档记录",
      sessionId: archive.sessionId,
      timestamp: archive.archivedAt ?? archive.updatedAt,
      source: "V96-archive",
      readOnly: true,
    });
  }

  return refs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 10);
}
