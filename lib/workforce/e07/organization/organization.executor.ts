/**
 * E07-P7 — Autonomous Organization Executor
 * Runs planned learning units via E07 workforce learning loop
 */

import { getLearningById } from "../learning/learning.registry";
import { runWorkforceLearningLoop } from "../learning/learning.updater";
import { planOrganization } from "./organization.planner";
import {
  appendOrganizationTraceEvent,
  createOrganizationRuntimeTrace,
  type OrganizationRuntimeTrace,
} from "./organization.trace";
import type {
  OrganizationDefinition,
  OrganizationExecutionResult,
  OrganizationUnitResult,
} from "./organization.types";

export type OrganizationExecuteBundle = {
  result: OrganizationExecutionResult;
  trace: OrganizationRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeOrganization(
  organization: OrganizationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): OrganizationExecuteBundle {
  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("org-inst");
  const taskId = options?.taskId?.trim() || createId("org-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createOrganizationRuntimeTrace({
    instanceId,
    organizationId: organization.id,
    taskId,
  });

  trace = appendOrganizationTraceEvent(
    trace,
    "ready",
    `organization ${organization.id} ready`,
    { kind: organization.kind },
  );

  const unitResults: OrganizationUnitResult[] = [];
  const learningIds: string[] = [];

  const fail = (
    plan: OrganizationExecutionResult["plan"],
    message: string,
  ): OrganizationExecuteBundle => {
    trace = appendOrganizationTraceEvent(trace, "error", message);
    return {
      trace,
      result: {
        success: false,
        organizationId: organization.id,
        kind: organization.kind,
        mission: organization.mission,
        instanceId,
        taskId,
        traceId: trace.traceId,
        plan,
        unitResults: [...unitResults],
        completedUnits: unitResults.filter((u) => u.success).length,
        learningIds: [...learningIds],
        output: {},
        duration: Date.now() - startedAt,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  };

  try {
    const plan = planOrganization(organization);
    trace = appendOrganizationTraceEvent(trace, "plan", plan.narrative, {
      unitCount: String(plan.unitCount),
    });

    for (const unit of plan.units) {
      const learning = getLearningById(unit.learningId);
      if (!learning) {
        return fail(plan, `unknown learning: ${unit.learningId}`);
      }

      trace = appendOrganizationTraceEvent(
        trace,
        "unit",
        `unit ${unit.order}/${plan.unitCount}: ${unit.title}`,
        { learningId: unit.learningId },
      );

      const loop = runWorkforceLearningLoop(learning, {
        taskId: `${taskId}:unit-${unit.order}`,
        input: {
          ...input,
          organizationId: organization.id,
          organizationKind: organization.kind,
          unitOrder: unit.order,
          humanDecision:
            typeof input.humanDecision === "string"
              ? input.humanDecision
              : "approve",
          goal:
            typeof input.goal === "string"
              ? input.goal
              : `organization:${organization.kind}`,
        },
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e07-organization",
          organizationId: organization.id,
        },
      });

      const unitResult: OrganizationUnitResult = {
        unitId: unit.id,
        order: unit.order,
        learningId: unit.learningId,
        success: loop.result.success,
        status: loop.result.status,
        baselineScore: loop.result.baseline.score,
        updatedScore: loop.result.updated.score,
        durationMs: loop.result.duration,
        errorMessage: loop.result.errorMessage,
        readOnly: true,
      };
      unitResults.push(unitResult);

      trace = appendOrganizationTraceEvent(
        trace,
        "learn",
        `learning ${unit.learningId} status=${loop.result.status}`,
        {
          success: String(loop.result.success),
          delta: String(loop.result.measurement.delta),
        },
      );

      if (!loop.result.success) {
        return fail(
          plan,
          `unit ${unit.order} failed: ${loop.result.errorMessage ?? "unknown"}`,
        );
      }

      learningIds.push(unit.learningId);
    }

    const duration = Date.now() - startedAt;
    const result: OrganizationExecutionResult = {
      success: true,
      organizationId: organization.id,
      kind: organization.kind,
      mission: organization.mission,
      instanceId,
      taskId,
      traceId: trace.traceId,
      plan,
      unitResults: [...unitResults],
      completedUnits: unitResults.length,
      learningIds: [...learningIds],
      output: Object.freeze({
        organizationId: organization.id,
        kind: organization.kind,
        unitCount: plan.unitCount,
        completedUnits: unitResults.length,
        learningIds: [...learningIds],
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendOrganizationTraceEvent(
      trace,
      "result",
      `result ready units=${unitResults.length}/${plan.unitCount} durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "organization failed";
    return fail(
      {
        organizationId: organization.id,
        kind: organization.kind,
        mission: organization.mission,
        unitCount: 0,
        units: [],
        narrative: "plan unavailable",
        readOnly: true,
      },
      message,
    );
  }
}

export function executeOrganizationOrThrow(
  organization: OrganizationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): OrganizationExecuteBundle & {
  result: OrganizationExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeOrganization(organization, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E07 organization failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as OrganizationExecuteBundle & {
    result: OrganizationExecutionResult & { success: true; status: "result" };
  };
}
