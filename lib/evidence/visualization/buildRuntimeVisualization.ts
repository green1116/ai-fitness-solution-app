import type {
  BuildRuntimeVisualizationInput,
  RuntimePipelineStage,
  RuntimeVisualizationMetric,
  RuntimeVisualizationPackage,
  RuntimeVisualizationStatus,
} from "../types";
import { EXECUTIVE_RUNTIME_VISUALIZATION_VERSION } from "../types";
import { formatRuntimeVisualizationDebug } from "../debug/runtimeVisualizationDebug";
import {
  auditPassed,
  governancePassed,
  ocrTraceabilityComplete,
} from "../runtime/buildExecutiveFindings";

function scoreToStatus(score: number): RuntimeVisualizationStatus {
  if (score >= 80) return "healthy";
  if (score >= 55) return "warning";
  return "critical";
}

function metric(label: string, score: number): RuntimeVisualizationMetric {
  return { label, score, status: scoreToStatus(score) };
}

function buildMetrics(input: BuildRuntimeVisualizationInput): RuntimeVisualizationMetric[] {
  const cov = input.coverageRuntime;
  const val = input.tenderValidation;
  const audit = input.tenderAudit;
  const gov = input.tenderGovernance;
  const dec = input.tenderDecision;

  const coverageScore = cov
    ? Math.round(cov.summary.validationScore ?? cov.summary.coverageRatio * 100)
    : 50;

  const validationScore =
    val?.outcome === "approved"
      ? 95
      : val?.outcome === "conditional"
        ? 68
        : val?.outcome === "rejected"
          ? 22
          : 45;

  const auditScore =
    audit?.governanceStatus === "clear"
      ? 92
      : audit?.governanceStatus === "review_required"
        ? 62
        : audit?.governanceStatus === "blocked"
          ? 18
          : 50;

  const governanceScore =
    gov?.posture === "proceed"
      ? 90
      : gov?.posture === "escalate"
        ? 72
        : gov?.posture === "hold"
          ? 48
          : gov?.posture === "halt"
            ? 15
            : 50;

  const decisionScore =
    dec?.status === "recommended"
      ? 90
      : dec?.status === "conditional"
        ? 70
        : dec?.status === "high-risk"
          ? 45
          : dec?.status === "rejected"
            ? 20
            : 50;

  const matches = input.linking?.matches.length ?? 0;
  const withLoc = input.linking?.matches.filter((m) => m.locations.length > 0).length ?? 0;
  const ocrScore = ocrTraceabilityComplete(input)
    ? 88
    : matches
      ? Math.round((withLoc / matches) * 100)
      : 35;

  return [
    metric("Coverage Quality", coverageScore),
    metric("Validation Status", validationScore),
    metric("Audit Status", auditScore),
    metric("Governance Status", governanceScore),
    metric("Decision Quality", decisionScore),
    metric("OCR Traceability", ocrScore),
  ];
}

function buildPipelineStages(
  input: BuildRuntimeVisualizationInput,
  metrics: RuntimeVisualizationMetric[],
): RuntimePipelineStage[] {
  const metricByLabel = Object.fromEntries(metrics.map((m) => [m.label, m]));

  const stages: RuntimePipelineStage[] = [
    {
      id: "evidence",
      label: "Evidence",
      status: input.coverageRuntime ? "healthy" : "warning",
      summary: input.linking
        ? `${input.linking.matches.length} requirement links`
        : input.coverageRuntime
          ? `covered=${input.coverageRuntime.summary.covered}`
          : "未运行",
    },
    {
      id: "ocr",
      label: "OCR Trace",
      status: metricByLabel["OCR Traceability"]?.status ?? "warning",
      summary: input.ocrDocuments?.length
        ? `${input.ocrDocuments.length} docs / ${input.ocrDocuments.reduce((n, d) => n + d.blocks.length, 0)} blocks`
        : "无 OCR 文档",
    },
    {
      id: "coverage",
      label: "Coverage",
      status: metricByLabel["Coverage Quality"]?.status ?? "warning",
      summary: input.coverageRuntime
        ? `ratio=${input.coverageRuntime.summary.coverageRatio} verdict=${input.coverageRuntime.validation.verdict}`
        : "—",
    },
    {
      id: "validation",
      label: "Validation",
      status: metricByLabel["Validation Status"]?.status ?? "warning",
      summary: input.tenderValidation?.outcome ?? "—",
    },
    {
      id: "audit",
      label: "Audit",
      status: metricByLabel["Audit Status"]?.status ?? "warning",
      summary: input.tenderAudit?.governanceStatus ?? "—",
    },
    {
      id: "decision",
      label: "Decision",
      status: metricByLabel["Decision Quality"]?.status ?? "warning",
      summary: input.tenderDecision?.status ?? "—",
    },
    {
      id: "governance",
      label: "Governance",
      status: metricByLabel["Governance Status"]?.status ?? "warning",
      summary: input.tenderGovernance
        ? `${input.tenderGovernance.posture} / ${input.tenderGovernance.riskLevel}`
        : "—",
    },
    {
      id: "executive_oversight",
      label: "Executive Oversight",
      status: input.executiveOversight
        ? input.executiveOversight.recommendation === "approve"
          ? "healthy"
          : input.executiveOversight.recommendation === "reject"
            ? "critical"
            : "warning"
        : "warning",
      summary: input.executiveOversight?.recommendation ?? "—",
    },
    {
      id: "executive_gate",
      label: "Executive Gate",
      status: input.executiveApprovalGate
        ? input.executiveApprovalGate.status === "approved"
          ? "healthy"
          : input.executiveApprovalGate.status === "blocked"
            ? "critical"
            : "warning"
        : "warning",
      summary: input.executiveApprovalGate?.recommendation ?? "—",
    },
    {
      id: "release_surface",
      label: "Release Surface",
      status: input.executiveReleaseSurface
        ? input.executiveReleaseSurface.releasable
          ? "healthy"
          : input.executiveReleaseSurface.decision === "block-release"
            ? "critical"
            : "warning"
        : "warning",
      summary:
        "decision" in (input.executiveReleaseSurface || {})
          ? (input.executiveReleaseSurface as { decision: string }).decision
          : "—",
    },
  ];

  return stages;
}

function collectFindings(input: BuildRuntimeVisualizationInput): string[] {
  const findings: string[] = [];

  for (const f of input.executiveOversight?.findings ?? []) {
    findings.push(`[${f.category}] ${f.summary}`);
  }

  if ((input.coverageRuntime?.summary.mandatoryMissing ?? 0) > 0) {
    findings.push(`强制性证据缺失 ${input.coverageRuntime!.summary.mandatoryMissing} 项`);
  }

  if (!governancePassed(input)) {
    findings.push(`治理未通过：${input.tenderGovernance?.posture ?? "unknown"}`);
  }

  if (!auditPassed(input)) {
    findings.push(`审计阻断：${input.tenderAudit?.message ?? "blocked"}`);
  }

  if (!ocrTraceabilityComplete(input)) {
    findings.push("OCR 块级追溯不完整");
  }

  for (const r of input.executiveApprovalGate?.reasons ?? []) {
    findings.push(`Gate: ${r}`);
  }

  return [...new Set(findings)].slice(0, 20);
}

function collectRecommendations(input: BuildRuntimeVisualizationInput): string[] {
  const recs: string[] = [];

  if (input.executiveOversight && "recommendations" in input.executiveOversight) {
    recs.push(...(input.executiveOversight.recommendations ?? []));
  }

  if (input.executiveReleaseSurface && "conditionalRelease" in input.executiveReleaseSurface) {
    if (input.executiveReleaseSurface.conditionalRelease) {
      recs.push("需完成条件性放行合规会签后方可释放投标包");
    }
  }

  if (input.tenderDecision?.recommendedActions?.length) {
    recs.push(...input.tenderDecision.recommendedActions.slice(0, 3));
  }

  return [...new Set(recs)].slice(0, 12);
}

function collectBlockReasons(input: BuildRuntimeVisualizationInput): string[] {
  const surface = input.executiveReleaseSurface;
  if (surface?.blockReasons?.length) return surface.blockReasons;
  if (input.executiveApprovalGate?.recommendation === "block-release") {
    return input.executiveApprovalGate.reasons.map((r) => String(r));
  }
  return [];
}

function collectConditionalReasons(input: BuildRuntimeVisualizationInput): string[] {
  const reasons: string[] = [];
  const surface = input.executiveReleaseSurface;

  if (surface?.conditionalRelease) {
    if (surface.gateReasons.includes("Weak OCR traceability")) {
      reasons.push("Weak OCR traceability — 建议补充 OCR coordinates");
    }
    if (surface.gateReasons.includes("Validation unresolved")) {
      reasons.push("Validation unresolved — 建议关闭未解决校验项");
    }
    if (input.executiveOversight?.recommendation === "conditional-approve") {
      reasons.push("Executive conditional approve — 需列明条件");
    }
  }

  return [...new Set(reasons)];
}

/**
 * V3.4-E12 — 确定性 Runtime Visualization（无 AI 推断）
 */
export function buildRuntimeVisualization(
  input: BuildRuntimeVisualizationInput,
): RuntimeVisualizationPackage {
  const surface = input.executiveReleaseSurface;
  const gate = input.executiveApprovalGate;
  const oversight = input.executiveOversight;

  const executiveScore =
    surface?.executiveScore ??
    gate?.executiveScore ??
    oversight?.executiveScore ??
    0;

  const executiveGate =
    gate?.status ??
    (surface?.gateStatus as "approved" | "conditional" | "blocked") ??
    "blocked";

  const releaseDecision =
    surface?.decision ??
    gate?.recommendation ??
    "block-release";

  const releasable = surface?.releasable ?? gate?.releasable ?? false;

  const metrics = buildMetrics(input);
  const pipeline = buildPipelineStages(input, metrics);
  const findings = collectFindings(input);
  const recommendations = collectRecommendations(input);
  const blockReasons = collectBlockReasons(input);
  const conditionalReleaseReasons = collectConditionalReasons(input);

  const panel = {
    executiveScore,
    executiveGate,
    releaseDecision,
    metrics,
    findings,
    recommendations,
    releasable,
  };

  const dashboard = {
    version: EXECUTIVE_RUNTIME_VISUALIZATION_VERSION,
    runId: input.runId,
    ranAt: input.ranAt,
    pipeline,
    conditionalReleaseReasons,
    blockReasons,
    ...panel,
  };

  const debug = formatRuntimeVisualizationDebug(dashboard);

  return { ...dashboard, debug };
}
