/**
 * E02-P6 — Enterprise Memory Agent entry
 */

export {
  MEMORY_AGENT_CATALOG,
  buildMemoryAgentRegistryManifest,
  getMemoryAgentById,
  getMemoryAgentByRole,
  isMemoryAgentDependencyGraphValid,
  listExecutableMemoryAgents,
} from "./memory-agent.registry";

export {
  assertMemoryAgentKernelPass,
  buildMemoryAgentKernel,
  buildMemoryAgentLifecycle,
  buildMemoryRecommendations,
} from "./memory-agent.builder";

export {
  assertValidMemoryAgentRecommendation,
  assertValidMemoryAgentRegistry,
  MEMORY_AGENT_CAPABILITIES,
  MEMORY_AGENT_LIFECYCLE_STAGES,
  MEMORY_AGENT_ROLES,
  MEMORY_RECOMMENDATION_STATUSES,
  validateMemoryAgentDefinition,
  validateMemoryAgentKernelInput,
  validateMemoryAgentRecommendation,
  validateMemoryAgentRegistry,
} from "./memory-agent.schema";

export type { SchemaIssue, SchemaResult } from "./memory-agent.schema";

export {
  V102_MEMORY_AGENT_FREEZE_VERSION,
  V102_MEMORY_AGENT_VERSION,
} from "./memory-agent.types";

export type {
  MemoryAgentCapability,
  MemoryAgentDefinition,
  MemoryAgentKernelInput,
  MemoryAgentKernelResult,
  MemoryAgentLifecycle,
  MemoryAgentLifecycleStage,
  MemoryAgentLifecycleTransition,
  MemoryAgentRecommendation,
  MemoryAgentRegistryManifest,
  MemoryAgentRole,
  MemoryRecommendationItem,
  MemoryRecommendationStatus,
} from "./memory-agent.types";

import {
  assertMemoryAgentKernelPass,
  buildMemoryAgentKernel,
} from "./memory-agent.builder";
import type {
  MemoryAgentKernelInput,
  MemoryAgentKernelResult,
} from "./memory-agent.types";

export function runMemoryAgentKernel(
  input: MemoryAgentKernelInput,
): MemoryAgentKernelResult {
  return buildMemoryAgentKernel(input);
}

export function runMemoryAgentKernelOrThrow(
  input: MemoryAgentKernelInput,
): MemoryAgentKernelResult & {
  ready: true;
  context: NonNullable<MemoryAgentKernelResult["context"]>;
  profile: NonNullable<MemoryAgentKernelResult["profile"]>;
  recommendation: NonNullable<MemoryAgentKernelResult["recommendation"]>;
} {
  const result = buildMemoryAgentKernel(input);
  assertMemoryAgentKernelPass(result);
  return result;
}

export function formatMemoryAgentKernelSummary(
  result: MemoryAgentKernelResult,
): string {
  const lines = [
    "V102 Enterprise Memory Agent",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  registry: agents=${result.registry.agentCount} complete=${result.registry.catalogComplete}`,
    `  retrieval: ${
      result.context
        ? `hits=${result.context.hitCount} status=${result.context.status}`
        : "none"
    }`,
    `  similarity: ${
      result.profile
        ? `matches=${result.profile.matchCount} top=${result.profile.topScore}`
        : "none"
    }`,
    `  recommendation: ${
      result.recommendation
        ? `status=${result.recommendation.status} items=${result.recommendation.itemCount} high=${result.recommendation.highPriorityCount}`
        : "none"
    }`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
