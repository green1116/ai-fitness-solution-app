/**
 * E06-P1 — Operation Policy Registry
 */

import { OPERATION_POLICY_KINDS } from "../core/operation.constants";
import type {
  OperationPolicyDefinition,
  OperationPolicyKind,
  OperationPolicyRegistryManifest,
} from "../core/operation.types";

export const OPERATION_POLICY_CATALOG: OperationPolicyDefinition[] = [
  {
    id: "e06.policy.block-unsafe",
    kind: "deny",
    name: "Block Unsafe",
    description: "Deny when operation is marked unsafe",
    conditions: [{ field: "unsafe", op: "truthy", readOnly: true }],
    onMatch: "deny",
    priority: 100,
    readOnly: true,
  },
  {
    id: "e06.policy.escalate-high-risk",
    kind: "escalate",
    name: "Escalate High Risk",
    description: "Escalate when risk score is high",
    conditions: [{ field: "riskScore", op: "gte", value: 80, readOnly: true }],
    onMatch: "escalate",
    priority: 80,
    readOnly: true,
  },
  {
    id: "e06.policy.gate-ready",
    kind: "gate",
    name: "Ready Gate",
    description: "Allow when readiness flag is set",
    conditions: [{ field: "ready", op: "truthy", readOnly: true }],
    onMatch: "allow",
    priority: 40,
    readOnly: true,
  },
  {
    id: "e06.policy.audit-observe",
    kind: "audit",
    name: "Audit Observe",
    description: "Force audit trail on observe operations",
    conditions: [{ field: "domain", op: "eq", value: "observe", readOnly: true }],
    onMatch: "audit",
    priority: 30,
    readOnly: true,
  },
  {
    id: "e06.policy.throttle-burst",
    kind: "throttle",
    name: "Throttle Burst",
    description: "Escalate under burst load to slow autonomous loops",
    conditions: [{ field: "burst", op: "truthy", readOnly: true }],
    onMatch: "escalate",
    priority: 70,
    readOnly: true,
  },
  {
    id: "e06.policy.allow-default",
    kind: "allow",
    name: "Allow Default",
    description: "Allow when goal is present",
    conditions: [{ field: "goal", op: "truthy", readOnly: true }],
    onMatch: "allow",
    priority: 10,
    readOnly: true,
  },
];

function assertPolicyDefinition(policy: OperationPolicyDefinition): void {
  if (!policy.id.trim()) throw new Error("policy.id is required");
  if (!policy.name.trim()) throw new Error("policy.name is required");
  if (!(OPERATION_POLICY_KINDS as readonly string[]).includes(policy.kind)) {
    throw new Error(`invalid policy kind: ${policy.kind}`);
  }
  if (policy.readOnly !== true) throw new Error("readOnly must be true");
  if (policy.conditions.length === 0) {
    throw new Error(`policy ${policy.id} requires conditions`);
  }
}

export function getOperationPolicyById(
  id: string,
): OperationPolicyDefinition | undefined {
  return OPERATION_POLICY_CATALOG.find((p) => p.id === id);
}

export function listPoliciesByKind(
  kind: OperationPolicyKind,
): OperationPolicyDefinition[] {
  return OPERATION_POLICY_CATALOG.filter((p) => p.kind === kind);
}

export function buildOperationPolicyRegistryManifest(
  policies: OperationPolicyDefinition[] = OPERATION_POLICY_CATALOG,
): OperationPolicyRegistryManifest {
  for (const policy of policies) {
    assertPolicyDefinition(policy);
  }

  const kinds = [...new Set(policies.map((p) => p.kind))];
  const catalogComplete = OPERATION_POLICY_KINDS.every((k) =>
    kinds.includes(k),
  );
  if (!catalogComplete) {
    throw new Error("Operation policy catalog incomplete: missing kinds");
  }

  return {
    policyCount: policies.length,
    kinds,
    policies,
    catalogComplete: true,
    readOnly: true,
  };
}
