/**
 * E01-P6 — Agent orchestration schema (pure TS validation)
 */

import type {
  AgentCapability,
  AgentDefinition,
  AgentOrchestrationInput,
  AgentRegistryManifest,
  AgentRole,
  AgentStatus,
  OrchestrationLifecycleStage,
  OrchestrationPlan,
} from "./agent.types";

export const AGENT_ROLES: readonly AgentRole[] = [
  "intake",
  "understanding",
  "intelligence",
  "strategy",
  "proposal",
  "orchestrator",
] as const;

export const AGENT_CAPABILITIES: readonly AgentCapability[] = [
  "ingest",
  "structure",
  "analyze",
  "decide",
  "compose",
  "coordinate",
] as const;

export const AGENT_STATUSES: readonly AgentStatus[] = [
  "registered",
  "ready",
  "running",
  "succeeded",
  "failed",
  "skipped",
] as const;

export const ORCHESTRATION_LIFECYCLE_STAGES: readonly OrchestrationLifecycleStage[] = [
  "registry",
  "plan",
  "execute",
  "assemble",
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

export function validateAgentDefinition(agent: unknown): SchemaResult<AgentDefinition> {
  const issues: SchemaIssue[] = [];
  if (!agent || typeof agent !== "object") {
    return { ok: false, issues: [issue("agent", "agent is required")] };
  }

  const a = agent as Partial<AgentDefinition>;
  if (!isNonEmptyString(a.id)) issues.push(issue("agent.id", "id is required"));
  if (!isNonEmptyString(a.name)) issues.push(issue("agent.name", "name is required"));
  if (!isNonEmptyString(a.kernelRef)) {
    issues.push(issue("agent.kernelRef", "kernelRef is required"));
  }
  if (typeof a.role !== "string" || !(AGENT_ROLES as readonly string[]).includes(a.role)) {
    issues.push(issue("agent.role", `role must be one of: ${AGENT_ROLES.join(", ")}`));
  }
  if (
    typeof a.capability !== "string" ||
    !(AGENT_CAPABILITIES as readonly string[]).includes(a.capability)
  ) {
    issues.push(
      issue("agent.capability", `capability must be one of: ${AGENT_CAPABILITIES.join(", ")}`),
    );
  }
  if (!Array.isArray(a.dependsOn)) {
    issues.push(issue("agent.dependsOn", "dependsOn must be an array"));
  }
  if (typeof a.optional !== "boolean") {
    issues.push(issue("agent.optional", "optional must be boolean"));
  }
  if (a.readOnly !== true) issues.push(issue("agent.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: agent as AgentDefinition };
}

export function validateAgentRegistry(
  registry: unknown,
): SchemaResult<AgentRegistryManifest> {
  const issues: SchemaIssue[] = [];
  if (!registry || typeof registry !== "object") {
    return { ok: false, issues: [issue("registry", "registry is required")] };
  }

  const r = registry as Partial<AgentRegistryManifest>;
  if (!Array.isArray(r.agents) || r.agents.length < 1) {
    issues.push(issue("registry.agents", "agents must be non-empty"));
  } else {
    for (let i = 0; i < r.agents.length; i++) {
      const result = validateAgentDefinition(r.agents[i]);
      if (!result.ok) {
        issues.push(
          ...result.issues.map((it) => issue(`registry.agents[${i}].${it.path}`, it.message)),
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
  if (r.readOnly !== true) issues.push(issue("registry.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: registry as AgentRegistryManifest };
}

export function validateOrchestrationPlan(plan: unknown): SchemaResult<OrchestrationPlan> {
  const issues: SchemaIssue[] = [];
  if (!plan || typeof plan !== "object") {
    return { ok: false, issues: [issue("plan", "plan is required")] };
  }

  const p = plan as Partial<OrchestrationPlan>;
  if (!isNonEmptyString(p.id)) issues.push(issue("plan.id", "id is required"));
  if (!Array.isArray(p.steps) || p.steps.length < 1) {
    issues.push(issue("plan.steps", "steps must be non-empty"));
  }
  if (typeof p.stepCount === "number" && Array.isArray(p.steps) && p.stepCount !== p.steps.length) {
    issues.push(issue("plan.stepCount", "stepCount must match steps.length"));
  }
  if (p.readOnly !== true) issues.push(issue("plan.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: plan as OrchestrationPlan };
}

export function validateOrchestrationInput(
  input: unknown,
): SchemaResult<AgentOrchestrationInput> {
  const issues: SchemaIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: [issue("input", "input is required")] };
  }

  const i = input as Partial<AgentOrchestrationInput>;
  if (!isNonEmptyString(i.rawText) || i.rawText.trim().length < 20) {
    issues.push(issue("input.rawText", "rawText must be at least 20 characters"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as AgentOrchestrationInput };
}

export function assertValidRegistry(registry: AgentRegistryManifest): void {
  const result = validateAgentRegistry(registry);
  if (!result.ok) {
    throw new Error(
      `Invalid AgentRegistry: ${result.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
}
