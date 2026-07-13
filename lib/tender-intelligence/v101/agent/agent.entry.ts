/**
 * E01-P6 — Agent orchestration entry
 */

export {
  AGENT_CATALOG,
  buildAgentRegistryManifest,
  getAgentById,
  getAgentByRole,
  isAgentDependencyGraphValid,
  listExecutableAgents,
} from "./agent.registry";

export {
  assertAgentOrchestrationPass,
  buildOrchestrationLifecycle,
  buildOrchestrationPlan,
  runAgentOrchestration,
} from "./agent.orchestrator";

export {
  AGENT_CAPABILITIES,
  AGENT_ROLES,
  AGENT_STATUSES,
  assertValidRegistry,
  ORCHESTRATION_LIFECYCLE_STAGES,
  validateAgentDefinition,
  validateAgentRegistry,
  validateOrchestrationInput,
  validateOrchestrationPlan,
} from "./agent.schema";

export type { SchemaIssue, SchemaResult } from "./agent.schema";

export {
  V101_AGENT_ORCHESTRATION_FREEZE_VERSION,
  V101_AGENT_ORCHESTRATION_VERSION,
} from "./agent.types";

export type {
  AgentCapability,
  AgentDefinition,
  AgentOrchestrationInput,
  AgentOrchestrationResult,
  AgentRegistryManifest,
  AgentRole,
  AgentRunRecord,
  AgentStatus,
  OrchestrationArtifactRefs,
  OrchestrationLifecycle,
  OrchestrationLifecycleStage,
  OrchestrationLifecycleTransition,
  OrchestrationPlan,
  OrchestrationPlanStep,
} from "./agent.types";

import {
  assertAgentOrchestrationPass,
  runAgentOrchestration,
} from "./agent.orchestrator";
import type {
  AgentOrchestrationInput,
  AgentOrchestrationResult,
} from "./agent.types";

export function runAgentKernel(
  input: AgentOrchestrationInput,
): AgentOrchestrationResult {
  return runAgentOrchestration(input);
}

export function runAgentKernelOrThrow(
  input: AgentOrchestrationInput,
): AgentOrchestrationResult & { ready: true } {
  const result = runAgentOrchestration(input);
  assertAgentOrchestrationPass(result);
  return result;
}

export function formatAgentOrchestrationSummary(
  result: AgentOrchestrationResult,
): string {
  const lines = [
    "V101 Enterprise AI Agent Orchestration",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  registry: agents=${result.registry.agentCount} complete=${result.registry.catalogComplete}`,
    `  plan: steps=${result.plan.stepCount}`,
    `  runs: ${result.runs.length} (succeeded=${result.runs.filter((r) => r.status === "succeeded").length})`,
    `  artifacts: blueprint=${result.artifacts.blueprintId ?? "none"}`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
