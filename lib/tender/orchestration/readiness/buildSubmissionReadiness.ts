import type { RuntimeDecision, RuntimeRecommendation } from "@/lib/tender/runtime/types";
import type { TenderRuntimeWorkflowResult } from "@/lib/tender/runtime/types";
import type {
  SubmissionChecklistItem,
  SubmissionReadiness,
} from "../types";

export type BuildSubmissionReadinessInput = {
  workflow: TenderRuntimeWorkflowResult;
  recommendations: RuntimeRecommendation[];
  minScore?: number;
};

function gradeFromScore(score: number): SubmissionReadiness["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/**
 * V3.0 提交就绪评估
 */
export function buildSubmissionReadiness(
  input: BuildSubmissionReadinessInput,
): SubmissionReadiness {
  const { workflow, recommendations, minScore = 75 } = input;
  const decision = workflow.decision;
  const checklist: SubmissionChecklistItem[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  const workflowComplete = !workflow.steps.some((s) => s.status === "failed");
  checklist.push({
    id: "workflow-complete",
    label: "运行时工作流完整执行",
    status: workflowComplete ? "pass" : "fail",
    weight: 15,
    detail: workflowComplete
      ? "全部关键步骤已完成"
      : "存在失败步骤",
  });
  if (!workflowComplete) {
    blockers.push("工作流存在失败步骤，无法确认投标准备完整性");
  }

  const coverageRatio = decision.meta.evidenceCoverageRatio;
  const coveragePass = coverageRatio >= 0.7;
  const coverageWarn = coverageRatio >= 0.5 && coverageRatio < 0.7;
  checklist.push({
    id: "evidence-coverage",
    label: "证据覆盖率",
    status: coveragePass ? "pass" : coverageWarn ? "warn" : "fail",
    weight: 25,
    detail: `覆盖率约 ${Math.round(coverageRatio * 100)}%`,
  });
  if (!coveragePass && !coverageWarn) {
    blockers.push(`证据覆盖率过低（${Math.round(coverageRatio * 100)}%）`);
  } else if (coverageWarn) {
    warnings.push("证据覆盖率处于临界区间，建议补强");
  }

  const gatePassed = workflow.score?.gate.passed ?? decision.action !== "block";
  checklist.push({
    id: "gate-pass",
    label: "评分门闸",
    status: gatePassed ? "pass" : decision.sources.gate === "warn" ? "warn" : "fail",
    weight: 25,
    detail: workflow.score?.gate.title || decision.title,
  });
  if (!gatePassed) {
    blockers.push(workflow.score?.gate.title || "评分门闸未通过");
  }

  const scoreRatio = decision.meta.scoreRatio;
  if (scoreRatio != null) {
    const scorePass = scoreRatio >= 0.65;
    const scoreWarn = scoreRatio >= 0.5 && scoreRatio < 0.65;
    checklist.push({
      id: "score-ratio",
      label: "综合得分率",
      status: scorePass ? "pass" : scoreWarn ? "warn" : "fail",
      weight: 20,
      detail: `得分率约 ${Math.round(scoreRatio * 100)}%`,
    });
    if (!scorePass && !scoreWarn) {
      blockers.push(`综合得分率偏低（${Math.round(scoreRatio * 100)}%）`);
    } else if (scoreWarn) {
      warnings.push("得分率处于谨慎区间");
    }
  } else {
    checklist.push({
      id: "score-ratio",
      label: "综合得分率",
      status: "skipped",
      weight: 20,
      detail: "未执行评分步骤",
    });
  }

  const criticalRecs = recommendations.filter((r) => r.priority === "critical");
  checklist.push({
    id: "no-critical-recs",
    label: "无阻断性建议",
    status: criticalRecs.length === 0 ? "pass" : "fail",
    weight: 15,
    detail:
      criticalRecs.length === 0
        ? "无 critical 级建议"
        : `${criticalRecs.length} 条 critical 建议`,
  });
  for (const rec of criticalRecs.slice(0, 3)) {
    blockers.push(rec.title);
  }

  let weighted = 0;
  let totalWeight = 0;
  for (const item of checklist) {
    if (item.status === "skipped") continue;
    totalWeight += item.weight;
    if (item.status === "pass") weighted += item.weight;
    else if (item.status === "warn") weighted += item.weight * 0.6;
  }
  const score =
    totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0;

  const ready =
    score >= minScore &&
    blockers.length === 0 &&
    decision.action !== "block" &&
    workflowComplete;

  if (decision.action === "warn" && ready) {
    warnings.push("决策为 warn，建议复核后提交");
  }

  return {
    ready,
    score,
    grade: gradeFromScore(score),
    blockers: [...new Set(blockers)],
    warnings: [...new Set(warnings)],
    checklist,
  };
}
