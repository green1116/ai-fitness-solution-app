/**
 * E06-P1 — Operation Executor
 * Bridges autonomous operations onto E05 Intelligence execute()
 */

import { getIntelligenceById } from "../../../intelligence/e05/core/intelligence.registry";
import { createIntelligenceExecutionContext } from "../../../intelligence/e05/runtime/intelligence.context";
import {
  executeIntelligence,
  type IntelligenceExecuteBundle,
} from "../../../intelligence/e05/runtime/intelligence.executor";
import type { OperationDefinition } from "../core/operation.types";
import type { OperationPolicyResult } from "../core/operation.types";
import {
  selectOperationPolicyEffect,
  type OperationFacts,
} from "../policy/operation.policy";
import { getOperationPolicyById } from "../policy/operation.policy.registry";
import {
  assertValidOperationContext,
  type OperationExecutionContext,
} from "./operation.context";

export type OperationExecutionResult = {
  success: boolean;
  operationId: string;
  intelligenceId: string;
  insightId?: string;
  policy: OperationPolicyResult;
  output: Readonly<Record<string, unknown>>;
  intelligence?: IntelligenceExecuteBundle;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type OperationExecuteBundle = {
  result: OperationExecutionResult;
  context: OperationExecutionContext;
};

function buildFacts(
  operation: OperationDefinition,
  context: OperationExecutionContext,
): OperationFacts {
  return Object.freeze({
    ...context.input,
    domain: operation.domain,
    operationId: operation.id,
    intelligenceId: operation.intelligenceId,
    goal:
      typeof context.input.goal === "string"
        ? context.input.goal
        : `operation:${operation.domain}`,
  });
}

export function executeOperation(
  operation: OperationDefinition,
  context: OperationExecutionContext,
): OperationExecuteBundle {
  assertValidOperationContext(context);

  if (operation.id !== context.operationId) {
    throw new Error(
      `operation/context mismatch: operation.id=${operation.id} context.operationId=${context.operationId}`,
    );
  }
  if (operation.intelligenceId !== context.intelligenceId) {
    throw new Error(
      `intelligence binding mismatch: operation.intelligenceId=${operation.intelligenceId} context.intelligenceId=${context.intelligenceId}`,
    );
  }

  const startedAt = Date.now();

  try {
    const policies = operation.policyIds
      .map((id) => getOperationPolicyById(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const policy = selectOperationPolicyEffect(
      policies,
      buildFacts(operation, context),
      "allow",
    );

    if (!policy.allowed) {
      return {
        context,
        result: {
          success: false,
          operationId: operation.id,
          intelligenceId: operation.intelligenceId,
          insightId: context.insightId ?? operation.insightId,
          policy,
          output: {},
          duration: Date.now() - startedAt,
          status: "blocked",
          errorMessage: `policy denied: ${policy.matchedPolicyId ?? "deny"}`,
          readOnly: true,
        },
      };
    }

    const module = getIntelligenceById(operation.intelligenceId);
    if (!module) {
      throw new Error(`E05 intelligence missing: ${operation.intelligenceId}`);
    }

    const insightId = context.insightId ?? operation.insightId;
    if (insightId && !module.insightIds.includes(insightId)) {
      throw new Error(`insight ${insightId} is not owned by ${module.id}`);
    }

    const intelligenceContext = createIntelligenceExecutionContext({
      intelligenceId: module.id,
      businessAgentId: module.businessAgentId,
      insightId,
      taskId: context.taskId,
      executionId: context.executionId,
      input: {
        ...context.input,
        operationId: operation.id,
        operationDomain: operation.domain,
        policyEffect: policy.effect,
        goal:
          typeof context.input.goal === "string"
            ? context.input.goal
            : `operation:${operation.domain}`,
      },
      metadata: {
        ...context.metadata,
        layer: "e06-operation",
        operationId: operation.id,
      },
    });

    const intelligence = executeIntelligence(module, intelligenceContext);
    const duration = Date.now() - startedAt;

    if (!intelligence.result.success) {
      return {
        context,
        result: {
          success: false,
          operationId: operation.id,
          intelligenceId: operation.intelligenceId,
          insightId,
          policy,
          output: {},
          intelligence,
          duration,
          status: "failed",
          errorMessage:
            intelligence.result.errorMessage ?? "intelligence failed",
          readOnly: true,
        },
      };
    }

    return {
      context,
      result: {
        success: true,
        operationId: operation.id,
        intelligenceId: operation.intelligenceId,
        insightId,
        policy,
        output: Object.freeze({
          domain: operation.domain,
          policyEffect: policy.effect,
          matchedPolicyId: policy.matchedPolicyId ?? null,
          insightId: insightId ?? null,
          intelligenceOutput: intelligence.result.output,
        }),
        intelligence,
        duration,
        status: "result",
        readOnly: true,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "operation failed";
    const duration = Date.now() - startedAt;
    throw Object.assign(new Error(message), {
      duration,
      operationId: operation.id,
    });
  }
}

export function executeOperationOrThrow(
  operation: OperationDefinition,
  context: OperationExecutionContext,
): OperationExecuteBundle & {
  result: OperationExecutionResult & { success: true; status: "result" };
} {
  try {
    const bundle = executeOperation(operation, context);
    if (!bundle.result.success || bundle.result.status !== "result") {
      throw new Error(
        `E06 operation execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
      );
    }
    return bundle as OperationExecuteBundle & {
      result: OperationExecutionResult & {
        success: true;
        status: "result";
      };
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "operation failed";
    throw new Error(`E06 operation execution failed: ${message}`);
  }
}
