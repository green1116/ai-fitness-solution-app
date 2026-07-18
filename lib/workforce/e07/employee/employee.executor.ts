/**
 * E07-P2 — AI Employee Executor
 * Runs planned task sequences via the E07 workforce executor
 */

import { getWorkerById } from "../core/workforce.registry";
import { createWorkforceExecutionContext } from "../runtime/workforce.context";
import { executeWorker } from "../runtime/workforce.executor";
import { planEmployeeTasks } from "./employee.planner";
import {
  appendEmployeeTraceEvent,
  createEmployeeRuntimeTrace,
  type EmployeeRuntimeTrace,
} from "./employee.trace";
import type {
  EmployeeDefinition,
  EmployeeExecutionResult,
  EmployeeTaskResult,
} from "./employee.types";

export type EmployeeExecuteBundle = {
  result: EmployeeExecutionResult;
  trace: EmployeeRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeEmployee(
  employee: EmployeeDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): EmployeeExecuteBundle {
  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("emp-inst");
  const taskId = options?.taskId?.trim() || createId("emp-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createEmployeeRuntimeTrace({
    instanceId,
    employeeId: employee.id,
    taskId,
  });

  trace = appendEmployeeTraceEvent(
    trace,
    "ready",
    `employee ${employee.id} ready`,
    { jobKind: employee.jobKind },
  );

  const taskResults: EmployeeTaskResult[] = [];

  const fail = (
    plan: EmployeeExecutionResult["plan"],
    status: "blocked" | "failed",
    message: string,
  ): EmployeeExecuteBundle => {
    trace = appendEmployeeTraceEvent(trace, "error", message);
    return {
      trace,
      result: {
        success: false,
        employeeId: employee.id,
        jobKind: employee.jobKind,
        jobTitle: employee.jobTitle,
        instanceId,
        taskId,
        traceId: trace.traceId,
        plan,
        taskResults: [...taskResults],
        completedTasks: taskResults.filter((t) => t.success).length,
        output: {},
        duration: Date.now() - startedAt,
        status,
        errorMessage: message,
        readOnly: true,
      },
    };
  };

  try {
    const plan = planEmployeeTasks(employee);
    trace = appendEmployeeTraceEvent(trace, "plan", plan.narrative, {
      taskCount: String(plan.taskCount),
    });

    for (const step of plan.steps) {
      const worker = getWorkerById(step.workerId);
      if (!worker) {
        return fail(plan, "failed", `unknown worker: ${step.workerId}`);
      }

      trace = appendEmployeeTraceEvent(
        trace,
        "task",
        `task ${step.order}/${plan.taskCount}: ${step.objective}`,
        { workerId: step.workerId, skillId: step.skillId },
      );

      const context = createWorkforceExecutionContext({
        workerId: worker.id,
        operationId: worker.operationId,
        skillId: step.skillId,
        taskId: `${taskId}:task-${step.order}`,
        input: {
          ...input,
          employeeId: employee.id,
          jobKind: employee.jobKind,
          objective: step.objective,
          goal:
            typeof input.goal === "string"
              ? input.goal
              : `employee:${employee.jobKind}`,
        },
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e07-employee",
          employeeId: employee.id,
        },
      });

      const run = executeWorker(worker, context);

      const taskResult: EmployeeTaskResult = {
        stepId: step.id,
        order: step.order,
        workerId: step.workerId,
        skillId: step.skillId,
        success: run.result.success,
        status: run.result.status,
        durationMs: run.result.duration,
        errorMessage: run.result.errorMessage,
        readOnly: true,
      };
      taskResults.push(taskResult);

      trace = appendEmployeeTraceEvent(
        trace,
        "worker",
        `worker ${step.workerId} status=${run.result.status}`,
        { success: String(run.result.success) },
      );

      if (!run.result.success) {
        const status = run.result.status === "blocked" ? "blocked" : "failed";
        return fail(
          plan,
          status,
          `task ${step.order} ${status}: ${run.result.errorMessage ?? "unknown"}`,
        );
      }
    }

    const duration = Date.now() - startedAt;
    const result: EmployeeExecutionResult = {
      success: true,
      employeeId: employee.id,
      jobKind: employee.jobKind,
      jobTitle: employee.jobTitle,
      instanceId,
      taskId,
      traceId: trace.traceId,
      plan,
      taskResults: [...taskResults],
      completedTasks: taskResults.length,
      output: Object.freeze({
        employeeId: employee.id,
        jobKind: employee.jobKind,
        taskCount: plan.taskCount,
        completedTasks: taskResults.length,
        workers: plan.steps.map((s) => s.workerId),
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendEmployeeTraceEvent(
      trace,
      "result",
      `result ready tasks=${taskResults.length}/${plan.taskCount} durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "employee failed";
    return fail(
      {
        employeeId: employee.id,
        jobKind: employee.jobKind,
        taskCount: 0,
        steps: [],
        narrative: "plan unavailable",
        readOnly: true,
      },
      "failed",
      message,
    );
  }
}

export function executeEmployeeOrThrow(
  employee: EmployeeDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): EmployeeExecuteBundle & {
  result: EmployeeExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeEmployee(employee, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E07 employee execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as EmployeeExecuteBundle & {
    result: EmployeeExecutionResult & { success: true; status: "result" };
  };
}
