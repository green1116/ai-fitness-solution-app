/**
 * E11-P6 — Autonomous Action Policy
 */

import { ACTION_POLICY_MODES, AUTONOMOUS_OPERATION_KINDS, INCIDENT_SEVERITIES } from "./autonomous.constants";
import type {
  ActionPolicyMode,
  AutonomousActionPolicy,
  AutonomousOperationKind,
  CreateActionPolicyInput,
  IncidentSeverity,
} from "./autonomous.types";

const policies = new Map<string, AutonomousActionPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: AutonomousActionPolicy): AutonomousActionPolicy {
  return {
    ...policy,
    allowedKinds: [...policy.allowedKinds],
    metadata: { ...policy.metadata },
  };
}

const SEVERITY_RANK: Record<IncidentSeverity, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

export function createActionPolicy(
  input: CreateActionPolicyInput,
): AutonomousActionPolicy {
  const name = input.name.trim();
  if (!name) throw new Error("policy.name is required");

  const mode = input.mode ?? "ASSISTED";
  if (!(ACTION_POLICY_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid action policy mode: ${mode}`);
  }

  const minAnomalyScore = input.minAnomalyScore ?? 0.5;
  if (!Number.isFinite(minAnomalyScore) || minAnomalyScore < 0 || minAnomalyScore > 1) {
    throw new Error("minAnomalyScore must be in [0,1]");
  }

  const autoIncidentSeverity = input.autoIncidentSeverity ?? "HIGH";
  if (!(INCIDENT_SEVERITIES as readonly string[]).includes(autoIncidentSeverity)) {
    throw new Error(`invalid autoIncidentSeverity: ${autoIncidentSeverity}`);
  }

  const allowedKinds = [
    ...(input.allowedKinds ?? ["RECOVER", "HEAL", "OPTIMIZE", "INCIDENT"]),
  ];
  for (const kind of allowedKinds) {
    if (!(AUTONOMOUS_OPERATION_KINDS as readonly string[]).includes(kind)) {
      throw new Error(`invalid allowed kind: ${kind}`);
    }
  }

  const id = input.id?.trim() || createId("apolicy");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const policy: AutonomousActionPolicy = {
    id,
    name,
    mode,
    allowedKinds: allowedKinds as AutonomousOperationKind[],
    minAnomalyScore,
    autoIncidentSeverity,
    tenantId: input.tenantId?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getActionPolicy(id: string): AutonomousActionPolicy | undefined {
  const p = policies.get(id.trim());
  return p ? clonePolicy(p) : undefined;
}

export function listActionPolicies(filter?: {
  mode?: ActionPolicyMode;
  tenantId?: string;
}): AutonomousActionPolicy[] {
  let result = [...policies.values()];
  if (filter?.mode) result = result.filter((p) => p.mode === filter.mode);
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((p) => p.tenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function resolveActionPolicy(
  tenantId?: string,
): AutonomousActionPolicy | undefined {
  if (tenantId) {
    const specific = listActionPolicies({ tenantId });
    if (specific.length > 0) return specific[0];
  }
  const globals = [...policies.values()].filter((p) => !p.tenantId);
  return globals.length > 0 ? clonePolicy(globals[0]!) : undefined;
}

export function policyAllowsKind(
  policy: AutonomousActionPolicy,
  kind: AutonomousOperationKind,
): boolean {
  return policy.allowedKinds.includes(kind);
}

export function policyAllowsAuto(
  policy: AutonomousActionPolicy,
  anomalyScore: number,
): boolean {
  if (policy.mode === "MANUAL") return false;
  if (policy.mode === "ASSISTED") return false;
  return anomalyScore >= policy.minAnomalyScore;
}

export function severityMeetsOrExceeds(
  severity: IncidentSeverity,
  minimum: IncidentSeverity,
): boolean {
  return SEVERITY_RANK[severity] >= SEVERITY_RANK[minimum];
}

export function clearActionPolicies(): void {
  policies.clear();
}
