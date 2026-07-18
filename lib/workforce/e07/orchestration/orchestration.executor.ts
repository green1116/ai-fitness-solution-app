/**
 * E07-P4 — Workforce Orchestration Executor
 * Runs planned role sequences via E07 marketplace deployer
 */

import { getRoleById } from "../marketplace/role.registry";
import { deployRoleAgent } from "../marketplace/role.deployer";
import { planOrchestration } from "./orchestration.planner";
import {
  appendOrchestrationTraceEvent,
  createOrchestrationRuntimeTrace,
  type OrchestrationRuntimeTrace,
} from "./orchestration.trace";
import type {
  OrchestrationDefinition,
  OrchestrationExecutionResult,
  OrchestrationStepResult,
} from "./orchestration.types";

export type OrchestrationExecuteBundle = {
  result: OrchestrationExecutionResult;
  trace: OrchestrationRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeOrchestration(
  orchestration: OrchestrationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): OrchestrationExecuteBundle {
  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("orch-inst");
  const taskId = options?.taskId?.trim() || createId("orch-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createOrchestrationRuntimeTrace({
    instanceId,
    orchestrationId: orchestration.id,
    taskId,
  });

  trace = appendOrchestrationTraceEvent(
    trace,
    "ready",
    `orchestration ${orchestration.id} ready`,
    { kind: orchestration.kind },
  );

  const stepResults: OrchestrationStepResult[] = [];
  const deployedRoles: string[] = [];

  const fail = (
    plan: OrchestrationExecutionResult["plan"],
    status: "blocked" | "failed",
    message: string,
  ): OrchestrationExecuteBundle => {
    trace = appendOrchestrationTraceEvent(trace, "error", message);
    return {
      trace,
      result: {
        success: false,
        orchestrationId: orchestration.id,
        kind: orchestration.kind,
        goal: orchestration.goal,
        instanceId,
        taskId,
        traceId: trace.traceId,
        plan,
        stepResults: [...stepResults],
        completedSteps: stepResults.filter((s) => s.success).length,
        deployedRoles: [...deployedRoles],
        output: {},
        duration: Date.now() - startedAt,
        status,
        errorMessage: message,
        readOnly: true,
      },
    };
  };

  try {
    const plan = planOrchestration(orchestration);
    trace = appendOrchestrationTraceEvent(trace, "plan", plan.narrative, {
      stepCount: String(plan.stepCount),
    });

    for (const step of plan.steps) {
      const role = getRoleById(step.roleId);
      if (!role) {
        return fail(plan, "failed", `unknown role: ${step.roleId}`);
      }

      trace = appendOrchestrationTraceEvent(
        trace,
        "step",
        `step ${step.order}/${plan.stepCount}: ${step.title}`,
        { roleId: step.roleId },
      );

      const deploy = deployRoleAgent(role, {
        taskId: `${taskId}:step-${step.order}`,
        input: {
          ...input,
          orchestrationId: orchestration.id,
          orchestrationKind: orchestration.kind,
          stepOrder: step.order,
          goal:
            typeof input.goal === "string"
              ? input.goal
              : `orchestration:${orchestration.kind}`,
        },
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e07-orchestration",
          orchestrationId: orchestration.id,
        },
      });

      const stepResult: OrchestrationStepResult = {
        stepId: step.id,
        order: step.order,
        roleId: step.roleId,
        success: deploy.result.success,
        status: deploy.result.status,
        completedTasks: deploy.result.employee?.completedTasks ?? 0,
        durationMs: deploy.result.duration,
        errorMessage: deploy.result.errorMessage,
        readOnly: true,
      };
      stepResults.push(stepResult);

      trace = appendOrchestrationTraceEvent(
        trace,
        "deploy",
        `role ${step.roleId} status=${deploy.result.status}`,
        { success: String(deploy.result.success) },
      );

      if (!deploy.result.success) {
        const status =
          deploy.result.status === "blocked" ? "blocked" : "failed";
        return fail(
          plan,
          status,
          `step ${step.order} ${status}: ${deploy.result.errorMessage ?? "unknown"}`,
        );
      }

      deployedRoles.push(step.roleId);
    }

    const duration = Date.now() - startedAt;
    const result: OrchestrationExecutionResult = {
      success: true,
      orchestrationId: orchestration.id,
      kind: orchestration.kind,
      goal: orchestration.goal,
      instanceId,
      taskId,
      traceId: trace.traceId,
      plan,
      stepResults: [...stepResults],
      completedSteps: stepResults.length,
      deployedRoles: [...deployedRoles],
      output: Object.freeze({
        orchestrationId: orchestration.id,
        kind: orchestration.kind,
        stepCount: plan.stepCount,
        completedSteps: stepResults.length,
        deployedRoles: [...deployedRoles],
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendOrchestrationTraceEvent(
      trace,
      "result",
      `result ready steps=${stepResults.length}/${plan.stepCount} durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "orchestration failed";
    return fail(
      {
        orchestrationId: orchestration.id,
        kind: orchestration.kind,
        goal: orchestration.goal,
        stepCount: 0,
        steps: [],
        narrative: "plan unavailable",
        readOnly: true,
      },
      "failed",
      message,
    );
  }
}

export function executeOrchestrationOrThrow(
  orchestration: OrchestrationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): OrchestrationExecuteBundle & {
  result: OrchestrationExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeOrchestration(orchestration, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E07 orchestration failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as OrchestrationExecuteBundle & {
    result: OrchestrationExecutionResult & { success: true; status: "result" };
  };
}
