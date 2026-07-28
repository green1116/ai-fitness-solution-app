/**
 * Product M13 — OS governance policy registry (definition only)
 */

import { OS_GOVERNANCE_POLICY_KINDS } from "./os.constants";
import { getOsSurfaceByKey } from "./os.registry";
import type {
  OsGovernancePolicy,
  OsGovernancePolicyKind,
  OsGovernancePolicyStatus,
  RegisterOsGovernancePolicyInput,
} from "./os.types";

const policies = new Map<string, OsGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: OsGovernancePolicy): OsGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerOsGovernancePolicy(
  input: RegisterOsGovernancePolicyInput,
): OsGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const surfaceKeyRef = input.surfaceKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!surfaceKeyRef) throw new Error("policy.surfaceKeyRef is required");
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(OS_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const surface = getOsSurfaceByKey(surfaceKeyRef);
  if (!surface) throw new Error(`surface not found: ${surfaceKeyRef}`);
  if (surface.status !== "ACTIVE" && surface.status !== "DRAFT") {
    throw new Error(`surface not governable: ${surfaceKeyRef}`);
  }

  const id = input.id?.trim() || createId("osgov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: OsGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    surfaceKeyRef,
    ruleRef,
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  policies.set(id, policy);
  keys.set(policyKey, id);
  return clonePolicy(policy);
}

export function getOsGovernancePolicy(
  id: string,
): OsGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listOsGovernancePolicies(filter?: {
  kind?: OsGovernancePolicyKind;
  status?: OsGovernancePolicyStatus;
}): OsGovernancePolicy[] {
  let result = [...policies.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.policyKey.localeCompare(b.policyKey))
    .map(clonePolicy);
}

export function clearOsGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
