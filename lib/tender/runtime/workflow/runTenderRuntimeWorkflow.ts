import { analyzeTender } from "@/lib/tender/analyzeTender";
import { buildTechnicalCompliancePackage } from "@/lib/tender/compliance";
import {
  rowsFromParsedTenderText,
  computeTenderRiskFromRows,
  DEFAULT_TENDER_ATTACHMENT_CODES,
} from "@/lib/tender/computeTenderRisk";
import { packageEvidenceQuery } from "@/lib/tender/evidence/query";
import { runEvidenceRuntime } from "@/lib/tender/evidence/runtime";
import type { EvidenceRuntimeResult } from "@/lib/tender/evidence/runtime";
import { composeTenderResponsePackage } from "@/lib/tender/response";
import { buildSemanticGraph } from "@/lib/tender/semantic";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import { buildSkuMappings } from "@/lib/tender/sku";
import { buildScoreProfileFromTenderText } from "@/lib/tender/scoreProfileFromTender";
import { computeTenderScore, resolveScoreProfile } from "@/lib/tender/scoreEngine";
import { buildBidDecisionSummary } from "@/lib/tender/score/buildBidDecisionSummary";
import { buildBidDecisionGate } from "@/lib/tender/score/buildBidDecisionGate";
import { formatBidDecisionGateText } from "@/lib/tender/score/formatBidDecisionGate";

import {
  buildRuntimeRecommendations,
  buildTenderRuntimeDecision,
  computeRuntimeScoringImpact,
} from "../decision";
import type {
  TenderRuntimeWorkflowError,
  TenderRuntimeWorkflowResult,
  TenderRuntimeWorkflowScoreBundle,
  TenderWorkflowStepId,
  WorkflowStepResult,
  WorkflowStepStatus,
} from "../types";
import type { TenderRuntimeWorkflowInput } from "./types";

type ParsedTender = Awaited<ReturnType<typeof analyzeTender>>;

type WorkflowContext = {
  rawText?: string;
  sourceName?: string;
  parsed?: ParsedTender;
  graph?: TenderSemanticGraph;
  skuResult?: import("@/lib/tender/sku/skuTypes").SKUIntelligenceResult;
  compliance?: import("@/lib/tender/compliance/types").TechnicalCompliancePackage;
  responses?: import("@/lib/tender/response/types").TenderResponsePackage;
  score?: TenderRuntimeWorkflowScoreBundle;
};

function newWorkflowId() {
  return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function stepResult(
  stepId: TenderWorkflowStepId,
  status: WorkflowStepStatus,
  started: number,
  message: string,
  metrics?: WorkflowStepResult["metrics"],
  error?: string,
): WorkflowStepResult {
  const finished = Date.now();
  return {
    stepId,
    status,
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    message,
    metrics,
    error,
  };
}

function shouldSkip(
  input: TenderRuntimeWorkflowInput,
  stepId: TenderWorkflowStepId,
): boolean {
  return input.skipSteps?.includes(stepId) ?? false;
}

/**
 * V2.9 Tender Runtime Workflow — 顺序执行 parse → semantic → sku → compliance → evidence → score → gate → decision
 */
export async function runTenderRuntimeWorkflow(
  input: TenderRuntimeWorkflowInput,
): Promise<TenderRuntimeWorkflowResult | TenderRuntimeWorkflowError> {
  const workflowId = newWorkflowId();
  const startedAt = new Date().toISOString();
  const workflowStarted = Date.now();
  const steps: WorkflowStepResult[] = [];
  const ctx: WorkflowContext = {
    rawText: input.rawText?.trim() || undefined,
    sourceName: input.sourceName,
    graph: input.graph,
    skuResult: input.skuResult,
    compliance: input.compliance,
  };

  const opts = {
    runSku: input.options?.runSku !== false,
    runCompliance: input.options?.runCompliance !== false,
    runResponses: input.options?.runResponses === true,
  };

  async function runStep(
    stepId: TenderWorkflowStepId,
    executor: () => Promise<WorkflowStepResult["metrics"] | void>,
    skipReason?: string,
  ): Promise<boolean> {
    if (shouldSkip(input, stepId)) {
      steps.push(
        stepResult(stepId, "skipped", Date.now(), skipReason || "用户跳过"),
      );
      return true;
    }

    const t0 = Date.now();
    try {
      const metrics = await executor();
      steps.push(
        stepResult(
          stepId,
          "completed",
          t0,
          `${stepId} 完成`,
          metrics ?? undefined,
        ),
      );
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      steps.push(
        stepResult(stepId, "failed", t0, `${stepId} 失败`, undefined, message),
      );
      return false;
    }
  }

  // --- parse ---
  if (!ctx.graph) {
    const ok = await runStep("parse", async () => {
      if (!ctx.rawText) throw new Error("需要 rawText 或 graph");
      const parsed = await analyzeTender({
        rawText: ctx.rawText,
        fileName: ctx.sourceName || "pasted-tender.txt",
      });
      ctx.parsed = parsed;
      ctx.rawText = parsed.rawText;
      return { textLength: parsed.rawText.length };
    });
    if (!ok) {
      return fail(workflowId, steps, "parse", "PARSE_FAILED", "招标文本解析失败");
    }
  } else {
    steps.push(
      stepResult("parse", "skipped", Date.now(), "已提供 graph，跳过解析"),
    );
  }

  // --- semantic ---
  if (!ctx.graph) {
    const ok = await runStep("semantic", async () => {
      if (!ctx.parsed) {
        const text = ctx.rawText;
        if (!text) throw new Error("缺少 rawText");
        ctx.parsed = await analyzeTender({
          rawText: text,
          fileName: ctx.sourceName || "pasted-tender.txt",
        });
      }
      ctx.graph = buildSemanticGraph(ctx.parsed).graph;
      return { requirements: ctx.graph.requirements.length };
    });
    if (!ok) {
      return fail(workflowId, steps, "semantic", "SEMANTIC_FAILED", "语义图构建失败");
    }
  } else {
    steps.push(
      stepResult("semantic", "skipped", Date.now(), "已提供 graph"),
    );
  }

  if (!ctx.graph) {
    return fail(workflowId, steps, "semantic", "GRAPH_REQUIRED", "无法获得语义图");
  }

  // --- sku ---
  if (opts.runSku && !ctx.skuResult) {
    const ok = await runStep("sku", async () => {
      ctx.skuResult = buildSkuMappings(ctx.graph!);
      return { mappings: ctx.skuResult.mappings?.length ?? 0 };
    });
    if (!ok) {
      return fail(workflowId, steps, "sku", "SKU_FAILED", "SKU 映射失败");
    }
  } else if (!opts.runSku) {
    steps.push(stepResult("sku", "skipped", Date.now(), "runSku=false"));
  } else {
    steps.push(stepResult("sku", "skipped", Date.now(), "已提供 skuResult"));
  }

  // --- compliance ---
  if (opts.runCompliance && !ctx.compliance) {
    const ok = await runStep("compliance", async () => {
      ctx.compliance = buildTechnicalCompliancePackage({
        graph: ctx.graph!,
        skuResult: ctx.skuResult,
      });
      return {
        requirements: ctx.compliance!.requirements.length,
        riskLevel: ctx.compliance!.riskLevel,
      };
    });
    if (!ok) {
      return fail(
        workflowId,
        steps,
        "compliance",
        "COMPLIANCE_FAILED",
        "符合性引擎失败",
      );
    }
  } else if (!opts.runCompliance) {
    steps.push(stepResult("compliance", "skipped", Date.now(), "runCompliance=false"));
  } else {
    steps.push(stepResult("compliance", "skipped", Date.now(), "已提供 compliance"));
  }

  if (opts.runResponses && ctx.graph) {
    ctx.responses = composeTenderResponsePackage(
      ctx.graph,
      ctx.skuResult,
      ctx.compliance,
    );
  }

  // --- evidence ---
  let evidenceRuntime: EvidenceRuntimeResult | undefined;
  const evidenceOk = await runStep("evidence", async () => {
    evidenceRuntime = runEvidenceRuntime(
      {
        graph: ctx.graph,
        compliance: ctx.compliance,
        skuResult: ctx.skuResult,
        responses: ctx.responses,
      },
      {
        policy: input.evidencePolicy,
        forceAllow: false,
      },
    );
    return {
      documents: evidenceRuntime.evidence.registry.documents.length,
      decision: evidenceRuntime.decision.action,
      coverageRatio: evidenceRuntime.decision.meta.coverageRatio,
    };
  });
  if (!evidenceOk || !evidenceRuntime) {
    return fail(workflowId, steps, "evidence", "EVIDENCE_FAILED", "证据运行时失败");
  }

  // --- score ---
  if (ctx.rawText) {
    const ok = await runStep("score", async () => {
      const { technicalRows, businessRows } = rowsFromParsedTenderText(ctx.rawText!);
      const risk = computeTenderRiskFromRows({
        technicalRows,
        businessRows,
        attachments: DEFAULT_TENDER_ATTACHMENT_CODES,
      });
      const extractedProfile = buildScoreProfileFromTenderText(ctx.rawText!);
      const profile =
        extractedProfile || resolveScoreProfile(input.mode || "enterprise");
      const scoreResult = computeTenderScore(
        {
          level: risk.level,
          summary: risk.summary,
          topRisks: risk.topRisks,
          missingAttachments: risk.missingAttachments,
        },
        profile,
        {
          responseRows: [
            ...technicalRows.map((r) => ({
              ref: r.ref,
              label: r.requirement,
              section: "技术响应",
              content: r.requirement,
            })),
            ...businessRows.map((r) => ({
              ref: r.ref,
              label: r.requirement,
              section: "商务响应",
              content: r.requirement,
            })),
          ],
          attachmentIndex: DEFAULT_TENDER_ATTACHMENT_CODES.map((code) => ({
            ref: code,
            title: code,
          })),
        },
      );
      const summary = buildBidDecisionSummary({
        items: scoreResult.breakdown,
        totalScore: scoreResult.totalScore,
        totalMaxScore: scoreResult.totalMaxScore,
        topRisks: risk.topRisks,
        missingAttachments: risk.missingAttachments,
      });
      ctx.score = {
        scoreResult,
        summary,
        gate: buildBidDecisionGate({ summary, forceAllow: false }),
        gateText: "",
        risk,
        profileSource: extractedProfile ? "tender-extracted" : "default",
        profileName: profile.profileName,
      };
      ctx.score.gateText = formatBidDecisionGateText(ctx.score.gate);
      return {
        totalScore: scoreResult.totalScore,
        totalMaxScore: scoreResult.totalMaxScore,
      };
    });
    if (!ok) {
      return fail(workflowId, steps, "score", "SCORE_FAILED", "评分引擎失败");
    }
  } else {
    steps.push(
      stepResult("score", "skipped", Date.now(), "无 rawText，跳过评分"),
    );
  }

  // --- gate (re-run with forceAllow from input if score exists) ---
  if (ctx.score) {
    const ok = await runStep("gate", async () => {
      ctx.score!.gate = buildBidDecisionGate({
        summary: ctx.score!.summary,
        forceAllow: input.forceAllow,
        policy: input.gatePolicy,
      });
      ctx.score!.gateText = formatBidDecisionGateText(ctx.score!.gate);
      return { action: ctx.score!.gate.action, passed: ctx.score!.gate.passed };
    });
    if (!ok) {
      return fail(workflowId, steps, "gate", "GATE_FAILED", "门闸决策失败");
    }
  } else {
    steps.push(
      stepResult("gate", "skipped", Date.now(), "无评分结果，跳过门闸"),
    );
  }

  // --- decision (unified) ---
  const scoreRatio = ctx.score
    ? ctx.score.summary.decision.scoreRatio
    : null;

  const scoringImpact = computeRuntimeScoringImpact({
    evidence: evidenceRuntime.evidence,
    graph: ctx.graph,
    scoreRatio,
  });

  let decision;
  await runStep("decision", async () => {
    decision = buildTenderRuntimeDecision({
      evidenceDecision: evidenceRuntime!.decision,
      gate: ctx.score?.gate,
      steps,
      forceAllow: input.forceAllow,
      scoreRatio,
    });
    return { action: decision.action, status: decision.status };
  });

  const recommendations = buildRuntimeRecommendations({
    evidenceDecision: evidenceRuntime.decision,
    gate: ctx.score?.gate,
    scoringImpact,
    trace: evidenceRuntime.trace,
  });

  const query = packageEvidenceQuery(evidenceRuntime.evidence);
  const finishedAt = new Date().toISOString();

  return {
    ok: true,
    workflowId,
    status: decision!.status,
    startedAt,
    finishedAt,
    durationMs: Date.now() - workflowStarted,
    steps,
    graph: ctx.graph,
    compliance: ctx.compliance,
    skuResult: ctx.skuResult,
    evidence: evidenceRuntime,
    query,
    score: ctx.score,
    decision: decision!,
    recommendations,
    scoringImpact,
  };
}

function fail(
  workflowId: string,
  steps: WorkflowStepResult[],
  failedStep: TenderWorkflowStepId,
  code: string,
  message: string,
): TenderRuntimeWorkflowError {
  return {
    ok: false,
    workflowId,
    code,
    message,
    failedStep,
    steps,
  };
}
