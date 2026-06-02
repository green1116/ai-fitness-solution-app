import type {
  GovernanceControlCheck,
  GovernanceRiskLevel,
  TenderGovernanceRuntimeInput,
} from "../types";

function control(
  controlId: GovernanceControlCheck["controlId"],
  passed: boolean,
  riskLevel: GovernanceRiskLevel,
  title: string,
  message: string,
): GovernanceControlCheck {
  return { controlId, passed, riskLevel: passed ? "low" : riskLevel, title, message };
}

/**
 * 企业治理控制检查（确定性合规门禁）
 */
export function runGovernanceControls(
  input: TenderGovernanceRuntimeInput,
): GovernanceControlCheck[] {
  const cov = input.coverageRuntime;
  const val = input.tenderValidation;
  const audit = input.tenderAudit;
  const dec = input.tenderDecision;

  const checks: GovernanceControlCheck[] = [];

  const evidenceCount = audit?.trail.summary.evidenceCount ?? 0;
  const linkCount = audit?.trail.summary.linkCount ?? 0;
  const hasEvidence =
    evidenceCount > 0 ||
    (cov?.requirements.some((r) => r.analysis.evidenceIds.length > 0) ?? false);
  checks.push(
    control(
      "evidence_chain",
      hasEvidence && linkCount > 0,
      "high",
      "证据链完整性",
      hasEvidence
        ? `证据 ${evidenceCount} 份，关联 ${linkCount} 条`
        : "未发现有效证据链",
    ),
  );

  const mandatoryOk = (cov?.summary.mandatoryMissing ?? 0) === 0;
  checks.push(
    control(
      "mandatory_coverage",
      mandatoryOk,
      "critical",
      "强制性需求覆盖",
      mandatoryOk
        ? "强制性需求均有证据关联"
        : `缺失 ${cov?.summary.mandatoryMissing} 项强制性需求证据`,
    ),
  );

  const auditOk =
    (audit?.trail.summary.totalEntries ?? 0) >= 3 &&
    audit?.governanceStatus !== "blocked";
  checks.push(
    control(
      "audit_trail",
      !!auditOk,
      "medium",
      "审计轨迹",
      audit
        ? `审计事件 ${audit.trail.summary.totalEntries} 条，治理 ${audit.governanceStatus}`
        : "缺少审计轨迹",
    ),
  );

  const validationOk =
    val?.outcome === "approved" || val?.outcome === "conditional";
  checks.push(
    control(
      "validation_gate",
      !!val && validationOk,
      "high",
      "投标校验门禁",
      val
        ? `校验结论 ${val.outcome}`
        : "未执行投标校验",
    ),
  );

  const decisionAligned =
    !!dec &&
    ((dec.status === "recommended" && audit?.governanceStatus !== "blocked") ||
      (dec.status === "conditional" &&
        (val?.outcome === "conditional" || audit?.governanceStatus === "review_required")) ||
      (dec.status === "rejected" &&
        (val?.outcome === "rejected" || audit?.governanceStatus === "blocked")) ||
      dec.status === "high-risk");
  checks.push(
    control(
      "decision_alignment",
      decisionAligned,
      "medium",
      "决策一致性",
      dec
        ? `决策 ${dec.status} 与校验/审计结论一致`
        : "缺少决策层输出",
    ),
  );

  return checks;
}
