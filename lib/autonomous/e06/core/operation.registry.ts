/**
 * E06-P1 — Operation Registry
 * Binds autonomous operations onto E05 intelligence modules
 */

import { getIntelligenceById } from "../../../intelligence/e05/core/intelligence.registry";
import { getOperationPolicyById } from "../policy/operation.policy.registry";
import {
  E06_OPERATION_BASE,
  E06_OPERATION_FREEZE_VERSION,
  E06_OPERATION_PLATFORM_ID,
  E06_OPERATION_VERSION,
  OPERATION_DOMAINS,
} from "./operation.constants";
import type {
  OperationDefinition,
  OperationDomain,
  OperationRegistryManifest,
} from "./operation.types";

export const OPERATION_CATALOG: OperationDefinition[] = [
  {
    id: "e06.op.observe-opportunity",
    name: "Observe Opportunity",
    domain: "observe",
    description: "Autonomous observe loop over opportunity intelligence",
    intelligenceId: "e05.intel.opportunity",
    insightId: "e05.insight.signal",
    policyIds: [
      "e06.policy.block-unsafe",
      "e06.policy.audit-observe",
      "e06.policy.allow-default",
    ],
    dependsOn: [],
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.op.decide-pricing",
    name: "Decide Pricing",
    domain: "decide",
    description: "Autonomous decide loop over pricing intelligence",
    intelligenceId: "e05.intel.pricing",
    insightId: "e05.insight.recommendation",
    policyIds: [
      "e06.policy.block-unsafe",
      "e06.policy.escalate-high-risk",
      "e06.policy.gate-ready",
      "e06.policy.allow-default",
    ],
    dependsOn: ["e06.op.observe-opportunity"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.op.act-risk",
    name: "Act On Risk",
    domain: "act",
    description: "Autonomous act loop over risk intelligence",
    intelligenceId: "e05.intel.risk",
    insightId: "e05.insight.anomaly",
    policyIds: [
      "e06.policy.block-unsafe",
      "e06.policy.escalate-high-risk",
      "e06.policy.allow-default",
    ],
    dependsOn: ["e06.op.observe-opportunity"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.op.monitor-compliance",
    name: "Monitor Compliance",
    domain: "monitor",
    description: "Autonomous monitor loop over compliance intelligence",
    intelligenceId: "e05.intel.compliance",
    insightId: "e05.insight.score",
    policyIds: [
      "e06.policy.block-unsafe",
      "e06.policy.gate-ready",
      "e06.policy.allow-default",
    ],
    dependsOn: ["e06.op.decide-pricing", "e06.op.act-risk"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.op.escalate-delivery",
    name: "Escalate Delivery",
    domain: "escalate",
    description: "Autonomous escalate loop over delivery intelligence",
    intelligenceId: "e05.intel.delivery",
    insightId: "e05.insight.forecast",
    policyIds: [
      "e06.policy.block-unsafe",
      "e06.policy.throttle-burst",
      "e06.policy.escalate-high-risk",
      "e06.policy.allow-default",
    ],
    dependsOn: ["e06.op.monitor-compliance"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.op.coordinate-synthesis",
    name: "Coordinate Synthesis",
    domain: "coordinate",
    description: "Autonomous coordinate loop over synthesis intelligence",
    intelligenceId: "e05.intel.synthesis",
    insightId: "e05.insight.recommendation",
    policyIds: [
      "e06.policy.block-unsafe",
      "e06.policy.gate-ready",
      "e06.policy.allow-default",
    ],
    dependsOn: [
      "e06.op.observe-opportunity",
      "e06.op.decide-pricing",
      "e06.op.act-risk",
      "e06.op.monitor-compliance",
      "e06.op.escalate-delivery",
    ],
    optional: false,
    readOnly: true,
  },
];

function assertOperationDefinition(operation: OperationDefinition): void {
  if (!operation.id.trim()) throw new Error("operation.id is required");
  if (!operation.name.trim()) throw new Error("operation.name is required");
  if (!(OPERATION_DOMAINS as readonly string[]).includes(operation.domain)) {
    throw new Error(`invalid domain: ${operation.domain}`);
  }
  if (operation.readOnly !== true) throw new Error("readOnly must be true");

  const intelligence = getIntelligenceById(operation.intelligenceId);
  if (!intelligence) {
    throw new Error(`missing E05 intelligence: ${operation.intelligenceId}`);
  }

  if (
    operation.insightId &&
    !intelligence.insightIds.includes(operation.insightId)
  ) {
    throw new Error(
      `insight ${operation.insightId} not owned by ${intelligence.id}`,
    );
  }

  for (const policyId of operation.policyIds) {
    if (!getOperationPolicyById(policyId)) {
      throw new Error(`unknown policy ${policyId} on ${operation.id}`);
    }
  }
}

export function isOperationDependencyGraphValid(
  operations: OperationDefinition[] = OPERATION_CATALOG,
): boolean {
  const ids = new Set(operations.map((o) => o.id));
  for (const operation of operations) {
    for (const dep of operation.dependsOn) {
      if (!ids.has(dep)) return false;
    }
  }
  return true;
}

export function buildOperationRegistryManifest(
  operations: OperationDefinition[] = OPERATION_CATALOG,
): OperationRegistryManifest {
  for (const operation of operations) {
    assertOperationDefinition(operation);
  }
  if (!isOperationDependencyGraphValid(operations)) {
    throw new Error("Operation dependency graph is invalid");
  }

  const domains = [...new Set(operations.map((o) => o.domain))];
  const requiredDomains: OperationDomain[] = [...OPERATION_DOMAINS];
  const catalogComplete = requiredDomains.every((d) => domains.includes(d));
  if (!catalogComplete) {
    throw new Error("Operation catalog incomplete: missing domains");
  }

  return {
    platformId: E06_OPERATION_PLATFORM_ID,
    version: E06_OPERATION_VERSION,
    freezeVersion: E06_OPERATION_FREEZE_VERSION,
    base: E06_OPERATION_BASE,
    operationCount: operations.length,
    domains,
    operations,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getOperationById(
  id: string,
): OperationDefinition | undefined {
  return OPERATION_CATALOG.find((o) => o.id === id);
}

export function getOperationByDomain(
  domain: OperationDomain,
): OperationDefinition | undefined {
  return OPERATION_CATALOG.find((o) => o.domain === domain);
}

export function listExecutableOperations(): OperationDefinition[] {
  return OPERATION_CATALOG.filter((o) => o.domain !== "coordinate");
}

export function listPoliciesForOperation(operation: OperationDefinition) {
  return operation.policyIds
    .map((id) => getOperationPolicyById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
}
