/**
 * E07-P5 — Human-AI Collaboration Executor
 * REQUEST -> DECIDE -> ORCHESTRATE over E07 workforce orchestration
 */

import { getOrchestrationById } from "../orchestration/orchestration.registry";
import { executeOrchestration } from "../orchestration/orchestration.executor";
import { assertCollaborationDefinition } from "./collaboration.registry";
import {
  createHumanCollaborationRequest,
  decideHumanCollaborationRequest,
  isHumanDecisionAllowingRun,
} from "./collaboration.request";
import {
  appendCollaborationTraceEvent,
  createCollaborationRuntimeTrace,
  type CollaborationRuntimeTrace,
} from "./collaboration.trace";
import type {
  CollaborationDefinition,
  CollaborationExecutionResult,
  HumanDecision,
} from "./collaboration.types";

export type CollaborationExecuteBundle = {
  result: CollaborationExecutionResult;
  trace: CollaborationRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function resolveDecision(
  collaboration: CollaborationDefinition,
  options?: {
    humanDecision?: HumanDecision;
    input?: Readonly<Record<string, unknown>>;
  },
): HumanDecision {
  if (options?.humanDecision) return options.humanDecision;

  const raw = options?.input?.humanDecision;
  if (raw === "approve" || raw === "reject" || raw === "defer") {
    return raw;
  }

  // Co-work and non-gated sessions default to approve when no decision supplied
  if (!collaboration.requiresApproval) return "approve";

  return "defer";
}

export function executeCollaboration(
  collaboration: CollaborationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
    humanDecision?: HumanDecision;
    humanNote?: string;
  },
): CollaborationExecuteBundle {
  assertCollaborationDefinition(collaboration);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("collab-inst");
  const taskId = options?.taskId?.trim() || createId("collab-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createCollaborationRuntimeTrace({
    instanceId,
    collaborationId: collaboration.id,
    taskId,
  });

  trace = appendCollaborationTraceEvent(
    trace,
    "ready",
    `collaboration ${collaboration.id} ready`,
    { mode: collaboration.mode, humanRole: collaboration.humanRole },
  );

  let request = createHumanCollaborationRequest(collaboration, {
    prompt:
      typeof input.prompt === "string"
        ? input.prompt
        : undefined,
  });

  trace = appendCollaborationTraceEvent(
    trace,
    "request",
    `human request ${request.requestId} pending`,
    { status: request.status },
  );

  try {
    const decision = resolveDecision(collaboration, options);
    request = decideHumanCollaborationRequest(
      request,
      decision,
      options?.humanNote,
    );

    trace = appendCollaborationTraceEvent(
      trace,
      "decision",
      `human decision=${decision}`,
      { humanRole: collaboration.humanRole },
    );

    if (decision === "reject") {
      const duration = Date.now() - startedAt;
      trace = appendCollaborationTraceEvent(
        trace,
        "error",
        "human rejected collaboration",
      );
      return {
        trace,
        result: {
          success: false,
          collaborationId: collaboration.id,
          mode: collaboration.mode,
          orchestrationId: collaboration.orchestrationId,
          instanceId,
          taskId,
          traceId: trace.traceId,
          request,
          output: {},
          duration,
          status: "blocked",
          errorMessage: "human rejected collaboration",
          readOnly: true,
        },
      };
    }

    if (decision === "defer" || !isHumanDecisionAllowingRun(decision)) {
      const duration = Date.now() - startedAt;
      trace = appendCollaborationTraceEvent(
        trace,
        "error",
        "human deferred collaboration",
      );
      return {
        trace,
        result: {
          success: false,
          collaborationId: collaboration.id,
          mode: collaboration.mode,
          orchestrationId: collaboration.orchestrationId,
          instanceId,
          taskId,
          traceId: trace.traceId,
          request,
          output: {},
          duration,
          status: "deferred",
          errorMessage: "human deferred collaboration",
          readOnly: true,
        },
      };
    }

    const orchestration = getOrchestrationById(collaboration.orchestrationId);
    if (!orchestration) {
      throw new Error(
        `orchestration missing: ${collaboration.orchestrationId}`,
      );
    }

    trace = appendCollaborationTraceEvent(
      trace,
      "orchestrate",
      `running orchestration ${orchestration.id}`,
      { kind: orchestration.kind },
    );

    const orchRun = executeOrchestration(orchestration, {
      taskId: `${taskId}:orch`,
      input: {
        ...input,
        collaborationId: collaboration.id,
        humanDecision: decision,
        humanRole: collaboration.humanRole,
        goal:
          typeof input.goal === "string"
            ? input.goal
            : `collaboration:${collaboration.mode}`,
      },
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e07-collaboration",
        collaborationId: collaboration.id,
      },
    });

    if (!orchRun.result.success) {
      const status =
        orchRun.result.status === "blocked" ? "blocked" : "failed";
      const message =
        orchRun.result.errorMessage ?? `orchestration ${status}`;
      trace = appendCollaborationTraceEvent(trace, "error", message);
      return {
        trace,
        result: {
          success: false,
          collaborationId: collaboration.id,
          mode: collaboration.mode,
          orchestrationId: collaboration.orchestrationId,
          instanceId,
          taskId,
          traceId: trace.traceId,
          request,
          orchestration: orchRun.result,
          output: {},
          duration: Date.now() - startedAt,
          status,
          errorMessage: message,
          readOnly: true,
        },
      };
    }

    const duration = Date.now() - startedAt;
    const result: CollaborationExecutionResult = {
      success: true,
      collaborationId: collaboration.id,
      mode: collaboration.mode,
      orchestrationId: collaboration.orchestrationId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      request,
      orchestration: orchRun.result,
      output: Object.freeze({
        collaborationId: collaboration.id,
        mode: collaboration.mode,
        humanRole: collaboration.humanRole,
        humanDecision: decision,
        orchestrationId: orchestration.id,
        completedSteps: orchRun.result.completedSteps,
        deployedRoles: [...orchRun.result.deployedRoles],
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendCollaborationTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "collaboration failed";
    const duration = Date.now() - startedAt;
    trace = appendCollaborationTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        collaborationId: collaboration.id,
        mode: collaboration.mode,
        orchestrationId: collaboration.orchestrationId,
        instanceId,
        taskId,
        traceId: trace.traceId,
        request,
        output: {},
        duration,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  }
}

export function executeCollaborationOrThrow(
  collaboration: CollaborationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
    humanDecision?: HumanDecision;
    humanNote?: string;
  },
): CollaborationExecuteBundle & {
  result: CollaborationExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeCollaboration(collaboration, {
    ...options,
    humanDecision: options?.humanDecision ?? "approve",
  });
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E07 collaboration failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as CollaborationExecuteBundle & {
    result: CollaborationExecutionResult & { success: true; status: "result" };
  };
}
