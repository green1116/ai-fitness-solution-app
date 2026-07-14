/**
 * E05-P1 — Intelligence Executor
 * Bridges intelligence modules onto E04 Business Agent execute()
 */

import { getBusinessAgentById } from "../../../business-agent/e04/core/business-agent.registry";
import { createBusinessAgentExecutionContext } from "../../../business-agent/e04/runtime/business-agent.context";
import {
  executeBusinessAgent,
  type BusinessAgentExecuteBundle,
} from "../../../business-agent/e04/runtime/business-agent.executor";
import { getInsightById } from "../insight/insight.registry";
import type { IntelligenceDefinition } from "../core/intelligence.types";
import {
  assertValidIntelligenceContext,
  type IntelligenceExecutionContext,
} from "./intelligence.context";

export type IntelligenceExecutionResult = {
  success: boolean;
  intelligenceId: string;
  businessAgentId: string;
  insightId?: string;
  output: Readonly<Record<string, unknown>>;
  business: BusinessAgentExecuteBundle;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type IntelligenceExecuteBundle = {
  result: IntelligenceExecutionResult;
  context: IntelligenceExecutionContext;
};

export function executeIntelligence(
  module: IntelligenceDefinition,
  context: IntelligenceExecutionContext,
): IntelligenceExecuteBundle {
  assertValidIntelligenceContext(context);

  if (module.id !== context.intelligenceId) {
    throw new Error(
      `intelligence/context mismatch: module.id=${module.id} context.intelligenceId=${context.intelligenceId}`,
    );
  }
  if (module.businessAgentId !== context.businessAgentId) {
    throw new Error(
      `business agent binding mismatch: module.businessAgentId=${module.businessAgentId} context.businessAgentId=${context.businessAgentId}`,
    );
  }

  const startedAt = Date.now();

  try {
    if (
      context.insightId &&
      !module.insightIds.includes(context.insightId)
    ) {
      throw new Error(
        `insight ${context.insightId} is not owned by ${module.id}`,
      );
    }

    const agent = getBusinessAgentById(module.businessAgentId);
    if (!agent) {
      throw new Error(`E04 business agent missing: ${module.businessAgentId}`);
    }

    const insight = context.insightId
      ? getInsightById(context.insightId)
      : undefined;

    const businessContext = createBusinessAgentExecutionContext({
      businessAgentId: agent.id,
      runtimeAgentId: agent.runtimeAgentId,
      capabilityId: module.capabilityId,
      taskId: context.taskId,
      executionId: context.executionId,
      input: {
        ...context.input,
        intelligenceId: module.id,
        intelligenceDomain: module.domain,
        insightId: context.insightId,
        insightKind: insight?.kind,
        goal:
          typeof context.input.goal === "string"
            ? context.input.goal
            : `intelligence:${module.domain}`,
      },
      metadata: {
        ...context.metadata,
        layer: "e05-intelligence",
        businessAgentId: agent.id,
      },
    });

    const business = executeBusinessAgent(agent, businessContext);
    const duration = Date.now() - startedAt;

    if (!business.result.success) {
      return {
        context,
        result: {
          success: false,
          intelligenceId: module.id,
          businessAgentId: module.businessAgentId,
          insightId: context.insightId,
          output: {},
          business,
          duration,
          status: "failed",
          errorMessage: business.result.errorMessage ?? "business agent failed",
          readOnly: true,
        },
      };
    }

    return {
      context,
      result: {
        success: true,
        intelligenceId: module.id,
        businessAgentId: module.businessAgentId,
        insightId: context.insightId,
        output: Object.freeze({
          domain: module.domain,
          insightId: context.insightId ?? null,
          insightKind: insight?.kind ?? null,
          businessOutput: business.result.output,
        }),
        business,
        duration,
        status: "result",
        readOnly: true,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "intelligence failed";
    const duration = Date.now() - startedAt;
    throw Object.assign(new Error(message), {
      duration,
      intelligenceId: module.id,
    });
  }
}

export function executeIntelligenceOrThrow(
  module: IntelligenceDefinition,
  context: IntelligenceExecutionContext,
): IntelligenceExecuteBundle & {
  result: IntelligenceExecutionResult & { success: true; status: "result" };
} {
  try {
    const bundle = executeIntelligence(module, context);
    if (!bundle.result.success || bundle.result.status !== "result") {
      throw new Error(
        `E05 intelligence execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
      );
    }
    return bundle as IntelligenceExecuteBundle & {
      result: IntelligenceExecutionResult & {
        success: true;
        status: "result";
      };
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "intelligence failed";
    throw new Error(`E05 intelligence execution failed: ${message}`);
  }
}
