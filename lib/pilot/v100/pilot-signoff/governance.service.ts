/**
 * V100 — Pilot governance (release / production checklists, read-only)
 */

import { getCapabilityCatalog } from "./capability-catalog";
import { getSignoffState } from "./signoff-cache";
import { buildPilotSignoffReport } from "./signoff.service";
import type {
  ChecklistStatus,
  GovernanceChecklistItem,
  PilotGovernance,
} from "./signoff.types";

function checklistItem(
  id: string,
  label: string,
  status: ChecklistStatus,
  detail: string,
): GovernanceChecklistItem {
  return { id, label, status, detail, readOnly: true };
}

export function buildPilotGovernance(organizationId: string): PilotGovernance {
  const report = buildPilotSignoffReport(organizationId);
  const state = getSignoffState(organizationId);
  const catalog = getCapabilityCatalog();
  const readiness = report.readinessSummary;

  const allLayersPresent = report.layerCount === catalog.length;
  const gatesClear =
    readiness.overallReadiness === "ready" ||
    readiness.overallReadiness === "certified";

  const releaseChecklist: GovernanceChecklistItem[] = [
    checklistItem(
      "chk-layers",
      "V80–V99 全部纳入",
      allLayersPresent ? "pass" : "blocked",
      `${report.layerCount}/${catalog.length} 层已收集`,
    ),
    checklistItem(
      "chk-score",
      "Pilot 综合评分达标",
      report.overallPilotScore >= 80 ? "pass" : report.overallPilotScore >= 60 ? "warning" : "blocked",
      `综合评分 ${report.overallPilotScore}`,
    ),
    checklistItem(
      "chk-signoff",
      "最终签收完成",
      state.signedOffAt ? "pass" : "warning",
      state.signedOffAt ? `签收于 ${state.signedOffAt}` : "待签收",
    ),
  ];

  const productionChecklist: GovernanceChecklistItem[] = [
    checklistItem(
      "chk-certification",
      "生产认证状态",
      gatesClear ? "pass" : readiness.overallReadiness === "conditional" ? "warning" : "blocked",
      readiness.certificationStatus,
    ),
    checklistItem(
      "chk-freeze",
      "基线冻结",
      state.frozenAt ? "pass" : "warning",
      state.frozenAt ? `冻结于 ${state.frozenAt}` : "待冻结",
    ),
    checklistItem(
      "chk-release",
      "发布锁定",
      state.releaseStatus === "released" ? "pass" : "warning",
      state.releaseStatus === "released" ? "已发布基线" : "待发布",
    ),
  ];

  const finalApproved = state.releaseStatus === "released";

  return {
    releaseChecklist,
    productionChecklist,
    certificationSummary: `${readiness.certificationStatus} · 门控 ${readiness.gatesPassed}/${readiness.gatesTotal} · 综合评分 ${report.overallPilotScore}`,
    finalApproval: {
      approved: finalApproved,
      approvedAt: state.releasedAt,
      approvedBy: state.releasedBy,
    },
    readOnly: true,
  };
}
