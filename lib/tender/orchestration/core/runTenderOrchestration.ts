import { runTenderRuntimeWorkflow } from "@/lib/tender/runtime/workflow";
import { runSemanticEvidenceReasoning } from "@/lib/tender/semantic-evidence";
import type { SemanticEvidenceIntelligenceResult } from "@/lib/tender/semantic-evidence/types";
import { runExternalEvidenceIntelligence } from "@/lib/tender/evidence-intelligence";
import type { ExternalEvidenceIntelligenceResult } from "@/lib/tender/evidence-intelligence/types";
import { runSemanticRuntimeReasoning } from "@/lib/tender/semantic-runtime";
import type { SemanticRuntimeReasoningResult } from "@/lib/tender/semantic-runtime/types";

import { buildEscalation } from "../escalation/buildEscalation";
import { buildFinalRuntimeOutcome } from "../outcome/buildFinalRuntimeOutcome";
import { buildSubmissionReadiness } from "../readiness/buildSubmissionReadiness";
import {
  adjustRouteForReadiness,
  buildDecisionRoute,
} from "../routing/buildDecisionRoute";
import type {
  OrchestrationPhaseId,
  OrchestrationPhaseResult,
  OrchestrationPhaseStatus,
  OrchestrationPolicy,
  TenderOrchestrationError,
  TenderOrchestrationInput,
  TenderOrchestrationResult,
} from "../types";

function newOrchestrationId() {
  return `orc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function phaseResult(
  phaseId: OrchestrationPhaseId,
  status: OrchestrationPhaseStatus,
  started: number,
  message: string,
  metrics?: OrchestrationPhaseResult["metrics"],
  error?: string,
): OrchestrationPhaseResult {
  const finished = Date.now();
  return {
    phaseId,
    status,
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    message,
    metrics,
    error,
  };
}

function resolvePolicy(
  input: TenderOrchestrationInput,
): OrchestrationPolicy {
  return {
    minReadinessScore: input.orchestrationPolicy?.minReadinessScore ?? 75,
    allowConditionalSubmit:
      input.orchestrationPolicy?.allowConditionalSubmit !== false,
    escalateOnWarn: input.orchestrationPolicy?.escalateOnWarn !== false,
    blockVerdictOnEscalation:
      input.orchestrationPolicy?.blockVerdictOnEscalation !== false,
  };
}

/**
 * V3.0 Tender Runtime Orchestration Core
 *
 * initialize → workflow → route → escalate → readiness → finalize
 */
export async function runTenderOrchestration(
  input: TenderOrchestrationInput,
): Promise<TenderOrchestrationResult | TenderOrchestrationError> {
  const orchestrationId = newOrchestrationId();
  const startedAt = new Date().toISOString();
  const orchestrationStarted = Date.now();
  const phases: OrchestrationPhaseResult[] = [];
  const policy = resolvePolicy(input);

  // --- initialize ---
  let t0 = Date.now();
  if (!input.rawText?.trim() && !input.graph) {
    phases.push(
      phaseResult(
        "initialize",
        "failed",
        t0,
        "缺少 rawText 或 graph",
        undefined,
        "INVALID_INPUT",
      ),
    );
    return {
      ok: false,
      orchestrationId,
      code: "INVALID_INPUT",
      message: "编排需要 rawText 或 graph 作为输入",
      failedPhase: "initialize",
      phases,
    };
  }
  phases.push(
    phaseResult("initialize", "completed", t0, "编排上下文已初始化", {
      planId: input.planId || null,
      hasGraph: Boolean(input.graph),
      hasRawText: Boolean(input.rawText?.trim()),
    }),
  );

  // --- workflow (V2.9 subsystem) ---
  t0 = Date.now();
  const workflowResult = await runTenderRuntimeWorkflow(input);
  if (!workflowResult.ok) {
    phases.push(
      phaseResult(
        "workflow",
        "failed",
        t0,
        workflowResult.message,
        undefined,
        workflowResult.code,
      ),
    );
    return {
      ok: false,
      orchestrationId,
      code: "WORKFLOW_FAILED",
      message: workflowResult.message,
      failedPhase: "workflow",
      phases,
      workflowError: workflowResult,
    };
  }
  phases.push(
    phaseResult("workflow", "completed", t0, "V2.9 工作流执行完成", {
      workflowId: workflowResult.workflowId,
      decision: workflowResult.decision.action,
      status: workflowResult.status,
    }),
  );

  const { decision, recommendations, scoringImpact } = workflowResult;

  let semanticEvidence: SemanticEvidenceIntelligenceResult | undefined;
  if (input.runSemanticEvidence !== false && workflowResult.graph) {
    semanticEvidence = runSemanticEvidenceReasoning(
      {
        graph: workflowResult.graph,
        registry: workflowResult.evidence?.registry,
        sourceName: input.sourceName,
      },
      { registryCoverage: workflowResult.evidence?.coverage },
    );
  }

  let externalEvidence: ExternalEvidenceIntelligenceResult | undefined;
  if (input.attachments?.length && workflowResult.graph) {
    const eir = await runExternalEvidenceIntelligence({
      attachments: input.attachments,
      snapshot: {
        graph: workflowResult.graph,
        compliance: workflowResult.compliance,
        skuResult: workflowResult.skuResult,
      },
      registry: workflowResult.evidence?.registry,
      mergeInternalEvidence: true,
    });
    if (eir.ok) {
      externalEvidence = eir;
      if (workflowResult.evidence) {
        workflowResult.evidence = eir.coverage.evidence;
      }
      if (input.runSemanticEvidence !== false) {
        semanticEvidence = runSemanticEvidenceReasoning(
          {
            graph: workflowResult.graph,
            registry: eir.registry.registry,
            sourceName: input.sourceName,
          },
          { registryCoverage: eir.coverage.evidence.coverage },
        );
      }
    }
  }

  let semanticRuntime: SemanticRuntimeReasoningResult | undefined;
  if (input.runSemanticRuntime !== false && (semanticEvidence || workflowResult.graph)) {
    semanticRuntime = runSemanticRuntimeReasoning({
      intelligence: semanticEvidence,
      graph: workflowResult.graph,
      registry:
        externalEvidence?.registry.registry ?? workflowResult.evidence?.registry,
      sourceName: input.sourceName,
      forceAllow: input.forceAllow,
    });
  }

  // --- route ---
  t0 = Date.now();
  let route = buildDecisionRoute({
    decision,
    forceAllow: input.forceAllow,
  });
  phases.push(
    phaseResult("route", "completed", t0, `决策路由 → ${route.target}`, {
      routeId: route.routeId,
      target: route.target,
    }),
  );

  // --- readiness (before escalate adjust — escalate uses readiness) ---
  t0 = Date.now();
  const readiness = buildSubmissionReadiness({
    workflow: workflowResult,
    recommendations,
    minScore: policy.minReadinessScore,
  });
  route = adjustRouteForReadiness(route, readiness);
  phases.push(
    phaseResult("readiness", "completed", t0, `就绪评分 ${readiness.score}`, {
      ready: readiness.ready,
      grade: readiness.grade,
      blockers: readiness.blockers.length,
    }),
  );

  // --- escalate ---
  t0 = Date.now();
  const escalation = buildEscalation({
    decision,
    route,
    readiness,
    policy: { escalateOnWarn: policy.escalateOnWarn },
  });
  phases.push(
    phaseResult("escalate", "completed", t0, `升级级别 ${escalation.level}`, {
      required: escalation.required,
      level: escalation.level,
    }),
  );

  // --- finalize ---
  t0 = Date.now();
  const outcome = buildFinalRuntimeOutcome({
    decision,
    route,
    escalation,
    readiness,
    policy,
    workflowFailed: false,
  });
  phases.push(
    phaseResult("finalize", "completed", t0, `最终裁决 ${outcome.verdict}`, {
      verdict: outcome.verdict,
      orchestrationStatus: outcome.orchestrationStatus,
    }),
  );

  const finishedAt = new Date().toISOString();

  return {
    ok: true,
    orchestrationId,
    version: "3.0",
    startedAt,
    finishedAt,
    durationMs: Date.now() - orchestrationStarted,
    phases,
    workflow: workflowResult,
    route,
    escalation,
    readiness,
    outcome,
    recommendations,
    scoringImpact,
    semanticEvidence,
    semanticRuntime,
    externalEvidence,
    attachmentEvidence: externalEvidence,
  };
}
