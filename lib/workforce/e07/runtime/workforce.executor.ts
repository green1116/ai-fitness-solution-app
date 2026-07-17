/**
 * E07-P1 — Workforce Executor
 * Bridges digital workers onto E06 autonomous operation execute()
 */

import { getOperationById } from "../../../autonomous/e06/core/operation.registry";
import { createOperationExecutionContext } from "../../../autonomous/e06/runtime/operation.context";
import {
  executeOperation,
  type OperationExecuteBundle,
} from "../../../autonomous/e06/runtime/operation.executor";
import { getSkillById } from "../skill/skill.registry";
import type { WorkerDefinition } from "../core/workforce.types";
import {
  assertValidWorkforceContext,
  type WorkforceExecutionContext,
} from "./workforce.context";

export type WorkforceExecutionResult = {
  success: boolean;
  workerId: string;
  operationId: string;
  skillId?: string;
  output: Readonly<Record<string, unknown>>;
  operation: OperationExecuteBundle;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type WorkforceExecuteBundle = {
  result: WorkforceExecutionResult;
  context: WorkforceExecutionContext;
};

export function executeWorker(
  worker: WorkerDefinition,
  context: WorkforceExecutionContext,
): WorkforceExecuteBundle {
  assertValidWorkforceContext(context);

  if (worker.id !== context.workerId) {
    throw new Error(
      `worker/context mismatch: worker.id=${worker.id} context.workerId=${context.workerId}`,
    );
  }
  if (worker.operationId !== context.operationId) {
    throw new Error(
      `operation binding mismatch: worker.operationId=${worker.operationId} context.operationId=${context.operationId}`,
    );
  }

  const startedAt = Date.now();

  try {
    if (context.skillId && !worker.skillIds.includes(context.skillId)) {
      throw new Error(
        `skill ${context.skillId} is not owned by ${worker.id}`,
      );
    }

    const operation = getOperationById(worker.operationId);
    if (!operation) {
      throw new Error(`E06 operation missing: ${worker.operationId}`);
    }

    const skill = context.skillId ? getSkillById(context.skillId) : undefined;

    const operationContext = createOperationExecutionContext({
      operationId: operation.id,
      intelligenceId: operation.intelligenceId,
      insightId: operation.insightId,
      taskId: context.taskId,
      executionId: context.executionId,
      input: {
        ...context.input,
        workerId: worker.id,
        workerRole: worker.role,
        skillId: context.skillId,
        skillKind: skill?.kind,
        goal:
          typeof context.input.goal === "string"
            ? context.input.goal
            : `worker:${worker.role}`,
      },
      metadata: {
        ...context.metadata,
        layer: "e07-workforce",
        workerId: worker.id,
      },
    });

    const operationRun = executeOperation(operation, operationContext);
    const duration = Date.now() - startedAt;

    if (!operationRun.result.success) {
      const status =
        operationRun.result.status === "blocked" ? "blocked" : "failed";
      return {
        context,
        result: {
          success: false,
          workerId: worker.id,
          operationId: worker.operationId,
          skillId: context.skillId,
          output: {},
          operation: operationRun,
          duration,
          status,
          errorMessage:
            operationRun.result.errorMessage ?? "operation failed",
          readOnly: true,
        },
      };
    }

    return {
      context,
      result: {
        success: true,
        workerId: worker.id,
        operationId: worker.operationId,
        skillId: context.skillId,
        output: Object.freeze({
          role: worker.role,
          skillId: context.skillId ?? null,
          skillKind: skill?.kind ?? null,
          operationOutput: operationRun.result.output,
        }),
        operation: operationRun,
        duration,
        status: "result",
        readOnly: true,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "worker failed";
    const duration = Date.now() - startedAt;
    throw Object.assign(new Error(message), {
      duration,
      workerId: worker.id,
    });
  }
}

export function executeWorkerOrThrow(
  worker: WorkerDefinition,
  context: WorkforceExecutionContext,
): WorkforceExecuteBundle & {
  result: WorkforceExecutionResult & { success: true; status: "result" };
} {
  try {
    const bundle = executeWorker(worker, context);
    if (!bundle.result.success || bundle.result.status !== "result") {
      throw new Error(
        `E07 worker execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
      );
    }
    return bundle as WorkforceExecuteBundle & {
      result: WorkforceExecutionResult & {
        success: true;
        status: "result";
      };
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "worker failed";
    throw new Error(`E07 worker execution failed: ${message}`);
  }
}
