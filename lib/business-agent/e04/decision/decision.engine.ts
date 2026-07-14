/**
 * E04-P4 — Business Decision Engine
 * Evaluates policies and optionally reuses E04 process executor
 */

import { executeProcess } from "../process/process.executor";
import { getProcessById } from "../process/process.registry";
import { selectOutcomeFromPolicies } from "./decision.policy";
import {
  assertDecisionDefinition,
  listPoliciesForDecision,
} from "./decision.registry";
import {
  appendDecisionTraceEvent,
  createDecisionRuntimeTrace,
  type DecisionRuntimeTrace,
} from "./decision.trace";
import type {
  DecisionDefinition,
  DecisionEvaluationResult,
  DecisionExecutionResult,
  DecisionFacts,
} from "./decision.types";

export type DecisionExecuteBundle = {
  result: DecisionExecutionResult;
  evaluation: DecisionEvaluationResult;
  trace: DecisionRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function evaluateDecision(
  decision: DecisionDefinition,
  facts: DecisionFacts,
): DecisionEvaluationResult {
  assertDecisionDefinition(decision);
  const policies = listPoliciesForDecision(decision);
  const selected = selectOutcomeFromPolicies(
    policies,
    facts,
    decision.defaultOutcome,
  );

  return {
    decisionId: decision.id,
    outcome: selected.outcome,
    matchedPolicyId: selected.matchedPolicyId,
    evaluations: selected.evaluations,
    facts: Object.freeze({ ...facts }),
    readOnly: true,
  };
}

export function executeDecision(
  decision: DecisionDefinition,
  options?: {
    facts?: DecisionFacts;
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    executionId?: string;
  },
): DecisionExecuteBundle {
  assertDecisionDefinition(decision);

  const startedAt = Date.now();
  const executionId = options?.executionId?.trim() || createId("dec-exec");
  const taskId = options?.taskId?.trim() || createId("dec-task");
  const facts = Object.freeze({ ...(options?.facts ?? {}) });

  let trace = createDecisionRuntimeTrace({
    executionId,
    decisionId: decision.id,
    taskId,
  });

  trace = appendDecisionTraceEvent(
    trace,
    "ready",
    `decision ${decision.id} ready`,
    { processId: decision.processId },
  );

  try {
    trace = appendDecisionTraceEvent(
      trace,
      "evaluate",
      `evaluating ${decision.policyIds.length} policies`,
    );

    const evaluation = evaluateDecision(decision, facts);

    for (const item of evaluation.evaluations) {
      trace = appendDecisionTraceEvent(
        trace,
        "policy",
        `policy ${item.policyId} matched=${item.matched}`,
        {
          matched: String(item.matched),
          outcome: item.outcome ?? "",
        },
      );
    }

    trace = appendDecisionTraceEvent(
      trace,
      "outcome",
      `outcome=${evaluation.outcome}`,
      {
        outcome: evaluation.outcome,
        matchedPolicyId: evaluation.matchedPolicyId ?? "",
      },
    );

    let processInstanceId: string | undefined;
    let processOutput: Readonly<Record<string, unknown>> | undefined;

    const shouldRunProcess = decision.runProcessOn.includes(evaluation.outcome);
    if (shouldRunProcess) {
      const process = getProcessById(decision.processId);
      if (!process) {
        throw new Error(`process missing: ${decision.processId}`);
      }

      trace = appendDecisionTraceEvent(
        trace,
        "process",
        `running process ${process.id}`,
        { outcome: evaluation.outcome },
      );

      const processBundle = executeProcess(process, {
        taskId: `${taskId}:process`,
        input: {
          ...(options?.input ?? {}),
          ...facts,
          decisionId: decision.id,
          decisionOutcome: evaluation.outcome,
          goal:
            typeof options?.input?.goal === "string"
              ? options.input.goal
              : `decision:${decision.id}`,
        },
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e04-decision",
          decisionId: decision.id,
          outcome: evaluation.outcome,
        },
      });

      if (!processBundle.result.success) {
        throw new Error(
          `process failed: ${processBundle.result.errorMessage ?? "unknown"}`,
        );
      }

      processInstanceId = processBundle.instance.instanceId;
      processOutput = processBundle.result.output;
    }

    const duration = Date.now() - startedAt;
    const result: DecisionExecutionResult = {
      success: true,
      decisionId: decision.id,
      executionId,
      taskId,
      traceId: trace.traceId,
      outcome: evaluation.outcome,
      evaluation,
      processInstanceId,
      processOutput,
      output: Object.freeze({
        decisionId: decision.id,
        outcome: evaluation.outcome,
        processRan: shouldRunProcess,
        processId: shouldRunProcess ? decision.processId : null,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendDecisionTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      {
        success: "true",
        outcome: evaluation.outcome,
      },
    );

    return { result, evaluation, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "decision failed";
    const duration = Date.now() - startedAt;
    const evaluation = evaluateDecision(decision, facts);

    trace = appendDecisionTraceEvent(trace, "error", message);

    const result: DecisionExecutionResult = {
      success: false,
      decisionId: decision.id,
      executionId,
      taskId,
      traceId: trace.traceId,
      outcome: evaluation.outcome,
      evaluation,
      output: {},
      duration,
      status: "failed",
      errorMessage: message,
      readOnly: true,
    };

    return { result, evaluation, trace };
  }
}

export function executeDecisionOrThrow(
  decision: DecisionDefinition,
  options?: {
    facts?: DecisionFacts;
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    executionId?: string;
  },
): DecisionExecuteBundle & {
  result: DecisionExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeDecision(decision, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E04 decision execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as DecisionExecuteBundle & {
    result: DecisionExecutionResult & { success: true; status: "result" };
  };
}
