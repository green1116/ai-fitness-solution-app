/**
 * E02-P6 — Enterprise Memory Agent schema (pure TS validation)
 */

import type { KnowledgeGraph } from "../knowledge/knowledge.types";
import type {
  MemoryAgentCapability,
  MemoryAgentDefinition,
  MemoryAgentKernelInput,
  MemoryAgentLifecycleStage,
  MemoryAgentRecommendation,
  MemoryAgentRegistryManifest,
  MemoryAgentRole,
  MemoryRecommendationStatus,
} from "./memory-agent.types";

export const MEMORY_AGENT_ROLES: readonly MemoryAgentRole[] = [
  "retriever",
  "similarity",
  "recommender",
  "coordinator",
] as const;

export const MEMORY_AGENT_CAPABILITIES: readonly MemoryAgentCapability[] = [
  "retrieve",
  "compare",
  "recommend",
  "coordinate",
] as const;

export const MEMORY_AGENT_LIFECYCLE_STAGES: readonly MemoryAgentLifecycleStage[] = [
  "agent",
  "retrieval",
  "recommendation",
] as const;

export const MEMORY_RECOMMENDATION_STATUSES: readonly MemoryRecommendationStatus[] = [
  "pending",
  "drafted",
  "ready",
  "failed",
] as const;

export type SchemaIssue = {
  path: string;
  message: string;
};

export type SchemaResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: SchemaIssue[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function issue(path: string, message: string): SchemaIssue {
  return { path, message };
}

export function validateMemoryAgentDefinition(
  agent: unknown,
): SchemaResult<MemoryAgentDefinition> {
  const issues: SchemaIssue[] = [];
  if (!agent || typeof agent !== "object") {
    return { ok: false, issues: [issue("agent", "agent is required")] };
  }

  const a = agent as Partial<MemoryAgentDefinition>;
  if (!isNonEmptyString(a.id)) issues.push(issue("agent.id", "id is required"));
  if (!isNonEmptyString(a.name)) issues.push(issue("agent.name", "name is required"));
  if (!isNonEmptyString(a.kernelRef)) {
    issues.push(issue("agent.kernelRef", "kernelRef is required"));
  }
  if (
    typeof a.role !== "string" ||
    !(MEMORY_AGENT_ROLES as readonly string[]).includes(a.role)
  ) {
    issues.push(
      issue("agent.role", `role must be one of: ${MEMORY_AGENT_ROLES.join(", ")}`),
    );
  }
  if (
    typeof a.capability !== "string" ||
    !(MEMORY_AGENT_CAPABILITIES as readonly string[]).includes(a.capability)
  ) {
    issues.push(
      issue(
        "agent.capability",
        `capability must be one of: ${MEMORY_AGENT_CAPABILITIES.join(", ")}`,
      ),
    );
  }
  if (!Array.isArray(a.dependsOn)) {
    issues.push(issue("agent.dependsOn", "dependsOn must be an array"));
  }
  if (typeof a.optional !== "boolean") {
    issues.push(issue("agent.optional", "optional must be boolean"));
  }
  if (a.readOnly !== true) {
    issues.push(issue("agent.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: agent as MemoryAgentDefinition };
}

export function validateMemoryAgentRegistry(
  registry: unknown,
): SchemaResult<MemoryAgentRegistryManifest> {
  const issues: SchemaIssue[] = [];
  if (!registry || typeof registry !== "object") {
    return { ok: false, issues: [issue("registry", "registry is required")] };
  }

  const r = registry as Partial<MemoryAgentRegistryManifest>;
  if (!Array.isArray(r.agents) || r.agents.length < 1) {
    issues.push(issue("registry.agents", "agents must be non-empty"));
  } else {
    for (let i = 0; i < r.agents.length; i++) {
      const result = validateMemoryAgentDefinition(r.agents[i]);
      if (!result.ok) {
        issues.push(
          ...result.issues.map((it) =>
            issue(`registry.agents[${i}].${it.path}`, it.message),
          ),
        );
      }
    }
    if (typeof r.agentCount === "number" && r.agentCount !== r.agents.length) {
      issues.push(issue("registry.agentCount", "agentCount must match agents.length"));
    }
  }
  if (r.catalogComplete !== true) {
    issues.push(issue("registry.catalogComplete", "catalogComplete must be true"));
  }
  if (r.readOnly !== true) {
    issues.push(issue("registry.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: registry as MemoryAgentRegistryManifest };
}

export function validateMemoryAgentRecommendation(
  recommendation: unknown,
): SchemaResult<MemoryAgentRecommendation> {
  const issues: SchemaIssue[] = [];
  if (!recommendation || typeof recommendation !== "object") {
    return {
      ok: false,
      issues: [issue("recommendation", "recommendation is required")],
    };
  }

  const rec = recommendation as Partial<MemoryAgentRecommendation>;
  if (!isNonEmptyString(rec.id)) {
    issues.push(issue("recommendation.id", "id is required"));
  }
  if (!isNonEmptyString(rec.title)) {
    issues.push(issue("recommendation.title", "title is required"));
  }
  if (!isNonEmptyString(rec.contextId)) {
    issues.push(issue("recommendation.contextId", "contextId is required"));
  }
  if (!isNonEmptyString(rec.profileId)) {
    issues.push(issue("recommendation.profileId", "profileId is required"));
  }
  if (
    typeof rec.status !== "string" ||
    !(MEMORY_RECOMMENDATION_STATUSES as readonly string[]).includes(rec.status)
  ) {
    issues.push(
      issue(
        "recommendation.status",
        `status must be one of: ${MEMORY_RECOMMENDATION_STATUSES.join(", ")}`,
      ),
    );
  }
  if (!Array.isArray(rec.items) || rec.items.length < 1) {
    issues.push(issue("recommendation.items", "items must be non-empty"));
  }
  if (
    typeof rec.itemCount === "number" &&
    Array.isArray(rec.items) &&
    rec.itemCount !== rec.items.length
  ) {
    issues.push(
      issue("recommendation.itemCount", "itemCount must match items.length"),
    );
  }
  if (rec.readOnly !== true) {
    issues.push(issue("recommendation.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: recommendation as MemoryAgentRecommendation };
}

export function validateMemoryAgentKernelInput(
  input: unknown,
): SchemaResult<MemoryAgentKernelInput> {
  const issues: SchemaIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: [issue("input", "input is required")] };
  }

  const i = input as Partial<MemoryAgentKernelInput>;
  if (!i.graph || typeof i.graph !== "object") {
    issues.push(issue("input.graph", "graph is required"));
  } else {
    const g = i.graph as Partial<KnowledgeGraph>;
    if (!isNonEmptyString(g.id)) issues.push(issue("input.graph.id", "id is required"));
    if (!Array.isArray(g.nodes) || g.nodes.length < 1) {
      issues.push(issue("input.graph.nodes", "nodes must be non-empty"));
    }
    if (g.readOnly !== true) {
      issues.push(issue("input.graph.readOnly", "readOnly must be true"));
    }
  }

  if (!isNonEmptyString(i.queryText) || i.queryText.trim().length < 2) {
    issues.push(issue("input.queryText", "queryText must be at least 2 characters"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as MemoryAgentKernelInput };
}

export function assertValidMemoryAgentRegistry(
  registry: MemoryAgentRegistryManifest,
): void {
  const result = validateMemoryAgentRegistry(registry);
  if (!result.ok) {
    throw new Error(
      `Invalid MemoryAgentRegistry: ${result.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
}

export function assertValidMemoryAgentRecommendation(
  recommendation: MemoryAgentRecommendation,
): void {
  const result = validateMemoryAgentRecommendation(recommendation);
  if (!result.ok) {
    throw new Error(
      `Invalid MemoryAgentRecommendation: ${result.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
}
