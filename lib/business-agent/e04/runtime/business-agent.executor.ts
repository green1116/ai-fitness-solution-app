/**
 * E04-P1 — Business Agent Executor
 * Bridges Business Agent definitions onto E03 Agent Runtime execute()
 */

import { getAgentById } from "../../../agent-platform/e03/core/agent.registry";
import { createAgentExecutionContext } from "../../../agent-platform/e03/runtime/agent.context";
import {
  execute as executeRuntimeAgent,
  type AgentExecuteBundle,
} from "../../../agent-platform/e03/runtime/agent.executor";
import { getCapabilityById } from "../capability/capability.registry";
import type { BusinessAgentDefinition } from "../core/business-agent.types";
import {
  assertValidBusinessAgentContext,
  type BusinessAgentExecutionContext,
} from "./business-agent.context";

export type BusinessAgentExecutionResult = {
  success: boolean;
  businessAgentId: string;
  runtimeAgentId: string;
  capabilityId?: string;
  output: Readonly<Record<string, unknown>>;
  runtime: AgentExecuteBundle;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type BusinessAgentExecuteBundle = {
  result: BusinessAgentExecutionResult;
  context: BusinessAgentExecutionContext;
};

export function executeBusinessAgent(
  agent: BusinessAgentDefinition,
  context: BusinessAgentExecutionContext,
): BusinessAgentExecuteBundle {
  assertValidBusinessAgentContext(context);

  if (agent.id !== context.businessAgentId) {
    throw new Error(
      `business agent/context mismatch: agent.id=${agent.id} context.businessAgentId=${context.businessAgentId}`,
    );
  }
  if (agent.runtimeAgentId !== context.runtimeAgentId) {
    throw new Error(
      `runtime binding mismatch: agent.runtimeAgentId=${agent.runtimeAgentId} context.runtimeAgentId=${context.runtimeAgentId}`,
    );
  }

  const startedAt = Date.now();

  try {
    if (
      context.capabilityId &&
      !agent.capabilityIds.includes(context.capabilityId)
    ) {
      throw new Error(
        `capability ${context.capabilityId} is not owned by ${agent.id}`,
      );
    }

    const runtimeAgent = getAgentById(agent.runtimeAgentId);
    if (!runtimeAgent) {
      throw new Error(`E03 runtime agent missing: ${agent.runtimeAgentId}`);
    }

    const capability = context.capabilityId
      ? getCapabilityById(context.capabilityId)
      : undefined;

    const runtimeContext = createAgentExecutionContext({
      agentId: runtimeAgent.id,
      taskId: context.taskId,
      executionId: context.executionId,
      input: {
        ...context.input,
        businessAgentId: agent.id,
        businessDomain: agent.domain,
        capabilityId: context.capabilityId,
        capabilityKind: capability?.kind,
        goal:
          typeof context.input.goal === "string"
            ? context.input.goal
            : `business:${agent.domain}`,
      },
      metadata: {
        ...context.metadata,
        layer: "e04-business-agent",
        runtimeAgentId: runtimeAgent.id,
      },
    });

    const runtime = executeRuntimeAgent(runtimeAgent, runtimeContext);
    const duration = Date.now() - startedAt;

    if (!runtime.result.success) {
      return {
        context,
        result: {
          success: false,
          businessAgentId: agent.id,
          runtimeAgentId: agent.runtimeAgentId,
          capabilityId: context.capabilityId,
          output: {},
          runtime,
          duration,
          status: "failed",
          errorMessage: runtime.result.errorMessage ?? "runtime failed",
          readOnly: true,
        },
      };
    }

    return {
      context,
      result: {
        success: true,
        businessAgentId: agent.id,
        runtimeAgentId: agent.runtimeAgentId,
        capabilityId: context.capabilityId,
        output: Object.freeze({
          domain: agent.domain,
          capabilityId: context.capabilityId ?? null,
          capabilityKind: capability?.kind ?? null,
          runtimeOutput: runtime.result.output,
        }),
        runtime,
        duration,
        status: "result",
        readOnly: true,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "business agent failed";
    const duration = Date.now() - startedAt;
    // Minimal failed runtime shell is not available; fabricate via empty execute path is avoided.
    // Return failed business result without rethrow when unexpected.
    throw Object.assign(new Error(message), {
      duration,
      businessAgentId: agent.id,
    });
  }
}

export function executeBusinessAgentOrThrow(
  agent: BusinessAgentDefinition,
  context: BusinessAgentExecutionContext,
): BusinessAgentExecuteBundle & {
  result: BusinessAgentExecutionResult & { success: true; status: "result" };
} {
  try {
    const bundle = executeBusinessAgent(agent, context);
    if (!bundle.result.success || bundle.result.status !== "result") {
      throw new Error(
        `E04 business agent execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
      );
    }
    return bundle as BusinessAgentExecuteBundle & {
      result: BusinessAgentExecutionResult & { success: true; status: "result" };
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "business agent failed";
    throw new Error(`E04 business agent execution failed: ${message}`);
  }
}
