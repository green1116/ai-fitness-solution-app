import type {
  DecisionFactor,
  DecisionInputsSnapshot,
  TenderAuditResult,
  TenderDecisionRuntimeInput,
} from "../types";

function factor(
  id: string,
  category: DecisionFactor["category"],
  severity: DecisionFactor["severity"],
  weight: number,
  message: string,
  requirementId?: string,
): DecisionFactor {
  return { id, category, severity, weight, message, requirementId };
}

export function buildDecisionInputsSnapshot(
  input: TenderDecisionRuntimeInput,
): DecisionInputsSnapshot {
  const cov = input.coverageRuntime;
  const val = input.tenderValidation;
  const audit = input.tenderAudit;

  return {
    validationOutcome: val?.outcome,
    governanceStatus: audit?.governanceStatus,
    coverageScore: cov?.summary.validationScore,
    coverageRatio: cov?.summary.coverageRatio,
    mandatoryMissing: cov?.summary.mandatoryMissing,
    mandatoryConflict: cov?.summary.mandatoryConflict,
    linkCount: input.linking?.links.length,
    auditEntryCount: audit?.trail.summary.totalEntries,
  };
}

/**
 * 从 Coverage / Validation / Audit 构建决策因子（可解释）
 */
export function buildDecisionFactors(input: TenderDecisionRuntimeInput): DecisionFactor[] {
  const factors: DecisionFactor[] = [];
  const cov = input.coverageRuntime;
  const val = input.tenderValidation;
  const audit = input.tenderAudit;

  if (!cov && !val && !audit) {
    factors.push(
      factor("F_NO_INPUT", "evidence", "critical", 1, "缺少覆盖/校验/审计输入，无法决策"),
    );
    return factors;
  }

  if (cov) {
    if (cov.summary.mandatoryMissing > 0) {
      factors.push(
        factor(
          "F_MANDATORY_MISSING",
          "mandatory",
          "critical",
          1,
          `强制性需求缺失证据 ${cov.summary.mandatoryMissing} 项`,
        ),
      );
    }
    if (cov.summary.mandatoryConflict > 0) {
      factors.push(
        factor(
          "F_MANDATORY_CONFLICT",
          "mandatory",
          "critical",
          0.9,
          `强制性需求证据冲突 ${cov.summary.mandatoryConflict} 项`,
        ),
      );
    }
    if (cov.summary.coverageRatio < 0.5) {
      factors.push(
        factor(
          "F_LOW_COVERAGE",
          "coverage",
          "warning",
          0.7,
          `证据覆盖率 ${cov.summary.coverageRatio} 偏低`,
        ),
      );
    }
    for (const req of cov.requirements) {
      if (req.status === "partial" && req.analysis.mandatory) {
        factors.push(
          factor(
            `F_PARTIAL_${req.requirementId}`,
            "coverage",
            "warning",
            0.6,
            `强制性需求部分覆盖：${req.requirementTitle}`,
            req.requirementId,
          ),
        );
      }
    }
  }

  if (val) {
    for (const f of val.findings.filter((x) => x.severity !== "info")) {
      factors.push(
        factor(
          `F_VAL_${f.id}`,
          "validation",
          f.severity === "critical" ? "critical" : f.severity === "error" ? "warning" : "notice",
          f.severity === "critical" ? 1 : 0.5,
          f.message,
          f.requirementId,
        ),
      );
    }
  }

  if (audit) {
    factors.push(
      factor(
        "F_GOVERNANCE",
        "audit",
        audit.governanceStatus === "blocked"
          ? "critical"
          : audit.governanceStatus === "review_required"
            ? "notice"
            : "info",
        audit.governanceStatus === "blocked" ? 1 : 0.4,
        audit.message,
      ),
    );
    const criticalAudit = audit.trail.entries.filter((e) => e.severity === "critical");
    if (criticalAudit.length) {
      factors.push(
        factor(
          "F_AUDIT_CRITICAL",
          "audit",
          "critical",
          0.95,
          `审计轨迹含 ${criticalAudit.length} 条严重事件`,
        ),
      );
    }
  }

  if (input.linking && input.linking.matches.length === 0 && cov?.requirements.length) {
    factors.push(
      factor("F_NO_LINKS", "evidence", "warning", 0.8, "未建立需求-证据关联"),
    );
  }

  return factors;
}
