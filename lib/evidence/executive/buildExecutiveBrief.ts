import type {
  ExecutiveBriefSection,
  ExecutiveKeyMetrics,
  ExecutiveOversightRuntimeInput,
  ExecutiveRiskLevel,
} from "../types";

/**
 * 高管审阅摘要（确定性要点，非 AI 报告）
 */
export function buildExecutiveBrief(input: {
  runtimeInput: ExecutiveOversightRuntimeInput;
  metrics: ExecutiveKeyMetrics;
  riskLevel: ExecutiveRiskLevel;
}): ExecutiveBriefSection[] {
  const { runtimeInput, metrics, riskLevel } = input;
  const sections: ExecutiveBriefSection[] = [];

  sections.push({
    id: "overview",
    title: "投标包概览",
    bullets: [
      `文档 ${runtimeInput.documentId}`,
      `证据覆盖得分 ${metrics.coverageScore ?? "—"}，覆盖率 ${metrics.coverageRatio ?? "—"}`,
      `投标决策 ${runtimeInput.tenderDecision?.status ?? "—"}（置信 ${metrics.decisionConfidence ?? "—"}）`,
    ],
  });

  sections.push({
    id: "governance",
    title: "治理结论",
    bullets: [
      `治理风险 ${metrics.governanceRisk ?? "—"}，姿态 ${metrics.governancePosture ?? "—"}`,
      `治理控制 ${metrics.controlsPassed ?? 0} 通过 / ${(metrics.controlsPassed ?? 0) + (metrics.controlsFailed ?? 0)} 项`,
      runtimeInput.tenderGovernance?.escalation.required
        ? `需升级：${runtimeInput.tenderGovernance.escalation.level} — ${runtimeInput.tenderGovernance.escalation.reason}`
        : "无需升级审批",
    ],
  });

  sections.push({
    id: "compliance",
    title: "合规与审计",
    bullets: [
      `校验结论 ${metrics.validationOutcome ?? "—"}`,
      `审计轨迹 ${metrics.auditEntries ?? 0} 条事件`,
      ...(runtimeInput.tenderValidation?.findings
        .filter((f) => f.severity !== "info")
        .slice(0, 3)
        .map((f) => f.title) ?? []),
    ],
  });

  const actions: string[] = [];
  if (riskLevel === "critical") {
    actions.push("不建议提交，需整改后重新评估");
  } else if (riskLevel === "high") {
    actions.push("建议暂缓高管签字，待风险项关闭");
  } else if (riskLevel === "attention") {
    actions.push("可在合规会签后条件性批准");
  } else {
    actions.push("证据链完整，可授权业务线推进");
  }
  if (runtimeInput.tenderDecision?.recommendedActions.length) {
    actions.push(...runtimeInput.tenderDecision.recommendedActions.slice(0, 2));
  }

  sections.push({
    id: "actions",
    title: "高管行动建议",
    bullets: actions,
  });

  return sections;
}
